/* Dylan Blanchard — site behaviour.
   Vanilla, no dependencies. Everything here is progressive enhancement:
   with JS off you still get the full gallery, working links and a usable form. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var site = window.SITE || {};

  /* ---------------------------------------------------------------- header */
  var header = document.querySelector(".site-header");
  if (header) {
    var setStuck = function () {
      header.classList.toggle("is-stuck", window.scrollY > 24);
    };
    setStuck();
    window.addEventListener("scroll", setStuck, { passive: true });
  }

  /* ------------------------------------------------------------ mobile nav */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
      document.body.classList.toggle("is-locked", !open);
      if (!open) {
        var first = nav.querySelector("a");
        if (first) first.focus();
      }
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        document.body.classList.remove("is-locked");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        document.body.classList.remove("is-locked");
        toggle.focus();
      }
    });
  }

  /* --------------------------------------------------------------- reveals */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length && !reduceMotion && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------------------------------------------------------- contact form
     Live paths (no custom server required):
       1. Netlify Forms — data-netlify on the form (default in contact.html)
       2. Formspree — set SITE.formspreeId in js/site-config.js
     Until one of those is active, submit is blocked with a clear status message. */
  var form = document.querySelector("form.form");
  if (form) {
    var formStatus = document.getElementById("form-status");
    var submitBtn = form.querySelector('button[type="submit"]');
    var formspreeId = String(site.formspreeId || "").trim();
    var usesNetlify =
      form.hasAttribute("data-netlify") ||
      form.getAttribute("netlify") !== null ||
      form.querySelector('input[name="form-name"]');

    if (formspreeId) {
      form.setAttribute("action", "https://formspree.io/f/" + formspreeId);
      form.setAttribute("method", "POST");
      form.removeAttribute("data-netlify");
      form.removeAttribute("netlify");
    }

    function setStatus(msg, isError) {
      if (!formStatus) return;
      formStatus.textContent = msg;
      formStatus.classList.toggle("field__hint--error", !!isError);
      formStatus.classList.toggle("field__hint--ok", !isError && !!msg);
    }

    function setBusy(busy) {
      if (!submitBtn) return;
      submitBtn.disabled = !!busy;
      submitBtn.setAttribute("aria-busy", busy ? "true" : "false");
    }

    function isLocalPreview() {
      var host = location.hostname;
      return (
        location.protocol === "file:" ||
        host === "" ||
        host === "localhost" ||
        host === "127.0.0.1" ||
        host === "[::1]"
      );
    }

    /* Static-only hosts can't process a Netlify Forms POST — GitHub Pages
       answers POST with 405, so the visitor lands on an error and the enquiry
       is lost. Treat these as "no backend" unless Formspree is configured. */
    function isStaticOnlyHost() {
      return /(^|\.)github\.io$/i.test(location.hostname);
    }

    function formIsLive() {
      var action = form.getAttribute("action") || "";
      if (/formspree\.io\/f\/[A-Za-z0-9]+/i.test(action)) return "formspree";
      /* Local preview never delivers — avoid a fake "success" via thanks.html. */
      if (isLocalPreview()) return "";
      if (isStaticOnlyHost()) return "";
      /* On a real host with Netlify Forms markup, allow the normal POST.
         (Custom domains on Netlify do not use *.netlify.app in the hostname.) */
      if (usesNetlify) return "netlify";
      return "";
    }

    form.addEventListener("submit", function (e) {
      if (typeof form.reportValidity === "function" && !form.reportValidity()) {
        e.preventDefault();
        return;
      }

      /* Honeypot filled → pretend success, do not send. */
      var honey = form.querySelector('[name="bot-field"]');
      if (honey && honey.value) {
        e.preventDefault();
        setStatus("Thanks — your enquiry has been sent.", false);
        form.reset();
        return;
      }

      var mode = formIsLive();

      if (!mode) {
        e.preventDefault();
        setStatus(
          "Enquiries are not live yet. To enable them: deploy on Netlify (form works automatically), or add a free Formspree id in js/site-config.js.",
          true
        );
        return;
      }

      /* Formspree — AJAX so the visitor stays on the page. */
      if (mode === "formspree") {
        e.preventDefault();
        setBusy(true);
        setStatus("Sending…", false);

        var data = new FormData(form);
        fetch(form.action, {
          method: "POST",
          body: data,
          headers: { Accept: "application/json" }
        })
          .then(function (res) {
            if (!res.ok) throw new Error("send failed");
            setStatus("Thanks — your enquiry is on its way. Dylan will reply by email.", false);
            form.reset();
          })
          .catch(function () {
            setStatus(
              "Something went wrong sending that. Please try again in a moment, or email directly if the problem continues.",
              true
            );
          })
          .then(function () {
            setBusy(false);
          });
        return;
      }

      /* Netlify — allow the normal POST (redirects to thanks.html). */
      setStatus("Sending…", false);
      setBusy(true);
    });

    if (!formIsLive() && formStatus) {
      setStatus(
        "Preview mode: the form validates, but messages are not delivered until the site is on Netlify or a Formspree id is set in js/site-config.js.",
        false
      );
    } else if (formspreeId && formStatus) {
      setStatus("Messages go to the connected Formspree inbox.", false);
    } else if (formStatus && usesNetlify) {
      setStatus("Messages are delivered through the site host when this page is live.", false);
    }
  }

  /* -------------------------------------------------------------- lightbox */
  var frames = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
  var box = document.querySelector(".lightbox");
  if (!frames.length || !box) return;

  var img = box.querySelector(".lightbox__img");
  var titleEl = box.querySelector(".lightbox__title");
  var metaEl = box.querySelector(".lightbox__meta");
  var btnClose = box.querySelector(".lightbox__close");
  var btnPrev = box.querySelector(".lightbox__nav--prev");
  var btnNext = box.querySelector(".lightbox__nav--next");
  if (!img || !titleEl || !metaEl || !btnClose || !btnPrev || !btnNext) return;

  var index = 0;
  var lastFocused = null;
  var closeTimer = null;

  function render(i) {
    index = (i + frames.length) % frames.length;
    var frame = frames[index];
    var full = frame.getAttribute("data-full");
    if (full) img.src = full;
    img.alt = frame.getAttribute("data-alt") || "";
    titleEl.textContent = frame.getAttribute("data-title") || "";
    metaEl.textContent = frame.getAttribute("data-meta") || "";
  }

  function open(i) {
    if (closeTimer !== null) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
    lastFocused = document.activeElement;
    render(i);
    box.classList.add("is-open");
    box.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    // Force a reflow so the browser records opacity:0 as the transition's start
    // value. rAF looks equivalent but never fires in a backgrounded tab, which
    // would strand the overlay invisible while the page stays scroll-locked.
    void box.offsetWidth;
    box.classList.add("is-visible");
    btnClose.focus();
  }

  function close() {
    if (!box.classList.contains("is-open")) return;
    box.classList.remove("is-visible");
    var done = function () {
      closeTimer = null;
      // A later open() may have cancelled this timer and re-shown the box;
      // only tear down if we are still mid-close (not visible).
      if (box.classList.contains("is-visible")) return;
      box.classList.remove("is-open");
      box.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-locked");
      img.removeAttribute("src");
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    };
    if (reduceMotion) {
      done();
    } else {
      if (closeTimer !== null) clearTimeout(closeTimer);
      closeTimer = setTimeout(done, 300);
    }
  }

  frames.forEach(function (frame, i) {
    frame.addEventListener("click", function (e) {
      e.preventDefault();
      open(i);
    });
  });

  btnClose.addEventListener("click", close);
  btnPrev.addEventListener("click", function () { render(index - 1); });
  btnNext.addEventListener("click", function () { render(index + 1); });

  box.addEventListener("click", function (e) {
    if (e.target === box || e.target.classList.contains("lightbox__stage")) close();
  });

  document.addEventListener("keydown", function (e) {
    if (!box.classList.contains("is-open")) return;
    if (e.key === "Escape") { close(); }
    else if (e.key === "ArrowLeft") { render(index - 1); }
    else if (e.key === "ArrowRight") { render(index + 1); }
    else if (e.key === "Tab") {
      // keep focus inside the overlay while it is up
      var focusables = [btnClose, btnPrev, btnNext];
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  });
})();
