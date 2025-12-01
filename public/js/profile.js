// public/js/profile.js
document.addEventListener("DOMContentLoaded", () => {
  // small flash helper
  function flash(msg, isError = false) {
    const node = document.createElement("div");
    node.textContent = msg;
    node.style.position = "fixed";
    node.style.right = "16px";
    node.style.top = "16px";
    node.style.padding = "8px 12px";
    node.style.borderRadius = "8px";
    node.style.zIndex = 10000;
    node.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
    node.style.background = isError ? "#fee2e2" : "#e6fffa";
    node.style.color = isError ? "#7a1220" : "#064e3b";
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 2200);
  }

  // Handle submit events centrally for the profile page forms
  document.addEventListener("submit", async (ev) => {
    const form = ev.target;
    if (!(form instanceof HTMLFormElement)) return;

    // DELETE (AJAX)
    if (form.classList.contains("js-delete-form")) {
      ev.preventDefault();
      if (!confirm("Delete this portfolio?")) return;

      try {
        const body = new URLSearchParams(new FormData(form)).toString();
        const res = await fetch(form.action, {
          method: "POST",
          headers: {
            "X-Requested-With": "XMLHttpRequest",
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body,
        });

        if (!res.ok) {
          const txt = await res.text();
          console.error("Delete failed:", txt);
          flash("Could not delete portfolio", true);
          return;
        }

        const data = await res.json();
        if (data && data.deleted) {
          const card = form.closest(".card");
          if (card) card.remove();
          flash("Portfolio deleted");
        } else {
          console.warn("Server did not return deleted=true", data);
          flash("Could not delete portfolio", true);
        }
      } catch (err) {
        console.error("Delete request failed", err);
        flash("Error deleting portfolio", true);
      }
      return;
    }

    // ACTIVATE (AJAX)
    if (
      form.classList.contains("js-activate-form") ||
      form.classList.contains("activate-form")
    ) {
      ev.preventDefault();
      try {
        const formData = new FormData(form);
        const body = new URLSearchParams();
        for (const pair of formData.entries()) body.append(pair[0], pair[1]);

        const res = await fetch(form.action, {
          method: "POST",
          headers: {
            "X-Requested-With": "XMLHttpRequest",
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        });

        if (!res.ok) {
          console.error("Activate failed, response:", await res.text());
          flash("Could not set active", true);
          return;
        }

        const data = await res.json();
        if (data && data.success) {
          const newActiveId =
            data.activePortfolioId ||
            form.dataset.portfolioId ||
            form.action.match(/\/portfolios\/([^/]+)\/activate/)?.[1];
          // update all cards
          document.querySelectorAll(".card").forEach((card) => {
            const pid = card.getAttribute("data-portfolio-id");
            const activeBadge = card.querySelector(".badge.active");
            const activateBtn = card.querySelector(
              "form.js-activate-form button, form.activate-form button"
            );

            if (pid === newActiveId) {
              if (!activeBadge) {
                const header = card.querySelector("header");
                const span = document.createElement("span");
                span.className = "badge active";
                span.textContent = "Active";
                header.appendChild(span);
              }
              if (activateBtn) {
                activateBtn.disabled = true;
                activateBtn.textContent = "Active";
              }
            } else {
              if (activeBadge) activeBadge.remove();
              if (activateBtn) {
                activateBtn.disabled = false;
                activateBtn.textContent = "Set active";
              }
            }
          });
          flash("Active portfolio updated");
        } else {
          console.warn("Activate response not success", data);
          flash("Could not set active", true);
        }
      } catch (err) {
        console.error("Activate error", err);
        flash("Error setting active", true);
      }
      return;
    }
  });
});
