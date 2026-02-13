/* ============================================
   microCMS Integration for NAK
   ============================================

   Setup:
   1. https://microcms.io でアカウント作成
   2. サービスを作成（サービスID = 下の CMS_SERVICE_ID に設定）
   3. 以下のAPIスキーマを作成:

      ■ hero（オブジェクト型）
        - badge: テキストフィールド
        - title_line1: テキストフィールド
        - title_line2: テキストフィールド
        - title_accent: テキストフィールド
        - subtitle: テキストフィールド
        - image1: 画像フィールド
        - image2: 画像フィールド
        - image3: 画像フィールド

      ■ about（オブジェクト型）
        - lead_html: リッチエディタ
        - description: テキストエリア
        - photo: 画像フィールド
        - photo_caption: テキストフィールド
        - org_name: テキストフィールド
        - address: テキストフィールド

      ■ services（リスト型）
        - title: テキストフィールド
        - description: テキストエリア
        - image: 画像フィールド

      ■ history（リスト型）
        - year: テキストフィールド
        - title: テキストフィールド
        - description: テキストエリア

      ■ settings（オブジェクト型）
        - email: テキストフィールド
        - address: テキストフィールド
        - copyright: テキストフィールド

   4. APIキーを取得して CMS_API_KEY に設定
   ============================================ */

const CMS_CONFIG = {
  SERVICE_ID: '',   // ← microCMSのサービスID
  API_KEY: '',      // ← microCMSのAPIキー（GET用）
};

// ============================================
// Core API
// ============================================

function cmsEnabled() {
  return CMS_CONFIG.SERVICE_ID && CMS_CONFIG.API_KEY;
}

async function fetchCMS(endpoint, params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `https://${CMS_CONFIG.SERVICE_ID}.microcms.io/api/v1/${endpoint}${query ? '?' + query : ''}`;

  const res = await fetch(url, {
    headers: { 'X-MICROCMS-API-KEY': CMS_CONFIG.API_KEY },
  });

  if (!res.ok) throw new Error(`CMS fetch failed: ${res.status}`);
  return res.json();
}

// ============================================
// Content Renderers
// ============================================

function renderHero(data) {
  const el = document.getElementById('hero');
  if (!el || !data) return;

  const badge = el.querySelector('.hero-badge');
  if (badge && data.badge) {
    badge.innerHTML = '<span class="hero-badge-dot"></span>' + escapeHtml(data.badge);
  }

  const lines = el.querySelectorAll('.hero-title-line');
  if (lines[0] && data.title_line1) lines[0].textContent = data.title_line1;
  if (lines[1] && data.title_line2) lines[1].textContent = data.title_line2;
  if (lines[2] && data.title_accent) lines[2].textContent = data.title_accent;

  const sub = el.querySelector('.hero-sub');
  if (sub && data.subtitle) sub.textContent = data.subtitle;

  const imgs = el.querySelectorAll('.hero-img img');
  if (imgs[0] && data.image1) imgs[0].src = data.image1.url + '?w=600&q=80';
  if (imgs[1] && data.image2) imgs[1].src = data.image2.url + '?w=600&q=80';
  if (imgs[2] && data.image3) imgs[2].src = data.image3.url + '?w=600&q=80';
}

function renderAbout(data) {
  const section = document.getElementById('about');
  if (!section || !data) return;

  const lead = section.querySelector('.about-lead');
  if (lead && data.lead_html) lead.innerHTML = data.lead_html;

  const desc = section.querySelector('.about-text');
  if (desc && data.description) desc.textContent = data.description;

  const photo = section.querySelector('.about-photo img');
  if (photo && data.photo) photo.src = data.photo.url + '?w=1200&h=400&fit=crop&q=80';

  const caption = section.querySelector('.about-photo-overlay span');
  if (caption && data.photo_caption) caption.textContent = data.photo_caption;

  const orgName = section.querySelector('.info-item:nth-child(1) .info-content p');
  if (orgName && data.org_name) orgName.textContent = data.org_name;

  const address = section.querySelector('.info-item:nth-child(2) .info-content p');
  if (address && data.address) address.textContent = data.address;
}

function renderServices(items) {
  const grid = document.querySelector('.services-grid');
  if (!grid || !items || items.length === 0) return;

  grid.innerHTML = items.map((item, i) => `
    <div class="service-card fade-up visible" style="--delay: ${i * 0.1}s">
      ${item.image ? `
        <div class="service-img">
          <img src="${item.image.url}?w=600&h=300&fit=crop&q=80" alt="${escapeHtml(item.title)}" loading="lazy">
        </div>
      ` : ''}
      <div class="service-body">
        <div class="service-number">${String(i + 1).padStart(2, '0')}</div>
        <h3 class="service-title">${escapeHtml(item.title)}</h3>
        <p class="service-text">${escapeHtml(item.description)}</p>
      </div>
      <div class="service-line"></div>
    </div>
  `).join('');
}

function renderHistory(items) {
  const timeline = document.querySelector('.timeline');
  if (!timeline || !items || items.length === 0) return;

  timeline.innerHTML = '<div class="timeline-line"></div>' +
    items.map(item => `
      <div class="timeline-item fade-up visible">
        <div class="timeline-dot"></div>
        <div class="timeline-year">${escapeHtml(item.year)}</div>
        <div class="timeline-content">
          <h4>${escapeHtml(item.title)}</h4>
          <p>${escapeHtml(item.description)}</p>
        </div>
      </div>
    `).join('');
}

function renderSettings(data) {
  if (!data) return;

  if (data.address) {
    const ctaAddr = document.querySelector('.cta-info-item span');
    if (ctaAddr) ctaAddr.textContent = data.address;
  }

  if (data.email) {
    const mailLink = document.querySelector('.cta-actions .btn-primary');
    if (mailLink) mailLink.href = 'mailto:' + data.email;

    const footerMail = document.querySelector('.footer-col a[href^="mailto:"]');
    if (footerMail) {
      footerMail.href = 'mailto:' + data.email;
    }
  }

  if (data.copyright) {
    const copy = document.querySelector('.footer-bottom p');
    if (copy) copy.textContent = data.copyright;
  }
}

// ============================================
// Utility
// ============================================

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ============================================
// Init
// ============================================

async function initCMS() {
  if (!cmsEnabled()) {
    console.log('[CMS] microCMS未設定。静的コンテンツで表示します。');
    console.log('[CMS] js/cms.js の CMS_CONFIG にサービスIDとAPIキーを設定してください。');
    return;
  }

  console.log('[CMS] microCMSからコンテンツを取得中...');

  const tasks = [
    fetchCMS('hero').then(renderHero).catch(e => console.warn('[CMS] hero:', e.message)),
    fetchCMS('about').then(renderAbout).catch(e => console.warn('[CMS] about:', e.message)),
    fetchCMS('services', { orders: 'publishedAt', limit: 20 }).then(d => renderServices(d.contents)).catch(e => console.warn('[CMS] services:', e.message)),
    fetchCMS('history', { orders: 'publishedAt', limit: 50 }).then(d => renderHistory(d.contents)).catch(e => console.warn('[CMS] history:', e.message)),
    fetchCMS('settings').then(renderSettings).catch(e => console.warn('[CMS] settings:', e.message)),
  ];

  await Promise.allSettled(tasks);
  console.log('[CMS] コンテンツ取得完了');
}

// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCMS);
} else {
  initCMS();
}
