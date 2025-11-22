// public/js/ui.js
document.addEventListener("DOMContentLoaded", () => {
  const avatarBtn = document.getElementById("avatarBtn");
  const dropdown = document.getElementById("avatarDropdown");

  // defensive checks + helpful console logs
  if (!avatarBtn) {
    console.warn("ui.js: avatarBtn not found");
    return;
  }
  if (!dropdown) {
    console.warn("ui.js: avatarDropdown not found");
    return;
  }

  // initialize ARIA states
  avatarBtn.setAttribute("aria-haspopup", "true");
  avatarBtn.setAttribute("aria-expanded", "false");
  dropdown.setAttribute("aria-hidden", "true");

  const openDropdown = () => {
    dropdown.classList.add("open");
    avatarBtn.setAttribute("aria-expanded", "true");
    dropdown.setAttribute("aria-hidden", "false");
  };

  const closeDropdown = () => {
    dropdown.classList.remove("open");
    avatarBtn.setAttribute("aria-expanded", "false");
    dropdown.setAttribute("aria-hidden", "true");
  };

  const toggleDropdown = (ev) => {
    ev && ev.preventDefault();
    ev && ev.stopPropagation();
    if (dropdown.classList.contains("open")) closeDropdown();
    else openDropdown();
  };

  // click on avatar toggles dropdown
  avatarBtn.addEventListener("click", toggleDropdown);

  // keyboard support for avatar (Enter or Space)
  avatarBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleDropdown(e);
    }
  });

  // close when clicking outside the dropdown or avatar
  document.addEventListener("click", (e) => {
    if (!avatarBtn.contains(e.target) && !dropdown.contains(e.target)) {
      closeDropdown();
    }
  });

  // close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDropdown();
    }
  });

  // prevent clicks inside the dropdown from bubbling to document (so clicking links works)
  dropdown.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // Small safety: close dropdown on window blur (useful when switching tabs)
  window.addEventListener("blur", () => closeDropdown());
});
