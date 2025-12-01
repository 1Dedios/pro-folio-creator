// public/js/topbar.js
// ES module version of the topbar/ avatar injection + dropdown.
// Exports initTopbar (default) and auto-initializes when imported.

export default function initTopbar(APP_USER = null) {
  // safe-guard: only initialize once
  if (window.__TOPBAR_INITIALIZED) return;
  window.__TOPBAR_INITIALIZED = true;

  // find the existing nav UL: <header><nav><ul>...</ul></nav></header>
  const navUl = document.querySelector("header nav ul");
  if (!navUl) return;

  // Create a Profile <li><a> and append (minimal injection)
  const profileLi = document.createElement("li");
  profileLi.style.listStyle = "none";
  profileLi.style.display = "inline";
  profileLi.style.marginLeft = "10px";

  const profileA = document.createElement("a");
  profileA.className = "nav-item";
  profileA.href = APP_USER ? `/profile/${APP_USER._id}` : "/";
  profileA.textContent = "Profile";
  profileLi.appendChild(profileA);
  navUl.appendChild(profileLi);

  // Create small avatar button (appended to the nav to avoid changing header layout)
  const avatarLi = document.createElement("li");
  avatarLi.style.listStyle = "none";
  avatarLi.style.display = "inline";
  avatarLi.style.marginLeft = "12px";

  const avatarBtn = document.createElement("button");
  avatarBtn.type = "button";
  avatarBtn.className = "avatar-btn";
  avatarBtn.style.border = "none";
  avatarBtn.style.background = "transparent";
  avatarBtn.style.padding = "0";
  avatarBtn.style.cursor = "pointer";

  const avatarImg = document.createElement("img");
  avatarImg.className = "avatar";
  avatarImg.alt = "avatar";
  avatarImg.width = 36;
  avatarImg.height = 36;
  avatarImg.style.borderRadius = "6px";
  avatarImg.style.verticalAlign = "middle";
  avatarImg.src =
    APP_USER && APP_USER.profilePictureUrl
      ? APP_USER.profilePictureUrl
      : "/public/img/default-avatar.png";

  avatarBtn.appendChild(avatarImg);
  avatarLi.appendChild(avatarBtn);
  navUl.appendChild(avatarLi);

  // Dropdown (small, injected)
  const dropdown = document.createElement("div");
  dropdown.className = "dropdown";
  dropdown.style.display = "none";
  dropdown.style.position = "absolute";
  dropdown.style.right = "10px";
  dropdown.style.top = "56px";
  dropdown.style.minWidth = "180px";
  dropdown.style.padding = "8px";
  dropdown.style.borderRadius = "8px";
  dropdown.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
  dropdown.style.background = "#fff";
  dropdown.style.zIndex = 1000;

  if (APP_USER) {
    const name = document.createElement("div");
    name.textContent = APP_USER.username || "";
    name.className = "dropdown-name";
    name.style.fontWeight = "700";
    dropdown.appendChild(name);

    const email = document.createElement("div");
    email.textContent = APP_USER.email || "";
    email.className = "dropdown-email";
    email.style.color = "#666";
    email.style.fontSize = "13px";
    email.style.marginTop = "4px";
    dropdown.appendChild(email);

    const hr = document.createElement("hr");
    hr.style.margin = "8px 0";
    dropdown.appendChild(hr);

    const view = document.createElement("a");
    view.href = `/profile/${APP_USER._id}`;
    view.textContent = "View profile";
    view.className = "dropdown-item";
    view.style.display = "block";
    view.style.padding = "6px 0";
    dropdown.appendChild(view);

    const logout = document.createElement("a");
    logout.href = "/users/logout";
    logout.textContent = "Log out";
    logout.className = "dropdown-item";
    logout.style.display = "block";
    logout.style.padding = "6px 0";
    dropdown.appendChild(logout);
  } else {
    const sign = document.createElement("a");
    sign.href = "/users/signup";
    sign.textContent = "Sign up";
    sign.className = "dropdown-item";
    sign.style.display = "block";
    sign.style.padding = "6px 0";
    dropdown.appendChild(sign);

    const login = document.createElement("a");
    login.href = "/users/login";
    login.textContent = "Log in";
    login.className = "dropdown-item";
    login.style.display = "block";
    login.style.padding = "6px 0";
    dropdown.appendChild(login);
  }

  // Append dropdown to header (absolute positioned)
  const header = document.querySelector("header");
  if (header) {
    // ensure header positioned so the absolute dropdown will align
    if (getComputedStyle(header).position === "static") {
      header.style.position = "relative";
    }
    header.appendChild(dropdown);
  } else {
    document.body.appendChild(dropdown);
  }

  // Positioning: place dropdown near the avatar
  function positionDropdown() {
    const rect = avatarBtn.getBoundingClientRect();
    // compute left so the dropdown's right edge aligns with avatar's right edge
    const left = rect.right + window.scrollX - dropdown.offsetWidth;
    dropdown.style.top = `${rect.bottom + window.scrollY + 6}px`;
    dropdown.style.left = `${left}px`;
  }

  // Toggle dropdown
  avatarBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (dropdown.style.display === "block") {
      dropdown.style.display = "none";
    } else {
      // must ensure dropdown is in DOM and rendered to get offsetWidth
      positionDropdown();
      dropdown.style.display = "block";
    }
  });

  // Close on outside click & ESC
  document.addEventListener("click", (ev) => {
    if (!avatarBtn.contains(ev.target) && !dropdown.contains(ev.target)) {
      dropdown.style.display = "none";
    }
  });
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") dropdown.style.display = "none";
  });

  // reposition on resize
  window.addEventListener("resize", () => {
    if (dropdown.style.display === "block") positionDropdown();
  });

  // return a small API in case other modules want to interact
  return {
    show() {
      positionDropdown();
      dropdown.style.display = "block";
    },
    hide() {
      dropdown.style.display = "none";
    },
    destroy() {
      dropdown.remove();
      avatarBtn.remove();
      profileLi.remove();
      window.__TOPBAR_INITIALIZED = false;
    },
  };
}

// Auto-initialize when module is imported (useful if you just include it by script)
if (typeof window !== "undefined") {
  // Wait for DOM ready before using window.__APP_USER
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      // window.__APP_USER should be injected server-side into the page if available
      const appUser = window.__APP_USER ?? null;
      initTopbar(appUser);
    });
  } else {
    initTopbar(window.__APP_USER ?? null);
  }
}
