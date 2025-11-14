const translations = {
  es: {
    "title": "Control de Material - Dashboard",
  },
  en: {
    "title": "Material Control - Dashboard",
  },
  zh: {
    "title": "物资管理 - 控制面板",
  }
};

function setLanguage(lang) {
  localStorage.setItem("lang", lang);

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  document.querySelectorAll("#language-selector .lang-btn")
    .forEach(btn => btn.classList.remove("active"));
  document.querySelector(`#language-selector .lang-btn[data-lang="${lang}"]`)
    .classList.add("active");
}

document.addEventListener("DOMContentLoaded", () => {
  let saved = localStorage.getItem("lang") || "es";
  setLanguage(saved);

  document.querySelectorAll("#language-selector .lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      setLanguage(btn.dataset.lang);
    });
  });
});
