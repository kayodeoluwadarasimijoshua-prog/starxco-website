/* StarXCO — site behaviour
   ------------------------------------------------------------------
   CONFIG: set the real inbox before launch (also appears in the
   footer / contact / quote pages as visible contact details).
   - email:    receives form submissions via FormSubmit.co (free).
               The FIRST submission triggers a one-time activation
               email to this address — click the link once.
   - endpoint: optional override. If set, submissions are POSTed
               there as JSON instead of FormSubmit.
------------------------------------------------------------------ */
window.STARXCO_CONFIG = Object.assign(
  {
    email: "samuel@starxco.com.ng",      /* shown on the site */
    formEmail: "samuel@starxco.com.ng",  /* receives form submissions */
    domain: "starxco.com.ng",            /* FormSubmit activation is domain-bound */
    whatsapp: "2348153299587",
    endpoint: ""
  },
  window.STARXCO_CONFIG || {}
);

(function () {
  "use strict";

  /* ---------- header scroll state ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.querySelector(".i-open").style.display = open ? "none" : "block";
      toggle.querySelector(".i-close").style.display = open ? "block" : "none";
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a") && window.innerWidth <= 1000) {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- dropdowns: expanded state announced + touch handling ---------- */
  document.querySelectorAll(".drop").forEach(function (drop) {
    var trigger = drop.querySelector(":scope > a");
    if (!trigger) return;
    trigger.setAttribute("aria-expanded", "false");

    function sync(state) {
      trigger.setAttribute("aria-expanded", state ? "true" : "false");
    }
    /* hover (pointer devices) */
    drop.addEventListener("mouseenter", function () { sync(true); });
    drop.addEventListener("mouseleave", function () { sync(false); });
    /* keyboard focus within */
    drop.addEventListener("focusin", function () { sync(true); });
    drop.addEventListener("focusout", function () {
      if (!drop.contains(document.activeElement)) sync(false);
    });
    /* touch / mobile: first tap opens instead of navigating */
    trigger.addEventListener("click", function (e) {
      if (window.innerWidth <= 1000) {
        e.preventDefault();
        var open = drop.classList.toggle("open");
        sync(open);
      }
    });
    drop.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        drop.classList.remove("open");
        sync(false);
        trigger.focus();
      }
    });
  });

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 4, 3) * 70 + "ms";
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- forms ---------- */
  function readForm(form) {
    var data = {};
    new FormData(form).forEach(function (v, k) {
      if (k.charAt(0) === "_") return; /* control fields are set separately */
      data[k] = String(v).trim();
    });
    return data;
  }

  /* ---------- guaranteed fallback: WhatsApp / email / copy ---------- */
  function copyText(text, btn) {
    var done = function () {
      var old = btn.textContent;
      btn.textContent = "Copied";
      setTimeout(function () { btn.textContent = old; }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { legacyCopy(text, btn); });
    } else {
      legacyCopy(text, btn);
    }
  }

  function legacyCopy(text, btn) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); btn.textContent = "Copied"; } catch (e) {}
    document.body.removeChild(ta);
    setTimeout(function () { btn.textContent = "Copy details"; }, 1600);
  }

  function isDebug() {
    return /[?&]debug=1/.test(window.location.search);
  }

  function showFallback(status, subject, body, note, detail) {
    var cfg = window.STARXCO_CONFIG;
    var waNumber = cfg.whatsapp || "2348153299587";
    var full = subject + "\n\n" + body;

    status.className = "form-status warn";
    status.textContent = "";

    var p = document.createElement("p");
    p.textContent = note;
    status.appendChild(p);

    /* ?debug=1 — reveal why the automatic send was refused (for the site owner) */
    if (isDebug()) {
      var host = window.location.hostname;
      var live = (host === cfg.domain || host === "www." + cfg.domain);
      var dbg = document.createElement("pre");
      dbg.className = "form-debug";
      dbg.textContent =
        "automatic delivery: refused\n" +
        "reason reported by service: " + (detail || "no response received") + "\n" +
        "page address: " + host + "\n" +
        "form delivers from: " + cfg.domain + " (activation is domain-bound)\n" +
        "status: " + (live
          ? "on the live domain — if this recurs, the activation may have lapsed; sign in to the inbox and reactivate."
          : "PREVIEW/DEPLOYMENT MISMATCH — forms can only deliver from " + cfg.domain +
            ". Deploy the site there to test delivery; the fallback buttons above still reach the desk.");
      status.appendChild(dbg);
    }

    var row = document.createElement("div");
    row.className = "fallback-actions";

    var wa = document.createElement("a");
    wa.className = "btn btn--sm";
    wa.href = "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(full);
    wa.target = "_blank";
    wa.rel = "noopener";
    wa.textContent = "Send on WhatsApp";

    var mail = document.createElement("a");
    mail.className = "btn btn--sm btn--ghost";
    mail.href = "mailto:" + cfg.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    mail.textContent = "Send by email";

    var copy = document.createElement("button");
    copy.type = "button";
    copy.className = "btn btn--sm btn--ghost";
    copy.textContent = "Copy details";
    copy.addEventListener("click", function () { copyText(full, copy); });

    var summary = document.createElement("textarea");
    summary.className = "form-summary";
    summary.readOnly = true;
    summary.value = full;
    summary.setAttribute("aria-label", "Your message details");

    row.appendChild(wa);
    row.appendChild(mail);
    row.appendChild(copy);
    status.appendChild(row);
    status.appendChild(summary);
    status.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  function summaryText(data) {
    var lines = [];
    Object.keys(data).forEach(function (k) {
      if (data[k]) lines.push(k.replace(/[-_]/g, " ").toUpperCase() + ": " + data[k]);
    });
    return lines.join("\n");
  }

  document.querySelectorAll("form[data-form]").forEach(function (form) {
    var status = form.querySelector(".form-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = readForm(form);

      /* basic required check */
      var missing = [];
      form.querySelectorAll("[required]").forEach(function (f) {
        if (!String(f.value || "").trim()) missing.push(f.name || f.id);
      });
      if (missing.length) {
        status.className = "form-status err";
        status.textContent = "Please complete: " + missing.join(", ") + ".";
        return;
      }

      var cfg = window.STARXCO_CONFIG;
      var body = summaryText(data);
      var subject = (form.getAttribute("data-subject") || "New enquiry") + " — " + (data.company || data.name || "StarXCO website");
      var inbox = cfg.formEmail || cfg.email;
      var emailOk = /.+@.+\..+/.test(inbox) && !/\.example$|@example\./.test(inbox);

      if (!emailOk && !cfg.endpoint) {
        showFallback(status, subject, body, "This form is not connected to an inbox yet.");
        return;
      }

      var target = cfg.endpoint || "https://formsubmit.co/ajax/" + inbox;
      var payload = Object.assign({}, data, {
        _subject: subject,
        _template: "table",
        _captcha: "false"
      });

      fetch(target, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json().catch(function () { return { success: r.ok }; }); })
        .then(function (j) {
          /* FormSubmit returns "true" / "True" / true depending on endpoint */
          if (j && String(j.success).toLowerCase() === "true") {
            status.className = "form-status ok";
            status.textContent = "Thank you — your requirement has been sent. Our team will review it and respond directly.";
            form.reset();
            return;
          }
          /* Not yet activated, or the service declined the submission: hand the
             visitor a guaranteed route instead of a dead end. */
          var msg = (j && j.message) || "";
          var note = /activat/i.test(msg)
            ? "This form is not accepting automatic sends from this address. Your message is ready — send it now with one tap:"
            : "We could not send it automatically. Your message is ready — send it now with one tap:";
          if (window.console && console.warn) {
            console.warn("StarXCO form: automatic send refused —", msg, "| page host:", location.hostname);
          }
          showFallback(status, subject, body, note, msg || "no message returned");
        })
        .catch(function (err) {
          if (window.console && console.warn) console.warn("StarXCO form: automatic send failed —", err);
          showFallback(status, subject, body, "We could not reach the form service. Your message is ready — send it now with one tap:", String(err));
        });
    });
  });

  /* ---------- confirmation after a native (no-JS) form post ---------- */
  if (/[?&]sent=1/.test(window.location.search)) {
    var sentForm = document.querySelector("form[data-form]");
    var sentStatus = sentForm && sentForm.querySelector(".form-status");
    if (sentStatus) {
      sentStatus.className = "form-status ok";
      sentStatus.textContent = "Thank you — your message has been sent. Our team will review it and respond directly.";
      sentStatus.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }

  /* ---------- button click ripple ---------- */
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");

  document.addEventListener("pointerdown", function (e) {
    if (!e.target || !e.target.closest) return;
    var btn = e.target.closest(".btn");
    if (!btn) return;
    if (reduceMotion && reduceMotion.matches) return;

    var box = btn.getBoundingClientRect();
    var size = Math.max(box.width, box.height) * 1.9;
    var x = (e.clientX || box.left + box.width / 2) - box.left - size / 2;
    var y = (e.clientY || box.top + box.height / 2) - box.top - size / 2;

    var ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.setAttribute("aria-hidden", "true");
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";

    btn.appendChild(ripple);
    ripple.addEventListener("animationend", function () {
      if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
    });
  });
})();
