/* ============================================================
   ADMIN DASHBOARD – admin.js
   Data disimpan di localStorage, portfolio.js baca dari sini
   ============================================================ */

(function () {
  'use strict';

  const STORAGE_KEY = 'portfolio_custom_data';

  /* ── Helpers ─────────────────────────────────────────────── */
  const $  = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];

  /* ════════════════════════════════════════════════════════
     STATE – load from localStorage, fallback to portfolio-data.js
  ════════════════════════════════════════════════════════ */
  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    // Deep clone defaults from portfolio-data.js
    return JSON.parse(JSON.stringify(PORTFOLIO_CONFIG));
  }

  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    showSaveIndicator();
  }

  let state = loadData();

  /* ════════════════════════════════════════════════════════
     ROUTING – sidebar pages
  ════════════════════════════════════════════════════════ */
  const pageTitles = {
    dashboard:  'Dashboard',
    profile:    'Profil',
    projects:   'Projects',
    showreel:   'Showreel',
    skills:     'Skills',
    education:  'Education',
    experience: 'Experience',
    theme:      'Tema & Warna',
  };

  function navigateTo(pageId) {
    $$('.page').forEach(p => p.classList.remove('active'));
    $$('.nav-item').forEach(n => n.classList.remove('active'));

    const page = $(`#page-${pageId}`);
    const nav  = $(`.nav-item[data-page="${pageId}"]`);
    if (page) page.classList.add('active');
    if (nav)  nav.classList.add('active');

    $('#topbar-title').textContent = pageTitles[pageId] || pageId;

    // Render page content
    if (pageId === 'dashboard')  renderDashboard();
    if (pageId === 'profile')    renderProfile();
    if (pageId === 'projects')   renderProjects();
    if (pageId === 'showreel')   renderShowreel();
    if (pageId === 'skills')     renderSkills();
    if (pageId === 'education')  renderEducation();
    if (pageId === 'experience') renderExperience();
    if (pageId === 'theme')      renderTheme();

    // Close mobile sidebar
    const sidebar = $('#sidebar');
    if (window.innerWidth <= 820) sidebar.classList.remove('open');
  }

  $$('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
  });

  // "goto" buttons in dashboard
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-goto]');
    if (btn) navigateTo(btn.dataset.goto);
  });

  /* ════════════════════════════════════════════════════════
     SIDEBAR TOGGLE
  ════════════════════════════════════════════════════════ */
  const sidebarEl  = $('#sidebar');
  const topbarEl   = document.querySelector('.topbar');
  const mainEl     = $('.main-content');
  let   sidebarCollapsed = false;

  $('#sidebar-toggle').addEventListener('click', () => {
    if (window.innerWidth <= 820) {
      // Mobile: slide in/out
      sidebarEl.classList.toggle('open');
    } else {
      // Desktop: collapse
      sidebarCollapsed = !sidebarCollapsed;
      sidebarEl.classList.toggle('collapsed', sidebarCollapsed);
      topbarEl.classList.toggle('expanded', sidebarCollapsed);
      mainEl.classList.toggle('expanded', sidebarCollapsed);
    }
  });

  /* ════════════════════════════════════════════════════════
     TOAST
  ════════════════════════════════════════════════════════ */
  function showToast(msg, type = 'success') {
    const toast = $('#toast');
    toast.textContent = msg;
    toast.className   = `toast ${type} show`;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function showSaveIndicator() {
    const ind = $('#save-indicator');
    ind.classList.add('show');
    clearTimeout(ind._t);
    ind._t = setTimeout(() => ind.classList.remove('show'), 2500);
  }

  /* ════════════════════════════════════════════════════════
     CONFIRM DIALOG
  ════════════════════════════════════════════════════════ */
  let confirmResolve = null;

  function confirmDialog(title, message) {
    return new Promise(resolve => {
      confirmResolve = resolve;
      $('#confirm-title').textContent   = title;
      $('#confirm-message').textContent = message;
      $('#confirm-backdrop').style.display = 'flex';
    });
  }

  $('#confirm-ok').addEventListener('click', () => {
    $('#confirm-backdrop').style.display = 'none';
    if (confirmResolve) { confirmResolve(true); confirmResolve = null; }
  });
  $('#confirm-cancel').addEventListener('click', () => {
    $('#confirm-backdrop').style.display = 'none';
    if (confirmResolve) { confirmResolve(false); confirmResolve = null; }
  });

  /* ════════════════════════════════════════════════════════
     RESET
  ════════════════════════════════════════════════════════ */
  $('#reset-all-btn').addEventListener('click', async () => {
    const ok = await confirmDialog(
      'Reset ke Default',
      'Semua perubahan akan dihapus dan dikembalikan ke data awal dari portfolio-data.js. Lanjutkan?'
    );
    if (!ok) return;
    localStorage.removeItem(STORAGE_KEY);
    state = loadData();
    navigateTo('dashboard');
    showToast('✓ Data direset ke default', 'info');
  });

  /* ════════════════════════════════════════════════════════
     FILE → BASE64 HELPER
  ════════════════════════════════════════════════════════ */
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function bindUploadArea(areaId, inputId, onResult) {
    const area  = $(`#${areaId}`);
    const input = $(`#${inputId}`);
    if (!area || !input) return;

    area.addEventListener('click', () => input.click());
    area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('drag-over'); });
    area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
    area.addEventListener('drop', async e => {
      e.preventDefault();
      area.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) {
        const b64 = await fileToBase64(file);
        onResult(b64, file.name);
      }
    });
    input.addEventListener('change', async () => {
      const file = input.files[0];
      if (file) {
        const b64 = await fileToBase64(file);
        onResult(b64, file.name);
      }
    });
  }

  /* ════════════════════════════════════════════════════════
     DASHBOARD
  ════════════════════════════════════════════════════════ */
  function renderDashboard() {
    const projects = state.projects || [];
    const skills   = state.skills   || [];
    const exp      = state.experience || [];
    const edu      = state.education  || [];
    const cats     = (state.categories || []).filter(c => c !== 'All');

    $('#stat-projects').textContent = projects.length;
    $('#stat-skills').textContent   = skills.length;
    $('#stat-exp').textContent      = exp.length + edu.length;
    $('#stat-cats').textContent     = cats.length;

    const list = $('#recent-projects-list');
    list.innerHTML = '';
    const recent = [...projects].slice(-5).reverse();
    if (!recent.length) {
      list.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;padding:12px 0">Belum ada proyek.</p>';
      return;
    }
    recent.forEach(p => {
      const div = document.createElement('div');
      div.className = 'recent-item';
      const hasThumb = p.thumbnail && p.thumbnail.length > 10;
      div.innerHTML = `
        <div class="recent-thumb">
          ${hasThumb ? `<img src="${escHtml(p.thumbnail)}" alt="" onerror="this.style.display='none'" />` : (p.type === 'video' ? '🎬' : p.type === 'youtube' ? '▶' : '🖼')}
        </div>
        <div class="recent-info">
          <div class="recent-title">${escHtml(p.title)}</div>
          <div class="recent-cat">${escHtml(p.category)}</div>
        </div>
        <span class="recent-type">${p.type}</span>`;
      list.appendChild(div);
    });
  }

  /* ════════════════════════════════════════════════════════
     PROFILE
  ════════════════════════════════════════════════════════ */
  function renderProfile() {
    const p = state.profile || {};
    $('#p-name').value      = p.name      || '';
    $('#p-email').value     = p.email     || '';
    $('#p-whatsapp').value  = p.whatsapp  || '';
    $('#p-title').value     = p.title     || '';
    $('#p-tagline').value   = p.tagline   || '';
    $('#p-about').value     = p.about     || '';
    $('#p-avatar').value    = p.avatar    || '';
    $('#p-instagram').value = p.socials?.instagram || '';
    $('#p-behance').value   = p.socials?.behance   || '';
    $('#p-fiverr').value    = p.socials?.fiverr    || '';
    $('#p-linkedin').value  = p.socials?.linkedin  || '';

    updateAvatarPreview(p.avatar || '');
  }

  function updateAvatarPreview(src) {
    const img         = $('#avatar-preview');
    const placeholder = $('#avatar-placeholder');
    if (src && src.length > 5) {
      img.src = src;
      img.style.display = 'block';
      placeholder.style.display = 'none';
      img.onerror = () => { img.style.display = 'none'; placeholder.style.display = 'flex'; };
    } else {
      img.style.display = 'none';
      placeholder.style.display = 'flex';
    }
  }

  // Avatar path input live preview
  $('#p-avatar').addEventListener('input', e => updateAvatarPreview(e.target.value));

  // Avatar file upload
  $('#avatar-file-input').addEventListener('change', async function () {
    if (!this.files[0]) return;
    try {
      const b64 = await fileToBase64(this.files[0]);
      $('#p-avatar').value = b64;
      updateAvatarPreview(b64);
    } catch (e) { showToast('Gagal membaca file', 'error'); }
  });

  $('#save-profile-btn').addEventListener('click', () => {
    const name = $('#p-name').value.trim();
    if (!name) { showToast('Nama tidak boleh kosong', 'error'); return; }

    state.profile = {
      name,
      email:    $('#p-email').value.trim(),
      whatsapp: $('#p-whatsapp').value.trim(),
      title:    $('#p-title').value.trim(),
      tagline:  $('#p-tagline').value.trim(),
      about:    $('#p-about').value.trim(),
      avatar:   $('#p-avatar').value.trim(),
      socials: {
        instagram: $('#p-instagram').value.trim(),
        behance:   $('#p-behance').value.trim(),
        fiverr:    $('#p-fiverr').value.trim(),
        linkedin:  $('#p-linkedin').value.trim(),
      }
    };
    saveData(state);
    showToast('✓ Profil tersimpan!');
  });

  /* ════════════════════════════════════════════════════════
     PROJECTS
  ════════════════════════════════════════════════════════ */
  let editingProjectId = null;

  function renderProjects() {
    const projects = state.projects || [];
    const grid     = $('#projects-grid');
    const empty    = $('#projects-empty');
    grid.innerHTML = '';

    if (!projects.length) {
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';

    projects.forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = 'admin-project-card';
      const hasThumb = p.thumbnail && p.thumbnail.length > 5;
      card.innerHTML = `
        <div class="apc-thumb">
          ${hasThumb
            ? `<img src="${escHtml(p.thumbnail)}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" /><div class="apc-thumb-placeholder" style="display:none">${p.type === 'video' ? '🎬' : p.type === 'youtube' ? '▶' : '🖼'}</div>`
            : `<div class="apc-thumb-placeholder">${p.type === 'video' ? '🎬' : p.type === 'youtube' ? '▶' : '🖼'}</div>`}
          <div class="apc-type">${p.type}</div>
          ${p.featured ? '<div class="apc-featured">⭐ Featured</div>' : ''}
        </div>
        <div class="apc-body">
          <div class="apc-cat">${escHtml(p.category)} · ${escHtml(p.year || '')}</div>
          <div class="apc-title">${escHtml(p.title)}</div>
          <div class="apc-desc">${escHtml(p.description || '')}</div>
        </div>
        <div class="apc-actions">
          <button class="btn btn-secondary" data-edit="${p.id}">✏ Edit</button>
          <button class="btn btn-danger" data-delete="${p.id}">🗑 Hapus</button>
        </div>`;
      grid.appendChild(card);
    });

    // Bind actions
    grid.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => openProjectForm(parseInt(btn.dataset.edit)));
    });
    grid.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => deleteProject(parseInt(btn.dataset.delete)));
    });
  }

  function buildCategoryOptions(selected) {
    const sel = $('#proj-category');
    sel.innerHTML = '';
    const cats = (state.categories || []).filter(c => c !== 'All');
    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      if (c === selected) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  function openProjectForm(id = null) {
    editingProjectId = id;
    const wrap = $('#project-form-wrap');
    wrap.style.display = 'block';
    wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (id !== null) {
      const p = state.projects.find(x => x.id === id);
      if (!p) return;
      $('#project-form-title').textContent = 'Edit Proyek';
      buildCategoryOptions(p.category);
      $('#proj-title').value   = p.title || '';
      $('#proj-year').value    = p.year  || '';
      $('#proj-client').value  = p.client || '';
      $('#proj-tags').value    = (p.tags || []).join(', ');
      $('#proj-desc').value    = p.description || '';
      $('#proj-featured').checked = !!p.featured;
      $('#proj-thumbnail').value  = p.thumbnail || '';
      $('#proj-edit-id').value    = id;
      // type
      $$('input[name="proj-type"]').forEach(r => { r.checked = r.value === p.type; });
      switchMediaGroup(p.type);
      if (p.type === 'image') {
        $('#proj-src-image').value = p.src || '';
        updateMediaPreview('image', p.src || '');
      } else if (p.type === 'video') {
        $('#proj-src-video').value = p.src || '';
      } else if (p.type === 'youtube') {
        $('#proj-youtube-id').value = p.youtubeId || '';
        updateYTPreview(p.youtubeId || '');
      }
      updateThumbPreview(p.thumbnail || '');
    } else {
      $('#project-form-title').textContent = 'Tambah Proyek Baru';
      buildCategoryOptions('');
      clearProjectForm();
    }
  }

  function clearProjectForm() {
    $('#proj-title').value    = '';
    $('#proj-year').value     = new Date().getFullYear().toString();
    $('#proj-client').value   = '';
    $('#proj-tags').value     = '';
    $('#proj-desc').value     = '';
    $('#proj-featured').checked = false;
    $('#proj-thumbnail').value  = '';
    $('#proj-src-image').value  = '';
    $('#proj-src-video').value  = '';
    $('#proj-youtube-id').value = '';
    $('#proj-edit-id').value    = '';
    $$('input[name="proj-type"]')[0].checked = true;
    switchMediaGroup('image');
    updateThumbPreview('');
    updateMediaPreview('image', '');
    $('#yt-preview').style.display = 'none';
  }

  function closeProjectForm() {
    $('#project-form-wrap').style.display = 'none';
    editingProjectId = null;
    clearProjectForm();
  }

  $('#add-project-btn').addEventListener('click', () => openProjectForm(null));
  $('#close-project-form').addEventListener('click', closeProjectForm);
  $('#cancel-project-btn').addEventListener('click', closeProjectForm);

  // Type radio switch
  $$('input[name="proj-type"]').forEach(r => {
    r.addEventListener('change', () => switchMediaGroup(r.value));
  });

  function switchMediaGroup(type) {
    $('#media-image-group').style.display   = type === 'image'   ? 'block' : 'none';
    $('#media-video-group').style.display   = type === 'video'   ? 'block' : 'none';
    $('#media-youtube-group').style.display = type === 'youtube' ? 'block' : 'none';
  }

  // Image upload
  bindUploadArea('image-upload-area', 'proj-image-file', (b64) => {
    $('#proj-src-image').value = b64;
    updateMediaPreview('image', b64);
    // auto-set thumbnail if empty
    if (!$('#proj-thumbnail').value) {
      $('#proj-thumbnail').value = b64;
      updateThumbPreview(b64);
    }
  });
  $('#proj-src-image').addEventListener('input', e => updateMediaPreview('image', e.target.value));

  // Video upload
  bindUploadArea('video-upload-area', 'proj-video-file', (b64) => {
    $('#proj-src-video').value = b64;
  });

  // YouTube ID → preview
  $('#proj-youtube-id').addEventListener('input', e => updateYTPreview(e.target.value.trim()));

  function updateYTPreview(id) {
    const prev  = $('#yt-preview');
    const thumb = $('#yt-thumb');
    if (id.length >= 8) {
      thumb.src = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
      prev.style.display = 'block';
      // auto-fill thumbnail
      if (!$('#proj-thumbnail').value) {
        $('#proj-thumbnail').value = thumb.src;
        updateThumbPreview(thumb.src);
      }
    } else {
      prev.style.display = 'none';
    }
  }

  // Thumbnail upload
  $('#proj-thumb-file').addEventListener('change', async function () {
    if (!this.files[0]) return;
    const b64 = await fileToBase64(this.files[0]);
    $('#proj-thumbnail').value = b64;
    updateThumbPreview(b64);
  });
  $('#proj-thumbnail').addEventListener('input', e => updateThumbPreview(e.target.value));

  function updateThumbPreview(src) {
    const img  = $('#thumb-preview');
    const ph   = $('#thumb-placeholder');
    if (src && src.length > 5) {
      img.src = src; img.style.display = 'block'; ph.style.display = 'none';
      img.onerror = () => { img.style.display = 'none'; ph.style.display = 'flex'; };
    } else {
      img.style.display = 'none'; ph.style.display = 'flex';
    }
  }

  function updateMediaPreview(type, src) {
    // For image type, update upload area icon
    if (type === 'image' && src) {
      const area = $('#image-upload-area');
      if (src.startsWith('data:image') || src.startsWith('http') || src.startsWith('assets')) {
        area.querySelector('.upload-icon').textContent = '✓';
      }
    }
  }

  // Save project
  $('#save-project-btn').addEventListener('click', () => {
    const title = $('#proj-title').value.trim();
    if (!title) { showToast('Judul proyek wajib diisi', 'error'); return; }

    const type    = $('input[name="proj-type"]:checked')?.value || 'image';
    const tags    = $('#proj-tags').value.split(',').map(t => t.trim()).filter(Boolean);
    const project = {
      id:          editingProjectId !== null ? editingProjectId : Date.now(),
      title,
      category:    $('#proj-category').value,
      tags,
      type,
      src:         type === 'image' ? $('#proj-src-image').value.trim()
                 : type === 'video' ? $('#proj-src-video').value.trim()
                 : '',
      youtubeId:   type === 'youtube' ? $('#proj-youtube-id').value.trim() : '',
      thumbnail:   $('#proj-thumbnail').value.trim(),
      description: $('#proj-desc').value.trim(),
      year:        $('#proj-year').value.trim(),
      client:      $('#proj-client').value.trim(),
      featured:    $('#proj-featured').checked,
    };

    if (!state.projects) state.projects = [];

    if (editingProjectId !== null) {
      const idx = state.projects.findIndex(p => p.id === editingProjectId);
      if (idx >= 0) state.projects[idx] = project;
    } else {
      state.projects.push(project);
    }

    saveData(state);
    closeProjectForm();
    renderProjects();
    renderDashboard();
    showToast(`✓ Proyek "${title}" tersimpan!`);
  });

  async function deleteProject(id) {
    const p = state.projects.find(x => x.id === id);
    const ok = await confirmDialog('Hapus Proyek', `Yakin ingin menghapus "${p?.title}"?`);
    if (!ok) return;
    state.projects = state.projects.filter(x => x.id !== id);
    saveData(state);
    renderProjects();
    renderDashboard();
    showToast('🗑 Proyek dihapus', 'info');
  }

  /* ════════════════════════════════════════════════════════
     SKILLS
  ════════════════════════════════════════════════════════ */
  let editingSkillIdx = null;

  function renderSkills() {
    const skills = state.skills || [];
    const list   = $('#skills-list-admin');
    const empty  = $('#skills-empty');
    list.innerHTML = '';

    if (!skills.length) { empty.style.display = 'block'; return; }
    empty.style.display = 'none';

    skills.forEach((s, idx) => {
      const item = document.createElement('div');
      item.className = 'admin-skill-item';
      item.draggable = true;
      item.dataset.idx = idx;
      item.innerHTML = `
        <span class="skill-drag-handle" title="Drag untuk urutkan">⠿</span>
        <div class="skill-item-icon">${escHtml(s.icon || '⭐')}</div>
        <div class="skill-item-info">
          <div class="skill-item-name">${escHtml(s.name)}</div>
          <div class="skill-item-bar">
            <div class="skill-item-fill" style="width:${s.level}%"></div>
          </div>
        </div>
        <div class="skill-item-pct">${s.level}%</div>
        <div class="skill-item-actions">
          <button class="icon-btn success" data-edit-skill="${idx}" title="Edit">✏</button>
          <button class="icon-btn danger"  data-del-skill="${idx}"  title="Hapus">🗑</button>
        </div>`;
      list.appendChild(item);
    });

    // Bind actions
    list.querySelectorAll('[data-edit-skill]').forEach(btn =>
      btn.addEventListener('click', () => openSkillForm(parseInt(btn.dataset.editSkill)))
    );
    list.querySelectorAll('[data-del-skill]').forEach(btn =>
      btn.addEventListener('click', () => deleteSkill(parseInt(btn.dataset.delSkill)))
    );

    // Drag-to-reorder
    initSkillDrag(list);
  }

  function openSkillForm(idx = null) {
    editingSkillIdx = idx;
    const wrap = $('#skill-form-wrap');
    wrap.style.display = 'block';
    wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (idx !== null) {
      const s = state.skills[idx];
      $('#skill-form-title').textContent = 'Edit Skill';
      $('#skill-name').value  = s.name  || '';
      $('#skill-icon').value  = s.icon  || '';
      $('#skill-level').value = s.level || 80;
      $('#skill-level-display').textContent = s.level || 80;
      $('#skill-edit-idx').value = idx;
    } else {
      $('#skill-form-title').textContent = 'Tambah Skill Baru';
      $('#skill-name').value  = '';
      $('#skill-icon').value  = '✦';
      $('#skill-level').value = 80;
      $('#skill-level-display').textContent = 80;
      $('#skill-edit-idx').value = '';
    }
  }

  function closeSkillForm() {
    $('#skill-form-wrap').style.display = 'none';
    editingSkillIdx = null;
  }

  $('#skill-level').addEventListener('input', e => {
    $('#skill-level-display').textContent = e.target.value;
  });
  $('#add-skill-btn').addEventListener('click', () => openSkillForm(null));
  $('#close-skill-form').addEventListener('click', closeSkillForm);
  $('#cancel-skill-btn').addEventListener('click', closeSkillForm);

  $('#save-skill-btn').addEventListener('click', () => {
    const name = $('#skill-name').value.trim();
    if (!name) { showToast('Nama skill wajib diisi', 'error'); return; }

    const skill = {
      name,
      icon:  $('#skill-icon').value.trim() || '✦',
      level: parseInt($('#skill-level').value),
    };

    if (!state.skills) state.skills = [];

    if (editingSkillIdx !== null) {
      state.skills[editingSkillIdx] = skill;
    } else {
      state.skills.push(skill);
    }

    saveData(state);
    closeSkillForm();
    renderSkills();
    showToast(`✓ Skill "${name}" tersimpan!`);
  });

  async function deleteSkill(idx) {
    const s   = state.skills[idx];
    const ok  = await confirmDialog('Hapus Skill', `Yakin hapus skill "${s?.name}"?`);
    if (!ok) return;
    state.skills.splice(idx, 1);
    saveData(state);
    renderSkills();
    showToast('🗑 Skill dihapus', 'info');
  }

  /* Drag-to-reorder skills */
  let dragSrcIdx = null;
  function initSkillDrag(list) {
    const items = list.querySelectorAll('.admin-skill-item');
    items.forEach(item => {
      item.addEventListener('dragstart', () => {
        dragSrcIdx = parseInt(item.dataset.idx);
        item.style.opacity = '0.4';
      });
      item.addEventListener('dragend', () => { item.style.opacity = '1'; });
      item.addEventListener('dragover', e => { e.preventDefault(); });
      item.addEventListener('drop', () => {
        const targetIdx = parseInt(item.dataset.idx);
        if (dragSrcIdx === null || dragSrcIdx === targetIdx) return;
        const moved = state.skills.splice(dragSrcIdx, 1)[0];
        state.skills.splice(targetIdx, 0, moved);
        saveData(state);
        renderSkills();
        dragSrcIdx = null;
      });
    });
  }

  /* ════════════════════════════════════════════════════════
     EDUCATION
  ════════════════════════════════════════════════════════ */
  let editingEduIdx = null;

  function renderEducation() {
    const edu   = state.education || [];
    const list  = $('#edu-list-admin');
    const empty = $('#edu-empty');
    list.innerHTML = '';

    if (!edu.length) { empty.style.display = 'block'; return; }
    empty.style.display = 'none';

    edu.forEach((e, idx) => {
      const item = document.createElement('div');
      item.className = 'admin-exp-item';
      item.innerHTML = `
        <div class="exp-item-dot" style="background:var(--accent3);box-shadow:0 0 0 4px rgba(67,230,252,0.15)">${e.icon || '🎓'}</div>
        <div class="exp-item-body">
          <div class="exp-item-period">${escHtml(e.period)}${e.gpa ? ` · GPA ${escHtml(e.gpa)}` : ''}</div>
          <div class="exp-item-role">${escHtml(e.degree)}</div>
          <div class="exp-item-company">${escHtml(e.school)}</div>
          <div class="exp-item-desc">${escHtml(e.desc || '')}</div>
          ${(e.tags||[]).length ? `<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">${(e.tags||[]).map(t=>`<span style="padding:2px 9px;border-radius:100px;font-size:0.7rem;background:var(--surface);border:1px solid var(--border);color:var(--text-muted)">${escHtml(t)}</span>`).join('')}</div>` : ''}
        </div>
        <div class="exp-item-actions">
          <button class="icon-btn success" data-edit-edu="${idx}" title="Edit">✏</button>
          <button class="icon-btn danger"  data-del-edu="${idx}"  title="Hapus">🗑</button>
        </div>`;
      list.appendChild(item);
    });

    list.querySelectorAll('[data-edit-edu]').forEach(btn =>
      btn.addEventListener('click', () => openEduForm(parseInt(btn.dataset.editEdu)))
    );
    list.querySelectorAll('[data-del-edu]').forEach(btn =>
      btn.addEventListener('click', () => deleteEdu(parseInt(btn.dataset.delEdu)))
    );
  }

  function openEduForm(idx = null) {
    editingEduIdx = idx;
    const wrap = $('#edu-form-wrap');
    wrap.style.display = 'block';
    wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (idx !== null) {
      const e = state.education[idx];
      $('#edu-form-title').textContent = 'Edit Pendidikan';
      $('#edu-school').value  = e.school  || '';
      $('#edu-degree').value  = e.degree  || '';
      $('#edu-period').value  = e.period  || '';
      $('#edu-gpa').value     = e.gpa     || '';
      $('#edu-icon').value    = e.icon    || '🎓';
      $('#edu-tags').value    = (e.tags || []).join(', ');
      $('#edu-desc').value    = e.desc    || '';
      $('#edu-edit-idx').value = idx;
    } else {
      $('#edu-form-title').textContent = 'Tambah Pendidikan';
      $('#edu-school').value = ''; $('#edu-degree').value = '';
      $('#edu-period').value = ''; $('#edu-gpa').value = '';
      $('#edu-icon').value   = '🎓'; $('#edu-tags').value = '';
      $('#edu-desc').value   = ''; $('#edu-edit-idx').value = '';
    }
  }

  function closeEduForm() {
    $('#edu-form-wrap').style.display = 'none';
    editingEduIdx = null;
  }

  $('#add-edu-btn').addEventListener('click', () => openEduForm(null));
  $('#close-edu-form').addEventListener('click', closeEduForm);
  $('#cancel-edu-btn').addEventListener('click', closeEduForm);

  $('#save-edu-btn').addEventListener('click', () => {
    const school = $('#edu-school').value.trim();
    const degree = $('#edu-degree').value.trim();
    if (!school || !degree) { showToast('Nama sekolah & jurusan wajib diisi', 'error'); return; }

    const tags = $('#edu-tags').value.split(',').map(t => t.trim()).filter(Boolean);
    const edu = {
      school,
      degree,
      period: $('#edu-period').value.trim(),
      gpa:    $('#edu-gpa').value.trim(),
      icon:   $('#edu-icon').value.trim() || '🎓',
      tags,
      desc:   $('#edu-desc').value.trim(),
    };

    if (!state.education) state.education = [];

    if (editingEduIdx !== null) {
      state.education[editingEduIdx] = edu;
    } else {
      state.education.push(edu);
    }

    saveData(state);
    closeEduForm();
    renderEducation();
    showToast(`✓ "${school}" tersimpan!`);
  });

  async function deleteEdu(idx) {
    const e  = state.education[idx];
    const ok = await confirmDialog('Hapus Pendidikan', `Hapus "${e?.school}"?`);
    if (!ok) return;
    state.education.splice(idx, 1);
    saveData(state);
    renderEducation();
    showToast('🗑 Dihapus', 'info');
  }

  /* ════════════════════════════════════════════════════════
     EXPERIENCE
  ════════════════════════════════════════════════════════ */
  let editingExpIdx = null;

  function renderExperience() {
    const exp   = state.experience || [];
    const list  = $('#exp-list-admin');
    const empty = $('#exp-empty');
    list.innerHTML = '';

    if (!exp.length) { empty.style.display = 'block'; return; }
    empty.style.display = 'none';

    exp.forEach((e, idx) => {
      const item = document.createElement('div');
      item.className = 'admin-exp-item';
      item.innerHTML = `
        <div class="exp-item-dot"></div>
        <div class="exp-item-body">
          <div class="exp-item-period">${escHtml(e.period)}</div>
          <div class="exp-item-role">${escHtml(e.role)}</div>
          <div class="exp-item-company">${escHtml(e.company)}</div>
          <div class="exp-item-desc">${escHtml(e.desc)}</div>
        </div>
        <div class="exp-item-actions">
          <button class="icon-btn success" data-edit-exp="${idx}" title="Edit">✏</button>
          <button class="icon-btn danger"  data-del-exp="${idx}"  title="Hapus">🗑</button>
        </div>`;
      list.appendChild(item);
    });

    list.querySelectorAll('[data-edit-exp]').forEach(btn =>
      btn.addEventListener('click', () => openExpForm(parseInt(btn.dataset.editExp)))
    );
    list.querySelectorAll('[data-del-exp]').forEach(btn =>
      btn.addEventListener('click', () => deleteExp(parseInt(btn.dataset.delExp)))
    );
  }

  function openExpForm(idx = null) {
    editingExpIdx = idx;
    const wrap = $('#exp-form-wrap');
    wrap.style.display = 'block';
    wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (idx !== null) {
      const e = state.experience[idx];
      $('#exp-form-title').textContent = 'Edit Experience';
      $('#exp-role').value    = e.role    || '';
      $('#exp-company').value = e.company || '';
      $('#exp-period').value  = e.period  || '';
      $('#exp-desc').value    = e.desc    || '';
      $('#exp-edit-idx').value = idx;
    } else {
      $('#exp-form-title').textContent = 'Tambah Experience';
      $('#exp-role').value = ''; $('#exp-company').value = '';
      $('#exp-period').value = ''; $('#exp-desc').value = '';
      $('#exp-edit-idx').value = '';
    }
  }

  function closeExpForm() {
    $('#exp-form-wrap').style.display = 'none';
    editingExpIdx = null;
  }

  $('#add-exp-btn').addEventListener('click', () => openExpForm(null));
  $('#close-exp-form').addEventListener('click', closeExpForm);
  $('#cancel-exp-btn').addEventListener('click', closeExpForm);

  $('#save-exp-btn').addEventListener('click', () => {
    const role = $('#exp-role').value.trim();
    if (!role) { showToast('Role wajib diisi', 'error'); return; }

    const exp = {
      role,
      company: $('#exp-company').value.trim(),
      period:  $('#exp-period').value.trim(),
      desc:    $('#exp-desc').value.trim(),
    };

    if (!state.experience) state.experience = [];

    if (editingExpIdx !== null) {
      state.experience[editingExpIdx] = exp;
    } else {
      state.experience.push(exp);
    }

    saveData(state);
    closeExpForm();
    renderExperience();
    showToast(`✓ Experience "${role}" tersimpan!`);
  });

  async function deleteExp(idx) {
    const e  = state.experience[idx];
    const ok = await confirmDialog('Hapus Experience', `Hapus "${e?.role} di ${e?.company}"?`);
    if (!ok) return;
    state.experience.splice(idx, 1);
    saveData(state);
    renderExperience();
    showToast('🗑 Experience dihapus', 'info');
  }

  /* ════════════════════════════════════════════════════════
     SHOWREEL
  ════════════════════════════════════════════════════════ */
  function renderShowreel() {
    const sr = state.showreel || PORTFOLIO_CONFIG.showreel || {};

    $('#sr-enabled').checked      = sr.enabled !== false;
    $('#sr-heading').value         = sr.heading   || '';
    $('#sr-subtitle').value        = sr.subtitle  || '';
    $('#sr-year').value            = sr.year       || '';
    $('#sr-duration').value        = sr.duration   || '';
    $('#sr-desc').value            = sr.description || '';
    $('#sr-tags').value            = (sr.tags || []).join(', ');
    $('#sr-youtube-id').value      = sr.youtubeId  || '';
    $('#sr-video-src').value       = sr.src         || '';
    $('#sr-thumbnail').value       = sr.thumbnail   || '';
    $('#sr-ext-link').value        = sr.externalLink || '';
    $('#sr-ext-label').value       = sr.externalLabel || '';

    // Type radios
    $$('input[name="sr-type"]').forEach(r => { r.checked = r.value === (sr.type || 'youtube'); });
    switchSrGroup(sr.type || 'youtube');

    // YouTube preview
    if (sr.youtubeId) updateSrYtPreview(sr.youtubeId);

    // Thumbnail preview
    const thumb = sr.thumbnail || (sr.type === 'youtube' && sr.youtubeId
      ? `https://img.youtube.com/vi/${sr.youtubeId}/mqdefault.jpg` : '');
    updateSrThumbPreview(thumb);
  }

  function switchSrGroup(type) {
    $('#sr-youtube-group').style.display = type === 'youtube' ? 'block' : 'none';
    $('#sr-video-group').style.display   = type === 'video'   ? 'block' : 'none';
  }

  function updateSrYtPreview(id) {
    const prev  = $('#sr-yt-preview');
    const thumb = $('#sr-yt-thumb');
    if (id && id.length >= 6) {
      thumb.src = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
      prev.style.display = 'block';
      updateSrThumbPreview(thumb.src);
      updateSrBigPreview(thumb.src);
    } else {
      prev.style.display = 'none';
    }
  }

  function updateSrThumbPreview(src) {
    const img = $('#sr-thumb-preview');
    const ph  = $('#sr-thumb-placeholder');
    if (src && src.length > 5) {
      img.src = src; img.style.display = 'block'; ph.style.display = 'none';
    } else {
      img.style.display = 'none'; ph.style.display = 'flex';
    }
  }

  function updateSrBigPreview(src) {
    const img = $('#sr-preview-img');
    const ph  = $('#sr-preview-placeholder');
    if (src && src.length > 5) {
      img.src = src; img.style.display = 'block'; ph.style.display = 'none';
    } else {
      img.style.display = 'none'; ph.style.display = 'block';
    }
  }

  // Type radio change
  $$('input[name="sr-type"]').forEach(r => {
    r.addEventListener('change', () => switchSrGroup(r.value));
  });

  // YouTube ID live
  $('#sr-youtube-id').addEventListener('input', e => updateSrYtPreview(e.target.value.trim()));

  // Thumbnail file
  $('#sr-thumb-file').addEventListener('change', async function () {
    if (!this.files[0]) return;
    const b64 = await fileToBase64(this.files[0]);
    $('#sr-thumbnail').value = b64;
    updateSrThumbPreview(b64);
    updateSrBigPreview(b64);
  });
  $('#sr-thumbnail').addEventListener('input', e => {
    updateSrThumbPreview(e.target.value);
    updateSrBigPreview(e.target.value);
  });

  // Video file
  bindUploadArea('sr-video-upload-area', 'sr-video-file', (b64) => {
    $('#sr-video-src').value = b64;
  });

  // Save showreel
  $('#save-showreel-btn').addEventListener('click', () => {
    const type = $('input[name="sr-type"]:checked')?.value || 'youtube';
    const tags  = $('#sr-tags').value.split(',').map(t => t.trim()).filter(Boolean);

    state.showreel = {
      enabled:       $('#sr-enabled').checked,
      heading:       $('#sr-heading').value.trim(),
      subtitle:      $('#sr-subtitle').value.trim(),
      year:          $('#sr-year').value.trim(),
      duration:      $('#sr-duration').value.trim(),
      description:   $('#sr-desc').value.trim(),
      tags,
      type,
      youtubeId:     type === 'youtube' ? $('#sr-youtube-id').value.trim() : '',
      src:           type === 'video'   ? $('#sr-video-src').value.trim()  : '',
      thumbnail:     $('#sr-thumbnail').value.trim(),
      externalLink:  $('#sr-ext-link').value.trim(),
      externalLabel: $('#sr-ext-label').value.trim(),
    };

    saveData(state);
    showToast('✓ Showreel tersimpan!');
  });

  /* ════════════════════════════════════════════════════════
     THEME
  ════════════════════════════════════════════════════════ */
  function renderTheme() {
    const t  = state.theme || {};
    const a1 = t.accent1 || '#6C63FF';
    const a2 = t.accent2 || '#FF6584';
    const a3 = t.accent3 || '#43E6FC';

    $('#theme-accent1').value     = a1;
    $('#theme-accent1-hex').value = a1;
    $('#theme-accent2').value     = a2;
    $('#theme-accent2-hex').value = a2;
    $('#theme-accent3').value     = a3;
    $('#theme-accent3-hex').value = a3;

    $('#theme-categories').value = (state.categories || []).join(', ');

    updateThemePreview(a1, a2, a3);
  }

  function updateThemePreview(a1, a2, a3) {
    $('#prev-btn1').style.background  = a1;
    $('#prev-tag').style.borderColor  = a1;
    $('#prev-tag').style.color        = a1;
    $('#prev-fill').style.background  = `linear-gradient(90deg, ${a1}, ${a2})`;
  }

  // Sync color ↔ hex inputs
  function bindColorHex(colorId, hexId) {
    const colorInput = $(`#${colorId}`);
    const hexInput   = $(`#${hexId}`);
    colorInput.addEventListener('input', () => {
      hexInput.value = colorInput.value;
      livePreviewTheme();
    });
    hexInput.addEventListener('input', () => {
      if (/^#[0-9A-Fa-f]{6}$/.test(hexInput.value)) {
        colorInput.value = hexInput.value;
        livePreviewTheme();
      }
    });
  }
  bindColorHex('theme-accent1', 'theme-accent1-hex');
  bindColorHex('theme-accent2', 'theme-accent2-hex');
  bindColorHex('theme-accent3', 'theme-accent3-hex');

  function livePreviewTheme() {
    updateThemePreview(
      $('#theme-accent1').value,
      $('#theme-accent2').value,
      $('#theme-accent3').value
    );
  }

  // Preset cards
  document.addEventListener('click', e => {
    const preset = e.target.closest('.preset-card');
    if (!preset) return;
    const a1 = preset.dataset.a1;
    const a2 = preset.dataset.a2;
    const a3 = preset.dataset.a3;
    $('#theme-accent1').value     = a1;
    $('#theme-accent1-hex').value = a1;
    $('#theme-accent2').value     = a2;
    $('#theme-accent2-hex').value = a2;
    $('#theme-accent3').value     = a3;
    $('#theme-accent3-hex').value = a3;
    updateThemePreview(a1, a2, a3);

    // Highlight active preset
    $$('.preset-card').forEach(c => c.style.borderColor = '');
    preset.style.borderColor = a1;
  });

  $('#save-theme-btn').addEventListener('click', () => {
    const a1 = $('#theme-accent1').value;
    const a2 = $('#theme-accent2').value;
    const a3 = $('#theme-accent3').value;

    state.theme = { accent1: a1, accent2: a2, accent3: a3 };

    // Parse categories
    const rawCats = $('#theme-categories').value;
    const cats = rawCats.split(',').map(c => c.trim()).filter(Boolean);
    if (!cats.includes('All')) cats.unshift('All');
    state.categories = cats;

    // Also apply to admin dashboard CSS variables
    document.documentElement.style.setProperty('--accent', a1);

    saveData(state);
    showToast('✓ Tema tersimpan!');
  });

  /* ════════════════════════════════════════════════════════
     UTILITY – XSS safe
  ════════════════════════════════════════════════════════ */
  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ════════════════════════════════════════════════════════
     INIT
  ════════════════════════════════════════════════════════ */
  navigateTo('dashboard');

})();
