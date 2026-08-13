(() => {
  'use strict';

  const config = window.SLANGUAGE_LEGAL_CONFIG;
  if (!config) throw new Error('SLANGUAGE_LEGAL_CONFIG is missing.');

  const pageType = document.body.dataset.legalType === 'terms' ? 'terms' : 'privacy';
  const routeCanonical = pageType === 'privacy'
    ? 'https://swipeuplabs.github.io/slanguage-web/privacy/'
    : 'https://swipeuplabs.github.io/slanguage-web/terms/';

  const locales = {
    en: {
      htmlLang: 'en',
      labels: { en: 'English', 'zh-TW': '繁體中文', 'zh-CN': '简体中文' },
      nav: { features: 'Features', faq: 'FAQ', download: 'Download' },
      footer: { privacy: 'Privacy Policy', terms: 'Terms of Service' },
      typeLabel: pageType === 'privacy' ? 'Privacy Policy' : 'Terms of Service',
      loading: pageType === 'privacy' ? 'Loading Privacy Policy…' : 'Loading Terms of Service…',
      errorTitle: 'Document temporarily unavailable',
      errorText: 'We can’t load this document right now. You can still view the original legal page.',
      fallback: pageType === 'privacy' ? 'Open Privacy Policy' : 'Open Terms of Service',
      title: pageType === 'privacy' ? 'Slanguage Privacy Policy' : 'Slanguage Terms of Service',
      description: pageType === 'privacy'
        ? 'Read the official Slanguage Privacy Policy.'
        : 'Read the official Slanguage Terms of Service.',
      ariaLanguage: 'Legal document language',
      ariaNav: 'Main navigation',
      ariaFooter: 'Legal links'
    },
    'zh-TW': {
      htmlLang: 'zh-TW',
      labels: { en: 'English', 'zh-TW': '繁體中文', 'zh-CN': '简体中文' },
      nav: { features: '功能特色', faq: '常見問題', download: '下載 App' },
      footer: { privacy: '隱私權政策', terms: '服務條款' },
      typeLabel: pageType === 'privacy' ? '隱私權政策' : '服務條款',
      loading: pageType === 'privacy' ? '正在載入隱私權政策…' : '正在載入服務條款…',
      errorTitle: '目前無法載入此文件',
      errorText: '目前無法載入此文件，您仍可直接查看原始法律頁面。',
      fallback: pageType === 'privacy' ? '開啟隱私權政策' : '開啟服務條款',
      title: pageType === 'privacy' ? 'Slanguage 隱私權政策' : 'Slanguage 服務條款',
      description: pageType === 'privacy'
        ? '閱讀 Slanguage 官方繁體中文隱私權政策。'
        : '閱讀 Slanguage 官方繁體中文服務條款。',
      ariaLanguage: '法律文件語言',
      ariaNav: '主要導覽',
      ariaFooter: '法律連結'
    },
    'zh-CN': {
      htmlLang: 'zh-CN',
      labels: { en: 'English', 'zh-TW': '繁體中文', 'zh-CN': '简体中文' },
      nav: { features: '功能特色', faq: '常见问题', download: '下载 App' },
      footer: { privacy: '隐私政策', terms: '服务条款' },
      typeLabel: pageType === 'privacy' ? '隐私政策' : '服务条款',
      loading: pageType === 'privacy' ? '正在加载隐私政策…' : '正在加载服务条款…',
      errorTitle: '目前无法加载此文件',
      errorText: '目前无法加载此文件，您仍可直接查看原始法律页面。',
      fallback: pageType === 'privacy' ? '打开隐私政策' : '打开服务条款',
      title: pageType === 'privacy' ? 'Slanguage 隐私政策' : 'Slanguage 服务条款',
      description: pageType === 'privacy'
        ? '阅读 Slanguage 官方简体中文隐私政策。'
        : '阅读 Slanguage 官方简体中文服务条款。',
      ariaLanguage: '法律文件语言',
      ariaNav: '主要导航',
      ariaFooter: '法律链接'
    }
  };

  const allowedTags = new Set([
    'H1','H2','H3','H4','H5','H6','P','UL','OL','LI','A','STRONG','EM','B','I','U','BR','HR',
    'BLOCKQUOTE','SECTION','DIV','SPAN','TABLE','THEAD','TBODY','TFOOT','TR','TH','TD','DL','DT','DD',
    'PRE','CODE','SUP','SUB','SMALL'
  ]);

  const removableSelectors = [
    'script','style','noscript','template','iframe','object','embed','form','input','button','select','textarea','link','meta',
    'nav','header','footer',
    '.language-switch','.lang-switch','.language-switcher','.language-nav','.lang-nav',
    '#language-switch','#lang-switch','.site-header','.site-footer','#site-header','#site-footer'
  ].join(',');

  const contentSelectors = [
    'main',
    'article',
    '#legal-content',
    '.legal-content',
    '#privacy-policy',
    '#terms-of-service',
    '.policy-content',
    '.terms-content',
    '.content'
  ];

  function normalizeLang(value) {
    const raw = String(value || '').trim().toLowerCase();
    if (raw === 'zh-tw' || raw === 'zh_tw' || raw === 'tw') return 'zh-TW';
    if (raw === 'zh-cn' || raw === 'zh_cn' || raw === 'cn' || raw === 'zh-hans') return 'zh-CN';
    if (raw === 'en' || raw.startsWith('en-')) return 'en';
    return 'en';
  }

  function getRequestedLang() {
    return normalizeLang(new URLSearchParams(location.search).get('lang'));
  }

  function sourceUrlFor(lang) {
    const relative = config.sources?.[pageType]?.[lang];
    if (!relative) throw new Error(`No legal source mapping for ${pageType}.${lang}`);
    return new URL(relative, config.sourceBase).href;
  }

  function isSafeHref(rawHref, baseUrl) {
    if (!rawHref) return null;
    if (rawHref.startsWith('#')) return rawHref;
    try {
      const resolved = new URL(rawHref, baseUrl);
      if (['https:', 'http:', 'mailto:', 'tel:'].includes(resolved.protocol)) return resolved.href;
    } catch (_) {}
    return null;
  }

  function sanitizeNode(node, outputDocument, baseUrl) {
    if (node.nodeType === Node.TEXT_NODE) return outputDocument.createTextNode(node.nodeValue || '');
    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const tag = node.tagName.toUpperCase();
    if (!allowedTags.has(tag)) {
      const fragment = outputDocument.createDocumentFragment();
      Array.from(node.childNodes).forEach(child => {
        const safeChild = sanitizeNode(child, outputDocument, baseUrl);
        if (safeChild) fragment.appendChild(safeChild);
      });
      return fragment;
    }

    const clean = outputDocument.createElement(tag.toLowerCase());
    if (tag === 'A') {
      const href = isSafeHref(node.getAttribute('href'), baseUrl);
      if (href) clean.setAttribute('href', href);
      const title = node.getAttribute('title');
      if (title) clean.setAttribute('title', title);
      if (href && /^https?:/i.test(href)) {
        const destination = new URL(href);
        if (destination.origin !== location.origin) {
          clean.setAttribute('target', '_blank');
          clean.setAttribute('rel', 'noopener noreferrer');
        }
      }
    }
    ['lang','dir'].forEach(attr => {
      const value = node.getAttribute(attr);
      if (value) clean.setAttribute(attr, value);
    });

    Array.from(node.childNodes).forEach(child => {
      const safeChild = sanitizeNode(child, outputDocument, baseUrl);
      if (safeChild) clean.appendChild(safeChild);
    });
    return clean;
  }

  function parseAndSanitizeLegalHtml(rawHtml, sourceUrl) {
    const parser = new DOMParser();
    const remoteDocument = parser.parseFromString(rawHtml, 'text/html');
    if (remoteDocument.querySelector('parsererror')) throw new Error('Unable to parse legal HTML.');

    let sourceRoot = null;
    for (const selector of contentSelectors) {
      const candidate = remoteDocument.querySelector(selector);
      if (candidate && (candidate.textContent || '').trim().length >= 80) {
        sourceRoot = candidate;
        break;
      }
    }
    if (!sourceRoot) sourceRoot = remoteDocument.body;
    if (!sourceRoot) throw new Error('Legal document body is missing.');

    const clone = sourceRoot.cloneNode(true);
    clone.querySelectorAll(removableSelectors).forEach(element => element.remove());

    const remoteBase = remoteDocument.querySelector('base[href]')?.getAttribute('href');
    const baseUrl = remoteBase ? new URL(remoteBase, sourceUrl).href : sourceUrl;
    const safeFragment = document.createDocumentFragment();
    Array.from(clone.childNodes).forEach(child => {
      const safeChild = sanitizeNode(child, document, baseUrl);
      if (safeChild) safeFragment.appendChild(safeChild);
    });

    const temp = document.createElement('div');
    temp.appendChild(safeFragment.cloneNode(true));
    const plainText = (temp.textContent || '').replace(/\s+/g, ' ').trim();
    if (plainText.length < 80) throw new Error('Legal document content is unexpectedly empty.');
    return safeFragment;
  }

  function updateMeta(lang) {
    const t = locales[lang];
    document.documentElement.lang = t.htmlLang;
    document.title = t.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', t.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', t.description);
    document.querySelector('meta[property="og:locale"]')?.setAttribute('content', lang === 'zh-TW' ? 'zh_TW' : lang === 'zh-CN' ? 'zh_CN' : 'en_US');
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', routeCanonical);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', t.title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', t.description);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', routeCanonical);
  }

  function updateChrome(lang) {
    const t = locales[lang];
    document.querySelector('.site-nav')?.setAttribute('aria-label', t.ariaNav);
    document.getElementById('legal-language-switcher')?.setAttribute('aria-label', t.ariaLanguage);
    document.querySelector('.footer-links')?.setAttribute('aria-label', t.ariaFooter);
    document.getElementById('nav-features').textContent = t.nav.features;
    document.getElementById('nav-faq').textContent = t.nav.faq;
    document.getElementById('nav-download').textContent = t.nav.download;
    document.getElementById('legal-type').textContent = t.typeLabel;
    document.querySelector('.legal-card')?.setAttribute('aria-label', t.typeLabel);
    document.getElementById('footer-privacy').textContent = t.footer.privacy;
    document.getElementById('footer-terms').textContent = t.footer.terms;
    document.getElementById('footer-privacy').href = `../privacy/?lang=${encodeURIComponent(lang)}`;
    document.getElementById('footer-terms').href = `../terms/?lang=${encodeURIComponent(lang)}`;

    document.querySelectorAll('[data-lang]').forEach(link => {
      const targetLang = link.dataset.lang;
      link.textContent = t.labels[targetLang];
      link.href = `?lang=${encodeURIComponent(targetLang)}`;
      const selected = targetLang === lang;
      link.classList.toggle('is-selected', selected);
      if (selected) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function renderLoading(lang) {
    const t = locales[lang];
    const container = document.getElementById('legal-content');
    container.className = 'legal-content loading-state';
    container.setAttribute('aria-busy', 'true');
    container.innerHTML = '';
    const inner = document.createElement('div');
    inner.className = 'loading-inner';
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.setAttribute('aria-hidden', 'true');
    const status = document.createElement('p');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.textContent = t.loading;
    inner.append(spinner, status);
    container.appendChild(inner);
  }

  function renderError(lang, sourceUrl) {
    const t = locales[lang];
    const container = document.getElementById('legal-content');
    container.className = 'legal-content error-state';
    container.setAttribute('aria-busy', 'false');
    container.innerHTML = '';
    const inner = document.createElement('div');
    inner.className = 'error-inner';
    inner.setAttribute('role', 'alert');
    const heading = document.createElement('h1');
    heading.textContent = t.errorTitle;
    const text = document.createElement('p');
    text.textContent = t.errorText;
    const link = document.createElement('a');
    link.className = 'fallback-button';
    link.href = sourceUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = t.fallback;
    inner.append(heading, text, link);
    container.appendChild(inner);
  }

  function cacheKey(lang) {
    return `slanguage_legal_v1:${pageType}:${lang}`;
  }

  function getCachedRawHtml(lang) {
    try {
      const record = JSON.parse(sessionStorage.getItem(cacheKey(lang)) || 'null');
      if (!record || typeof record.html !== 'string' || typeof record.savedAt !== 'number') return null;
      if (Date.now() - record.savedAt > config.cacheTtlMs) {
        sessionStorage.removeItem(cacheKey(lang));
        return null;
      }
      return record.html;
    } catch (_) {
      return null;
    }
  }

  function setCachedRawHtml(lang, html) {
    try {
      sessionStorage.setItem(cacheKey(lang), JSON.stringify({ savedAt: Date.now(), html }));
    } catch (_) {}
  }

  async function fetchLegalHtml(sourceUrl) {
    const response = await fetch(sourceUrl, {
      method: 'GET',
      credentials: 'omit',
      cache: 'no-cache',
      headers: { 'Accept': 'text/html,application/xhtml+xml' }
    });
    if (!response.ok) throw new Error(`Legal source returned HTTP ${response.status}.`);
    const contentType = response.headers.get('content-type') || '';
    if (contentType && !/text\/html|application\/xhtml\+xml/i.test(contentType)) {
      throw new Error(`Unexpected legal source content type: ${contentType}`);
    }
    return response.text();
  }

  async function loadLegalDocument(lang, { updateHistory = false, forceRefresh = false } = {}) {
    const normalized = normalizeLang(lang);
    const sourceUrl = sourceUrlFor(normalized);

    if (updateHistory) {
      const next = new URL(location.href);
      next.searchParams.set('lang', normalized);
      history.pushState({ lang: normalized }, '', next);
    }

    updateMeta(normalized);
    updateChrome(normalized);
    renderLoading(normalized);

    try {
      let rawHtml = forceRefresh ? null : getCachedRawHtml(normalized);
      if (!rawHtml) {
        rawHtml = await fetchLegalHtml(sourceUrl);
        setCachedRawHtml(normalized, rawHtml);
      }
      const safeFragment = parseAndSanitizeLegalHtml(rawHtml, sourceUrl);
      const container = document.getElementById('legal-content');
      container.className = 'legal-content';
      container.setAttribute('aria-busy', 'false');
      container.replaceChildren(safeFragment);
      window.scrollTo({ top: 0, behavior: 'auto' });
    } catch (error) {
      console.error('[Slanguage Legal] Failed to load legal document:', error);
      renderError(normalized, sourceUrl);
    }
  }

  document.querySelectorAll('[data-lang]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      loadLegalDocument(link.dataset.lang, { updateHistory: true });
    });
  });

  window.addEventListener('popstate', () => loadLegalDocument(getRequestedLang()));
  // Direct navigation / browser refresh always revalidates the GitHub source.
  // The 15-minute session cache is used only to avoid redundant downloads while switching languages in the same page session.
  loadLegalDocument(getRequestedLang(), { forceRefresh: true });
})();
