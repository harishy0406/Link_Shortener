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

// API endpoint (public free shortener)
const API = "https://api.shrtco.de/v2/shorten?url=";

// Save analytics
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(analyticsData));
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

    card.innerHTML = `
      <div class="analytics-left">
        <h3>${item.short}</h3>
        <p>Clicks: ${item.clicks}</p>
        <p>Original: ${item.long}</p>
      </div>
      <button class="delete-btn" data-index="${index}">Delete</button>
    `;

    // count clicks
    card.querySelector("h3").addEventListener("click", () => {
      item.clicks++;
      saveData();
      renderAnalytics();
      window.open(item.short, "_blank");
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

  if (!url) return alert("Enter a valid URL!");

  let apiUrl = API + encodeURIComponent(url);

  // Shorten using API
  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data.ok) return alert("Error shortening URL!");

    let short = data.result.full_short_link;

    // If custom alias, override
    if (alias) short = `https://url.mini/${alias}`;

    shortUrlInput.value = short;
    resultDiv.classList.remove("hidden");

    // Add to analytics
    analyticsData.push({
      long: url,
      short: short,
      clicks: 0,
      createdAt: Date.now(),
    });

    saveData();
    renderAnalytics();
  } catch (e) {
    alert("Network error!");
  }
});

// Copy button
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(shortUrlInput.value);
  copyBtn.textContent = "Copied!";
  setTimeout(() => (copyBtn.textContent = "Copy"), 1200);
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
