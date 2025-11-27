// inside DOMContentLoaded...
document.addEventListener("submit", async (ev) => {
  const form = ev.target;
  if (!(form && form.matches && form.matches("form"))) return;

  // DELETE
  if (form.matches("form.js-delete-form")) {
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
        console.error(
          "Delete failed, falling back to normal submit",
          await res.text()
        );
        form.submit();
        return;
      }
      const data = await res.json();
      if (data && data.deleted) {
        const card = form.closest(".card");
        if (card) card.remove();
      } else {
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

  // ACTIVATE
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
        const newActiveId =
          data.activePortfolioId ||
          (form.action.match(/\/portfolios\/([^/]+)\/activate/) || [])[1];
        document.querySelectorAll(".card").forEach((card) => {
          const pid = card.getAttribute("data-portfolio-id");
          const badge = card.querySelector(".badge.active");
          if (pid === newActiveId) {
            if (!badge) {
              const header = card.querySelector("header");
              const span = document.createElement("span");
              span.className = "badge active";
              span.textContent = "Active";
              header.appendChild(span);
            }
            const btn = card.querySelector("form.activate-form button");
            if (btn) {
              btn.disabled = true;
              btn.textContent = "Active";
            }
          } else {
            if (badge) badge.remove();
            const btn = card.querySelector("form.activate-form button");
            if (btn) {
              btn.disabled = false;
              btn.textContent = "Set active";
            }
          }
        });
      } else {
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
});
