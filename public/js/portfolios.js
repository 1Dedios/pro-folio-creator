// Handles AJAX activate/delete actions and updates DOM in-place.

document.addEventListener('DOMContentLoaded', () => {
  // Handle "Copy Link to Active Portfolio" button
  const copyLinkBtn = document.getElementById('copyActivePortfolioLink');
  if (copyLinkBtn && window.__APP_USER) {
    copyLinkBtn.addEventListener('click', () => {
      const userId = window.__APP_USER._id;
      const baseUrl = window.location.origin;
      const portfolioUrl = `${baseUrl}/user/${userId}/portfolio`;

      // Copy to clipboard
      navigator.clipboard.writeText(portfolioUrl)
        .then(() => {
          // Provide feedback to the user
          const originalText = copyLinkBtn.textContent;
          copyLinkBtn.textContent = 'Copied!';

          // Reset button text after 2 seconds
          setTimeout(() => {
            copyLinkBtn.textContent = originalText;
          }, 2000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          alert('Failed to copy link to clipboard');
        });
    });
  }

  // Helper: find card element for portfolioId
  const findCard = (portfolioId) =>
    document.querySelector(`article.card[data-portfolio-id="${portfolioId}"]`);

  // Helper: render activate button inside the activate form
  const renderActivateUI = (formEl, isActive, userIdValue) => {
    // Remove existing buttons inside the activate form, keep hidden inputs if present
    const hiddenInputs = Array.from(formEl.querySelectorAll('input[type="hidden"]'))
      .map(n => n.outerHTML)
      .join('');
    formEl.innerHTML = hiddenInputs; // keep hidden fields

    if (isActive) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn activated';
      btn.disabled = true;
      btn.textContent = 'Activated';
      formEl.appendChild(btn);
    } else {
      const btn = document.createElement('button');
      btn.type = 'submit';
      btn.className = 'btn js-set-active-btn';
      btn.textContent = 'Set active';
      formEl.appendChild(btn);
    }
  };

  // Helper: ensure badge presence/absence
  const setBadgeActive = (cardEl, makeActive) => {
    if (!cardEl) return;
    let badge = cardEl.querySelector('.badge');
    if (makeActive) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'badge active';
        badge.textContent = 'Active';
        const header = cardEl.querySelector('header') || cardEl;
        header.appendChild(badge);
      } else {
        badge.classList.add('active');
        badge.textContent = 'Active';
      }
    } else {
      if (badge) {
        badge.remove(); // remove non-active badge to match original styles
      }
    }
  };

  // Activate (POST) handlers
  const activateForms = document.querySelectorAll('.js-activate-form');
  activateForms.forEach(form => {
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const portfolioId = form.dataset.portfolioId;
      if (!portfolioId) return;

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          credentials: 'same-origin'
        });

        if (!response.ok) {
          const text = await response.text().catch(()=>null);
          throw new Error(`Server returned ${response.status} ${text || ''}`);
        }

        const json = await response.json();

        // Expected shape: { success: true, userId: "...", activePortfolioId: "..." }
        if (!json || !json.success) {
          console.error('Activate failed', json);
          alert(json && json.error ? json.error : 'Failed to set active portfolio');
          return;
        }

        const newActiveId = String(json.activePortfolioId || portfolioId);

        // Update all cards in place
        document.querySelectorAll('article.card').forEach(card => {
          const pid = String(card.dataset.portfolioId);
          // Update badge
          setBadgeActive(card, pid === newActiveId);

          // Update activate button in this card
          const af = card.querySelector('.js-activate-form');
          const userIdInput = af ? af.querySelector('input[name="userId"]') : null;
          const userIdValue = userIdInput ? userIdInput.value : (json.userId || '');
          if (af) {
            renderActivateUI(af, pid === newActiveId, userIdValue);
          }
        });

      } catch (err) {
        console.error('Error setting active:', err);
        alert('Error setting active portfolio — see console for details.');
      }
    });
  });

  // Delete (POST) handlers
  const deleteForms = document.querySelectorAll('.js-delete-form');
  deleteForms.forEach(form => {
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      // confirm dialog (also allowed on template via onsubmit, keep both)
      if (!confirm('Delete this portfolio?')) return;

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          credentials: 'same-origin'
        });

        if (!response.ok) {
          const text = await response.text().catch(()=>null);
          throw new Error(`Server returned ${response.status} ${text || ''}`);
        }

        const json = await response.json();

        // Expected shape: { deleted: true, portfolioId: "..." }
        if (!json || !json.deleted) {
          console.error('Delete failed', json);
          alert(json && json.error ? json.error : 'Failed to delete portfolio');
          return;
        }

        const removedId = String(json.portfolioId);
        const card = findCard(removedId);
        if (card) card.remove();

      } catch (err) {
        console.error('Error deleting portfolio:', err);
        alert('Error deleting portfolio — see console for details.');
      }
    });
  });

});
