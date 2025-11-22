// public/js/profile.js
// Frontend-only rendering of a simple user profile page.
// No server calls — uses in-memory sample data and simulates actions.

(function () {
  // Sample data (replace with fetch calls later when backend is ready)
  const DB = {
    user: {
      username: "kartik",
      email: "kartik@example.com",
      profilePictureId: null,
      activePortfolioId: "p1",
    },
    portfolios: [
      {
        _id: "p1",
        title: "Fullstack Portfolio",
        description: "One-page portfolio showing projects and work experience.",
        sections: ["education", "projects", "experience"],
        updatedAt: "2025-11-01T10:00:00.000Z",
      },
      {
        _id: "p2",
        title: "Research & Publications",
        description: "Focused on publications and research projects.",
        sections: ["publications", "skills"],
        updatedAt: "2025-10-10T08:30:00.000Z",
      },
    ],
  };

  // DOM references
  const userCard = document.getElementById("userCard");
  const portfoliosContainer = document.getElementById("portfoliosContainer");
  const yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // Render functions
  function renderUser(user) {
    const avatarText = user.profilePictureId
      ? `[img:${user.profilePictureId}]`
      : "[no avatar]";
    userCard.innerHTML = "";
    const wrapper = document.createElement("div");

    const h2 = document.createElement("h2");
    h2.textContent = user.username;
    wrapper.appendChild(h2);

    const email = document.createElement("div");
    email.textContent = user.email;
    wrapper.appendChild(email);

    const avatar = document.createElement("div");
    avatar.textContent = avatarText;
    wrapper.appendChild(avatar);

    const saved = document.createElement("div");
    saved.textContent = `Saved portfolios: ${DB.portfolios.length}`;
    wrapper.appendChild(saved);

    userCard.appendChild(wrapper);
  }

  function renderPortfolios() {
    portfoliosContainer.innerHTML = "";
    if (!Array.isArray(DB.portfolios) || DB.portfolios.length === 0) {
      portfoliosContainer.textContent =
        "You don't have any portfolios yet. Use Create to add one.";
      return;
    }

    DB.portfolios.forEach((p) => {
      const card = document.createElement("div");
      card.setAttribute("data-id", p._id);

      const title = document.createElement("div");
      title.textContent = p.title;
      title.style.fontWeight = "700";
      card.appendChild(title);

      const meta = document.createElement("div");
      meta.textContent = p.description || "";
      card.appendChild(meta);

      const sections = document.createElement("div");
      sections.textContent = `Sections: ${
        Array.isArray(p.sections) ? p.sections.length : 0
      } • Last edited: ${formatDate(p.updatedAt)}`;
      card.appendChild(sections);

      const actions = document.createElement("div");

      const preview = document.createElement("a");
      preview.href = `#/portfolio/${p._id}`;
      preview.textContent = "Preview";
      preview.style.marginRight = "8px";
      actions.appendChild(preview);

      const activateBtn = document.createElement("button");
      activateBtn.textContent =
        DB.user.activePortfolioId === p._id ? "Active" : "Set active";
      activateBtn.disabled = DB.user.activePortfolioId === p._id;
      activateBtn.addEventListener("click", () => simulateActivate(p._id));
      actions.appendChild(activateBtn);

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.style.marginLeft = "8px";
      deleteBtn.addEventListener("click", () => simulateDelete(p._id));
      actions.appendChild(deleteBtn);

      card.appendChild(actions);

      // visual flag for active
      if (DB.user.activePortfolioId === p._id) {
        const flag = document.createElement("div");
        flag.textContent = " (ACTIVE)";
        flag.style.color = "green";
        title.appendChild(flag);
      }

      // small separator
      const hr = document.createElement("hr");
      card.appendChild(hr);

      portfoliosContainer.appendChild(card);
    });
  }

  // Simulated actions (update in-memory DB and re-render)
  function simulateActivate(id) {
    const found = DB.portfolios.find((p) => p._id === id);
    if (!found) return alert("Portfolio not found");
    DB.user.activePortfolioId = id;
    renderAll();
  }

  function simulateDelete(id) {
    if (!confirm("Delete this portfolio?")) return;
    const idx = DB.portfolios.findIndex((p) => p._id === id);
    if (idx === -1) return alert("Portfolio not found");
    DB.portfolios.splice(idx, 1);
    if (DB.user.activePortfolioId === id) DB.user.activePortfolioId = null;
    renderAll();
  }

  // helpers
  function formatDate(iso) {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch (e) {
      return String(iso);
    }
  }

  // overall render
  function renderAll() {
    renderUser(DB.user);
    renderPortfolios();
  }

  // initial render
  renderAll();
})();
