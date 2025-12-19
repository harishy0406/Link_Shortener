// Local storage key
const STORAGE_KEY = "urlMiniData";

let analyticsData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// Elements
const longUrl = document.getElementById("longUrl");
const customAlias = document.getElementById("customAlias");
const shortenBtn = document.getElementById("shortenBtn");
const shortUrlInput = document.getElementById("shortUrl");
const resultDiv = document.getElementById("result");
const copyBtn = document.getElementById("copyBtn");
const qrBtn = document.getElementById("qrBtn");
const qrCodeBox = document.getElementById("qrCode");
const analyticsDiv = document.getElementById("analytics");
const statusDiv = document.getElementById("status");

// API endpoint (public free shortener)
const API = "https://api.shrtco.de/v2/shorten?url=";

// Save analytics
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(analyticsData));
}

function setStatus(msg, isError = false) {
  if (!statusDiv) return;
  statusDiv.textContent = msg || "";
  statusDiv.style.color = isError ? "#ff9e9e" : "var(--muted)";
}

function normalizeUrl(u) {
  if (!/^https?:\/\//i.test(u)) {
    return `https://${u}`;
  }
  return u;
}

// Render analytics
function renderAnalytics() {
  analyticsDiv.innerHTML = "";

  if (analyticsData.length === 0) {
    analyticsDiv.innerHTML = `<p style="text-align:center;color:var(--muted)">No links shortened yet</p>`;
    return;
  }

  analyticsData.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "analytics-card";

    const created = new Date(item.createdAt).toLocaleString();
    const sourceLabel = item.source === 'local' ? ' (local fallback)' : '';

    card.innerHTML = `
      <div class="analytics-left">
        <h3 class="short-link">${item.short}</h3>
        <p>Clicks: ${item.clicks} · Created: ${created}${sourceLabel}</p>
        <p>Original: ${item.long}</p>
      </div>
      <button class="delete-btn" data-index="${index}">Delete</button>
    `;

    // count clicks — open API short link when available, otherwise open original
    card.querySelector(".short-link").addEventListener("click", () => {
      item.clicks++;
      saveData();
      renderAnalytics();
      if (item.source === 'local') {
        window.open(item.long, '_blank');
      } else {
        window.open(item.short, '_blank');
      }
    });

    // delete entry
    card.querySelector(".delete-btn").addEventListener("click", () => {
      analyticsData.splice(index, 1);
      saveData();
      renderAnalytics();
    });

    analyticsDiv.appendChild(card);
  });
}

// Shorten URL
shortenBtn.addEventListener("click", async () => {
  let url = longUrl.value.trim();
  let alias = customAlias.value.trim();

  if (!url) {
    setStatus("Enter a valid URL!", true);
    return;
  }

  url = normalizeUrl(url);

  let apiUrl = API + encodeURIComponent(url);

  shortenBtn.disabled = true;
  shortenBtn.textContent = "Shortening...";
  setStatus("");

  // Shorten using API with graceful fallback
  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (data && data.ok && data.result && data.result.full_short_link) {
      let short = data.result.full_short_link;
      if (alias) short = `https://url.mini/${alias}`;

      shortUrlInput.value = short;
      resultDiv.classList.remove("hidden");

      analyticsData.push({
        long: url,
        short: short,
        clicks: 0,
        createdAt: Date.now(),
        source: "api",
      });

      setStatus("Shortened via API.");
    } else {
      // API returned an error — fallback
      throw new Error("API error");
    }
  } catch (e) {
    // Network or API failure — create a local fallback short link
    const id = Math.random().toString(36).slice(2, 8);
    const short = `https://url.mini/${alias || id}`;
    shortUrlInput.value = short;
    resultDiv.classList.remove("hidden");

    analyticsData.push({
      long: url,
      short: short,
      clicks: 0,
      createdAt: Date.now(),
      source: "local",
    });

    setStatus("Network/API unavailable — using local fallback.", true);
  } finally {
    saveData();
    renderAnalytics();
    shortenBtn.disabled = false;
    shortenBtn.textContent = "Shorten URL";
  }
});

// Copy button
copyBtn.addEventListener("click", () => {
  const txt = shortUrlInput.value;
  if (!txt) return;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(() => {
      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = "Copy"), 1200);
    }).catch(() => fallbackCopy(txt));
  } else {
    fallbackCopy(txt);
  }

  function fallbackCopy(text) {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    try {
      document.execCommand('copy');
      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = "Copy"), 1200);
    } catch (err) {
      setStatus('Copy failed', true);
    }
    document.body.removeChild(el);
  }
});

// QR
qrBtn.addEventListener("click", () => {
  qrCodeBox.innerHTML = "";
  QRCode.toCanvas(shortUrlInput.value, { width: 180 }, (err, canvas) => {
    if (err) return;
    qrCodeBox.appendChild(canvas);
  });
});

// Start
renderAnalytics();
