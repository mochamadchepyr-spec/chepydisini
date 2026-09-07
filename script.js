/* ============================================================
   PORTFOLIO 3D – script.js
   ============================================================ */

(function () {
  'use strict';

  /* ════════════════════════════════════════════════════════
     0. LOAD DATA – localStorage overrides portfolio-data.js
     Setiap kali kamu simpan dari admin dashboard, perubahan
     langsung tampil di sini tanpa edit file apapun.
  ════════════════════════════════════════════════════════ */
  const STORAGE_KEY = 'portfolio_custom_data';

  function getActiveConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        // Deep merge profile: socials di-merge key-by-key berdasarkan default
        // sehingga key lama (github) otomatis hilang, key baru (fiverr) masuk
        let mergedProfile = PORTFOLIO_CONFIG.profile;
        if (saved.profile) {
          mergedProfile = {
            ...PORTFOLIO_CONFIG.profile,
            ...saved.profile,
            socials: Object.fromEntries(
              Object.keys(PORTFOLIO_CONFIG.profile.socials).map(key => [
                key,
                saved.profile.socials?.[key] ?? PORTFOLIO_CONFIG.profile.socials[key]
              ])
            ),
          };
        }
        return {
          profile:    mergedProfile,
          skills:     saved.skills     || PORTFOLIO_CONFIG.skills,
          categories: saved.categories || PORTFOLIO_CONFIG.categories,
          projects:   saved.projects   || PORTFOLIO_CONFIG.projects,
          education:  saved.education  || PORTFOLIO_CONFIG.education,
          experience: saved.experience || PORTFOLIO_CONFIG.experience,
          theme:      saved.theme      || PORTFOLIO_CONFIG.theme,
          showreel:   saved.showreel   !== undefined ? saved.showreel : PORTFOLIO_CONFIG.showreel,
        };
      }
    } catch (e) {
      console.warn('[Portfolio] Gagal baca localStorage, pakai default config.');
    }
    return PORTFOLIO_CONFIG;
  }

  // CONFIG aktif — semua kode di bawah baca dari sini
  const CONFIG = getActiveConfig();

  /* ── Apply theme colors ──────────────────────────────────── */
  const theme = CONFIG.theme;
  document.documentElement.style.setProperty('--accent1', theme.accent1);
  document.documentElement.style.setProperty('--accent2', theme.accent2);
  document.documentElement.style.setProperty('--accent3', theme.accent3);

  /* ── DOM helpers ─────────────────────────────────────────── */
  const $  = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];

  /* ════════════════════════════════════════════════════════
     1. LOADER
  ════════════════════════════════════════════════════════ */
  const loader = $('#loader');

  // Hilang setelah DOM + JS selesai — jangan tunggu window.load
  // (window.load nunggu semua gambar selesai = lama kalau foto hero besar)
  function hideLoader() {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
    initSkillBars();
  }

  // DOMContentLoaded sudah lewat saat script jalan, langsung set timer pendek
  setTimeout(hideLoader, 200);

  document.body.style.overflow = 'hidden';

  /* ════════════════════════════════════════════════════════
     2. POPULATE CONTENT FROM portfolio-data.js
  ════════════════════════════════════════════════════════ */
  function populateProfile() {
    const p = CONFIG.profile;

    // Page title
    document.title = `Portfolio – ${p.name}`;

    // Hero
    $('#hero-name').textContent     = p.name;
    $('#hero-title').textContent    = p.title;
    $('#hero-tagline').textContent  = p.tagline;

    // Hero strip
    const stripName  = $('#hero-strip-name');
    const stripTitle = $('#hero-strip-title');
    if (stripName)  stripName.textContent  = p.name;
    if (stripTitle) stripTitle.textContent = p.title;

    // Glitch data-text
    const heroName = $('#hero-name');
    if (heroName) heroName.dataset.text = p.name;

    // About
    $('#about-bio').textContent = p.about;
    const avatarEl = $('#about-avatar');
    if (p.avatar) avatarEl.src = p.avatar;

    // Footer
    $('#footer-name').textContent = p.name;
    $('#footer-year').textContent = new Date().getFullYear();

    // Nav logo name
    $('#nav-logo').querySelector('.logo-name').textContent = p.name.split(' ')[0].toUpperCase();

    // Contact – email card
    const emailCard = $('#contact-email-card');
    const emailText = $('#contact-email-text');
    if (emailCard && p.email) {
      emailCard.href = `mailto:${p.email}`;
      if (emailText) emailText.textContent = p.email;
    }

    // Contact – WhatsApp card
    const waCard = $('#contact-wa-card');
    const waText = $('#contact-wa-text');
    if (waCard) {
      const num = (p.whatsapp || '').replace(/\D/g, '');
      if (num) {
        waCard.href = `https://wa.me/${num}`;
        waCard.style.display = '';
        if (waText) {
          // Format: +62 812-3456-7890
          const formatted = '+' + num.replace(/(\d{2})(\d{3})(\d{4})(\d{0,4})/, (_, a, b, c, d) =>
            d ? `${a} ${b}-${c}-${d}` : `${a} ${b}-${c}`
          );
          waText.textContent = formatted;
        }
      } else {
        // Sembunyikan kalau nomor tidak diisi
        waCard.style.display = 'none';
      }
    }

    // Socials
    const socialsEl = $('#socials');
    const socialDefs = [
      { key: 'instagram', label: 'Instagram', color: '#E1306C', svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>` },
      { key: 'behance',   label: 'Behance',   color: '#1769FF', svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.5 11.25c.69 0 1.25-.56 1.25-1.25S8.19 8.75 7.5 8.75H4.5v2.5h3zm.25 1.75H4.5v2.75h3.25c.83 0 1.5-.67 1.5-1.375S8.58 13 7.75 13zM14.5 10.5c-1.1 0-1.88.7-2 1.75h4c-.12-1.05-.9-1.75-2-1.75zM2 6v12h8.5c1.93 0 3.5-1.57 3.5-3.5 0-1.1-.5-2.08-1.28-2.72A3 3 0 0013 9.5c0-1.93-1.57-3.5-3.5-3.5H2zm12.5 1.5h5v1.25h-5V7.5zm0 9c0-2.49 2.01-4.5 4.5-4.5S23.5 14.51 23.5 17H17c.12 1.12.95 1.88 2 1.88.7 0 1.32-.35 1.67-.88l1.62.47A3.49 3.49 0 0119 20c-2.49 0-4.5-2.01-4.5-4.5z"/></svg>` },
      { key: 'fiverr',    label: 'Fiverr',    color: '#1DBF73', svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 9.5h-2.3a6.64 6.64 0 00.3-2C21 4.36 18.64 2 15.5 2A5.5 5.5 0 0010 7.5v2H7v2.5h3V20H7.5v2h7.5v-2H13v-8h4V9.5h-4V7.5A3 3 0 0116 4.5a3 3 0 013 3 4.14 4.14 0 01-.2 1.3A2 2 0 0017 10.5v.5h6v-1.5zM5 9.5H2V12h3v8H2v2h8v-2H8V9.5H5zm1-5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/></svg>` },
      { key: 'linkedin',  label: 'LinkedIn',  color: '#0077B5', svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>` },
    ];

    socialDefs.forEach(({ key, label, color, svg }) => {
      const url = p.socials?.[key];
      if (!url || url === '#' || url === '') return;
      const a = document.createElement('a');
      a.href   = url;
      a.target = '_blank';
      a.rel    = 'noopener noreferrer';
      a.className = 'social-link';
      a.dataset.platform = key;
      a.style.setProperty('--social-color', color);
      a.innerHTML = `<span class="social-icon">${svg}</span><span class="social-label">${label}</span>`;
      socialsEl.appendChild(a);
    });
  }

  /* ── Skills ──────────────────────────────────────────────── */
  function buildSkills() {
    const list = $('#skills-list');
    CONFIG.skills.forEach((skill, i) => {
      const div = document.createElement('div');
      div.className = 'skill-item reveal';
      // stagger delay per item
      div.style.transitionDelay = `${i * 0.08}s`;
      div.innerHTML = `
        <div class="skill-header">
          <span><span class="skill-icon">${skill.icon}</span>${skill.name}</span>
          <span class="skill-percent" data-target="${skill.level}">0%</span>
        </div>
        <div class="skill-bar">
          <div class="skill-fill" data-level="${skill.level}" style="width:0%"></div>
        </div>`;
      list.appendChild(div);
    });
  }

  /* Animasi bar + counter angka dari 0 → target */
  function animateSkill(item) {
    if (item.dataset.animated === 'true') return;
    item.dataset.animated = 'true';

    const fill    = item.querySelector('.skill-fill');
    const pctEl   = item.querySelector('.skill-percent');
    const target  = parseInt(fill?.dataset.level || 0, 10);
    const DURATION = 1200; // ms
    let start = null;

    // easeOutQuart
    function ease(t) { return 1 - Math.pow(1 - t, 4); }

    function step(ts) {
      if (!start) start = ts;
      const elapsed  = ts - start;
      const progress = Math.min(elapsed / DURATION, 1);
      const eased    = ease(progress);
      const current  = Math.round(eased * target);

      if (fill)  fill.style.width  = `${eased * target}%`;
      if (pctEl) pctEl.textContent = `${current}%`;

      if (progress < 1) requestAnimationFrame(step);
      else {
        if (fill)  fill.style.width  = `${target}%`;
        if (pctEl) pctEl.textContent = `${target}%`;
      }
    }

    requestAnimationFrame(step);
  }

  function initSkillBars() {
    // Fallback: animate bars that are already in viewport on load
    $$('.skill-item').forEach(item => {
      const rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight) animateSkill(item);
    });
  }

  /* ── Filter categories ───────────────────────────────────── */
  function buildFilters() {
    const bar = $('#filter-bar');
    CONFIG.categories.forEach((cat, i) => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn' + (i === 0 ? ' active' : '');
      btn.textContent = cat;
      btn.dataset.filter = cat;
      btn.addEventListener('click', () => filterProjects(cat, btn));
      bar.appendChild(btn);
    });
  }

  /* ── Projects grid ───────────────────────────────────────── */
  function buildProjects() {
    const grid = $('#portfolio-grid');
    CONFIG.projects.forEach((proj, idx) => {
      const card = document.createElement('article');
      card.className = 'project-card reveal';
      card.dataset.category = proj.category;
      card.dataset.index    = idx;

      const typeLabel = proj.type === 'video' || proj.type === 'youtube'
        ? `<span class="card-type-badge ${proj.type}">${proj.type === 'youtube' ? '▶ YouTube' : '▶ Video'}</span>`
        : '';

      const thumbSrc = proj.thumbnail || '';

      card.innerHTML = `
        <div class="card-thumb">
          <img src="${thumbSrc}" alt="${proj.title}" loading="lazy" />
          ${typeLabel}
          <div class="card-view-overlay">
            <div class="card-view-icon">${proj.type === 'image' ? '🔍' : '▶'}</div>
          </div>
        </div>
        <div class="card-body">
          <div class="card-meta">
            <span>${proj.category}</span>
            <span class="card-year">${proj.year}</span>
          </div>
          <h3 class="card-title">${proj.title}</h3>
          <p class="card-desc">${proj.description}</p>
          <div class="card-tags">
            ${proj.tags.map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
        </div>`;

      card.addEventListener('click', () => openLightbox(idx));
      card.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
        tiltCard(card);
      });
      card.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
        card.style.transform = '';
      });
      card.addEventListener('mousemove', (e) => tiltOnMove(e, card));

      grid.appendChild(card);
    });
  }

  /* ── Filter logic ────────────────────────────────────────── */
  function filterProjects(category, activeBtn) {
    $$('.filter-btn').forEach(b => b.classList.remove('active'));
    activeBtn.classList.add('active');

    $$('.project-card').forEach(card => {
      const match = category === 'All' || card.dataset.category === category;
      card.classList.toggle('hidden', !match);
    });
  }

  /* ── Hero preview cards ──────────────────────────────────── */
  function populateHeroCards() {
    const featured = CONFIG.projects.filter(p => p.featured).slice(0, 3);
    const ids = ['hero-card-1', 'hero-card-2', 'hero-card-3'];
    const labels = ['.card-1 .card-overlay', '.card-2 .card-overlay', '.card-3 .card-overlay'];
    featured.forEach((proj, i) => {
      const img = $(`#${ids[i]}`);
      if (img) {
        img.src = proj.thumbnail || '';
        img.alt = proj.title;
      }
      const overlay = $(labels[i]);
      if (overlay) overlay.textContent = proj.title;
    });
  }

  /* ── Showreel ────────────────────────────────────────────── */
  function buildShowreel() {
    const sr = CONFIG.showreel;
    if (!sr || !sr.enabled) {
      const sec = document.getElementById('showreel');
      if (sec) sec.style.display = 'none';
      // Remove from navbar
      const navLink = document.querySelector('.nav-link[data-section="showreel"]');
      if (navLink) navLink.style.display = 'none';
      return;
    }

    // Heading & subtitle
    const headingEl = $('#showreel-heading');
    const subtitleEl = $('#showreel-subtitle');
    const descEl    = $('#showreel-desc');
    if (headingEl)  headingEl.innerHTML = sr.heading  || 'My <em>Showreel</em>';
    if (subtitleEl) subtitleEl.textContent = sr.subtitle || '';
    if (descEl)     descEl.textContent = sr.description || '';

    // Determine thumbnail
    let thumbSrc = sr.thumbnail || '';
    if (!thumbSrc && sr.type === 'youtube' && sr.youtubeId) {
      thumbSrc = `https://img.youtube.com/vi/${sr.youtubeId}/maxresdefault.jpg`;
    }

    // Set poster image
    const posterImg = $('#showreel-poster-img');
    if (posterImg && thumbSrc) {
      posterImg.src = thumbSrc;
      // Fallback to smaller YT thumb if maxres not available
      if (sr.type === 'youtube') {
        posterImg.onerror = function () {
          this.src = `https://img.youtube.com/vi/${sr.youtubeId}/hqdefault.jpg`;
          this.onerror = null;
        };
      }
    }

    // Blurred cinematic background
    const bgEl = $('#showreel-bg');
    if (bgEl && thumbSrc) {
      bgEl.style.backgroundImage = `url('${thumbSrc}')`;
    }

    // Duration
    const durEl = $('#showreel-duration');
    if (durEl && sr.duration) durEl.textContent = sr.duration;

    // Year
    const yearEl = $('#showreel-year');
    if (yearEl) yearEl.textContent = sr.year || '';

    // Tags
    const tagsEl = $('#showreel-tags');
    if (tagsEl && sr.tags) {
      tagsEl.innerHTML = sr.tags
        .map(t => `<span class="showreel-tag">${t}</span>`)
        .join('');
    }

    // External link
    const ctaWrap = $('#showreel-cta-wrap');
    if (ctaWrap && sr.externalLink) {
      ctaWrap.innerHTML = `
        <a href="${sr.externalLink}" target="_blank" rel="noopener noreferrer" class="showreel-ext-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          ${sr.externalLabel || 'Watch Full'}
        </a>`;
    }

    // Play button click
    const playBtn   = $('#showreel-play-btn');
    const poster    = $('#showreel-poster');
    const frame     = $('#showreel-frame');
    const mediaDiv  = $('#showreel-media');

    function activatePlayer() {
      if (!mediaDiv || frame.classList.contains('playing')) return;

      if (sr.type === 'youtube') {
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${sr.youtubeId}?autoplay=1&rel=0&color=white`;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';
        iframe.allowFullscreen = true;
        iframe.title = sr.heading || 'Showreel';
        mediaDiv.appendChild(iframe);
      } else if (sr.type === 'video' && sr.src) {
        const video = document.createElement('video');
        video.src      = sr.src;
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        mediaDiv.appendChild(video);
      }

      mediaDiv.style.display = 'block';
      frame.classList.add('playing');
    }

    if (playBtn) {
      playBtn.addEventListener('click', activatePlayer);
      playBtn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activatePlayer(); }
      });
    }
    // Also clicking the poster area triggers play
    if (poster) {
      poster.addEventListener('click', e => {
        if (!e.target.closest('.showreel-play-btn')) activatePlayer();
      });
    }
  }

  /* ── Education timeline ─────────────────────────────────── */
  function buildEducation() {
    const tl = $('#edu-timeline');
    if (!tl) return;

    const items = CONFIG.education || [];
    if (!items.length) {
      const sec = document.getElementById('education');
      if (sec) sec.style.display = 'none';
      const navLink = document.querySelector('.nav-link[data-section="education"]');
      if (navLink) navLink.style.display = 'none';
      return;
    }

    items.forEach((edu, i) => {
      const item = document.createElement('div');
      item.className = 'edu-item'; // reveal handled manually below

      const gpaHTML = edu.gpa
        ? `<span class="edu-gpa">GPA ${edu.gpa}</span>`
        : '';

      const tagsHTML = (edu.tags || [])
        .map(t => `<span class="edu-tag">${t}</span>`)
        .join('');

      item.innerHTML = `
        <div class="edu-spacer"></div>
        <div class="edu-node">
          <div class="edu-node-inner">${edu.icon || '🎓'}</div>
        </div>
        <div class="edu-card">
          <div class="edu-card-top">
            <div class="edu-school">${edu.school}</div>
            <span class="edu-period-badge">${edu.period}</span>
          </div>
          <div class="edu-degree">
            ${edu.degree}
            ${gpaHTML}
          </div>
          <p class="edu-desc">${edu.desc}</p>
          ${tagsHTML ? `<div class="edu-tags">${tagsHTML}</div>` : ''}
        </div>`;

      tl.appendChild(item);
    });

    // Intersection observer for slide-in animation
    const eduObserver = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Stagger delay per item
          const idx = [...tl.children].indexOf(entry.target);
          entry.target.style.transitionDelay = `${idx * 0.12}s`;
          entry.target.classList.add('visible');
          eduObserver.unobserve(entry.target);
        }
      }),
      { threshold: 0.15 }
    );
    tl.querySelectorAll('.edu-item').forEach(el => eduObserver.observe(el));
  }

  /* ── Experience timeline ─────────────────────────────────── */
  function buildTimeline() {
    const tl = $('#timeline');
    CONFIG.experience.forEach(exp => {
      const item = document.createElement('div');
      item.className = 'timeline-item reveal';
      item.innerHTML = `
        <div class="timeline-period">${exp.period}</div>
        <div class="timeline-role">${exp.role}</div>
        <div class="timeline-company">${exp.company}</div>
        <div class="timeline-desc">${exp.desc}</div>`;
      tl.appendChild(item);
    });
  }

  /* ════════════════════════════════════════════════════════
     3. LIGHTBOX
  ════════════════════════════════════════════════════════ */
  const lb          = $('#lightbox');
  const lbBackdrop  = $('#lightbox-backdrop');
  const lbMedia     = $('#lightbox-media');
  const lbClose     = $('#lightbox-close');
  const lbPrev      = $('#lb-prev');
  const lbNext      = $('#lb-next');
  let currentLbIdx  = 0;
  let visibleProjects = [];

  function getVisibleProjects() {
    const activeFilter = $('.filter-btn.active')?.dataset.filter || 'All';
    return CONFIG.projects.filter(p =>
      activeFilter === 'All' || p.category === activeFilter
    );
  }

  function openLightbox(projectIdx) {
    const proj = CONFIG.projects[projectIdx];
    visibleProjects = getVisibleProjects();
    currentLbIdx    = visibleProjects.findIndex(p => p.id === proj.id);
    if (currentLbIdx === -1) currentLbIdx = 0;

    renderLightboxContent(proj);
    lb.classList.add('open');
    lbBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    updateNavButtons();
  }

  function renderLightboxContent(proj) {
    // Clear media
    lbMedia.innerHTML = '';

    if (proj.type === 'image') {
      const img = document.createElement('img');
      img.src = proj.src || proj.thumbnail || '';
      img.alt = proj.title;
      lbMedia.appendChild(img);
    } else if (proj.type === 'video') {
      const vid = document.createElement('video');
      vid.src      = proj.src;
      vid.controls = true;
      vid.autoplay = true;
      vid.style.maxHeight = '80vh';
      lbMedia.appendChild(vid);
    } else if (proj.type === 'youtube') {
      const iframe = document.createElement('iframe');
      iframe.src             = `https://www.youtube.com/embed/${proj.youtubeId}?autoplay=1`;
      iframe.allow           = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      lbMedia.appendChild(iframe);
    }

    // Info panel
    $('#lb-category').textContent = proj.category;
    $('#lb-title').textContent    = proj.title;
    $('#lb-desc').textContent     = proj.description;
    $('#lb-year').textContent     = `📅 ${proj.year}`;
    $('#lb-client').textContent   = `👤 ${proj.client}`;
    const tagsEl = $('#lb-tags');
    tagsEl.innerHTML = proj.tags.map(t => `<span class="tag">${t}</span>`).join('');
  }

  function closeLightbox() {
    lb.classList.remove('open');
    lbBackdrop.classList.remove('open');
    document.body.style.overflow = '';
    // Stop any video/audio
    const vid = lbMedia.querySelector('video');
    if (vid) { vid.pause(); vid.src = ''; }
    const iframe = lbMedia.querySelector('iframe');
    if (iframe) { iframe.src = ''; }
  }

  function navigateLightbox(dir) {
    currentLbIdx = (currentLbIdx + dir + visibleProjects.length) % visibleProjects.length;
    renderLightboxContent(visibleProjects[currentLbIdx]);
    updateNavButtons();
  }

  function updateNavButtons() {
    lbPrev.style.display = visibleProjects.length > 1 ? '' : 'none';
    lbNext.style.display = visibleProjects.length > 1 ? '' : 'none';
  }

  lbClose.addEventListener('click', closeLightbox);
  lbBackdrop.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => navigateLightbox(-1));
  lbNext.addEventListener('click', () => navigateLightbox(1));

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   navigateLightbox(-1);
    if (e.key === 'ArrowRight')  navigateLightbox(1);
  });

  /* ════════════════════════════════════════════════════════
     4. 3D CARD TILT (mouse move)
  ════════════════════════════════════════════════════════ */
  function tiltOnMove(e, card) {
    const rect   = card.getBoundingClientRect();
    const x      = (e.clientX - rect.left) / rect.width  - 0.5;
    const y      = (e.clientY - rect.top)  / rect.height - 0.5;
    const rotY   = x * 14;
    const rotX   = -y * 10;
    card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-8px)`;
  }
  function tiltCard(card) {
    card.style.transition = 'box-shadow 0.3s ease';
  }

  /* ════════════════════════════════════════════════════════
     5. CUSTOM CURSOR
  ════════════════════════════════════════════════════════ */
  const cursor   = $('#cursor');
  const follower = $('#cursor-follower');
  let fX = 0, fY = 0, cX = 0, cY = 0;

  document.addEventListener('mousemove', e => {
    cX = e.clientX; cY = e.clientY;
    cursor.style.left   = `${cX}px`;
    cursor.style.top    = `${cY}px`;
  });

  // Smooth follower
  (function animateFollower() {
    fX += (cX - fX) * 0.1;
    fY += (cY - fY) * 0.1;
    follower.style.left = `${fX}px`;
    follower.style.top  = `${fY}px`;
    requestAnimationFrame(animateFollower);
  })();

  // Hover state
  document.querySelectorAll('a, button, .project-card, .filter-btn, .social-link')
    .forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

  /* ════════════════════════════════════════════════════════
     6. NAVBAR – scroll + mobile toggle
  ════════════════════════════════════════════════════════ */
  const navbar    = $('#navbar');
  const navToggle = $('#nav-toggle');
  const navLinks  = $('#nav-links');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    updateActiveNavLink();
  });

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close mobile menu on link click
  $$('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  function updateActiveNavLink() {
    const sections = ['hero', 'about', 'experience', 'education', 'portfolio', 'showreel', 'contact'];
    let current = 'hero';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 160) current = id;
    });
    $$('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }

  /* ════════════════════════════════════════════════════════
     7. SCROLL REVEAL
  ════════════════════════════════════════════════════════ */
  const revealObserver = new IntersectionObserver(
    (entries) => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Trigger skill bars when about section visible
        if (entry.target.classList.contains('skill-item')) {
          animateSkill(entry.target);
        }
      }
    }),
    { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
  );

  function attachRevealObserver() {
    $$('.reveal').forEach(el => revealObserver.observe(el));
  }

  /* ════════════════════════════════════════════════════════
     8. HERO PARALLAX (disabled — replaced by liquid reveal)
  ════════════════════════════════════════════════════════ */
  // Hero 3D scene parallax removed (no floating cards in new design)

  /* ════════════════════════════════════════════════════════
     9. CANVAS SYSTEMS
     A) bg-canvas  → hero only (shows/hides with scroll)
     B) section-canvas → per section, unique color palette,
        lazy-started when section enters viewport
  ════════════════════════════════════════════════════════ */

  /* ── A) Hero bg-canvas visibility ───────────────────────── */
  const bgCanvas = $('#bg-canvas');
  const bgCtx    = bgCanvas ? bgCanvas.getContext('2d') : null;
  let   bgParticles = [];
  const BG_COUNT = 55;
  const BG_DIST  = 130;

  if (bgCanvas && bgCtx) {
    const resize = () => { bgCanvas.width = window.innerWidth; bgCanvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    function mkP() {
      return {
        x: Math.random() * bgCanvas.width,  y: Math.random() * bgCanvas.height,
        vx:(Math.random()-0.5)*0.35,         vy:(Math.random()-0.5)*0.35,
        r: Math.random()*1.8+0.4,            a: Math.random()*0.4+0.15,
      };
    }
    for (let i = 0; i < BG_COUNT; i++) bgParticles.push(mkP());
  }

  function hexToRgb(hex) {
    return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
  }
  const [a1r,a1g,a1b] = hexToRgb(theme.accent1);
  const [a3r,a3g,a3b] = hexToRgb(theme.accent3);

  function drawBgParticles() {
    if (!bgCanvas || !bgCtx) return;
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    for (let i = 0; i < bgParticles.length; i++) {
      for (let j = i+1; j < bgParticles.length; j++) {
        const dx = bgParticles[i].x - bgParticles[j].x;
        const dy = bgParticles[i].y - bgParticles[j].y;
        const d  = Math.sqrt(dx*dx+dy*dy);
        if (d < BG_DIST) {
          bgCtx.beginPath();
          bgCtx.strokeStyle = `rgba(${a1r},${a1g},${a1b},${(1-d/BG_DIST)*0.12})`;
          bgCtx.lineWidth = 0.5;
          bgCtx.moveTo(bgParticles[i].x, bgParticles[i].y);
          bgCtx.lineTo(bgParticles[j].x, bgParticles[j].y);
          bgCtx.stroke();
        }
      }
    }
    bgParticles.forEach(p => {
      bgCtx.beginPath();
      bgCtx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      bgCtx.fillStyle = `rgba(${a3r},${a3g},${a3b},${p.a})`;
      bgCtx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > bgCanvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > bgCanvas.height) p.vy *= -1;
    });
  }

  // Toggle hero canvas based on scroll — hide when hero leaves view
  const heroSection = document.getElementById('hero');
  const heroObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      document.body.classList.toggle('hero-visible', e.isIntersecting);
    });
  }, { threshold: 0.05 });
  if (heroSection) {
    heroObserver.observe(heroSection);
    document.body.classList.add('hero-visible'); // default on load
  }

  /* ── B) Per-section canvas particles ────────────────────── */
  // Each section gets its own animated particle system with
  // unique color palette. Lazy-init: only starts rAF when section
  // is in viewport (IntersectionObserver), pauses when out.
  const SECTION_CONFIGS = [
    {
      id: 'canvas-about',
      // Teal-cyan — cool blue energy
      dotColor:  [0, 210, 220],
      lineColor: [0, 180, 200],
      count: 45, connDist: 120, dotAlpha: 0.35, lineAlpha: 0.10,
      speed: 0.32,
      // Extra: floating ring particles
      style: 'rings',
    },
    {
      id: 'canvas-experience',
      // Amber-gold — warm energy
      dotColor:  [240, 160, 40],
      lineColor: [220, 140, 30],
      count: 40, connDist: 110, dotAlpha: 0.30, lineAlpha: 0.09,
      speed: 0.28,
      style: 'dots',
    },
    {
      id: 'canvas-education',
      // Emerald-green — matrix energy
      dotColor:  [30, 200, 120],
      lineColor: [20, 180, 100],
      count: 50, connDist: 115, dotAlpha: 0.32, lineAlpha: 0.10,
      speed: 0.30,
      style: 'matrix',
    },
    {
      id: 'canvas-portfolio',
      // Hot pink-magenta — neon energy
      dotColor:  [220, 50, 140],
      lineColor: [200, 40, 120],
      count: 45, connDist: 118, dotAlpha: 0.30, lineAlpha: 0.09,
      speed: 0.35,
      style: 'dots',
    },
    {
      id: 'canvas-contact',
      // Violet-indigo — portal energy
      dotColor:  [130, 80, 240],
      lineColor: [110, 60, 220],
      count: 42, connDist: 112, dotAlpha: 0.32, lineAlpha: 0.09,
      speed: 0.28,
      style: 'rings',
    },
  ];

  // Matrix rain drops (education section)
  function createMatrixDrops(canvas, color) {
    const cols   = Math.floor(canvas.width / 20);
    const drops  = Array.from({ length: cols }, () => ({
      y:     Math.random() * -canvas.height,
      speed: Math.random() * 1.2 + 0.4,
      alpha: Math.random() * 0.12 + 0.03,
      char:  Math.floor(Math.random() * 10),
    }));
    return drops;
  }

  SECTION_CONFIGS.forEach(cfg => {
    const canvas = $(`#${cfg.id}`);
    if (!canvas) return;

    const section = canvas.closest('section');
    if (!section) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let matrixDrops = [];
    let rafId = null;
    let active = false;

    function resize() {
      const rect = section.getBoundingClientRect();
      canvas.width  = section.offsetWidth;
      canvas.height = section.offsetHeight;
      canvas.style.width  = '100%';
      canvas.style.height = '100%';
    }

    function mkParticle() {
      return {
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        vx: (Math.random()-0.5) * cfg.speed,
        vy: (Math.random()-0.5) * cfg.speed,
        r:  Math.random() * 1.6 + 0.5,
        // Ring style has some larger hollow circles
        ring: cfg.style === 'rings' && Math.random() < 0.25,
        ringR: Math.random() * 4 + 2,
        // Pulse phase
        phase: Math.random() * Math.PI * 2,
      };
    }

    function init() {
      resize();
      particles = Array.from({ length: cfg.count }, mkParticle);
      if (cfg.style === 'matrix') {
        matrixDrops = createMatrixDrops(canvas, cfg.dotColor);
      }
    }

    const [dr, dg, db]  = cfg.dotColor;
    const [lr, lg, lb]  = cfg.lineColor;

    function draw() {
      if (!active) { rafId = null; return; }
      rafId = requestAnimationFrame(draw);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const t = performance.now() / 1000;

      // ── Matrix rain (education) ───────────────────────────
      if (cfg.style === 'matrix' && matrixDrops.length) {
        ctx.font = '11px monospace';
        matrixDrops.forEach(drop => {
          ctx.fillStyle = `rgba(${dr},${dg},${db},${drop.alpha})`;
          ctx.fillText(String(Math.floor(Math.random()*2)), // 0 or 1
            drop.y % canvas.width, drop.y
          );
          drop.y += drop.speed;
          if (drop.y > canvas.height) drop.y = Math.random() * -80;
        });
      }

      // ── Connection lines ──────────────────────────────────
      for (let i = 0; i < particles.length; i++) {
        for (let j = i+1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.sqrt(dx*dx + dy*dy);
          if (d < cfg.connDist) {
            const alpha = (1 - d/cfg.connDist) * cfg.lineAlpha;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${lr},${lg},${lb},${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // ── Dots / rings ──────────────────────────────────────
      particles.forEach(p => {
        const pulse = Math.sin(t * 1.2 + p.phase) * 0.5 + 0.5; // 0..1

        if (p.ring && cfg.style === 'rings') {
          // Hollow pulsing ring
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.ringR * (1 + pulse * 0.4), 0, Math.PI*2);
          ctx.strokeStyle = `rgba(${dr},${dg},${db},${cfg.dotAlpha * 0.6 * pulse})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        } else {
          // Filled dot with subtle pulse
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * (1 + pulse * 0.2), 0, Math.PI*2);
          ctx.fillStyle = `rgba(${dr},${dg},${db},${cfg.dotAlpha * (0.7 + pulse * 0.3)})`;
          ctx.fill();
        }

        // Move
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      // ── Occasional glow blob (atmospheric depth) ─────────
      // Paint a very faint large radial glow that breathes
      const blobX = canvas.width  * (0.3 + Math.sin(t * 0.3) * 0.2);
      const blobY = canvas.height * (0.4 + Math.cos(t * 0.25) * 0.2);
      const grad  = ctx.createRadialGradient(blobX, blobY, 0, blobX, blobY, canvas.width * 0.4);
      grad.addColorStop(0,   `rgba(${dr},${dg},${db},0.025)`);
      grad.addColorStop(1,   `rgba(${dr},${dg},${db},0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Lazy start/stop via IntersectionObserver
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !active) {
          active = true;
          if (!particles.length) init();
          if (!rafId) rafId = requestAnimationFrame(draw);
        } else if (!e.isIntersecting) {
          active = false;
          // rafId will self-cancel on next frame
        }
      });
    }, { threshold: 0.05 });

    obs.observe(section);

    // Resize when section changes size
    new ResizeObserver(() => {
      resize();
      particles = Array.from({ length: cfg.count }, mkParticle);
      if (cfg.style === 'matrix') matrixDrops = createMatrixDrops(canvas, cfg.dotColor);
    }).observe(section);
  });

  /* ── Liquid Reveal ───────────────────────────────────────── */
  (function initLiquidReveal() {
    const container   = $('#hero-liquid');
    const mainCanvas  = $('#hero-reveal-canvas');
    if (!container || !mainCanvas) return;

    // Gracefully hide broken-img indicator on base image too
    const baseImg = $('#hero-base-img');
    if (baseImg) {
      baseImg.style.opacity = '0';
      baseImg.onload  = () => { baseImg.style.opacity = '1'; };
      baseImg.onerror = () => {
        // Keep opacity 0 — the .hero background gradient shows instead
        baseImg.style.display = 'none';
      };
      // If already cached/loaded
      if (baseImg.complete && baseImg.naturalWidth) baseImg.style.opacity = '1';
    }

    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const BRUSH_RADIUS = 150;   // CSS px
    const DECAY        = 0.018;
    const DPR          = Math.min(devicePixelRatio || 1, 2);
    const FADE_FRAMES  = 120;

    const ctx = mainCanvas.getContext('2d');
    let coverCanvas = null;   // offscreen: after image cover-fitted
    let brushCanvas = null;   // offscreen: soft brush stamp
    let radius      = 0;
    let diam        = 0;
    let points      = [];
    let last        = null;
    let idle        = 0;
    let rafId       = null;
    let imgLoaded   = false;

    // Load the reveal image (orange dramatic photo)
    const revealImg = new Image();
    revealImg.crossOrigin = 'anonymous';
    revealImg.src = 'assets/images/hero-reveal.jpg.png';
    revealImg.onload = () => {
      imgLoaded = true;
      buildOffscreens();
      if (!rafId) rafId = requestAnimationFrame(tick);
    };
    // Silently ignore missing image — hero still looks fine with gradient
    revealImg.onerror = () => {
      imgLoaded = false;
    };

    function buildOffscreens() {
      const rect = container.getBoundingClientRect();
      const W = Math.round(rect.width  * DPR);
      const H = Math.round(rect.height * DPR);
      if (!W || !H) return;

      // Size main canvas
      mainCanvas.width        = W;
      mainCanvas.height       = H;
      mainCanvas.style.width  = rect.width  + 'px';
      mainCanvas.style.height = rect.height + 'px';

      // Cover canvas — reveal image drawn object-fit:cover
      coverCanvas = new OffscreenCanvas(W, H);
      const cc    = coverCanvas.getContext('2d');
      const ir    = revealImg.naturalWidth / revealImg.naturalHeight;
      const cr    = W / H;
      let sw, sh, sx, sy;
      if (ir > cr) { sh = H; sw = H * ir; sx = (W - sw) / 2; sy = 0; }
      else         { sw = W; sh = W / ir; sx = 0; sy = (H - sh) / 2; }
      cc.drawImage(revealImg, sx, sy, sw, sh);

      // Brush canvas
      radius = Math.ceil(BRUSH_RADIUS * DPR);
      diam   = Math.ceil(radius * 2);
      brushCanvas = new OffscreenCanvas(diam, diam);
    }

    // Pointer trail
    window.addEventListener('pointermove', e => {
      if (!imgLoaded || !coverCanvas) return;
      const rect = container.getBoundingClientRect();
      const cx   = (e.clientX - rect.left) * DPR;
      const cy   = (e.clientY - rect.top)  * DPR;

      // Outside with margin?
      if (cx < -radius || cx > mainCanvas.width  + radius ||
          cy < -radius || cy > mainCanvas.height + radius) {
        last = null; return;
      }

      if (last) {
        const dx   = cx - last.x;
        const dy   = cy - last.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const step = Math.max(radius * 0.28, 1);
        const n    = Math.min(Math.ceil(dist / step), 60);
        for (let i = 1; i <= n; i++) {
          points.push({
            x: last.x + dx * (i/n),
            y: last.y + dy * (i/n),
          });
        }
      }
      last = { x: cx, y: cy };
    });

    function stamp(x, y) {
      const bc = brushCanvas.getContext('2d');
      bc.clearRect(0, 0, diam, diam);

      // Draw soft radial gradient brush
      bc.globalCompositeOperation = 'source-over';
      const grad = bc.createRadialGradient(radius, radius, 0, radius, radius, radius);
      grad.addColorStop(0,    'rgba(255,255,255,1)');
      grad.addColorStop(0.55, 'rgba(255,255,255,0.82)');
      grad.addColorStop(1,    'rgba(255,255,255,0)');
      bc.fillStyle = grad;
      bc.fillRect(0, 0, diam, diam);

      // Clip to the reveal image pixels
      bc.globalCompositeOperation = 'source-in';
      const sx = x - radius;
      const sy = y - radius;
      bc.drawImage(coverCanvas, sx, sy, diam, diam, 0, 0, diam, diam);

      // Paint brush onto main canvas
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(brushCanvas, sx, sy);
    }

    function tick() {
      rafId = requestAnimationFrame(tick);
      if (!imgLoaded || !coverCanvas) return;

      const drawing = points.length > 0;
      if (drawing) { idle = 0; }
      else {
        idle++;
        if (idle > FADE_FRAMES + 30) return; // fully settled, skip frame
      }

      // Fade existing trail
      const fade = drawing
        ? DECAY
        : Math.min(DECAY + idle * 0.003, 0.45);

      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = `rgba(0,0,0,${fade})`;
      ctx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

      // Hard clear once fully idle
      if (!drawing && idle > FADE_FRAMES) {
        ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        return;
      }

      // Stamp queued points
      if (drawing) {
        ctx.globalCompositeOperation = 'source-over';
        points.forEach(p => stamp(p.x, p.y));
        points = [];
      }
    }

    // Rebuild on resize
    const ro = new ResizeObserver(() => {
      buildOffscreens();
      ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    });
    ro.observe(container);

    // Also update hero-name data-text for glitch (if visual.css loaded)
    const heroName = $('#hero-name');
    if (heroName) heroName.dataset.text = heroName.textContent;
  })();

  /* ── Combined rAF loop ─────────────────────────────────── */
  function animate() {
    drawBgParticles();
    requestAnimationFrame(animate);
  }
  animate();
  /* ════════════════════════════════════════════════════════
     10. CONTACT FORM (demo)
  ════════════════════════════════════════════════════════ */
  const form = $('#contact-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn  = form.querySelector('button[type="submit"] span');
    const orig = btn.textContent;
    btn.textContent = '✓ Terkirim!';
    form.querySelectorAll('input, textarea').forEach(el => el.value = '');
    setTimeout(() => { btn.textContent = orig; }, 3000);
  });

  /* ════════════════════════════════════════════════════════
     11. AVATAR CARD 3D tilt
  ════════════════════════════════════════════════════════ */
  const avatarCard = $('#avatar-card');
  if (avatarCard) {
    avatarCard.addEventListener('mousemove', e => {
      const rect = avatarCard.getBoundingClientRect();
      const x    = (e.clientX - rect.left) / rect.width  - 0.5;
      const y    = (e.clientY - rect.top)  / rect.height - 0.5;
      const inner = avatarCard.querySelector('.avatar-card-inner');
      inner.style.transform = `perspective(600px) rotateY(${x * 18}deg) rotateX(${-y * 14}deg) scale(1.03)`;
    });
    avatarCard.addEventListener('mouseleave', () => {
      const inner = avatarCard.querySelector('.avatar-card-inner');
      inner.style.transform = '';
    });
  }

  /* ════════════════════════════════════════════════════════
     INIT – run everything
  ════════════════════════════════════════════════════════ */
  function init() {
    populateProfile();
    buildSkills();
    buildFilters();
    buildProjects();
    buildShowreel();
    buildTimeline();
    buildEducation();
    attachRevealObserver();
    updateActiveNavLink();
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
