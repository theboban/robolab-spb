/* ============================================================
   Cog & Brick Robotics Lab — interactions & WhatsApp tracking
   ============================================================ */

(function () {
  "use strict";

  /* --------------------------------------------------------
   * CONFIG — replace with the school's real values:
   *  WA_NUMBER: full international number, digits only.
   * -------------------------------------------------------- */
  var WA_NUMBER = "15125550142"; // +1 (512) 555-0142 — placeholder

  var DEFAULT_MSG =
    "Hi! We'd like to book a FREE trial robotics class for our child (age __AGE__). " +
    "Please suggest available times.";

  /* --------------------------------------------------------
   * Remember the child's age after first visit, so every
   * WhatsApp message opens pre-filled with it automatically.
   * -------------------------------------------------------- */
  function getChildAge() {
    try { return localStorage.getItem("cogbrick.childAge") || ""; }
    catch (e) { return ""; }
  }

  function maybeAskAge() {
    if (getChildAge()) return;            // already known
    if (sessionStorage.getItem("cogbrick.ageAsked")) return; // declined this session
    sessionStorage.setItem("cogbrick.ageAsked", "1");
    // Ask once, gently, after the visitor has looked around a bit.
    setTimeout(function () {
      var age = window.prompt(
        "Quick question so we can pre-fill your booking message:\n" +
        "How old is your child? (6–10, or leave blank)",
        ""
      );
      if (age === null) return; // cancelled
      age = String(age).trim();
      if (/^([6-9]|10)$/.test(age)) {
        try { localStorage.setItem("cogbrick.childAge", age); } catch (e) {}
        refreshWaLinks();
      }
    }, 8000);
  }

  function buildMessage(template) {
    var age = getChildAge();
    var msg = template || DEFAULT_MSG;
    if (age) {
      msg = msg.replace("__AGE__", age);
    } else {
      // clean up the "(age __AGE__)" fragment when age is unknown
      msg = msg.replace(/\s*\(age\s*__AGE__\)\s*/g, " ").replace(/\s+/g, " ").trim();
    }
    return msg;
  }

  function waHref(template) {
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(buildMessage(template));
  }

  /* Rewrite all tracked WhatsApp links with the remembered age. */
  function refreshWaLinks() {
    document.querySelectorAll("a.wa-track").forEach(function (a) {
      var url;
      try {
        url = new URL(a.href);
        var existing = url.searchParams.get("text");
        a.dataset.waTemplate = a.dataset.waTemplate || existing || DEFAULT_MSG;
        url.searchParams.set("text", buildMessage(a.dataset.waTemplate));
        a.href = url.toString();
      } catch (e) { /* ignore malformed links */ }
    });
  }

  /* --------------------------------------------------------
   * Google Analytics 4 / gtag event tracking on every
   * WhatsApp click. Falls back to dataLayer push (GTM) and
   * fires no errors if analytics is not loaded yet.
   * Event name: whatsapp_click
   * Parameters: link_source (which button), destination.
   * -------------------------------------------------------- */
  function trackWhatsAppClick(el) {
    var params = {
      event_name: "whatsapp_click",
      link_source: el.getAttribute("data-wa-src") || "unspecified",
      link_text: (el.textContent || "").trim().slice(0, 60),
      page_location: window.location.href,
      has_child_age: getChildAge() ? "yes" : "no",
      transport_type: "beacon"
    };

    // GA4 global (gtag.js)
    if (typeof window.gtag === "function") {
      window.gtag("event", "whatsapp_click", {
        link_source: params.link_source,
        link_text: params.link_text,
        has_child_age: params.has_child_age
      });
    }

    // GTM dataLayer fallback (custom event for a GA4 tag in the container)
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "whatsapp_click",
      link_source: params.link_source,
      link_text: params.link_text,
      has_child_age: params.has_child_age,
      page_location: params.page_location
    });

    // Fallback for environments without GTM preview: fire & forget ping
    if (typeof window.gtag !== "function" && navigator.sendBeacon) {
      // No measurement id configured yet — keep as console hint for devs.
      try {
        navigator.sendBeacon(
          "/ga-collect",
          new Blob([JSON.stringify(params)], { type: "application/json" })
        );
      } catch (e) { /* offline / static hosting — safe to ignore */ }
    }
  }

  /* --------------------------------------------------------
   * Wire up clicks
   * -------------------------------------------------------- */
  document.addEventListener("click", function (e) {
    var el = e.target.closest("a.wa-track");
    if (!el) return;
    trackWhatsAppClick(el);
    // ensure the freshest href (with age) at click time
    var template = el.getAttribute("data-wa-template") ||
      (function () {
        try { return new URL(el.href).searchParams.get("text"); }
        catch (err) { return null; }
      })();
    el.href = waHref(template || DEFAULT_MSG);
  }, { capture: true });

  /* Footer year */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  refreshWaLinks();
  maybeAskAge();
})();
