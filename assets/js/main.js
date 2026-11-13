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

  /* ---------- Contact form -> Google Form ----------
     Posts each field to the Google Form named in data-gform, using the entry IDs
     in data-entry. Google doesn't let the page read its reply (no-cors), so a
     completed request is treated as sent; a network failure shows a fallback. */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var params = new URLSearchParams(window.location.search);
    var about = params.get("about");
    if (about) {
      var pre = form.querySelector('input[name="about"][value="' + about.replace(/[^a-z]/g, "") + '"]');
      if (pre) pre.checked = true;
    }
    var status = form.querySelector(".form__status");
    var done = form.querySelector(".form__done");
    var submitBtn = form.querySelector('button[type="submit"]');
    var submitHTML = submitBtn.innerHTML;
    var fields = Array.prototype.filter.call(form.children, function (c) { return c !== done && c !== status; });

    function showDone(on) {
      fields.forEach(function (c) { c.hidden = on; });
      done.hidden = !on;
      if (on) done.focus();
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var body = new URLSearchParams();
      form.querySelectorAll("[data-entry]").forEach(function (f) {
        if (f.value.trim()) body.append(f.getAttribute("data-entry"), f.value.trim());
      });
      var topicEl = form.querySelector('input[name="about"]:checked');
      if (topicEl) body.append(form.getAttribute("data-entry-about"), topicEl.getAttribute("data-label"));

      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
      status.textContent = "";
      fetch(form.getAttribute("data-gform"), { method: "POST", mode: "no-cors", body: body })
        .then(function () {
          form.reset();
          if (topicEl) topicEl.checked = true;
          showDone(true);
        })
        .catch(function () {
          var mail = form.getAttribute("data-email");
          status.innerHTML = "";
          status.appendChild(document.createTextNode("Sorry, your message couldn't be sent. Please check your connection and try again, or email us at "));
          var a = document.createElement("a");
          a.href = "mailto:" + mail; a.textContent = mail;
          status.appendChild(a);
          status.appendChild(document.createTextNode("."));
        })
        .then(function () {
          submitBtn.disabled = false;
          submitBtn.innerHTML = submitHTML;
        });
    });
    form.querySelector("[data-form-reset]").addEventListener("click", function () {
      showDone(false);
      form.querySelector("#f-name").focus();
    });
  }

  /* ---------- Review bar: details still to fill in, across all pages ----------
     Any <mark class="todo"> on any page listed in PAGES is counted. Other pages are
     read with fetch(), which works on GitHub Pages or a local server. When a page is
     opened straight from disk (file://) browsers block that, so only the current
     page is counted. */
  (function () {
    var PAGES = [
      ["index.html", "Home"],
      ["life.html", "THRIVE Life"],
      ["kids.html", "THRIVE Kids"],
      ["organisations.html", "THRIVE Organisations"],
      ["about.html", "About"]
    ];
    var here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    var localMarks = document.querySelectorAll("mark.todo");
    localMarks.forEach(function (m, i) { m.id = "todo-" + i; });

    function snippet(el) {
      var t = el.textContent.replace(/\s+/g, " ").replace(/[\[\]]/g, "").trim();
      return t.length > 72 ? t.slice(0, 70) + "…" : t;
    }
    function readPage(file) {
      if (file === here) return Promise.resolve(Array.prototype.map.call(localMarks, snippet));
      return fetch(file, { cache: "no-store" })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
        .then(function (html) {
          var doc = new DOMParser().parseFromString(html, "text/html");
          return Array.prototype.map.call(doc.querySelectorAll("mark.todo"), snippet);
        })
        .catch(function () { return null; });
    }
    function el(tag, cls, text) {
      var e = document.createElement(tag);
      if (cls) e.className = cls;
      if (text != null) e.textContent = text;
      return e;
    }

    Promise.all(PAGES.map(function (p) { return readPage(p[0]); })).then(function (results) {
      var items = [], groups = [], unreadable = 0;
      results.forEach(function (texts, pi) {
        if (texts === null) { unreadable++; return; }
        if (!texts.length) return;
        var g = { file: PAGES[pi][0], name: PAGES[pi][1], items: [] };
        texts.forEach(function (t, i) {
          var it = { file: g.file, idx: i, text: t };
          items.push(it); g.items.push(it);
        });
        groups.push(g);
      });
      if (!items.length) return;

      /* Bar */
      var bar = el("div", "todo-bar");
      bar.setAttribute("role", "region");
      bar.setAttribute("aria-label", "Details to fill in");
      var toggle = el("button", "todo-bar__toggle");
      toggle.type = "button";
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-controls", "todo-panel");
      toggle.innerHTML = '<span class="todo-bar__dot" aria-hidden="true"></span><span class="todo-bar__label"></span>' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>';
      var prev = el("button", "todo-bar__prev", "← Prev");
      prev.type = "button";
      prev.setAttribute("aria-label", "Previous detail");
      var next = el("button", "todo-bar__next", "Next →");
      next.type = "button";
      next.setAttribute("aria-label", "Next detail");
      var close = el("button", "todo-bar__close", "×");
      close.type = "button";
      close.setAttribute("aria-label", "Hide review bar");
      bar.appendChild(toggle); bar.appendChild(prev); bar.appendChild(next); bar.appendChild(close);
      var label = toggle.querySelector(".todo-bar__label");
      label.textContent = items.length + (items.length === 1 ? " detail" : " details") + " to fill in" +
        (groups.length > 1 ? " · " + groups.length + " pages" : "");

      /* Panel listing every item, grouped by page */
      var panel = el("div", "todo-panel");
      panel.id = "todo-panel";
      panel.hidden = true;
      panel.appendChild(el("p", "todo-panel__title", "Details to fill in"));
      groups.forEach(function (g) {
        var box = el("div", "todo-panel__group");
        var head = el("p", "todo-panel__page");
        var pageLink = el("a", null, g.name);
        pageLink.href = g.file;
        head.appendChild(pageLink);
        head.appendChild(el("span", null, String(g.items.length)));
        box.appendChild(head);
        var ol = el("ol");
        g.items.forEach(function (it) {
          var li = el("li");
          var a = el("a", it.file === here ? "is-here" : null, it.text);
          a.href = it.file + "#todo-" + it.idx;
          a.setAttribute("data-file", it.file);
          a.setAttribute("data-idx", it.idx);
          li.appendChild(a);
          ol.appendChild(li);
        });
        box.appendChild(ol);
        panel.appendChild(box);
      });
      if (unreadable) {
        panel.appendChild(el("p", "todo-panel__note",
          "Showing this page only. Details on other pages are counted when the site is viewed on GitHub Pages or a local server."));
      }

      var pointer = -1;
      function focusLocal(i) {
        localMarks.forEach(function (m) { m.classList.remove("is-current"); });
        var m = localMarks[i];
        if (!m) return;
        var r = m.closest(".reveal"); if (r) r.classList.add("is-visible");
        m.classList.add("is-current");
        m.scrollIntoView({ behavior: "smooth", block: "center" });
        for (var k = 0; k < items.length; k++) {
          if (items[k].file === here && items[k].idx === i) { pointer = k; break; }
        }
        label.textContent = (pointer + 1) + " of " + items.length + " to fill in";
      }
      function go(k) {
        var it = items[k];
        if (it.file === here) focusLocal(it.idx);
        else location.href = it.file + "#todo-" + it.idx;
      }
      function setOpen(open) {
        panel.hidden = !open;
        toggle.setAttribute("aria-expanded", String(open));
        bar.classList.toggle("is-open", open);
      }

      toggle.addEventListener("click", function () { setOpen(panel.hidden); });
      next.addEventListener("click", function () {
        if (pointer >= 0) { go((pointer + 1) % items.length); return; }
        for (var k = 0; k < items.length; k++) { if (items[k].file === here) { go(k); return; } }
        go(0);
      });
      prev.addEventListener("click", function () {
        var n = items.length;
        if (pointer >= 0) { go((pointer - 1 + n) % n); return; }
        // start from the last item on this page, else the last item overall
        for (var k = n - 1; k >= 0; k--) { if (items[k].file === here) { go(k); return; } }
        go(n - 1);
      });
      close.addEventListener("click", function () {
        localMarks.forEach(function (m) { m.classList.remove("is-current"); });
        bar.remove(); panel.remove();
      });
      panel.addEventListener("click", function (e) {
        var a = e.target.closest("ol a");
        if (a && a.getAttribute("data-file") === here) {
          e.preventDefault();
          setOpen(false);
          focusLocal(+a.getAttribute("data-idx"));
        }
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !panel.hidden) { setOpen(false); toggle.focus(); }
      });

      document.body.appendChild(panel);
      document.body.appendChild(bar);

      // Arriving from another page via "Next" or the list
      var h = /^#todo-(\d+)$/.exec(location.hash);
      if (h) setTimeout(function () { focusLocal(+h[1]); }, 350);
      else if (location.hash === "#todos") setOpen(true);
    });
  })();

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
