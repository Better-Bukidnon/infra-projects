(function () {
  'use strict';

  const DATA_URL = 'data/projects.json';
  const PAGE_SIZE = 25;
  const BUKIDNON_CENTER = [8.05, 125.0];

  const STATUS_ORDER = ['Completed', 'On-Going', 'For Procurement', 'Not Yet Started', 'Terminated'];
  const STATUS_COLOR = {
    Completed: 'var(--s-completed)',
    'On-Going': 'var(--s-ongoing)',
    'For Procurement': 'var(--s-procurement)',
    Terminated: 'var(--s-terminated)',
  };

  const $ = (id) => document.getElementById(id);
  const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 });
  const num = new Intl.NumberFormat('en-PH');

  const state = { all: [], filtered: [], view: 'map', page: 1, map: null, cluster: null };

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }

  function statusColor(s) {
    return STATUS_COLOR[s] || 'var(--s-other)';
  }

  function badge(s) {
    return `<span class="badge" style="--c:${statusColor(s)}">${esc(s)}</span>`;
  }

  function placeOf(p) {
    return [p.lgu, p.office].filter(Boolean).join(' · ') || '—';
  }

  // ---------- filters ----------

  function fillSelect(el, values) {
    for (const v of values) {
      const o = document.createElement('option');
      o.value = v;
      o.textContent = v;
      el.appendChild(o);
    }
  }

  function buildFilters() {
    const uniq = (key) => [...new Set(state.all.map((p) => p[key]).filter((v) => v != null))];
    fillSelect($('f-lgu'), uniq('lgu').sort());
    fillSelect($('f-year'), uniq('year').sort((a, b) => b - a));
    fillSelect($('f-category'), uniq('category').sort((a, b) => (a === 'Other') - (b === 'Other') || a.localeCompare(b)));

    const statuses = uniq('status').sort(
      (a, b) => (STATUS_ORDER.indexOf(a) + 1 || 99) - (STATUS_ORDER.indexOf(b) + 1 || 99),
    );
    $('f-status').innerHTML = statuses
      .map(
        (s) => `<label class="status-opt">
          <input type="checkbox" value="${esc(s)}" checked />
          <span>${esc(s)}</span><span class="count" data-status="${esc(s)}"></span>
        </label>`,
      )
      .join('');
  }

  function readFilters() {
    return {
      q: $('f-search').value.trim().toLowerCase(),
      lgu: $('f-lgu').value,
      year: $('f-year').value,
      category: $('f-category').value,
      statuses: new Set([...$('f-status').querySelectorAll('input:checked')].map((i) => i.value)),
    };
  }

  function matches(p, f, ignoreStatus) {
    if (f.lgu && p.lgu !== f.lgu) return false;
    if (f.year && String(p.year) !== f.year) return false;
    if (f.category && p.category !== f.category) return false;
    if (!ignoreStatus && !f.statuses.has(p.status)) return false;
    if (f.q) {
      const hay = `${p.title} ${p.contractor ?? ''} ${p.id} ${p.lgu ?? ''}`.toLowerCase();
      if (!hay.includes(f.q)) return false;
    }
    return true;
  }

  function apply() {
    const f = readFilters();

    // Status counts reflect every other filter, so they show what checking a box would add.
    const counts = {};
    for (const p of state.all) if (matches(p, f, true)) counts[p.status] = (counts[p.status] || 0) + 1;
    for (const el of $('f-status').querySelectorAll('.count')) el.textContent = num.format(counts[el.dataset.status] || 0);

    state.filtered = state.all.filter((p) => matches(p, f, false));
    state.page = 1;
    render();
  }

  // ---------- rendering ----------

  function render() {
    const list = state.filtered;
    const mapped = list.filter((p) => p.lat != null).length;
    const budget = list.reduce((sum, p) => sum + (p.budget || 0), 0);
    $('summary').innerHTML =
      `<strong>${num.format(list.length)}</strong> projects · ${num.format(mapped)} mapped · ` +
      `${peso.format(budget)} total budget`;

    $('empty').hidden = list.length > 0;
    $('view-map').hidden = state.view !== 'map' || list.length === 0;
    $('view-table').hidden = state.view !== 'table' || list.length === 0;

    if (state.view === 'map') renderMap();
    else renderTable();
  }

  function popupHtml(p) {
    const rows = [
      ['Status', badge(p.status) + (p.progress != null && p.status === 'On-Going' ? ` ${p.progress}%` : '')],
      ['Budget', p.budget != null ? peso.format(p.budget) : '—'],
      ['Location', esc(placeOf(p))],
      ['Contractor', esc(p.contractor || '—')],
      ['Year', esc(p.year || '—')],
      ['Contract ID', esc(p.id)],
    ];
    return `<div class="popup"><h3>${esc(p.title)}</h3>
      <span class="sub">${esc(p.category)}</span>
      <dl>${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl></div>`;
  }

  function initMap() {
    state.map = L.map('map', { scrollWheelZoom: true }).setView(BUKIDNON_CENTER, 9);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(state.map);
    state.cluster = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 45,
      iconCreateFunction(c) {
        const n = c.getChildCount();
        const size = n < 10 ? 30 : n < 100 ? 36 : 44;
        return L.divIcon({ className: '', html: `<div class="cluster">${n}</div>`, iconSize: [size, size] });
      },
    });
    state.map.addLayer(state.cluster);
  }

  function renderMap() {
    if (!state.map) initMap();
    // The container may have been hidden when Leaflet measured it.
    state.map.invalidateSize();
    state.cluster.clearLayers();

    const markers = [];
    for (const p of state.filtered) {
      if (p.lat == null) continue;
      const icon = L.divIcon({
        className: '',
        html: `<div class="pin" style="--c:${statusColor(p.status)}"></div>`,
        iconSize: [14, 14],
      });
      markers.push(L.marker([p.lat, p.lng], { icon, title: p.title }).bindPopup(() => popupHtml(p), { maxWidth: 320 }));
    }
    state.cluster.addLayers(markers);

    if (markers.length) state.map.fitBounds(state.cluster.getBounds(), { padding: [24, 24], maxZoom: 13 });
  }

  function renderTable() {
    const total = state.filtered.length;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    state.page = Math.min(state.page, pages);
    const start = (state.page - 1) * PAGE_SIZE;

    $('rows').innerHTML = state.filtered
      .slice(start, start + PAGE_SIZE)
      .map(
        (p) => `<tr>
          <td class="title">${esc(p.title)}<span class="sub">${esc(p.category)} · ${esc(p.year || '—')} · ${esc(p.id)}</span></td>
          <td>${esc(placeOf(p))}</td>
          <td>${esc(p.contractor || '—')}</td>
          <td class="num">${p.budget != null ? peso.format(p.budget) : '—'}</td>
          <td>${badge(p.status)}</td>
        </tr>`,
      )
      .join('');

    renderPager(pages);
  }

  function renderPager(pages) {
    const cur = state.page;
    const btn = (label, page, opts = {}) =>
      `<button type="button" data-page="${page}" ${opts.disabled ? 'disabled' : ''} ` +
      `${opts.current ? 'aria-current="page"' : ''} aria-label="${opts.aria || 'Page ' + page}">${label}</button>`;

    const nums = new Set([1, pages, cur - 1, cur, cur + 1].filter((n) => n >= 1 && n <= pages));
    const sorted = [...nums].sort((a, b) => a - b);
    let html = btn('‹', cur - 1, { disabled: cur === 1, aria: 'Previous page' });
    sorted.forEach((n, i) => {
      if (i > 0 && n - sorted[i - 1] > 1) html += '<span>…</span>';
      html += btn(n, n, { current: n === cur });
    });
    html += btn('›', cur + 1, { disabled: cur === pages, aria: 'Next page' });
    $('pager').innerHTML = html;
  }

  // ---------- wiring ----------

  function setView(view) {
    state.view = view;
    for (const b of document.querySelectorAll('.view-toggle button')) {
      b.setAttribute('aria-selected', String(b.dataset.view === view));
    }
    if (window.location.hash.slice(1) !== view) history.replaceState(null, '', '#' + view);
    render();
  }

  function debounce(fn, ms) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }

  function wire() {
    $('f-search').addEventListener('input', debounce(apply, 200));
    for (const id of ['f-lgu', 'f-year', 'f-category', 'f-status']) $(id).addEventListener('change', apply);
    $('f-reset').addEventListener('click', () => {
      $('f-search').value = '';
      $('f-lgu').value = $('f-year').value = $('f-category').value = '';
      for (const i of $('f-status').querySelectorAll('input')) i.checked = true;
      apply();
    });
    for (const b of document.querySelectorAll('.view-toggle button')) {
      b.addEventListener('click', () => setView(b.dataset.view));
    }
    $('pager').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-page]');
      if (!b || b.disabled) return;
      state.page = Number(b.dataset.page);
      renderTable();
      $('view-table').scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
  }

  async function main() {
    wire();
    try {
      const res = await fetch(DATA_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      state.all = data.projects || [];
      if (data.lastSyncedAt) {
        const when = new Date(data.lastSyncedAt).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
        $('source').insertAdjacentText('beforeend', ` Last synced ${when}.`);
      }
    } catch (err) {
      $('summary').textContent = '';
      $('empty').textContent = 'No infrastructure projects synced yet. Data will appear here once the Bisto.ph sync runs.';
      $('empty').hidden = false;
      $('view-map').hidden = true;
      console.error('Failed to load projects:', err);
      return;
    }
    buildFilters();
    const hashView = window.location.hash.slice(1);
    state.view = hashView === 'table' ? 'table' : 'map';
    for (const b of document.querySelectorAll('.view-toggle button')) {
      b.setAttribute('aria-selected', String(b.dataset.view === state.view));
    }
    apply();
  }

  main();
})();
