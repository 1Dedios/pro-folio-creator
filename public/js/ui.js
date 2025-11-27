document.addEventListener("DOMContentLoaded", () => {
  const avatarBtn = document.getElementById("avatarBtn");
  const dropdown = document.getElementById("avatarDropdown");
  if (!avatarBtn || !dropdown) {
    console.warn("ui.js: avatarBtn or avatarDropdown not found");
    return;
  }

  // set ARIA
  avatarBtn.setAttribute("aria-haspopup", "true");
  avatarBtn.setAttribute("aria-expanded", "false");
  dropdown.setAttribute("aria-hidden", "true");

  const openDropdown = () => {
    dropdown.classList.add("open");
    dropdown.classList.remove("hidden");
    avatarBtn.setAttribute("aria-expanded", "true");
    dropdown.setAttribute("aria-hidden", "false");
  };
  const closeDropdown = () => {
    dropdown.classList.remove("open");
    dropdown.classList.add("hidden");
    avatarBtn.setAttribute("aria-expanded", "false");
    dropdown.setAttribute("aria-hidden", "true");
  };
  const toggleDropdown = (ev) => {
    ev && ev.preventDefault();
    ev && ev.stopPropagation();
    if (dropdown.classList.contains("open")) closeDropdown();
    else openDropdown();
  };

  avatarBtn.addEventListener("click", toggleDropdown);
  avatarBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleDropdown(e);
    }
  });

  document.addEventListener("click", (e) => {
    if (!avatarBtn.contains(e.target) && !dropdown.contains(e.target)) {
      closeDropdown();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDropdown();
  });

  dropdown.addEventListener("click", (e) => e.stopPropagation());
});
