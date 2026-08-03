#!/usr/bin/env python3
"""
Bitcoin Technical Analysis Script
=================================
Fetches 90 days of BTC/USDT OHLCV from Binance via ccxt, computes RSI(14),
MACD, and Bollinger Bands(20, 2), plots indicators, and prints a trading summary.

Dependencies: ccxt, pandas, numpy, matplotlib

Usage:
    python scripts/btc_technical_analysis.py
"""

from __future__ import annotations

import sys
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from enum import Enum
from pathlib import Path
from typing import Final, Optional, Tuple

import ccxt
import matplotlib.dates as mdates
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

SYMBOL: Final[str] = "BTC/USDT"
EXCHANGE_ID: Final[str] = "binance"
LOOKBACK_DAYS: Final[int] = 90
TIMEFRAME: Final[str] = "1d"
RSI_PERIOD: Final[int] = 14
BB_PERIOD: Final[int] = 20
BB_STD: Final[float] = 2.0
MACD_FAST: Final[int] = 12
MACD_SLOW: Final[int] = 26
MACD_SIGNAL: Final[int] = 9

RSI_OVERSOLD: Final[float] = 30.0
RSI_OVERBOUGHT: Final[float] = 70.0


class RiskLevel(str, Enum):
    """Qualitative risk assessment based on indicator confluence."""

    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    EXTREME = "EXTREME"


class Signal(str, Enum):
    """Discrete trading signal derived from indicator rules."""

    STRONG_BUY = "STRONG BUY"
    BUY = "BUY"
    NEUTRAL = "NEUTRAL"
    SELL = "SELL"
    STRONG_SELL = "STRONG SELL"


@dataclass(frozen=True)
class AnalysisSummary:
    """Container for the latest indicator values and derived signals."""

    as_of: datetime
    close: float
    rsi: float
    macd: float
    macd_signal: float
    macd_histogram: float
    bb_upper: float
    bb_middle: float
    bb_lower: float
    signal: Signal
    risk_level: RiskLevel
    notes: Tuple[str, ...]


# ---------------------------------------------------------------------------
# Data fetching
# ---------------------------------------------------------------------------


def create_exchange() -> ccxt.Exchange:
    """
    Instantiate a Binance exchange client with rate-limit handling enabled.

    Returns:
        ccxt.Exchange: Configured Binance exchange instance.

    Raises:
        ccxt.BaseError: If exchange initialization fails.
    """
    exchange_class = getattr(ccxt, EXCHANGE_ID)
    return exchange_class({"enableRateLimit": True})


def fetch_ohlcv_data(
    exchange: ccxt.Exchange,
    symbol: str = SYMBOL,
    days: int = LOOKBACK_DAYS,
    timeframe: str = TIMEFRAME,
) -> pd.DataFrame:
    """
    Download daily OHLCV candles for the given symbol from Binance.

    Args:
        exchange: Authenticated ccxt exchange instance.
        symbol: Trading pair, e.g. ``"BTC/USDT"``.
        days: Number of calendar days of history to retrieve.
        timeframe: Candle resolution (default daily ``"1d"``).

    Returns:
        DataFrame indexed by UTC timestamp with columns
        ``open, high, low, close, volume``.

    Raises:
        ccxt.NetworkError: On connectivity issues.
        ccxt.ExchangeError: On exchange-side errors.
        ValueError: If no candles are returned.
    """
    since_ms = int(
        (datetime.now(timezone.utc) - timedelta(days=days)).timestamp() * 1000
    )

    try:
        raw: list[list[float]] = exchange.fetch_ohlcv(
            symbol, timeframe=timeframe, since=since_ms
        )
    except ccxt.NetworkError as exc:
        raise ccxt.NetworkError(
            f"Network failure while fetching {symbol} OHLCV: {exc}"
        ) from exc
    except ccxt.ExchangeError as exc:
        raise ccxt.ExchangeError(
            f"Exchange error while fetching {symbol} OHLCV: {exc}"
        ) from exc

    if not raw:
        raise ValueError(f"No OHLCV data returned for {symbol}.")

    df = pd.DataFrame(
        raw, columns=["timestamp", "open", "high", "low", "close", "volume"]
    )
    df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms", utc=True)
    df.set_index("timestamp", inplace=True)
    df = df.astype(
        {"open": float, "high": float, "low": float, "close": float, "volume": float}
    )
    return df.sort_index()


