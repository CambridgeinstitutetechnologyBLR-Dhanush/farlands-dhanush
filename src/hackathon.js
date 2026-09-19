/**
 * Farlands Hackathon 2026 — Interactive JS
 * Covers: Countdown, FAQ accordion, Registration form, Nav state, Scroll animations.
 * This is frontend-only. Registration data is logged to console;
 * connect your backend here (see BACKEND_HOOK comment below).
 */

// ─── CONFIGURATION ────────────────────────────────────────────────────────────
// Update this date to set the official hackathon kickoff time.
const HACKATHON_DATE = new Date('2026-10-25T09:00:00+05:30');

// ─── COUNTDOWN ────────────────────────────────────────────────────────────────
function initCountdown() {
  const days = document.getElementById('cd-days');
  const hours = document.getElementById('cd-hours');
  const mins = document.getElementById('cd-mins');
  const secs = document.getElementById('cd-secs');
  if (!days) return;

  function pad(n) { return String(Math.max(0, n)).padStart(2, '0'); }

  function tick() {
    const now = Date.now();
    const diff = HACKATHON_DATE.getTime() - now;

    if (diff <= 0) {
      days.textContent = '00'; hours.textContent = '00';
      mins.textContent = '00'; secs.textContent = '00';
      const label = document.querySelector('.countdown-label');
      if (label) label.textContent = 'HACKATHON IS LIVE!';
      return;
    }

    const totalSecs = Math.floor(diff / 1000);
    const d = Math.floor(totalSecs / 86400);
    const h = Math.floor((totalSecs % 86400) / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;

    days.textContent = pad(d);
    hours.textContent = pad(h);
    mins.textContent = pad(m);
    secs.textContent = pad(s);
  }

  tick();
  setInterval(tick, 1000);
}

// ─── NAVIGATION ───────────────────────────────────────────────────────────────
function initNav() {
  const nav = document.getElementById('hackathon-nav');
  const hackathonContent = document.getElementById('hackathon-content');
  if (!nav || !hackathonContent) return;

  // Show nav with solid bg only when hackathon content is visible
  const observer = new IntersectionObserver(
    (entries) => {
      const isVisible = entries[0].isIntersecting;
      nav.classList.toggle('nav-visible', isVisible);
    },
    { threshold: 0, rootMargin: '-64px 0px 0px 0px' }
  );
  observer.observe(hackathonContent);

  // Hamburger menu
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('nav-mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', open);
    });
    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Smooth-scroll nav links
  nav.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ─── SCROLL ANIMATIONS ────────────────────────────────────────────────────────
function initScrollAnimations() {
  const elements = document.querySelectorAll('.fl-animate');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  elements.forEach(el => observer.observe(el));
}

// ─── REGISTRATION FORM ────────────────────────────────────────────────────────
const MAX_TEAMMATES = 4;

function buildTeammateHTML(index) {
  const isLeader = index === 0;
  const label = isLeader ? 'TEAM LEADER' : `TEAMMATE ${index + 1}`;
  const canRemove = !isLeader;
  return `
    <div class="teammate-section fl-animate visible" id="teammate-${index}" data-index="${index}">
      <div class="teammate-header">
        <span class="teammate-title">${label}</span>
        ${canRemove ? `<button class="btn-remove" type="button" data-remove="${index}" aria-label="Remove teammate ${index + 1}">× Remove</button>` : ''}
      </div>
      <div class="teammate-fields">
        <div class="field-group">
          <label class="field-label" for="tm-name-${index}">FULL NAME${isLeader ? ' *' : ''}</label>
          <input class="field-input" id="tm-name-${index}" name="tm-name-${index}" type="text"
            placeholder="Enter full name" ${isLeader ? 'required' : ''} autocomplete="name">
        </div>
        <div class="field-group">
          <label class="field-label" for="tm-email-${index}">EMAIL${isLeader ? ' *' : ''}</label>
          <input class="field-input" id="tm-email-${index}" name="tm-email-${index}" type="email"
            placeholder="your@email.com" ${isLeader ? 'required' : ''} autocomplete="email">
        </div>
        <div class="field-group">
          <label class="field-label" for="tm-phone-${index}">PHONE (OPTIONAL)</label>
          <input class="field-input" id="tm-phone-${index}" name="tm-phone-${index}" type="tel"
            placeholder="+91 00000 00000" autocomplete="tel">
        </div>
      </div>
    </div>
  `;
}

