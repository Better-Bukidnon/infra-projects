// Strings and a small language switcher (EN / FIL / CEB) for
// infra.betterbukidnon.org. Exposes window.IPI18N:
//   t(key, fallback, params)  translated string, `{param}` interpolated
//   lang()                    'en' | 'fil' | 'ceb'
//   set(lang)                 switch, re-apply markup, notify listeners
//   onChange(fn)              called after every switch
//
// Markup: data-i18n (text), data-i18n-placeholder, data-i18n-aria (aria-label).
// The English text stays inline in index.html as the fallback.
//
// FIL/CEB are first drafts. Have a native speaker review them before launch.

(function () {
  'use strict';

  const STRINGS = {
    en: {
      'ip-skip': 'Skip to main content',
      'ip-top-budget': 'Budget portal',
      'ip-lang-label': 'Language',
      'ip-kicker': 'Province of Bukidnon · Public works',
      'ip-title': 'Infrastructure Projects',
      'ip-data-from': 'Data from',
      'ip-via': 'via BetterGov.ph',
      'ip-nav-label': 'Sections',
      'ip-nav-about': 'About the data',
      'ip-desc': 'Every DPWH public works project in Bukidnon on Bisto.ph: roads, bridges, buildings, water and flood control, with budgets, contractors and status.',
      'ip-stat-projects': 'Projects',
      'ip-stat-mapped': 'On the map',
      'ip-stat-budget': 'Total budget',
      'ip-filters': 'Filters',
      'ip-map-label': 'Map of infrastructure projects',
      'ip-pagination': 'Pagination',
      'ip-view-map': 'Map',
      'ip-view-table': 'Table',
      'ip-search': 'Search projects',
      'ip-search-ph': 'Name, contractor, contract ID…',
      'ip-lgu': 'City / Municipality',
      'ip-lgu-all': 'All of Bukidnon',
      'ip-year': 'Infrastructure year',
      'ip-year-all': 'All years',
      'ip-category': 'Project category',
      'ip-category-all': 'All categories',
      'ip-status': 'Project status',
      'ip-reset': 'Reset filters',
      'ip-report': 'Report or monitor a project on Bisto.ph',
      'ip-empty': 'No projects match these filters.',
      'ip-empty-nodata': 'No infrastructure projects synced yet. Data will appear here once the Bisto.ph sync runs.',
      'ip-source': 'Data sourced from Bisto.ph (DPWH projects via BetterGov.ph).',
      'ip-synced': 'Last synced {when}.',
      'ip-col-project': 'Project',
      'ip-col-location': 'Location',
      'ip-col-contractor': 'Contractor',
      'ip-col-budget': 'Budget',
      'ip-col-status': 'Status',
      'ip-f-status': 'Status',
      'ip-f-budget': 'Budget',
      'ip-f-location': 'Location',
      'ip-f-contractor': 'Contractor',
      'ip-f-year': 'Year',
      'ip-f-contract': 'Contract ID',
      'ip-prev': 'Previous page',
      'ip-next': 'Next page',
      'ip-about-sync': "The list is copied once a day from the BetterGov.ph DPWH API, the same data behind Bisto.ph. Budgets, contractors and statuses are shown as published. The city or municipality and the category are worked out from each project's description, and pins that fall outside Bukidnon are left off the map.",
      'ip-note': 'Project data is published by DPWH and collected by Bisto.ph. Locations, budgets and progress may be out of date or wrong. To report a problem with a project, use Bisto.ph.',
      'ip-foot-source': 'Source: DPWH projects on Bisto.ph · via the BetterGov.ph DPWH API',
      'ip-foot-site': 'This site',
      'ip-foot-run-by': 'Run by',
      'ip-foot-also': 'Also from Better Bukidnon',
      'ip-foot-report': 'Report a project',
      'ip-foot-help': 'Help out',
      'ip-foot-disclaimer': 'Volunteer civic project, not an official government website.',
      'ip-status-Completed': 'Completed',
      'ip-status-On-Going': 'On-Going',
      'ip-status-For Procurement': 'For Procurement',
      'ip-status-Not Yet Started': 'Not Yet Started',
      'ip-status-Terminated': 'Terminated',
      'ip-cat-Roads': 'Roads',
      'ip-cat-Bridges': 'Bridges',
      'ip-cat-Buildings and Facilities': 'Buildings and Facilities',
      'ip-cat-Water Provision and Storage': 'Water Provision and Storage',
      'ip-cat-Flood Control and Drainage': 'Flood Control and Drainage',
      'ip-cat-Other': 'Other',
    },
    fil: {
      'ip-skip': 'Lumaktaw sa pangunahing nilalaman',
      'ip-top-budget': 'Portal ng badyet',
      'ip-lang-label': 'Wika',
      'ip-kicker': 'Lalawigan ng Bukidnon · Pampublikong gawain',
      'ip-title': 'Mga Proyektong Imprastraktura',
      'ip-data-from': 'Datos mula sa',
      'ip-via': 'sa pamamagitan ng BetterGov.ph',
      'ip-nav-label': 'Mga seksyon',
      'ip-nav-about': 'Tungkol sa datos',
      'ip-desc': 'Bawat proyekto ng DPWH sa Bukidnon na nasa Bisto.ph: kalsada, tulay, gusali, tubig at flood control, kasama ang badyet, kontratista at katayuan.',
      'ip-stat-projects': 'Proyekto',
      'ip-stat-mapped': 'Nasa mapa',
      'ip-stat-budget': 'Kabuuang badyet',
      'ip-filters': 'Mga filter',
      'ip-map-label': 'Mapa ng mga proyektong imprastraktura',
      'ip-pagination': 'Mga pahina',
      'ip-view-map': 'Mapa',
      'ip-view-table': 'Talahanayan',
      'ip-search': 'Maghanap ng proyekto',
      'ip-search-ph': 'Pangalan, kontratista, contract ID…',
      'ip-lgu': 'Lungsod / Bayan',
      'ip-lgu-all': 'Buong Bukidnon',
      'ip-year': 'Taon ng proyekto',
      'ip-year-all': 'Lahat ng taon',
      'ip-category': 'Uri ng proyekto',
      'ip-category-all': 'Lahat ng uri',
      'ip-status': 'Katayuan ng proyekto',
      'ip-reset': 'I-reset ang filter',
      'ip-report': 'Mag-ulat o magbantay ng proyekto sa Bisto.ph',
      'ip-empty': 'Walang proyektong tugma sa mga filter na ito.',
      'ip-empty-nodata': 'Wala pang naka-sync na proyekto. Lalabas dito ang datos kapag tumakbo na ang Bisto.ph sync.',
      'ip-source': 'Datos mula sa Bisto.ph (mga proyekto ng DPWH sa pamamagitan ng BetterGov.ph).',
      'ip-synced': 'Huling na-sync {when}.',
      'ip-col-project': 'Proyekto',
      'ip-col-location': 'Lokasyon',
      'ip-col-contractor': 'Kontratista',
      'ip-col-budget': 'Badyet',
      'ip-col-status': 'Katayuan',
      'ip-f-status': 'Katayuan',
      'ip-f-budget': 'Badyet',
      'ip-f-location': 'Lokasyon',
      'ip-f-contractor': 'Kontratista',
      'ip-f-year': 'Taon',
      'ip-f-contract': 'Contract ID',
      'ip-prev': 'Nakaraang pahina',
      'ip-next': 'Susunod na pahina',
      'ip-about-sync': 'Kinokopya ang listahan isang beses kada araw mula sa BetterGov.ph DPWH API, ang parehong datos sa likod ng Bisto.ph. Ipinapakita ang badyet, kontratista at katayuan ayon sa pagkakalathala. Ang lungsod o bayan at ang uri ay hinango sa paglalarawan ng bawat proyekto, at hindi inilalagay sa mapa ang mga pin na nasa labas ng Bukidnon.',
      'ip-note': 'Ang datos ng proyekto ay inilalathala ng DPWH at kinokolekta ng Bisto.ph. Maaaring luma o mali ang lokasyon, badyet at progreso. Para mag-ulat ng problema sa isang proyekto, gamitin ang Bisto.ph.',
      'ip-foot-source': 'Pinagmulan: mga proyekto ng DPWH sa Bisto.ph · sa pamamagitan ng BetterGov.ph DPWH API',
      'ip-foot-site': 'Ang site na ito',
      'ip-foot-run-by': 'Pinapatakbo ng',
      'ip-foot-also': 'Mula rin sa Better Bukidnon',
      'ip-foot-report': 'Mag-ulat ng proyekto',
      'ip-foot-help': 'Tumulong',
      'ip-foot-disclaimer': 'Proyektong sibiko ng mga boluntaryo, hindi opisyal na website ng gobyerno.',
      'ip-status-Completed': 'Tapos na',
      'ip-status-On-Going': 'Kasalukuyang ginagawa',
      'ip-status-For Procurement': 'Para sa procurement',
      'ip-status-Not Yet Started': 'Hindi pa nasisimulan',
      'ip-status-Terminated': 'Tinapos ang kontrata',
      'ip-cat-Roads': 'Mga kalsada',
      'ip-cat-Bridges': 'Mga tulay',
      'ip-cat-Buildings and Facilities': 'Mga gusali at pasilidad',
      'ip-cat-Water Provision and Storage': 'Suplay at imbakan ng tubig',
      'ip-cat-Flood Control and Drainage': 'Flood control at drainage',
      'ip-cat-Other': 'Iba pa',
    },
    ceb: {
      'ip-skip': 'Laktaw ngadto sa panguna nga sulod',
      'ip-top-budget': 'Portal sa badyet',
      'ip-lang-label': 'Pinulongan',
      'ip-kicker': 'Probinsya sa Bukidnon · Publikong buhat',
      'ip-title': 'Mga Proyekto sa Imprastraktura',
      'ip-data-from': 'Datos gikan sa',
      'ip-via': 'pinaagi sa BetterGov.ph',
      'ip-nav-label': 'Mga seksyon',
      'ip-nav-about': 'Mahitungod sa datos',
      'ip-desc': 'Matag proyekto sa DPWH sa Bukidnon nga anaa sa Bisto.ph: dalan, taytayan, bilding, tubig ug flood control, uban ang badyet, kontraktor ug kahimtang.',
      'ip-stat-projects': 'Proyekto',
      'ip-stat-mapped': 'Anaa sa mapa',
      'ip-stat-budget': 'Kinatibuk-ang badyet',
      'ip-filters': 'Mga filter',
      'ip-map-label': 'Mapa sa mga proyekto sa imprastraktura',
      'ip-pagination': 'Mga panid',
      'ip-view-map': 'Mapa',
      'ip-view-table': 'Talaan',
      'ip-search': 'Pangitaa ang proyekto',
      'ip-search-ph': 'Ngalan, kontraktor, contract ID…',
      'ip-lgu': 'Siyudad / Lungsod',
      'ip-lgu-all': 'Tibuok Bukidnon',
      'ip-year': 'Tuig sa proyekto',
      'ip-year-all': 'Tanang tuig',
      'ip-category': 'Klase sa proyekto',
      'ip-category-all': 'Tanang klase',
      'ip-status': 'Kahimtang sa proyekto',
      'ip-reset': 'I-reset ang filter',
      'ip-report': 'Pag-report o pagbantay sa proyekto sa Bisto.ph',
      'ip-empty': 'Walay proyekto nga mohaum niini nga mga filter.',
      'ip-empty-nodata': 'Wala pay na-sync nga proyekto. Makita dinhi ang datos kung modagan na ang Bisto.ph sync.',
      'ip-source': 'Datos gikan sa Bisto.ph (mga proyekto sa DPWH pinaagi sa BetterGov.ph).',
      'ip-synced': 'Katapusang na-sync {when}.',
      'ip-col-project': 'Proyekto',
      'ip-col-location': 'Lokasyon',
      'ip-col-contractor': 'Kontraktor',
      'ip-col-budget': 'Badyet',
      'ip-col-status': 'Kahimtang',
      'ip-f-status': 'Kahimtang',
      'ip-f-budget': 'Badyet',
      'ip-f-location': 'Lokasyon',
      'ip-f-contractor': 'Kontraktor',
      'ip-f-year': 'Tuig',
      'ip-f-contract': 'Contract ID',
      'ip-prev': 'Miaging panid',
      'ip-next': 'Sunod nga panid',
      'ip-about-sync': 'Ang listahan gikopya kausa matag adlaw gikan sa BetterGov.ph DPWH API, ang samang datos sa luyo sa Bisto.ph. Gipakita ang badyet, kontraktor ug kahimtang sumala sa pagkapatik. Ang siyudad o lungsod ug ang klase gikuha gikan sa paghulagway sa matag proyekto, ug ang mga pin nga gawas sa Bukidnon wala ibutang sa mapa.',
      'ip-note': 'Ang datos sa proyekto gipatik sa DPWH ug gikolekta sa Bisto.ph. Basin daan na o sayop ang lokasyon, badyet ug progreso. Aron mo-report og problema sa usa ka proyekto, gamita ang Bisto.ph.',
      'ip-foot-source': 'Tinubdan: mga proyekto sa DPWH sa Bisto.ph · pinaagi sa BetterGov.ph DPWH API',
      'ip-foot-site': 'Kini nga site',
      'ip-foot-run-by': 'Gipadagan sa',
      'ip-foot-also': 'Gikan usab sa Better Bukidnon',
      'ip-foot-report': 'Pag-report og proyekto',
      'ip-foot-help': 'Tabang',
      'ip-foot-disclaimer': 'Proyekto sa mga boluntaryo, dili opisyal nga website sa gobyerno.',
      'ip-status-Completed': 'Nahuman na',
      'ip-status-On-Going': 'Gihimo pa',
      'ip-status-For Procurement': 'Para sa procurement',
      'ip-status-Not Yet Started': 'Wala pa masugdi',
      'ip-status-Terminated': 'Gitapos ang kontrata',
      'ip-cat-Roads': 'Mga dalan',
      'ip-cat-Bridges': 'Mga taytayan',
      'ip-cat-Buildings and Facilities': 'Mga bilding ug pasilidad',
      'ip-cat-Water Provision and Storage': 'Suplay ug tipiganan sa tubig',
      'ip-cat-Flood Control and Drainage': 'Flood control ug drainage',
      'ip-cat-Other': 'Uban pa',
    },
  };

  const STORE_KEY = 'ip-lang';
  const listeners = [];
  let current = 'en';

  function read() {
    try {
      const saved = localStorage.getItem(STORE_KEY);
      if (saved && STRINGS[saved]) return saved;
    } catch (e) {
      /* storage blocked */
    }
    return 'en';
  }

  function t(key, fallback, params) {
    let s = (STRINGS[current] && STRINGS[current][key]) || STRINGS.en[key] || fallback || key;
    if (params) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in params ? params[k] : m));
    return s;
  }

  function apply() {
    document.documentElement.lang = current;
    for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n, el.textContent);
    for (const el of document.querySelectorAll('[data-i18n-placeholder]')) {
      el.placeholder = t(el.dataset.i18nPlaceholder, el.placeholder);
    }
    for (const el of document.querySelectorAll('[data-i18n-aria]')) {
      el.setAttribute('aria-label', t(el.dataset.i18nAria, el.getAttribute('aria-label')));
    }
    for (const b of document.querySelectorAll('.ip-lang button')) {
      b.setAttribute('aria-pressed', String(b.dataset.lang === current));
    }
  }

  function set(lang) {
    if (!STRINGS[lang]) return;
    current = lang;
    try {
      localStorage.setItem(STORE_KEY, lang);
    } catch (e) {
      /* storage blocked */
    }
    apply();
    for (const fn of listeners) fn(lang);
  }

  window.IPI18N = { t, lang: () => current, set, onChange: (fn) => listeners.push(fn) };

  // Deferred scripts run after parsing, so the markup is ready.
  current = read();
  apply();
  for (const b of document.querySelectorAll('.ip-lang button')) b.addEventListener('click', () => set(b.dataset.lang));
})();
