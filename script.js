
"use strict";

/* ==========================================
   OPERACIÓN STEF.EXE — EXPEDIENTE 2310
   ========================================== */

const EVENT = Object.freeze({
  name: "STEF",
  operation: "OPERACIÓN STEF.EXE",
  date: "2026-10-24",
  time: "15:30",
  estimatedTime: "15:30",
  location: "Azcuénaga 1035, CABA, Argentina",
  rsvpEndpoint:
    "https://script.google.com/macros/s/AKfycbwRmpf4ejxgaOz8m39sfIYgjpMxJAT6u8Ayu0i0hMcn26l-xFo9zzKbzDhyQ9Kxx_ZsWQ/exec"
});

const $ = selector => document.querySelector(selector);

function setText(selector, value) {
  const element = $(selector);
  if (element) element.textContent = value;
}

function prefersReducedMotion() {
  return window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
}

function argentinaDate(date, time) {
  return new Date(`${date}T${time}:00-03:00`);
}

/* ==========================================
   INFORMACIÓN DEL EVENTO
   ========================================== */

function initializeEvent() {
  const date = new Date(
    `${EVENT.date}T12:00:00-03:00`
  );

  if (!Number.isNaN(date.getTime())) {
    const formattedDate = new Intl.DateTimeFormat(
      "es-AR",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "America/Argentina/Buenos_Aires"
      }
    ).format(date);

    setText("#event-date", formattedDate.toUpperCase());
  }

  setText(
    "#event-time",
    EVENT.time
      ? `${EVENT.time} HS`
      : "HORARIO A CONFIRMAR"
  );

  setText(
    "#event-location",
    EVENT.location || "UBICACIÓN BAJO INVESTIGACIÓN"
  );

  initializeCalendar();
  initializeMap();
}

/* ==========================================
   GOOGLE CALENDAR
   ========================================== */

function initializeCalendar() {
  const link = $("#calendar-link");
  if (!link) return;

  const compactDate = EVENT.date.replaceAll("-", "");

  const nextDate = new Date(
    `${EVENT.date}T12:00:00-03:00`
  );

  nextDate.setTime(nextDate.getTime() + 86400000);

  const nextDay = new Intl.DateTimeFormat(
    "en-CA",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "America/Argentina/Buenos_Aires"
    }
  )
    .format(nextDate)
    .replaceAll("-", "");

  let dates = `${compactDate}/${nextDay}`;

  if (EVENT.time) {
    const start = argentinaDate(
      EVENT.date,
      EVENT.time
    );

    const end = new Date(
      start.getTime() + 3 * 60 * 60 * 1000
    );

    const formatDate = date =>
      date
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "");

    dates = `${formatDate(start)}/${formatDate(end)}`;
  }

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: "Cumpleaños de Stef · Operación Stef.exe",
    dates,
    details: EVENT.time
      ? "Expediente 2310. Aguante el Rojo."
      : "Horario pendiente de confirmación.",
    location: EVENT.location
  });

  link.href =
    `https://calendar.google.com/calendar/render?${params}`;
}

/* ==========================================
   GOOGLE MAPS
   ========================================== */

function initializeMap() {
  if (!EVENT.location) return;

  const container = $("#map-container");
  const link = $("#map-link");

  if (container) {
    const iframe = document.createElement("iframe");

    iframe.title = "Ubicación del cumpleaños de Stef";
    iframe.loading = "lazy";
    iframe.referrerPolicy =
      "no-referrer-when-downgrade";

    iframe.src =
      "https://www.google.com/maps?q=" +
      encodeURIComponent(EVENT.location) +
      "&output=embed";

    container.replaceChildren(iframe);
  }

  if (link) {
    link.hidden = false;

    link.href =
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(EVENT.location);
  }

  setText(
    "#map-caption",
    "Ubicación desclasificada. Consultá el mapa."
  );
}

/* ==========================================
   CUENTA REGRESIVA
   ========================================== */

let countdownInterval = null;

function initializeCountdown() {
  const target = argentinaDate(
    EVENT.date,
    EVENT.time || EVENT.estimatedTime
  );

  setText(
    "#countdown-note",
    EVENT.time
      ? "SÁBADO 24 DE OCTUBRE · 15:30 HS · ¡NOS VEMOS AHÍ!"
      : "Horario estimado para el contador. El horario real todavía no está confirmado."
  );

  function updateCountdown() {
    if (Number.isNaN(target.getTime())) {
      setText(
        "#countdown-note",
        "ERROR 2310: FECHA INVÁLIDA."
      );
      return false;
    }

    const difference = Math.max(
      0,
      target.getTime() - Date.now()
    );

    const values = [
      Math.floor(difference / 86400000),
      Math.floor(difference / 3600000) % 24,
      Math.floor(difference / 60000) % 60,
      Math.floor(difference / 1000) % 60
    ];

    const selectors = [
      "#days",
      "#hours",
      "#minutes",
      "#seconds"
    ];

    selectors.forEach((selector, index) => {
      setText(
        selector,
        String(values[index]).padStart(2, "0")
      );
    });

    if (difference === 0) {
      setText(
        "#countdown-note",
        "LLEGÓ EL DÍA DEL OPERATIVO."
      );
      return false;
    }

    return true;
  }

  if (updateCountdown()) {
    countdownInterval = setInterval(() => {
      if (!updateCountdown()) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }
    }, 1000);
  }
}