function initRegistration() {
  const formEl = document.getElementById('reg-form');
  const teammatesContainer = document.getElementById('teammates-container');
  const btnAdd = document.getElementById('btn-add-teammate');
  const btnSubmit = document.getElementById('btn-submit-reg');
  const countEl = document.getElementById('reg-count');
  const successEl = document.getElementById('reg-success');

  if (!formEl || !teammatesContainer) return;

  let count = 1;

  function updateCount() {
    if (countEl) countEl.textContent = `${count} of ${MAX_TEAMMATES} Teammate${count !== 1 ? 's' : ''}`;
    if (btnAdd) btnAdd.disabled = count >= MAX_TEAMMATES;
  }

  function rebuildTeammates() {
    teammatesContainer.innerHTML = '';
    for (let i = 0; i < count; i++) {
      teammatesContainer.insertAdjacentHTML('beforeend', buildTeammateHTML(i));
    }
    // Re-attach remove listeners
    teammatesContainer.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.remove, 10);
        // Shift: remove this index, renumber
        count = Math.max(1, count - 1);
        rebuildTeammates();
        updateCount();
      });
    });
    updateCount();
  }

  // Initial render
  rebuildTeammates();

  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      if (count < MAX_TEAMMATES) {
        count++;
        rebuildTeammates();
        // Smooth scroll to new section
        setTimeout(() => {
          const newSection = document.getElementById(`teammate-${count - 1}`);
          if (newSection) newSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);
      }
    });
  }

  formEl.addEventListener('submit', e => {
    e.preventDefault();
    // Clear previous errors
    formEl.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));
    formEl.querySelectorAll('.field-error-msg').forEach(el => el.remove());

    let valid = true;

    const teamName = document.getElementById('team-name')?.value?.trim();
    if (!teamName) {
      const inp = document.getElementById('team-name');
      if (inp) { inp.classList.add('field-error'); markError(inp, 'Team name is required.'); }
      valid = false;
    }

    // Validate leader (index 0) required fields
    ['tm-name-0', 'tm-email-0'].forEach(id => {
      const inp = document.getElementById(id);
      if (inp && !inp.value.trim()) {
        inp.classList.add('field-error'); markError(inp, 'This field is required.');
        valid = false;
      }
    });

    // Basic email format check for all filled emails
    for (let i = 0; i < count; i++) {
      const emailInp = document.getElementById(`tm-email-${i}`);
      if (emailInp && emailInp.value.trim() && !emailInp.value.includes('@')) {
        emailInp.classList.add('field-error'); markError(emailInp, 'Enter a valid email address.');
        valid = false;
      }
    }

    if (!valid) {
      formEl.querySelector('.field-error')?.focus();
      return;
    }

    // Collect data
    const payload = {
      teamName,
      teammates: Array.from({ length: count }, (_, i) => ({
        name: document.getElementById(`tm-name-${i}`)?.value?.trim() || '',
        email: document.getElementById(`tm-email-${i}`)?.value?.trim() || '',
        phone: document.getElementById(`tm-phone-${i}`)?.value?.trim() || '',
      })),
      submittedAt: new Date().toISOString(),
    };

    // ── BACKEND_HOOK ──────────────────────────────────────────────────────────
    // Replace the console.log below with your actual API call, e.g.:
    //   await fetch('/api/register', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
    // ─────────────────────────────────────────────────────────────────────────
    console.log('[Farlands Registration] Payload ready for backend:', payload);

    // Show success state
    if (successEl) {
      formEl.style.display = 'none';
      successEl.classList.add('visible');
      successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}

function markError(input, message) {
  const msg = document.createElement('span');
  msg.className = 'field-error-msg';
  msg.textContent = message;
  input.parentNode?.appendChild(msg);
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initNav();
  initScrollAnimations();
  initRegistration();
});
