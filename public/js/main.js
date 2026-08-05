document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");
  const menuLabel = (open) => {
    const en = (localStorage.getItem("ft_lang") || "ko") === "en";
    if (open) return en ? "Close menu" : "메뉴 닫기";
    return en ? "Open menu" : "메뉴 열기";
  };

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      toggle.setAttribute("aria-label", menuLabel(isOpen));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", menuLabel(false));
        document.querySelectorAll(".nav-item.has-dropdown.open").forEach((el) => el.classList.remove("open"));
      });
    });

    document.addEventListener("click", (e) => {
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", menuLabel(false));
      document.querySelectorAll(".nav-item.has-dropdown.open").forEach((el) => el.classList.remove("open"));
    });
  }

  document.querySelectorAll(".nav-item.has-dropdown > a").forEach((a) => {
    a.addEventListener("click", (e) => {
      if (window.innerWidth > 1024) return;
      const href = a.getAttribute("href") || "";
      if (href.includes("#")) return;
      e.preventDefault();
      const item = a.parentElement;
      document.querySelectorAll(".nav-item.has-dropdown.open").forEach((el) => {
        if (el !== item) el.classList.remove("open");
      });
      item.classList.toggle("open");
    });
  });

  function setActiveNav() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const current = parts[parts.length - 1] || "index.html";
    const normalizedCurrent = current.replace(/\.html$/, "");
    const inArticles = parts.includes("articles");

    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.classList.remove("active");
      const href = link.getAttribute("href") || "";
      const linkFile = href.split("/").pop()?.split("#")[0] || "";
      const normalizedLink = linkFile.replace(/\.html$/, "");

      if (
        linkFile === current ||
        normalizedLink === normalizedCurrent ||
        (normalizedCurrent === "index" && (linkFile === "index.html" || linkFile === "" || href === "/")) ||
        (normalizedCurrent === "stock-tech" && (linkFile === "stock-education.html" || normalizedLink === "stock-education")) ||
        (normalizedCurrent === "stock-fund" && (linkFile === "stock-education.html" || normalizedLink === "stock-education"))
      ) {
        link.classList.add("active");
        return;
      }

      if (
        inArticles &&
        (linkFile === "articles.html" || linkFile === "articles" || href.endsWith("articles.html"))
      ) {
        link.classList.add("active");
      }
    });
  }

  setActiveNav();
  document.addEventListener("spa:navigate", setActiveNav);

  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.06}s`;
      observer.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  if (location.hash) {
    const id = location.hash.slice(1);
    const target = document.getElementById(id);
    if (target) {
      setTimeout(() => {
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: "smooth" });
      }, 600);
    }
  }

  document.querySelectorAll(".hidden-content-area").forEach((area) => {
    area.addEventListener("click", () => {
      if (!window.matchMedia("(hover: none)").matches && window.innerWidth > 640) return;
      document.querySelectorAll(".hidden-content-area.revealed").forEach((el) => {
        if (el !== area) el.classList.remove("revealed");
      });
      area.classList.toggle("revealed");
    });
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest(".hidden-content-area")) return;
    document.querySelectorAll(".hidden-content-area.revealed").forEach((el) => el.classList.remove("revealed"));
  });
});
