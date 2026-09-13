// ----------------------------------------------------
// APP DATA
// ----------------------------------------------------
const apps = [
  { name: "ခေါင်မိုး", icon: "🏠", url: "roof.html" },
  { name: "ကွန်ကရစ်", icon: "🏗️", url: "concrete.html" },
  { name: "အုတ်စီရန်", icon: "🧱", url: "brick.html" },
  { name: "သံချောင်း", icon: "🔩", url: "steel.html" },
  { name: "ဆေးသုတ်ရန်", icon: "🎨", url: "paint.html" },
  { name: "ကြွေပြားခင်း", icon: "🔲", url: "tile.html" },
  { name: "သစ်တွက်ရန်", icon: "🪵", url: "wood.html" },
  { name: "Unit Converter", icon: "📐", url: "converter.html" },
  { name: "မှတ်စု", icon: "📝", url: "notes.html" },
  { name: "တခြား Apps များ", icon: "🌐", url: "more.html" }
];

const shops = [
  { name: "ရွှေနဂါး ဆောက်လုပ်ရေး", location: "လှိုင်သာယာ၊ ရန်ကုန်။", phone: "09123456789", isVip: true },
  { name: "အောင်မင်္ဂလာ သံ/အုတ်ဆိုင်", location: "မရမ်းကုန်း၊ ရန်ကုန်။", phone: "09987654321", isVip: false }
];

const sheetCsvUrl = ""; 

// ----------------------------------------------------
// APP INITIALIZATION
// ----------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  renderApps();
  renderShops();
  loadSavedPrices();
  renderHistory();
  fetchLiveTicker();
  initServiceWorker();
});

// ----------------------------------------------------
// UI RENDER FUNCTIONS
// ----------------------------------------------------
function renderApps() {
  const container = document.getElementById('appsContainer');
  if (!container) return;
  
  container.innerHTML = apps.map(app => `
    <a class="app-card" href="${app.url}">
      <div class="app-icon">${app.icon}</div>
      <div class="app-name">${app.name}</div>
    </a>
  `).join('');
}

function renderShops() {
  const shopContainer = document.getElementById('shopsContainer');
  if (!shopContainer) return;

  shopContainer.innerHTML = shops.map(s => `
    <div class="shop-card ${s.isVip ? 'is-vip' : ''}">
      <div>
        ${s.isVip ? '<div class="vip-tag">VIP SPONSOR</div>' : ''}
        <div class="shop-title" style="font-weight:bold;">${s.name}</div>
        <div class="shop-subtext" style="font-size:0.8rem; color:#666;"><i class="fa-solid fa-location-dot"></i> ${s.location}</div>
      </div>
      <a href="tel:${s.phone}" class="call-action-btn"><i class="fa-solid fa-phone"></i> ဖုန်းခေါ်မည်</a>
    </div>
  `).join('');
}

// ----------------------------------------------------
// TAB NAVIGATION
// ----------------------------------------------------
function switchTab(tabId, element) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  const targetTab = document.getElementById(tabId);
  if (targetTab) targetTab.classList.add('active');
  if (element) element.classList.add('active');
}

// ----------------------------------------------------
// LOCAL STORAGE MANAGEMENT
// ----------------------------------------------------
function savePrices() {
  const cementEl = document.getElementById('cementPrice');
  const brickEl = document.getElementById('brickPrice');
  const steelEl = document.getElementById('steelPrice');

  if (!cementEl || !brickEl || !steelEl) return;

  const prices = {
    cement: cementEl.value,
    brick: brickEl.value,
    steel: steelEl.value
  };

  localStorage.setItem('myanmar_hub_prices', JSON.stringify(prices));
  alert('ဈေးနှုန်းများ သိမ်းဆည်းပြီးပါပြီ!');
}

function loadSavedPrices() {
  const saved = localStorage.getItem('myanmar_hub_prices');
  if (!saved) return;

  try {
    const p = JSON.parse(saved);
    const cementEl = document.getElementById('cementPrice');
    const brickEl = document.getElementById('brickPrice');
    const steelEl = document.getElementById('steelPrice');

    if (cementEl && p.cement) cementEl.value = p.cement;
    if (brickEl && p.brick) brickEl.value = p.brick;
    if (steelEl && p.steel) steelEl.value = p.steel;
  } catch (e) {
    console.error("Price JSON parsing error:", e);
  }
}

function renderHistory() {
  const container = document.getElementById('historyListContainer');
  if (!container) return;

  const history = JSON.parse(localStorage.getItem('myanmar_hub_history') || '[]');
  
  if (history.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 20px 10px;">
        <i class="fa-solid fa-clipboard-list" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 8px;"></i>
        <p style="font-size: 0.85rem; color: var(--text-muted);">မှတ်တမ်းများ မရှိသေးပါ။</p>
      </div>`;
    return;
  }

  container.innerHTML = history.map(item => `
    <div class="history-item">
      <div>
        <strong style="font-size: 0.88rem;">${item.title || ''}</strong>
        <div style="font-size: 0.75rem; color: var(--text-muted);">${item.date || ''}</div>
      </div>
      <span style="font-weight: bold; color: var(--primary-color);">${item.result || ''}</span>
    </div>
  `).join('');
}

function clearHistory() {
  localStorage.removeItem('myanmar_hub_history');
  renderHistory();
}

// ----------------------------------------------------
// LIVE TICKER FETCH
// ----------------------------------------------------
async function fetchLiveTicker() {
  if (!sheetCsvUrl) return;
  const tickerEl = document.getElementById('tickerContent');
  if (!tickerEl) return;

  try {
    const res = await fetch(sheetCsvUrl);
    const text = await res.text();
    const items = text.split('\n').map(i => i.trim()).filter(i => i.length > 0);
    if (items.length > 0) {
      tickerEl.innerText = "📢 ယနေ့ ပေါက်ဈေးများ — " + items.join(" | ");
    }
  } catch (e) {
    console.error("Sheet Ticker Error:", e);
  }
}

// ----------------------------------------------------
// PWA SERVICE WORKER & INSTALL PROMPT
// ----------------------------------------------------
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const banner = document.getElementById('installBanner');
  if (banner) banner.style.display = 'flex';
});

function installPWA() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA install prompt');
      }
      const banner = document.getElementById('installBanner');
      if (banner) banner.style.display = 'none';
      deferredPrompt = null;
    });
  }
}

function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => {
        console.log('Service Worker Registered Successfully:', reg.scope);
        reg.update(); // Forced Update to clear cache version 2
      })
      .catch(err => console.error('Service Worker Registration Failed:', err));
  }
}
