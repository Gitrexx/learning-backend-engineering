/* =============================================================================
   Backend Engineering — learning app shell
   Manifest-driven, dependency-free. Works served as static files on Pages.
   - fetches content/manifest.json (relative path)
   - builds structured navigation grouped by sections
   - shows a landing/overview from the manifest (no Markdown parsing)
   - loads a "done" deep-dive into an <iframe> so its own scripts run isolated
   - reflects the current view in the URL hash (#<slug>) for linkable, stable views
   ========================================================================== */
(function () {
  "use strict";

  var MANIFEST_URL = "content/manifest.json";
  var CONTENT_DIR = "content/";
  var RING_CIRCUMFERENCE = 226; // 2*pi*36, matches the SVG in index.html

  var state = { manifest: null, sections: [], items: [], byId: {}, current: null };

  var el = {
    nav: document.getElementById("nav"),
    overview: document.getElementById("overview"),
    viewer: document.getElementById("viewer"),
    frame: document.getElementById("frame"),
    secGrid: document.getElementById("secGrid"),
    homeLink: document.getElementById("homeLink"),
    brandTitle: document.getElementById("brandTitle"),
    heroTitle: document.getElementById("heroTitle"),
    heroTagline: document.getElementById("heroTagline"),
    heroMode: document.getElementById("heroMode"),
    progressFill: document.getElementById("progressFill"),
    progressCount: document.getElementById("progressCount"),
    progressMeta: document.getElementById("progressMeta"),
    ringArc: document.getElementById("ringArc"),
    ringPct: document.getElementById("ringPct"),
    emptyNote: document.getElementById("emptyNote"),
    crumbSection: document.getElementById("crumbSection"),
    crumbTitle: document.getElementById("crumbTitle"),
    backBtn: document.getElementById("backBtn"),
    menuBtn: document.getElementById("menuBtn"),
    sidebar: document.getElementById("sidebar"),
    scrim: document.getElementById("scrim"),
    themeBtn: document.getElementById("themeBtn"),
    themeIcon: document.getElementById("themeIcon"),
    themeLabel: document.getElementById("themeLabel")
  };

  /* ---------- helpers ------------------------------------------------------ */
  function h(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "class") node.className = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else if (k === "disabled") { if (attrs[k]) node.setAttribute("disabled", ""); }
        else node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) {
      if (c == null) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function sortByOrder(a, b) { return (a.order || 0) - (b.order || 0); }

  function sectionOrderOf(sectionId) {
    for (var i = 0; i < state.sections.length; i++) {
      if (state.sections[i].id === sectionId) return state.sections[i].order || (i + 1);
    }
    return 99;
  }

  function itemsInSection(sectionId) {
    return state.items
      .filter(function (it) { return (it.sectionId || null) === (sectionId || null); })
      .sort(sortByOrder);
  }

  function prereqsMet(item) {
    return (item.prerequisites || []).every(function (pid) {
      return state.byId[pid] && state.byId[pid].status === "done";
    });
  }

  /* ---------- navigation (sidebar) ---------------------------------------- */
  function renderNav() {
    el.nav.innerHTML = "";
    state.sections.slice().sort(sortByOrder).forEach(function (sec) {
      var items = itemsInSection(sec.id);
      if (!items.length) return;
      var list = h("ul", { class: "nav-items" });
      items.forEach(function (item) {
        list.appendChild(navItem(item, sec));
      });
      el.nav.appendChild(
        h("div", { class: "nav-section" }, [
          h("p", { class: "sec-head" }, [
            h("span", { class: "sec-num", text: pad(sec.order) }),
            h("span", { text: sec.title })
          ]),
          list
        ])
      );
    });
  }

  function navItem(item, sec) {
    var done = item.status === "done";
    var btn = h("button", {
      class: "nav-item-btn" + (done ? " done" : ""),
      "data-id": item.id,
      title: done ? item.summary : (prereqsMet(item) ? "Not built yet" : "Locked — finish prerequisites first"),
      disabled: !done
    }, [
      h("span", { class: "dot", "aria-hidden": "true" }),
      h("span", {}, [
        h("span", { class: "idx", text: sectionOrderOf(item.sectionId) + "." + item.order + "  " }),
        document.createTextNode(item.title)
      ]),
      done ? null : h("span", { class: "lock", text: prereqsMet(item) ? "•" : "🔒" })
    ]);
    if (done) btn.addEventListener("click", function () { goTo(item.id); closeNav(); });
    return h("li", { class: "nav-item" }, [btn]);
  }

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  /* ---------- overview ----------------------------------------------------- */
  function renderOverview() {
    var m = state.manifest;
    el.brandTitle.textContent = m.topic;
    el.heroTitle.textContent = m.topic;
    el.heroTagline.textContent = m.tagline || "";
    el.heroMode.textContent = (m.mode || "landscape") + " journey";

    el.secGrid.innerHTML = "";
    state.sections.slice().sort(sortByOrder).forEach(function (sec) {
      var items = itemsInSection(sec.id);
      if (!items.length) return;
      var ol = h("ol");
      items.forEach(function (item) {
        var done = item.status === "done";
        var tbtn = h("button", { "data-id": item.id, disabled: !done }, [
          h("span", { class: "num", text: sectionOrderOf(sec.id) + "." + item.order }),
          h("span", { class: "t-title" }, [
            document.createTextNode(item.title),
            h("small", { text: item.summary })
          ]),
          statusBadge(item)
        ]);
        if (done) tbtn.addEventListener("click", function () { goTo(item.id); });
        ol.appendChild(h("li", { "data-status": item.status }, [tbtn]));
      });
      el.secGrid.appendChild(
        h("div", { class: "sec-card" }, [
          h("h3", {}, [ h("span", { class: "sec-num", text: pad(sec.order) }), document.createTextNode(sec.title) ]),
          sec.blurb ? h("p", { class: "sec-blurb", text: sec.blurb }) : null,
          ol
        ])
      );
    });

    updateProgress();
  }

  function statusBadge(item) {
    if (item.status === "done") return h("span", { class: "badge done", text: "done" });
    if (!prereqsMet(item)) return h("span", { class: "badge planned", text: "locked" });
    return h("span", { class: "badge planned", text: "planned" });
  }

  function updateProgress() {
    var total = state.items.length;
    var done = state.items.filter(function (it) { return it.status === "done"; }).length;
    var pct = total ? Math.round((done / total) * 100) : 0;

    el.progressFill.style.width = pct + "%";
    el.progressCount.textContent = done + " / " + total;
    el.ringArc.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - (total ? done / total : 0)));
    el.ringPct.textContent = pct + "%";

    var remaining = total - done;
    el.progressMeta.innerHTML =
      "<strong>" + done + "</strong> deep-dive" + (done === 1 ? "" : "s") + " built &middot; " +
      "<strong>" + remaining + "</strong> planned &middot; " +
      "<strong>" + total + "</strong> total across " + state.sections.length + " areas.";

    el.emptyNote.hidden = done !== 0;
  }

  /* ---------- routing ------------------------------------------------------ */
  function goTo(id) {
    if (location.hash.slice(1) === id) route(); // same hash: force re-render
    else location.hash = id;
  }

  function route() {
    var id = decodeURIComponent(location.hash.replace(/^#/, ""));
    var item = state.byId[id];
    if (item && item.status === "done") showItem(item);
    else showOverview();
  }

  function showOverview() {
    state.current = null;
    el.viewer.classList.remove("active");
    el.overview.classList.add("active");
    el.homeLink.classList.add("active");
    setActiveNav(null);
    el.frame.removeAttribute("src");
    if (location.hash && location.hash !== "#") {
      // normalize unknown/planned hashes back to a clean overview URL
      history.replaceState(null, "", location.pathname + location.search);
    }
    document.title = state.manifest.topic + " — Learning";
    window.scrollTo(0, 0);
  }

  function showItem(item) {
    state.current = item.id;
    el.overview.classList.remove("active");
    el.viewer.classList.add("active");
    el.homeLink.classList.remove("active");
    setActiveNav(item.id);

    var sec = sectionById(item.sectionId);
    el.crumbSection.textContent = sec ? sec.title : "";
    el.crumbTitle.textContent = item.title;
    el.frame.src = CONTENT_DIR + item.file;
    document.title = item.title + " — " + state.manifest.topic;
    window.scrollTo(0, 0);
  }

  function sectionById(id) {
    return state.sections.filter(function (s) { return s.id === id; })[0] || null;
  }

  function setActiveNav(id) {
    var btns = el.nav.querySelectorAll(".nav-item-btn");
    Array.prototype.forEach.call(btns, function (b) {
      b.classList.toggle("active", b.getAttribute("data-id") === id);
    });
  }

  /* ---------- theme toggle ------------------------------------------------- */
  function currentTheme() {
    var attr = document.documentElement.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") return attr;
    var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  }

  // Deep-dives are same-origin, so stamp the chosen theme onto the iframe's
  // document too — otherwise the content would ignore the toggle and follow
  // only the OS preference.
  function applyThemeToFrame(theme) {
    try {
      var doc = el.frame && el.frame.contentDocument;
      if (doc && doc.documentElement) doc.documentElement.setAttribute("data-theme", theme);
    } catch (e) { /* cross-origin or not yet loaded — ignore */ }
  }

  function applyTheme(theme, persist) {
    document.documentElement.setAttribute("data-theme", theme);
    if (persist) { try { localStorage.setItem("be-theme", theme); } catch (e) {} }
    var isDark = theme === "dark";
    if (el.themeIcon) el.themeIcon.textContent = isDark ? "☾" : "☀";
    if (el.themeLabel) el.themeLabel.textContent = isDark ? "Dark" : "Light";
    if (el.themeBtn) {
      el.themeBtn.setAttribute("aria-pressed", isDark ? "true" : "false");
      el.themeBtn.title = "Switch to " + (isDark ? "light" : "dark") + " theme";
    }
    applyThemeToFrame(theme);
  }

  function initTheme() {
    // The inline <head> script already applied any saved theme (flash-free);
    // sync the button and iframe to whatever is currently in effect.
    applyTheme(currentTheme(), false);
    el.themeBtn.addEventListener("click", function () {
      applyTheme(currentTheme() === "dark" ? "light" : "dark", true);
    });
    // Re-apply to each deep-dive as it loads into the iframe.
    el.frame.addEventListener("load", function () { applyThemeToFrame(currentTheme()); });
  }

  /* ---------- mobile nav --------------------------------------------------- */
  function closeNav() { document.body.classList.remove("nav-open"); }
  function initNavToggle() {
    el.menuBtn.addEventListener("click", function () { document.body.classList.toggle("nav-open"); });
    el.scrim.addEventListener("click", closeNav);
  }

  /* ---------- boot --------------------------------------------------------- */
  function boot(manifest) {
    state.manifest = manifest;
    state.sections = (manifest.sections || []).slice();
    state.items = (manifest.items || []).slice();
    state.byId = {};
    state.items.forEach(function (it) { state.byId[it.id] = it; });

    renderNav();
    renderOverview();

    el.homeLink.addEventListener("click", function () { location.hash = ""; showOverview(); });
    el.backBtn.addEventListener("click", function () { location.hash = ""; showOverview(); });
    window.addEventListener("hashchange", route);

    route();
  }

  function fail(err) {
    el.overview.classList.add("active");
    el.secGrid.innerHTML =
      '<p class="load-error">Could not load content/manifest.json — ' +
      (err && err.message ? err.message : "unknown error") +
      '. If you opened this file directly (file://), serve the folder over HTTP instead ' +
      '(e.g. <code>python3 -m http.server</code>).</p>';
  }

  function start() {
    initTheme();
    initNavToggle();
    fetch(MANIFEST_URL, { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(boot)
      .catch(fail);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
