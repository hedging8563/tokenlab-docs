/** TokenLab Docs: locale metadata and an optional API Playground key input. */
(function () {
  'use strict';

  const AUTH_STORAGE_KEY = 'tokenlab-api-key';
  const API_ORIGINS = new Set(['https://api.tokenlab.sh']);
  // Only explicit Playground hooks are supported. Never infer a container from
  // a translated Send button, which can also belong to search or the assistant.
  const PLAYGROUND_SELECTOR = '[data-testid="playground"], [class*="PlaygroundContainer"], [class*="playground-container"], [class*="Playground_"]';
  const COPY = {
    en: { label: 'API key', required: 'Required', show: 'Show', hide: 'Hide', showKey: 'Show API key', hideKey: 'Hide API key', getKey: 'Get an API key', saved: 'Saved in this browser. Clear the field to remove it.' },
    zh: { label: 'API 密钥', required: '必填', show: '显示', hide: '隐藏', showKey: '显示 API 密钥', hideKey: '隐藏 API 密钥', getKey: '获取 API 密钥', saved: '保存在此浏览器中。清空输入框即可移除。' },
    'zh-Hant': { label: 'API 金鑰', required: '必填', show: '顯示', hide: '隱藏', showKey: '顯示 API 金鑰', hideKey: '隱藏 API 金鑰', getKey: '取得 API 金鑰', saved: '儲存在此瀏覽器中。清空輸入框即可移除。' },
    ja: { label: 'API キー', required: '必須', show: '表示', hide: '非表示', showKey: 'API キーを表示', hideKey: 'API キーを非表示', getKey: 'API キーを取得', saved: 'このブラウザーに保存されます。入力欄を空にすると削除されます。' },
    ko: { label: 'API 키', required: '필수', show: '표시', hide: '숨기기', showKey: 'API 키 표시', hideKey: 'API 키 숨기기', getKey: 'API 키 발급', saved: '이 브라우저에 저장됩니다. 입력란을 비우면 삭제됩니다.' },
    de: { label: 'API-Schlüssel', required: 'Erforderlich', show: 'Anzeigen', hide: 'Verbergen', showKey: 'API-Schlüssel anzeigen', hideKey: 'API-Schlüssel verbergen', getKey: 'API-Schlüssel erstellen', saved: 'In diesem Browser gespeichert. Zum Entfernen das Feld leeren.' },
    fr: { label: 'Clé API', required: 'Requis', show: 'Afficher', hide: 'Masquer', showKey: 'Afficher la clé API', hideKey: 'Masquer la clé API', getKey: 'Obtenir une clé API', saved: 'Enregistrée dans ce navigateur. Videz le champ pour la supprimer.' },
    es: { label: 'Clave API', required: 'Obligatorio', show: 'Mostrar', hide: 'Ocultar', showKey: 'Mostrar clave API', hideKey: 'Ocultar clave API', getKey: 'Obtener una clave API', saved: 'Guardada en este navegador. Vacía el campo para eliminarla.' },
    pt: { label: 'Chave de API', required: 'Obrigatório', show: 'Mostrar', hide: 'Ocultar', showKey: 'Mostrar chave de API', hideKey: 'Ocultar chave de API', getKey: 'Obter uma chave de API', saved: 'Salva neste navegador. Limpe o campo para removê-la.' },
    ar: { label: 'مفتاح API', required: 'مطلوب', show: 'إظهار', hide: 'إخفاء', showKey: 'إظهار مفتاح API', hideKey: 'إخفاء مفتاح API', getKey: 'الحصول على مفتاح API', saved: 'محفوظ في هذا المتصفح. أفرغ الحقل لإزالته.' },
    vi: { label: 'Khóa API', required: 'Bắt buộc', show: 'Hiện', hide: 'Ẩn', showKey: 'Hiện khóa API', hideKey: 'Ẩn khóa API', getKey: 'Lấy khóa API', saved: 'Được lưu trong trình duyệt này. Xóa nội dung ô để gỡ khóa.' },
    id: { label: 'Kunci API', required: 'Wajib', show: 'Tampilkan', hide: 'Sembunyikan', showKey: 'Tampilkan kunci API', hideKey: 'Sembunyikan kunci API', getKey: 'Dapatkan kunci API', saved: 'Disimpan di browser ini. Kosongkan kolom untuk menghapusnya.' },
    tr: { label: 'API anahtarı', required: 'Zorunlu', show: 'Göster', hide: 'Gizle', showKey: 'API anahtarını göster', hideKey: 'API anahtarını gizle', getKey: 'API anahtarı oluştur', saved: 'Bu tarayıcıda kaydedilir. Kaldırmak için alanı temizleyin.' },
  };

  function routeInfo() {
    const segments = window.location.pathname.split('/').filter(Boolean);
    const locale = Object.hasOwn(COPY, segments[0]) ? segments.shift() : 'en';
    // Management credentials have a different authority and must use Mintlify's
    // native auth field. A saved inference key must never fill that surface.
    return { locale, apiPage: segments[0] === 'api-reference' && segments[1] !== 'management' };
  }

  function syncDocumentLang(locale) {
    const html = document.documentElement;
    const dir = locale === 'ar' ? 'rtl' : 'ltr';
    if (html.lang !== locale) html.lang = locale;
    if (html.dir !== dir) html.dir = dir;
  }

  function redirectApiShadowPaths() {
    const { pathname, search, hash } = window.location;
    if (/^\/(v1|v1beta)(\/|$)/.test(pathname)) {
      window.location.replace(`https://api.tokenlab.sh${pathname}${search}${hash}`);
      return true;
    }
    return false;
  }

  let storageAvailable = true;
  function getSavedApiKey() {
    try { return localStorage.getItem(AUTH_STORAGE_KEY) || ''; }
    catch { storageAvailable = false; return ''; }
  }

  function saveApiKey(key) {
    try {
      if (key) localStorage.setItem(AUTH_STORAGE_KEY, key);
      else localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch { storageAvailable = false; }
  }

  function createElement(tag, attrs, children = []) {
    const element = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs || {})) element.setAttribute(key, value);
    element.append(...children);
    return element;
  }

  function updateCopy(container, locale) {
    if (container.dataset.locale === locale) return;
    container.dataset.locale = locale;
    const copy = COPY[locale];
    for (const name of ['label', 'required', 'getKey', 'saved']) {
      container.querySelector(`[data-auth-copy="${name}"]`).textContent = copy[name];
    }
    container.querySelector('[data-auth-copy="saved"]').hidden = !storageAvailable;
    updateVisibility(container);
  }

  function updateVisibility(container) {
    const input = container.querySelector('input');
    const toggle = container.querySelector('button');
    const copy = COPY[container.dataset.locale];
    const visible = input.type === 'text';
    toggle.textContent = visible ? copy.hide : copy.show;
    toggle.setAttribute('aria-label', visible ? copy.hideKey : copy.showKey);
    toggle.setAttribute('aria-pressed', String(visible));
  }

  function createAuthInput(locale) {
    const container = createElement('div', { id: 'tokenlab-auth-input' });
    const input = createElement('input', {
      type: 'password', id: 'tokenlab-api-key-input', placeholder: 'sk-…',
      autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', dir: 'ltr',
      'aria-describedby': 'tokenlab-api-key-help',
    });
    // Set the property rather than serializing a saved credential into HTML.
    input.value = getSavedApiKey();
    input.addEventListener('input', () => {
      saveApiKey(input.value.trim());
      container.querySelector('[data-auth-copy="saved"]').hidden = !storageAvailable;
    });
    const toggle = createElement('button', { type: 'button', id: 'tokenlab-toggle-visibility', 'aria-controls': input.id });
    toggle.addEventListener('click', () => {
      input.type = input.type === 'password' ? 'text' : 'password';
      updateVisibility(container);
    });
    container.append(
      createElement('div', { class: 'tokenlab-auth-title' }, [
        createElement('label', { for: input.id, 'data-auth-copy': 'label' }),
        createElement('span', { class: 'tokenlab-auth-required', 'data-auth-copy': 'required' }),
      ]),
      createElement('div', { class: 'tokenlab-auth-controls' }, [input, toggle]),
      createElement('div', { class: 'tokenlab-auth-help', id: 'tokenlab-api-key-help' }, [
        createElement('a', { href: 'https://tokenlab.sh/dashboard/api?tab=keys', target: '_blank', rel: 'noopener noreferrer', 'data-auth-copy': 'getKey' }),
        createElement('span', { 'data-auth-copy': 'saved' }),
      ]),
    );
    updateCopy(container, locale);
    return container;
  }

  function hasNativeAuth(playground) {
    // Prefer a native credential control if Mintlify provides one. Exclude our
    // own field so repeated DOM observations do not remove and reinsert it.
    return [...playground.querySelectorAll('input')].some(input =>
      !input.closest('#tokenlab-auth-input') && (
        input.type === 'password' ||
        /^(authorization|x-api-key|x-goog-api-key)$/i.test(input.name)
      ));
  }

  let fetchIntercepted = false;
  function interceptPlaygroundRequests() {
    if (fetchIntercepted || typeof window.fetch !== 'function') return;
    fetchIntercepted = true;
    const originalFetch = window.fetch;
    window.fetch = function (resource, options) {
      const field = document.getElementById('tokenlab-api-key-input');
      const key = field?.value.trim();
      const playground = field?.closest(PLAYGROUND_SELECTOR);
      if (!key || !routeInfo().apiPage || !playground || hasNativeAuth(playground)) {
        return originalFetch.call(this, resource, options);
      }
      const request = typeof Request !== 'undefined' && resource instanceof Request ? resource : null;
      let target;
      let pathname;
      try {
        target = new URL(request ? request.url : resource, window.location.href);
        pathname = decodeURIComponent(target.pathname);
      }
      catch { return originalFetch.call(this, resource, options); }
      if (!API_ORIGINS.has(target.origin) || target.username || target.password ||
          !/^\/(v1|v1beta)\//.test(pathname) ||
          /^\/v1\/management(\/|$)/.test(pathname) || target.searchParams.has('key')) {
        return originalFetch.call(this, resource, options);
      }
      const headers = new Headers(options?.headers ?? request?.headers);
      if (['Authorization', 'x-api-key', 'x-goog-api-key'].some(name => headers.has(name))) {
        return originalFetch.call(this, resource, options);
      }
      headers.set('Authorization', `Bearer ${key}`);
      // Respect caller headers and Request bodies; do not mutate the caller's init.
      return originalFetch.call(this, resource, { ...options, headers });
    };
  }

  function syncPage() {
    if (redirectApiShadowPaths()) return;
    const { locale, apiPage } = routeInfo();
    syncDocumentLang(locale);
    const existing = document.getElementById('tokenlab-auth-input');
    const playground = apiPage ? document.querySelector(PLAYGROUND_SELECTOR) : null;
    if (!playground || hasNativeAuth(playground)) {
      existing?.remove();
      return;
    }
    if (existing && playground.contains(existing)) {
      updateCopy(existing, locale);
      return;
    }
    existing?.remove();
    playground.prepend(createAuthInput(locale));
    interceptPlaygroundRequests();
  }

  let scheduled = false;
  function scheduleSync() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => { scheduled = false; syncPage(); }, 0);
  }

  function start() {
    if (redirectApiShadowPaths()) return;
    syncPage();
    new MutationObserver(scheduleSync).observe(document.body, { childList: true, subtree: true });
    for (const methodName of ['pushState', 'replaceState']) {
      const original = history[methodName];
      history[methodName] = function (...args) {
        const result = original.apply(this, args);
        scheduleSync();
        return result;
      };
    }
    window.addEventListener('popstate', scheduleSync);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
