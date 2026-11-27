(() => {
  "use strict";
  const config = window.LORENZO_SITE || {};
  const isDemo = true;
  if (isDemo) {
    const robots = document.createElement("meta"); robots.name = "robots"; robots.content = "noindex,nofollow"; document.head.appendChild(robots);
    const banner = document.createElement("div"); banner.className = "demo-banner"; banner.textContent = "Demoversion – formuläret skickar eller sparar inga personuppgifter."; document.body.prepend(banner);
  }
  document.querySelectorAll("[data-phone]").forEach((node) => { node.textContent = config.phoneDisplay; if (node.tagName === "A") node.href = `tel:${config.phoneHref}`; });
  document.querySelectorAll("[data-address]").forEach((node) => node.textContent = config.streetDisplay);
  document.querySelectorAll(".location").forEach((node) => { node.textContent = `● ${config.streetDisplay}, Stockholm`; });
  document.querySelectorAll("[data-directions]").forEach((node) => { node.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.directionsQuery)}`; });
  document.querySelectorAll("[data-facebook]").forEach((node) => { if (config.facebookUrl) node.href = config.facebookUrl; else node.hidden = true; });
  document.querySelectorAll("[data-hours]").forEach((node) => { node.textContent = config.hours.length ? config.hours.join(" · ") : "Öppettider bekräftas per telefon"; });
  const menuButton = document.querySelector("[data-menu-button]");
  const menu = document.querySelector("[data-menu]");
  if (menuButton && menu) {
    const mobileMenu = matchMedia("(max-width: 760px)");
    const syncMenu = () => { menu.hidden = mobileMenu.matches; menuButton.setAttribute("aria-expanded", "false"); };
    syncMenu(); mobileMenu.addEventListener("change", syncMenu);
    menuButton.addEventListener("click", () => { const open = menuButton.getAttribute("aria-expanded") === "true"; menuButton.setAttribute("aria-expanded", String(!open)); menu.hidden = open; });
  }
  const form = document.querySelector("[data-booking-form]");
  if (!form) return;
  const status = form.querySelector("[data-form-status]");
  const submit = form.querySelector("button[type=submit]");
  if (!isDemo) fetch(config.csrfEndpoint, { credentials: "same-origin", headers: { Accept: "application/json" } }).then((r) => r.ok ? r.json() : Promise.reject()).then((data) => { form.elements.csrf_token.value = data.token; }).catch(() => { status.textContent = "Formuläret kunde inte förberedas. Ring oss gärna i stället."; status.className = "form-status error"; });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (isDemo) { status.textContent = "Demoläge: inga uppgifter har skickats eller sparats."; status.className = "form-status success"; return; }
    submit.disabled = true; submit.textContent = "Skickar …"; status.textContent = "";
    try {
      const response = await fetch(config.formEndpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" }, credentials: "same-origin" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Förfrågan kunde inte skickas.");
      form.reset(); status.textContent = "Tack! Din förfrågan är skickad. Vi kontaktar dig för att komma överens om tid och pris."; status.className = "form-status success";
    } catch (error) { status.textContent = error.message || "Något gick fel. Ring oss gärna i stället."; status.className = "form-status error"; }
    finally { submit.disabled = false; submit.textContent = "Skicka bokningsförfrågan"; }
  });
})();