/* ==========================================
   ANIMACIONES AL HACER SCROLL
   ========================================== */

function initializeReveal() {
  const elements = document.querySelectorAll(".reveal");

  if (
    !("IntersectionObserver" in window) ||
    prefersReducedMotion()
  ) {
    elements.forEach(element => {
      element.classList.add("is-visible");
    });
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.07 }
  );

  document.documentElement.classList.add("js-motion");

  elements.forEach(element => {
    observer.observe(element);
  });
}

/* ==========================================
   ESTADÍSTICAS — PERFIL DEL OBJETIVO
   ========================================== */

function initializeStatsAnimation() {
  const section = $("#perfil");
  const stats = $(".fake-stats");
  const dignityFill = $("#dignity-fill");
  const dignityValue = $("#dignity-value");

  if (
    !section ||
    !stats ||
    !dignityFill ||
    !dignityValue
  ) {
    return;
  }

  dignityFill.style.width = "0%";
  dignityValue.textContent = "0%";

  const clutchFill = stats.querySelector(".clutch-fill");

  if (clutchFill) {
    clutchFill.style.width = "0%";
  }

  if (prefersReducedMotion()) {
    stats.classList.add("stats-animated");
    return;
  }

  let started = false;

  function animateDignity() {
    const duration = 5500;
    let startTime = null;

    function easeInOutCubic(t) {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function frame(timestamp) {
      if (startTime === null) {
        startTime = timestamp;
      }

      const elapsed = Math.min(
        timestamp - startTime,
        duration
      );

      const progress = elapsed / duration;
      let percentage;

      if (progress <= 0.5) {
        percentage =
          easeInOutCubic(progress * 2) * 100;
      } else {
        percentage =
          (
            1 -
            easeInOutCubic((progress - 0.5) * 2)
          ) * 100;
      }

      dignityFill.style.width = `${percentage}%`;
      dignityValue.textContent =
        `${Math.round(percentage)}%`;

      if (elapsed < duration) {
        requestAnimationFrame(frame);
      } else {
        dignityFill.style.width = "0%";
        dignityValue.textContent = "0%";
      }
    }

    requestAnimationFrame(frame);
  }

  function startAnimation() {
    if (started) return;

    started = true;
    stats.classList.add("stats-animated");
    animateDignity();
  }

  if (!("IntersectionObserver" in window)) {
    const onScroll = () => {
      const rect = section.getBoundingClientRect();

      if (
        rect.top < window.innerHeight * 0.7 &&
        rect.bottom > window.innerHeight * 0.3
      ) {
        startAnimation();
        window.removeEventListener("scroll", onScroll);
      }
    };

    window.addEventListener(
      "scroll",
      onScroll,
      { passive: true }
    );

    onScroll();
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        startAnimation();
        observer.disconnect();
      }
    },
    {
      rootMargin: "-30% 0px -30% 0px",
      threshold: 0
    }
  );

  observer.observe(section);
}

/* ==========================================
   VENTANA WINDOWS 98
   ========================================== */

let retroPreviousFocus = null;

function openRetroConfirmation(attendance) {
  const overlay = $("#retro-overlay");
  const dialog = overlay?.querySelector(".retro-window");
  const title = $("#retro-title");
  const description = $("#retro-description");

  if (!overlay || !dialog || !title || !description) {
    return;
  }

  retroPreviousFocus = document.activeElement;

  title.textContent = "EXPEDIENTE ENVIADO";

  description.textContent =
    attendance === "no"
      ? "Tu declaración de ausencia fue enviada. El Organismo Internacional del Rojo lamenta profundamente tu arrugue :("
      : "¡EXPEDIENTE ENVIADO! El Organismo Internacional del Rojo recibió tu solicitud de confirmación. Sábado 24 de octubre, 15:30 HS. Azcuénaga 1035, CABA. Nos vemos ahí!!";

  overlay.hidden = false;
  document.body.style.overflow = "hidden";

  const acceptButton = $("#retro-accept");

  if (acceptButton) {
    acceptButton.focus();
  } else {
    dialog.focus();
  }
}

function closeRetroConfirmation() {
  const overlay = $("#retro-overlay");

  if (!overlay || overlay.hidden) return;

  overlay.hidden = true;
  document.body.style.overflow = "";

  if (
    retroPreviousFocus &&
    retroPreviousFocus.isConnected
  ) {
    retroPreviousFocus.focus();
  }
}

