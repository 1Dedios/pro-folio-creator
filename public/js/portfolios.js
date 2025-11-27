// public/js/portfolios.js

document.addEventListener("DOMContentLoaded", () => {
  // Prevent clicks on buttons from bubbling to card-level navigation
  document.body.addEventListener(
    "click",
    (ev) => {
      const btn = ev.target.closest("button");
      if (btn) {
        // stopping propagation so that teh parent handlers won't interpret the click as "open preview"
        ev.stopPropagation();
        return;
      }

      // If the user clicks a card (not a button/link) navigate to preview
      const card = ev.target.closest(".card");
      if (card) {
        // if clicked element is an <a>, let it handle itself
        if (ev.target.closest("a")) return;
        const preview = card.querySelector("a.preview-link");
        if (preview) window.location.href = preview.href;
      }
    },
    true
  ); // use capture to get ahead of some handlers

  // Intercept delete & activate form submissions
  document.body.addEventListener("submit", async (ev) => {
    const form = ev.target;
    if (!form || !form.matches) return;

    // Delete form
    if (form.matches("form.delete-form")) {
      ev.preventDefault();
      if (!confirm("Delete this portfolio?")) return;

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
          // If server returned HTML redirect or error, fallback to full-page submit
          console.error(
            "Delete failed, falling back to normal submit",
            await res.text()
          );
          form.submit();
          return;
        }

        const data = await res.json();
        if (data && data.deleted) {
          // remove the card from DOM
          const card = form.closest(".card");
          if (card) card.remove();
        } else {
          console.warn("Server did not return deleted=true", data);
          // fallback submit to keep behavior safe
          form.submit();
        }
      } catch (err) {
        console.error(
          "Delete request failed — falling back to normal submit",
          err
        );
        form.submit();
      }
      return;
    }

    // Activate form
    if (form.matches("form.activate-form")) {
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
          console.error(
            "Activate failed, falling back to normal submit",
            await res.text()
          );
          form.submit();
          return;
        }

        const data = await res.json();
        if (data && data.success) {
          // Update UI: mark this card as active and unmark others
          const userId = data.userId || formData.get("userId");
          const newActiveId =
            data.activePortfolioId ||
            (form.action.match(/\/portfolios\/([^/]+)\/activate/) || [])[1];
          document.querySelectorAll(".card").forEach((card) => {
            const pid = card.getAttribute("data-portfolio-id");
            const badge = card.querySelector(".badge.active");
            if (pid === newActiveId) {
              // add or create badge
              if (!badge) {
                const header = card.querySelector("header");
                const span = document.createElement("span");
                span.className = "badge active";
                span.textContent = "Active";
                header.appendChild(span);
              }
              // disable button for this card
              const btn = card.querySelector("form.activate-form button");
              if (btn) {
                btn.disabled = true;
                btn.textContent = "Active";
              }
            } else {
              // remove active badge if present
              if (badge) badge.remove();
              const btn = card.querySelector("form.activate-form button");
              if (btn) {
                btn.disabled = false;
                btn.textContent = "Set active";
              }
            }
          });
        } else {
          console.warn("Activate response not success", data);
          form.submit();
        }
      } catch (err) {
        console.error(
          "Activate request failed — falling back to normal submit",
          err
        );
        form.submit();
      }
      return;
    }
  }); // submit listener
});
