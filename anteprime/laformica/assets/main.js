/* Configurazione invio moduli.
   Inserire la chiave Web3Forms (https://web3forms.com) legata a info@laformicaedilizia.it.
   Finché è vuota, i moduli mostrano un messaggio di anteprima e non inviano nulla. */
const WEB3FORMS_KEY = "";

// Ogni pagina si apre dall'inizio, salvo link a una sezione precisa
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
const toTop = () => { if (!location.hash) window.scrollTo({ top: 0, left: 0, behavior: "instant" }); };
toTop();
window.addEventListener("pageshow", toTop);

document.addEventListener("DOMContentLoaded", () => {
  toTop();
  // Menu mobile
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
  }

  // Header: solido dopo lo scroll
  const header = document.querySelector(".header");
  const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Chiudi il menu mobile al click su un link
  nav && nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("open")));

  // Indice servizi: evidenzia la sezione visibile
  const pills = document.querySelectorAll(".svc-nav a");
  if (pills.length && "IntersectionObserver" in window) {
    const map = new Map([...pills].map((a) => [a.getAttribute("href").slice(1), a]));
    const so = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          pills.forEach((p) => p.classList.remove("active"));
          const a = map.get(e.target.id);
          if (a) { a.classList.add("active"); const c = a.parentElement; c.scrollTo({ left: a.offsetLeft - c.clientWidth / 2 + a.offsetWidth / 2, behavior: "smooth" }); }
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll(".svc").forEach((s) => so.observe(s));
  }

  // Animazioni in ingresso
  const items = document.querySelectorAll(".reveal, .reveal-img, .steps");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add("in"));
  }

  // Anno nel footer
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  // Moduli
  document.querySelectorAll("form[data-form]").forEach((form) => {
    const status = form.querySelector(".form-status");
    const btn = form.querySelector("button[type=submit]");
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      status.className = "form-status";
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (form.querySelector(".hp input")?.value) return;

      if (!WEB3FORMS_KEY) {
        status.textContent = "Anteprima: invio disattivato. Il modulo verrà attivato sul sito definitivo.";
        status.classList.add("ok");
        return;
      }
      const data = new FormData(form);
      data.append("access_key", WEB3FORMS_KEY);
      data.append("subject", form.dataset.subject || "Nuova richiesta dal sito");
      data.append("from_name", "Sito La Formica");
      const label = btn.innerHTML;
      btn.disabled = true; btn.textContent = "Invio in corso...";
      try {
        const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: data });
        const json = await res.json();
        if (json.success) {
          form.reset();
          status.textContent = "Grazie, abbiamo ricevuto la tua richiesta. Ti ricontatteremo al più presto.";
          status.classList.add("ok");
        } else { throw new Error(); }
      } catch {
        status.textContent = "Invio non riuscito. Riprova o chiamaci al 334 288 9200.";
        status.classList.add("err");
      } finally {
        btn.disabled = false; btn.innerHTML = label;
      }
    });
  });
});