function initializeRetroConfirmation() {
  const overlay = $("#retro-overlay");
  const closeButton = $("#retro-close");
  const acceptButton = $("#retro-accept");

  if (!overlay) return;

  closeButton?.addEventListener(
    "click",
    closeRetroConfirmation
  );

  acceptButton?.addEventListener(
    "click",
    closeRetroConfirmation
  );

  overlay.addEventListener("click", event => {
    if (event.target === overlay) {
      closeRetroConfirmation();
    }
  });

  document.addEventListener("keydown", event => {
    if (overlay.hidden) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeRetroConfirmation();
      return;
    }

    if (event.key !== "Tab") return;

    const controls = [
      closeButton,
      acceptButton
    ].filter(element => element && !element.disabled);

    if (!controls.length) {
      event.preventDefault();
      return;
    }

    const first = controls[0];
    const last = controls[controls.length - 1];

    if (
      event.shiftKey &&
      (
        document.activeElement === first ||
        !overlay.contains(document.activeElement)
      )
    ) {
      event.preventDefault();
      last.focus();
    } else if (
      !event.shiftKey &&
      (
        document.activeElement === last ||
        !overlay.contains(document.activeElement)
      )
    ) {
      event.preventDefault();
      first.focus();
    }
  });
}

/* ==========================================
   FORMULARIO — GOOGLE SHEETS
   ========================================== */

function initializeRSVP() {
  const form = $("#rsvp-form");
  const status = $("#form-status");
  const button = $("#submit-rsvp");

  if (!form || !status || !button) return;

  let sending = false;

  form.addEventListener("submit", async event => {
    event.preventDefault();

    if (sending) return;

    status.textContent = "";

    if (!form.reportValidity()) {
      status.textContent =
        "FALTAN DATOS OBLIGATORIOS. COMPLETÁ EL EXPEDIENTE.";
      return;
    }

    const nameInput = $("#full-name");
    const attendanceInput = $("#attendance");
    const commentInput = $("#comment");

    if (
      !nameInput ||
      !attendanceInput ||
      !commentInput
    ) {
      status.textContent =
        "ERROR 2310: FALTAN CAMPOS DEL FORMULARIO.";
      return;
    }

    const nombre = nameInput.value.trim();
    const asistencia = attendanceInput.value;
    const comentario = commentInput.value.trim();

    if (nombre.length < 2) {
      status.textContent =
        "INGRESÁ UN NOMBRE VÁLIDO.";
      nameInput.focus();
      return;
    }

    if (
      asistencia !== "si" &&
      asistencia !== "no"
    ) {
      status.textContent =
        "TENÉS QUE INDICAR SI VENÍS O NO.";
      attendanceInput.focus();
      return;
    }

    const payload = {
      nombre,
      asistencia,
      comentario,
      evento: EVENT.operation,
      expediente: "2310"
    };

    if (!EVENT.rsvpEndpoint) {
      status.textContent =
        "ERROR 2310: EL FORMULARIO NO ESTÁ CONECTADO.";
      return;
    }

    sending = true;
    button.disabled = true;
    button.textContent = "ENVIANDO EXPEDIENTE…";

    try {
      await fetch(EVENT.rsvpEndpoint, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      });

      /*
       * no-cors no permite comprobar la respuesta
       * del servidor. La ventana confirma el ENVÍO,
       * no el guardado definitivo.
       */

      status.textContent =
        "✓ EXPEDIENTE ENVIADO AL ORGANISMO INTERNACIONAL DEL ROJO.";

      openRetroConfirmation(asistencia);

      // Se conservan los datos por si fuera
      // necesario volver a enviar la respuesta.
    } catch (error) {
      status.textContent =
        "ERROR: NO SE PUDO ENVIAR EL EXPEDIENTE. INTENTÁ NUEVAMENTE.";

      console.error(
        "Error al enviar la confirmación:",
        error
      );
    } finally {
      sending = false;
      button.disabled = false;
      button.textContent =
        "⚪ CONFIRMO MI PRESENCIA ⚪";
    }
  });
}

/* ==========================================
   BOTÓN SECRETO
   ========================================== */

function initializeSecret() {
  const button = $("#secret-button");
  const message = $("#secret-message");

  if (!button || !message) return;

  button.addEventListener("click", () => {
    const expanded =
      button.getAttribute("aria-expanded") === "true";

    const willOpen = !expanded;

    button.setAttribute(
      "aria-expanded",
      String(willOpen)
    );

    message.hidden = !willOpen;

    button.textContent = willOpen
      ? "VOLVER A CLASIFICAR ↗"
      : "NO TOCAR ↗";
  });
}

/* ==========================================
   VOLVER ARRIBA
   ========================================== */

function initializeBackTop() {
  const button = $("#back-top");

  if (!button) return;

  button.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion()
        ? "auto"
        : "smooth"
    });
  });
}

/* ==========================================
   INICIALIZACIÓN
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
  initializeEvent();
  initializeCountdown();
  initializeReveal();
  initializeStatsAnimation();
  initializeRetroConfirmation();
  initializeRSVP();
  initializeSecret();
  initializeBackTop();
});

/* ==========================================
   LIMPIEZA
   ========================================== */

window.addEventListener("pagehide", () => {
  if (countdownInterval !== null) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
});
