// ── Preview Bypass ────────────────────────────────────────────
// Enter code 4031 to unlock all pages regardless of date.
// Stored in localStorage so it persists across pages.

const PREVIEW_KEY = 'tjpreview';
const PREVIEW_CODE = '4031';

function previewEnabled() {
  return localStorage.getItem(PREVIEW_KEY) === PREVIEW_CODE;
}

function initPreviewToggle() {
  // Show active-preview banner if bypass is on
  if (previewEnabled()) {
    document.body.classList.add('preview-active');
    const banner = document.createElement('div');
    banner.className = 'preview-banner';
    banner.innerHTML = 'Preview Mode Active &nbsp;·&nbsp; <span style="cursor:pointer;text-decoration:underline;" id="disablePreview">Disable</span>';
    document.body.appendChild(banner);
    document.getElementById('disablePreview').addEventListener('click', () => {
      localStorage.removeItem(PREVIEW_KEY);
      location.reload();
    });
  }

  // Key button fixed to bottom-right
  const btn = document.createElement('button');
  btn.className = 'preview-toggle';
  btn.title = 'Preview';
  btn.textContent = '🔑';
  btn.addEventListener('click', openModal);
  document.body.appendChild(btn);
}

function openModal() {
  if (document.querySelector('.preview-modal-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'preview-modal-overlay';
  overlay.innerHTML = `
    <div class="preview-modal">
      <h4>Preview Mode</h4>
      <p>Enter your code to unlock all pages.</p>
      <input type="password" inputmode="numeric" maxlength="4" id="previewInput" placeholder="••••" autofocus />
      <div class="modal-btns">
        <button class="btn-cancel" id="previewCancel">Cancel</button>
        <button class="btn-confirm" id="previewConfirm">Unlock</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const input = document.getElementById('previewInput');
  setTimeout(() => input.focus(), 50);

  document.getElementById('previewCancel').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

  document.getElementById('previewConfirm').addEventListener('click', tryUnlock);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryUnlock(); });
}

function closeModal() {
  const overlay = document.querySelector('.preview-modal-overlay');
  if (overlay) overlay.remove();
}

function tryUnlock() {
  const input = document.getElementById('previewInput');
  if (input.value === PREVIEW_CODE) {
    localStorage.setItem(PREVIEW_KEY, PREVIEW_CODE);
    location.reload();
  } else {
    input.classList.add('error');
    input.value = '';
    setTimeout(() => input.classList.remove('error'), 400);
  }
}

document.addEventListener('DOMContentLoaded', initPreviewToggle);
