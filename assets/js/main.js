/* THRIVE Always — site interactions (vanilla JS, no dependencies) */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.remove("no-js");

  /* ---------- Theme ---------- */
  var THEME_KEY = "thrive-theme";
  var mql = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function storedTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }
  function resolvedTheme() {
    var t = root.getAttribute("data-theme");
    if (t === "light" || t === "dark") return t;
    return mql && mql.matches ? "dark" : "light";
  }
  function syncThemeUI() {
    var t = resolvedTheme();
    root.setAttribute("data-theme-active", t);
    document.querySelectorAll(".theme-toggle").forEach(function (b) {
      b.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
    });
  }
  var initial = storedTheme();
  if (initial === "light" || initial === "dark") root.setAttribute("data-theme", initial);
  syncThemeUI();
  if (mql && mql.addEventListener) mql.addEventListener("change", syncThemeUI);

  document.querySelectorAll(".theme-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = resolvedTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
      syncThemeUI();
    });
  });

  /* ---------- Header: scrolled state, progress bar, mobile menu ---------- */
  var header = document.querySelector(".site-header");
  var progress = document.querySelector(".progress");
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (h > 0 ? Math.min(y / h, 1) : 0) + ")";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var nav = document.querySelector(".nav");
  var menuBtn = document.querySelector(".menu-toggle");
  if (nav && menuBtn) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.focus();
      }
    });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Generic tabs helper (arrow-key support) ---------- */
  function tabs(list, onSelect) {
    var btns = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    function select(i, focus) {
      btns.forEach(function (b, j) {
        b.setAttribute("aria-selected", String(i === j));
        b.tabIndex = i === j ? 0 : -1;
      });
      if (focus) btns[i].focus();
      onSelect(i, btns[i]);
    }
    btns.forEach(function (b, i) {
      b.addEventListener("click", function () { select(i, false); list.dispatchEvent(new Event("user-select")); });
      b.addEventListener("keydown", function (e) {
        var k = e.key, n = btns.length, cur = btns.indexOf(document.activeElement);
        if (k === "ArrowRight" || k === "ArrowDown") { e.preventDefault(); select((cur + 1) % n, true); }
        else if (k === "ArrowLeft" || k === "ArrowUp") { e.preventDefault(); select((cur - 1 + n) % n, true); }
        else if (k === "Home") { e.preventDefault(); select(0, true); }
        else if (k === "End") { e.preventDefault(); select(n - 1, true); }
        else return;
        list.dispatchEvent(new Event("user-select"));
      });
    });
    return { select: select, count: btns.length };
  }

  /* ---------- Resilience contexts ---------- */
  var ctxList = document.querySelector("[data-contexts]");
  if (ctxList) {
    var cards = document.querySelectorAll(".context-card");
    tabs(ctxList, function (i) {
      cards.forEach(function (c, j) { c.classList.toggle("is-active", i === j); });
    });
  }

  /* ---------- THRIVE approach ---------- */
  var approach = document.querySelector("[data-approach]");
  if (approach) {
    var data = [
      ["Trust", "and Connection", "Growth begins in relationship. We start by building a safe, respectful space where people feel heard, valued and able to be honest about where they are."],
      ["Holistic", "Understanding", "We look at the whole picture: the person, the child or the organisation, with its strengths and needs, history and context, rather than one isolated problem."],
      ["Reflective", "Awareness", "Pausing to notice what is really happening, and why, helps us understand patterns and recognise what is needed next."],
      ["Integrating", "Learning", "Insight becomes useful when it is put into practice. We help turn understanding into skills, habits, systems and structures."],
      ["Venturing", "into Change", "With the right support, we take the next step. Sometimes that is a small, courageous move, and sometimes it means asking, “Is there a better way?”"],
      ["Experiencing", "Growth & Resilience", "Over time, change takes root, and people and organisations are better able to adapt, grow and move forward through whatever life brings."]
    ];
    var title = approach.querySelector(".approach__title");
    var text = approach.querySelector(".approach__text");
    var panel = approach.querySelector(".approach__panel");
    var bars = approach.querySelectorAll(".approach__progress i");
    var timer = null;
    var current = 0;
    var t = tabs(approach.querySelector('[role="tablist"]'), function (i) {
      current = i;
      title.innerHTML = "<b>" + data[i][0] + "</b> " + data[i][1];
      text.textContent = data[i][2];
      panel.setAttribute("aria-labelledby", "thrive-tab-" + i);
      panel.classList.remove("fade-swap"); void panel.offsetWidth; panel.classList.add("fade-swap");
      bars.forEach(function (b, j) { b.classList.toggle("on", j <= i); });
    });
    t.select(0, false);

    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function start() {
      if (reduce || timer) return;
      timer = setInterval(function () { t.select((current + 1) % t.count, false); }, 5000);
    }
    approach.querySelector('[role="tablist"]').addEventListener("user-select", stop);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) start(); else stop(); });
      }, { threshold: 0.4 }).observe(approach);
    }
    approach.addEventListener("mouseenter", stop);
  }

  /* ---------- Service filters ---------- */
  document.querySelectorAll("[data-filters]").forEach(function (group) {
    var grid = document.querySelector(group.getAttribute("data-filters"));
    if (!grid) return;
    var items = grid.querySelectorAll(".service");
    group.querySelectorAll(".filter").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var f = btn.getAttribute("data-filter");
        group.querySelectorAll(".filter").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        items.forEach(function (it, i) {
          var show = f === "all" || it.getAttribute("data-group") === f;
          it.classList.toggle("is-hidden", !show);
          it.classList.remove("is-entering");
          if (show) {
            void it.offsetWidth;
            it.style.animationDelay = (i % 6) * 40 + "ms";
            it.classList.add("is-entering");
          }
        });
      });
    });
  });

  /* ---------- Contact form (mailto, no backend needed) ---------- */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var params = new URLSearchParams(window.location.search);
    var about = params.get("about");
    if (about) {
      var pre = form.querySelector('input[name="about"][value="' + about.replace(/[^a-z]/g, "") + '"]');
      if (pre) pre.checked = true;
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = form.querySelector(".form__status");
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var fd = new FormData(form);
      var topicEl = form.querySelector('input[name="about"]:checked');
      var topic = topicEl ? topicEl.getAttribute("data-label") : "General enquiry";
      var subject = "Enquiry: " + topic + " (from " + fd.get("name") + ")";
      var body =
        "Name: " + fd.get("name") + "\n" +
        "Email: " + fd.get("email") + "\n" +
        (fd.get("phone") ? "Phone: " + fd.get("phone") + "\n" : "") +
        "About: " + topic + "\n\n" +
        fd.get("message");
      var to = form.getAttribute("data-email");
      window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      if (status) status.textContent = "Thank you. Your email app should open with your message ready to send.";
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