# ---------------------------------------------------------------------------
# Indicator calculations
# ---------------------------------------------------------------------------


def compute_rsi(close: pd.Series, period: int = RSI_PERIOD) -> pd.Series:
    """
    Calculate the Relative Strength Index (Wilder's smoothing).

    Args:
        close: Series of closing prices.
        period: Look-back window (default 14).

    Returns:
        RSI series aligned with ``close`` index (NaN for initial window).
    """
    delta = close.diff()
    gain = delta.clip(lower=0.0)
    loss = (-delta).clip(lower=0.0)

    avg_gain = gain.ewm(alpha=1 / period, min_periods=period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1 / period, min_periods=period, adjust=False).mean()

    rs = avg_gain / avg_loss.replace(0, np.nan)
    rsi = 100.0 - (100.0 / (1.0 + rs))
    return rsi.rename("rsi")


def compute_macd(
    close: pd.Series,
    fast: int = MACD_FAST,
    slow: int = MACD_SLOW,
    signal: int = MACD_SIGNAL,
) -> pd.DataFrame:
    """
    Calculate MACD line, signal line, and histogram.

    Args:
        close: Series of closing prices.
        fast: Fast EMA period (default 12).
        slow: Slow EMA period (default 26).
        signal: Signal EMA period (default 9).

    Returns:
        DataFrame with columns ``macd``, ``macd_signal``, ``macd_hist``.
    """
    ema_fast = close.ewm(span=fast, adjust=False).mean()
    ema_slow = close.ewm(span=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    histogram = macd_line - signal_line

    return pd.DataFrame(
        {
            "macd": macd_line,
            "macd_signal": signal_line,
            "macd_hist": histogram,
        }
    )


def compute_bollinger_bands(
    close: pd.Series,
    period: int = BB_PERIOD,
    num_std: float = BB_STD,
) -> pd.DataFrame:
    """
    Calculate Bollinger Bands (SMA middle band ± ``num_std`` standard deviations).

    Args:
        close: Series of closing prices.
        period: Moving-average window (default 20).
        num_std: Standard-deviation multiplier (default 2).

    Returns:
        DataFrame with columns ``bb_upper``, ``bb_middle``, ``bb_lower``.
    """
    middle = close.rolling(window=period).mean()
    std = close.rolling(window=period).std()
    upper = middle + num_std * std
    lower = middle - num_std * std

    return pd.DataFrame(
        {"bb_upper": upper, "bb_middle": middle, "bb_lower": lower}
    )


def enrich_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Append RSI, MACD, and Bollinger Band columns to an OHLCV DataFrame.

    Args:
        df: OHLCV DataFrame with a ``close`` column.

    Returns:
        Copy of ``df`` with indicator columns added.
    """
    enriched = df.copy()
    enriched["rsi"] = compute_rsi(enriched["close"])
    enriched = enriched.join(compute_macd(enriched["close"]))
    enriched = enriched.join(compute_bollinger_bands(enriched["close"]))
    return enriched


# ---------------------------------------------------------------------------
# Signal & risk logic
# ---------------------------------------------------------------------------


def derive_signal(
    rsi: float,
    macd: float,
    macd_signal: float,
    macd_hist: float,
    close: float,
    bb_upper: float,
    bb_lower: float,
) -> Tuple[Signal, RiskLevel, Tuple[str, ...]]:
    """
    Derive a composite trading signal and risk level from latest indicators.

    Scoring uses simple rule-based confluence:
    - RSI oversold/overbought
    - MACD line vs signal & histogram direction
    - Price position relative to Bollinger Bands

    Args:
        rsi: Latest RSI(14) value.
        macd: Latest MACD line value.
        macd_signal: Latest MACD signal line value.
        macd_hist: Latest MACD histogram value.
        close: Latest closing price.
        bb_upper: Latest upper Bollinger Band.
        bb_lower: Latest lower Bollinger Band.

    Returns:
        Tuple of (Signal, RiskLevel, notes).
    """
    score = 0  # positive = bullish, negative = bearish
    notes: list[str] = []

    # RSI
    if rsi < RSI_OVERSOLD:
        score += 2
        notes.append(f"RSI {rsi:.1f} - oversold (< {RSI_OVERSOLD})")
    elif rsi > RSI_OVERBOUGHT:
        score -= 2
        notes.append(f"RSI {rsi:.1f} - overbought (> {RSI_OVERBOUGHT})")
    else:
        notes.append(f"RSI {rsi:.1f} - neutral zone")

    # MACD
    if macd > macd_signal and macd_hist > 0:
        score += 1
        notes.append("MACD bullish crossover / positive histogram")
    elif macd < macd_signal and macd_hist < 0:
        score -= 1
        notes.append("MACD bearish crossover / negative histogram")
    else:
        notes.append("MACD mixed / consolidating")

    # Bollinger Bands
    band_width = bb_upper - bb_lower
    if close <= bb_lower:
        score += 1
        notes.append("Price at/below lower Bollinger Band (potential mean-reversion)")
    elif close >= bb_upper:
        score -= 1
        notes.append("Price at/above upper Bollinger Band (extended move)")
    else:
        pct_b = (close - bb_lower) / band_width if band_width > 0 else 0.5
        notes.append(f"Bollinger %B = {pct_b:.2f}")

    # Map score to signal
    if score >= 3:
        signal = Signal.STRONG_BUY
    elif score == 2:
        signal = Signal.BUY
    elif score <= -3:
        signal = Signal.STRONG_SELL
    elif score == -2:
        signal = Signal.SELL
    else:
        signal = Signal.NEUTRAL

    # Risk from volatility proxy (band width relative to price)
    width_pct = (band_width / close * 100) if close > 0 else 0.0
    if width_pct > 15 or rsi > 80 or rsi < 20:
        risk = RiskLevel.EXTREME
    elif width_pct > 10 or abs(macd_hist) > close * 0.005:
        risk = RiskLevel.HIGH
    elif width_pct > 6:
        risk = RiskLevel.MODERATE
    else:
        risk = RiskLevel.LOW

    notes.append(f"Bollinger bandwidth {width_pct:.1f}% of price -> risk {risk.value}")
    return signal, risk, tuple(notes)


def build_summary(df: pd.DataFrame) -> AnalysisSummary:
    """
    Build an ``AnalysisSummary`` from the most recent row of enriched data.

    Args:
        df: DataFrame with indicator columns populated.

    Returns:
        AnalysisSummary for the latest candle.

    Raises:
        ValueError: If required columns are missing or data is insufficient.
    """
    required = {
        "close",
        "rsi",
        "macd",
        "macd_signal",
        "macd_hist",
        "bb_upper",
        "bb_middle",
        "bb_lower",
    }
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Missing indicator columns: {missing}")

    latest = df.dropna(subset=list(required)).iloc[-1]
    as_of = df.dropna(subset=list(required)).index[-1].to_pydatetime()

    signal, risk, notes = derive_signal(
        rsi=float(latest["rsi"]),
        macd=float(latest["macd"]),
        macd_signal=float(latest["macd_signal"]),
        macd_hist=float(latest["macd_hist"]),
        close=float(latest["close"]),
        bb_upper=float(latest["bb_upper"]),
        bb_lower=float(latest["bb_lower"]),
    )

    return AnalysisSummary(
        as_of=as_of,
        close=float(latest["close"]),
        rsi=float(latest["rsi"]),
        macd=float(latest["macd"]),
        macd_signal=float(latest["macd_signal"]),
        macd_histogram=float(latest["macd_hist"]),
        bb_upper=float(latest["bb_upper"]),
        bb_middle=float(latest["bb_middle"]),
        bb_lower=float(latest["bb_lower"]),
        signal=signal,
        risk_level=risk,
        notes=notes,
    )


# ---------------------------------------------------------------------------
# Plotting
# ---------------------------------------------------------------------------


def plot_analysis(df: pd.DataFrame, summary: AnalysisSummary) -> None:
    """
    Render price + Bollinger Bands, RSI, and MACD on a single figure.

    Args:
        df: Enriched OHLCV DataFrame.
        summary: Latest analysis summary (used in the suptitle).
    """
    plot_df = df.dropna(
        subset=["rsi", "macd", "macd_signal", "bb_upper", "bb_lower"]
    ).copy()

    fig, axes = plt.subplots(
        3,
        1,
        figsize=(14, 10),
        sharex=True,
        gridspec_kw={"height_ratios": [3, 1, 1.2]},
    )
    fig.patch.set_facecolor("#0f0f0f")

    title = (
        f"BTC/USDT Technical Analysis  |  {summary.as_of.strftime('%Y-%m-%d')}  |  "
        f"Signal: {summary.signal.value}  |  Risk: {summary.risk_level.value}"
    )
    fig.suptitle(title, fontsize=13, fontweight="bold", color="white", y=0.98)

    ax_price, ax_rsi, ax_macd = axes
    for ax in axes:
        ax.set_facecolor("#1a1a1a")
        ax.tick_params(colors="#aaaaaa")
        ax.spines[:].set_color("#333333")
        ax.yaxis.label.set_color("#cccccc")
        ax.xaxis.label.set_color("#cccccc")

    dates = plot_df.index

    # --- Price + Bollinger Bands ---
    ax_price.plot(
        dates, plot_df["close"], label="Close", color="#3b82f6", linewidth=1.8
    )
    ax_price.plot(
        dates,
        plot_df["bb_upper"],
        label=f"BB Upper ({BB_PERIOD}, {BB_STD})",
        color="#ef4444",
        linewidth=1.0,
        linestyle="--",
        alpha=0.85,
    )
    ax_price.plot(
        dates,
        plot_df["bb_middle"],
        label="BB Middle (SMA 20)",
        color="#a0a0a0",
        linewidth=1.0,
        linestyle="-.",
        alpha=0.7,
    )
    ax_price.plot(
        dates,
        plot_df["bb_lower"],
        label=f"BB Lower ({BB_PERIOD}, {BB_STD})",
        color="#22c55e",
        linewidth=1.0,
        linestyle="--",
        alpha=0.85,
    )
    ax_price.fill_between(
        dates,
        plot_df["bb_lower"],
        plot_df["bb_upper"],
        color="#3b82f6",
        alpha=0.06,
    )
    ax_price.set_ylabel("Price (USDT)")
    ax_price.legend(loc="upper left", fontsize=8, facecolor="#1e1e1e", labelcolor="white")
    ax_price.grid(True, alpha=0.15, color="#555555")

    # --- RSI ---
    ax_rsi.plot(dates, plot_df["rsi"], label=f"RSI ({RSI_PERIOD})", color="#f59e0b", linewidth=1.5)
    ax_rsi.axhline(RSI_OVERBOUGHT, color="#ef4444", linestyle="--", linewidth=0.8, alpha=0.7)
    ax_rsi.axhline(RSI_OVERSOLD, color="#22c55e", linestyle="--", linewidth=0.8, alpha=0.7)
    ax_rsi.axhline(50, color="#666666", linestyle=":", linewidth=0.6, alpha=0.5)
    ax_rsi.fill_between(dates, RSI_OVERSOLD, RSI_OVERBOUGHT, alpha=0.04, color="white")
    ax_rsi.set_ylabel("RSI")
    ax_rsi.set_ylim(0, 100)
    ax_rsi.legend(loc="upper left", fontsize=8, facecolor="#1e1e1e", labelcolor="white")
    ax_rsi.grid(True, alpha=0.15, color="#555555")

    # --- MACD ---
    colors = np.where(plot_df["macd_hist"] >= 0, "#22c55e", "#ef4444")
    ax_macd.bar(dates, plot_df["macd_hist"], label="MACD Histogram", color=colors, alpha=0.55, width=0.8)
    ax_macd.plot(
        dates, plot_df["macd"], label=f"MACD ({MACD_FAST},{MACD_SLOW})", color="#3b82f6", linewidth=1.4
    )
    ax_macd.plot(
        dates,
        plot_df["macd_signal"],
        label=f"Signal ({MACD_SIGNAL})",
        color="#f59e0b",
        linewidth=1.2,
    )
    ax_macd.axhline(0, color="#666666", linewidth=0.6, alpha=0.6)
    ax_macd.set_ylabel("MACD")
    ax_macd.set_xlabel("Date (UTC)")
    ax_macd.legend(loc="upper left", fontsize=8, facecolor="#1e1e1e", labelcolor="white")
    ax_macd.grid(True, alpha=0.15, color="#555555")

    ax_macd.xaxis.set_major_formatter(mdates.DateFormatter("%Y-%m-%d"))
    ax_macd.xaxis.set_major_locator(mdates.WeekdayLocator(interval=2))
    plt.setp(ax_macd.xaxis.get_majorticklabels(), rotation=30, ha="right", color="#aaaaaa")

    plt.tight_layout(rect=[0, 0, 1, 0.96])

    chart_path = Path(__file__).resolve().parent / "btc_analysis_chart.png"
    fig.savefig(chart_path, dpi=150, facecolor=fig.get_facecolor(), bbox_inches="tight")
    print(f"Chart saved: {chart_path}")

    plt.show()


# ---------------------------------------------------------------------------
# Console output
# ---------------------------------------------------------------------------


def print_summary(summary: AnalysisSummary, rows: int) -> None:
    """
    Print a formatted trading summary to stdout.

    Args:
        summary: Latest analysis summary.
        rows: Number of OHLCV rows analysed.
    """
    sep = "=" * 62
    print(f"\n{sep}")
    print("  BITCOIN (BTC/USDT) - TECHNICAL ANALYSIS SUMMARY")
    print(sep)
    print(f"  As of (UTC)     : {summary.as_of.strftime('%Y-%m-%d %H:%M')}")
    print(f"  Candles loaded  : {rows} daily bars (~{LOOKBACK_DAYS} days)")
    print(f"  Close price     : ${summary.close:,.2f}")
    print(f"{sep}")
    print("  INDICATORS")
    print(f"  RSI({RSI_PERIOD})          : {summary.rsi:.2f}")
    print(f"  MACD            : {summary.macd:,.2f}")
    print(f"  MACD Signal     : {summary.macd_signal:,.2f}")
    print(f"  MACD Histogram  : {summary.macd_histogram:,.2f}")
    print(f"  BB Upper        : ${summary.bb_upper:,.2f}")
    print(f"  BB Middle       : ${summary.bb_middle:,.2f}")
    print(f"  BB Lower        : ${summary.bb_lower:,.2f}")
    print(f"{sep}")
    print(f"  TRADING SIGNAL  : {summary.signal.value}")
    print(f"  RISK LEVEL      : {summary.risk_level.value}")
    print(f"{sep}")
    print("  NOTES")
    for note in summary.notes:
        print(f"    - {note}")
    print(f"{sep}\n")
    print("  Disclaimer: For educational purposes only. Not financial advice.\n")


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------


def main() -> int:
    """
    Orchestrate data fetch, indicator computation, plotting, and summary output.

    Returns:
        Exit code (0 = success, 1 = failure).
    """
    # Windows console UTF-8 (best effort)
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
            sys.stderr.reconfigure(encoding="utf-8")
        except (OSError, ValueError):
            pass

    exchange: Optional[ccxt.Exchange] = None

    try:
        print(f"Connecting to {EXCHANGE_ID} …")
        exchange = create_exchange()
        exchange.load_markets()

        print(f"Fetching {LOOKBACK_DAYS}-day {TIMEFRAME} OHLCV for {SYMBOL} …")
        df = fetch_ohlcv_data(exchange, SYMBOL, LOOKBACK_DAYS, TIMEFRAME)
        print(f"Received {len(df)} candles ({df.index[0].date()} -> {df.index[-1].date()})")

        enriched = enrich_dataframe(df)
        summary = build_summary(enriched)

        print_summary(summary, len(enriched))
        plot_analysis(enriched, summary)

        return 0

    except ccxt.NetworkError as exc:
        print(f"[ERROR] Network/API failure: {exc}", file=sys.stderr)
        print("  Check your internet connection and try again.", file=sys.stderr)
        return 1
    except ccxt.ExchangeError as exc:
        print(f"[ERROR] Exchange rejected the request: {exc}", file=sys.stderr)
        return 1
    except ccxt.BaseError as exc:
        print(f"[ERROR] ccxt error: {exc}", file=sys.stderr)
        return 1
    except ValueError as exc:
        print(f"[ERROR] Data error: {exc}", file=sys.stderr)
        return 1
    except Exception as exc:  # noqa: BLE001 - top-level safety net
        print(f"[ERROR] Unexpected failure: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
