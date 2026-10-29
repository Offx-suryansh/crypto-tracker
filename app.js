const API = {
  markets: "https://api.coingecko.com/api/v3/coins/markets?vs_currency={currency}&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h",
  global: "https://api.coingecko.com/api/v3/global",
  rates: "https://api.frankfurter.dev/v2/rates?base=USD"
};

const state = { coins: [], currency: "usd", rates: null, ratesUpdated: null, cryptoLoading: false, ratesLoading: false, lastMarketFetch: null };
const currencyMeta = {
  USD:{name:"US Dollar",symbol:"$",flag:"🇺🇸"}, INR:{name:"Indian Rupee",symbol:"₹",flag:"🇮🇳"},
  EUR:{name:"Euro",symbol:"€",flag:"🇪🇺"}, GBP:{name:"British Pound",symbol:"£",flag:"🇬🇧"},
  JPY:{name:"Japanese Yen",symbol:"¥",flag:"🇯🇵"}, CAD:{name:"Canadian Dollar",symbol:"C$",flag:"🇨🇦"},
  AUD:{name:"Australian Dollar",symbol:"A$",flag:"🇦🇺"}, CHF:{name:"Swiss Franc",symbol:"CHF",flag:"🇨🇭"},
  CNY:{name:"Chinese Yuan",symbol:"¥",flag:"🇨🇳"}, SGD:{name:"Singapore Dollar",symbol:"S$",flag:"🇸🇬"},
  NZD:{name:"New Zealand Dollar",symbol:"NZ$",flag:"🇳🇿"}, AED:{name:"UAE Dirham",symbol:"د.إ",flag:"🇦🇪"},
  SAR:{name:"Saudi Riyal",symbol:"﷼",flag:"🇸🇦"}, KRW:{name:"South Korean Won",symbol:"₩",flag:"🇰🇷"},
  BRL:{name:"Brazilian Real",symbol:"R$",flag:"🇧🇷"}, MXN:{name:"Mexican Peso",symbol:"Mex$",flag:"🇲🇽"},
  HKD:{name:"Hong Kong Dollar",symbol:"HK$",flag:"🇭🇰"}, TRY:{name:"Turkish Lira",symbol:"₺",flag:"🇹🇷"},
  ZAR:{name:"South African Rand",symbol:"R",flag:"🇿🇦"}, THB:{name:"Thai Baht",symbol:"฿",flag:"🇹🇭"},
  IDR:{name:"Indonesian Rupiah",symbol:"Rp",flag:"🇮🇩"}, PHP:{name:"Philippine Peso",symbol:"₱",flag:"🇵🇭"},
  PKR:{name:"Pakistani Rupee",symbol:"₨",flag:"🇵🇰"}, BDT:{name:"Bangladeshi Taka",symbol:"৳",flag:"🇧🇩"},
  LKR:{name:"Sri Lankan Rupee",symbol:"Rs",flag:"🇱🇰"}, NPR:{name:"Nepalese Rupee",symbol:"Rs",flag:"🇳🇵"},
  RUB:{name:"Russian Ruble",symbol:"₽",flag:"🇷🇺"}, PLN:{name:"Polish Zloty",symbol:"zł",flag:"🇵🇱"},
  SEK:{name:"Swedish Krona",symbol:"kr",flag:"🇸🇪"}, NOK:{name:"Norwegian Krone",symbol:"kr",flag:"🇳🇴"}
};

const $ = (id) => document.getElementById(id);
const money = (value, currency = state.currency.toUpperCase()) => {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return "—";
  try { return new Intl.NumberFormat("en-US", {style:"currency", currency, maximumFractionDigits: Number(value) < 1 ? 6 : 2}).format(value); }
  catch { return `${currency} ${Number(value).toLocaleString("en-US", {maximumFractionDigits:2})}`; }
};
const compactMoney = (value) => {
  if (!Number.isFinite(Number(value))) return "—";
  const n = Number(value);
  const curr = state.currency.toUpperCase();
  if (Math.abs(n) >= 1e12) return `${curr} ${(n/1e12).toFixed(2)}T`;
  if (Math.abs(n) >= 1e9) return `${curr} ${(n/1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `${curr} ${(n/1e6).toFixed(2)}M`;
  return money(n);
};
const pct = (n) => Number.isFinite(Number(n)) ? `${Number(n) > 0 ? "+" : ""}${Number(n).toFixed(2)}%` : "—";
const classFor = (n) => Number(n) > 0 ? "positive" : Number(n) < 0 ? "negative" : "neutral";
const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
function showToast(message) {
  const el = $("toast"); el.textContent = message; el.classList.add("show");
  clearTimeout(showToast.timer); showToast.timer = setTimeout(() => el.classList.remove("show"), 3200);
}
function sparkline(points, positive) {
  if (!Array.isArray(points) || points.length < 2) return `<span class="muted">—</span>`;
  const vals = points.filter(Number.isFinite); if (vals.length < 2) return "—";
  const min = Math.min(...vals), max = Math.max(...vals), range = max-min || 1;
  const coords = vals.map((v,i) => `${(i/(vals.length-1))*74},${25-((v-min)/range)*22}`).join(" ");
  const stroke = positive ? "#81e2b0" : "#ff7f93";
  return `<svg class="mini-chart" viewBox="0 0 75 28" role="img" aria-label="7 day price trend"><polyline points="${coords}" fill="none" stroke="${stroke}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
function renderStats() {
  const coins = state.coins;
  $("assetCount").textContent = coins.length ? coins.length.toString() : "—";
  const btc = coins.find(c => c.id === "bitcoin");
  $("btcPrice").textContent = btc ? money(btc.current_price) : "—";
  $("btcChange").textContent = btc ? pct(btc.price_change_percentage_24h) : "—";
  $("btcChange").className = `change ${btc ? classFor(btc.price_change_percentage_24h) : "neutral"}`;
  if (coins.length) {
    // CoinGecko's top 50 are used as the tracked set; these sums are explicitly labelled accordingly.
    const cap = coins.reduce((sum,c) => sum + (Number(c.market_cap)||0), 0);
    const vol = coins.reduce((sum,c) => sum + (Number(c.total_volume)||0), 0);
    $("totalMarketCap").textContent = compactMoney(cap);
    $("totalVolume").textContent = compactMoney(vol);
    const weighted = coins.reduce((sum,c) => sum + (Number(c.market_cap)||0) * (Number(c.market_cap_change_percentage_24h)||0),0) /
      Math.max(1, coins.reduce((sum,c) => sum + (Number(c.market_cap)||0),0));
    $("marketCapChange").textContent = pct(weighted);
    $("marketCapChange").className = `change ${classFor(weighted)}`;
  }
}
function renderCoins() {
  const query = $("coinSearch").value.trim().toLowerCase();
  const filtered = state.coins.filter(c => c.name.toLowerCase().includes(query) || c.symbol.toLowerCase().includes(query));
  const rows = filtered.map(c => {
    const change = c.price_change_percentage_24h;
    return `<tr>
      <td><div class="coin-cell"><img class="coin-logo" src="${escapeHtml(c.image)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'"><div class="coin-name"><strong>${escapeHtml(c.name)}</strong><small>${escapeHtml(c.symbol)}</small></div></div></td>
      <td class="price-cell">${money(c.current_price)}</td>
      <td><span class="change ${classFor(change)}">${pct(change)}</span></td>
      <td class="market-cap">${compactMoney(c.market_cap)}</td>
      <td class="mini-chart-cell">${sparkline(c.sparkline_in_7d?.price, Number(change) >= 0)}</td>
    </tr>`;
  }).join("");
  $("coinRows").innerHTML = rows || `<tr><td colspan="5" class="empty-state">No coins match “${escapeHtml(query)}”. Try another search.</td></tr>`;
  $("coinStatus").textContent = `Showing ${filtered.length} of ${state.coins.length} assets`;
}
function renderMovers() {
  if (!state.coins.length) return;
  const movers = [...state.coins].filter(c => Number.isFinite(Number(c.price_change_percentage_24h)))
    .sort((a,b) => Math.abs(b.price_change_percentage_24h) - Math.abs(a.price_change_percentage_24h)).slice(0,6);
  $("moversList").innerHTML = movers.map(c => `<div class="mover">
    <img src="${escapeHtml(c.image)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
    <div class="mover-info"><strong>${escapeHtml(c.name)}</strong><small>${escapeHtml(c.symbol.toUpperCase())} · ${money(c.current_price)}</small></div>
    <div class="mover-change ${classFor(c.price_change_percentage_24h)}">${pct(c.price_change_percentage_24h)}<small>24 hours</small></div>
  </div>`).join("");
}
async function loadMarkets(force = false) {
  if (state.cryptoLoading) return;
  state.cryptoLoading = true;
  const button = $("refreshAll"); button.style.opacity = ".55";
  try {
    const url = API.markets.replace("{currency}", encodeURIComponent(state.currency));
    const response = await fetch(url, {headers:{"accept":"application/json"}, cache: force ? "no-store" : "default"});
    if (!response.ok) {
      if (response.status === 429) throw new Error("Market API rate limit reached. Please wait a little and try again.");
      throw new Error(`Market data request failed (${response.status}).`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Unexpected market data response.");
    state.coins = data; state.lastMarketFetch = new Date();
    $("lastUpdated").textContent = state.lastMarketFetch.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",second:"2-digit"});
    renderStats(); renderCoins(); renderMovers();
  } catch (error) {
    console.error(error);
    if (!state.coins.length) $("coinRows").innerHTML = `<tr><td colspan="5" class="empty-state">${escapeHtml(error.message)}<br><br>Check your connection, or retry in a minute.</td></tr>`;
    else $("coinStatus").textContent = "Refresh failed — showing the last successfully loaded data";
    $("coinStatus").textContent = state.coins.length ? "Refresh failed — showing the last successfully loaded data" : "Could not refresh market data";
    showToast(error.message || "Could not load crypto market data.");
  } finally { state.cryptoLoading = false; button.style.opacity = "1"; }
}
function fillCurrencySelects(availableCodes = Object.keys(currencyMeta)) {
  const codes = [...new Set(["USD", ...availableCodes])].filter(code => code === "USD" || !state.rates || state.rates[code] !== undefined);
  const options = codes.sort((a,b) => (currencyMeta[a]?.name || a).localeCompare(currencyMeta[b]?.name || b))
    .map(code => {
      const meta = currencyMeta[code] || {name: code, flag: "💱"};
      return `<option value="${code}">${meta.flag} ${code} — ${meta.name}</option>`;
    }).join("");
  const oldFrom = $("fromCurrency").value || "USD";
  const oldTo = $("toCurrency").value || "INR";
  $("fromCurrency").innerHTML = options; $("toCurrency").innerHTML = options;
  $("fromCurrency").value = codes.includes(oldFrom) ? oldFrom : "USD";
  $("toCurrency").value = codes.includes(oldTo) ? oldTo : (codes.includes("INR") ? "INR" : "EUR");
}
async function loadRates(force = false) {
  if (state.ratesLoading) return;
  state.ratesLoading = true;
  try {
    const response = await fetch(API.rates, {cache: force ? "no-store" : "default"});
    if (!response.ok) throw new Error(`Exchange-rate request failed (${response.status}).`);
    const rows = await response.json();
    if (!Array.isArray(rows) || !rows.length) throw new Error("Exchange-rate provider did not return rates.");
    const rates = {USD: 1};
    for (const row of rows) {
      if (row && typeof row.quote === "string" && Number.isFinite(Number(row.rate)) && Number(row.rate) > 0) {
        rates[row.quote.toUpperCase()] = Number(row.rate);
      }
    }
    if (Object.keys(rates).length < 2) throw new Error("No usable exchange rates were returned.");
    state.rates = rates;
    state.ratesUpdated = rows[0]?.date || "date unavailable";
    fillCurrencySelects(Object.keys(rates));
    $("rateUpdated").textContent = `Reference rates dated: ${state.ratesUpdated} · Frankfurter`;
    calculateConversion();
  } catch (error) {
    console.error(error);
    $("rateUpdated").textContent = "Could not load rates — check your connection and retry.";
    $("rateSummary").textContent = "Rate unavailable";
    showToast("Could not load currency rates. Please try again.");
  } finally { state.ratesLoading = false; }
}
function rateFor(from, to) {
  if (!state.rates) return null;
  if (from === to) return 1;
  const usdPerFrom = state.rates[from];
  const toPerUsd = state.rates[to];
  if (!Number.isFinite(Number(usdPerFrom)) || !Number.isFinite(Number(toPerUsd)) || Number(usdPerFrom) <= 0 || Number(toPerUsd) <= 0) return null;
  return toPerUsd / usdPerFrom;
}
function calculateConversion() {
  const from = $("fromCurrency").value, to = $("toCurrency").value;
  const amount = Math.max(0, Number($("fromAmount").value) || 0);
  const rate = rateFor(from, to);
  const metaFrom = currencyMeta[from] || {name:from};
  const metaTo = currencyMeta[to] || {name:to};
  $("fromCaption").textContent = `${amount.toLocaleString("en-US")} ${metaFrom.name}`;
  if (rate === null) {
    $("toAmount").value = "—"; $("toCaption").textContent = "Rate unavailable";
    $("rateSummary").textContent = "Waiting for exchange rates…"; return;
  }
  const converted = amount * rate;
  $("toAmount").value = new Intl.NumberFormat("en-US", {maximumFractionDigits: to === "JPY" || to === "KRW" ? 0 : 4}).format(converted);
  $("toCaption").textContent = `${Number(converted).toLocaleString("en-US",{maximumFractionDigits:4})} ${metaTo.name}`;
  $("rateSummary").textContent = `1 ${from} = ${rate.toLocaleString("en-US",{maximumFractionDigits:6})} ${to}`;
}
function updateCryptoCurrency() {
  state.currency = $("currencySelect").value;
  if (state.coins.length) { renderStats(); renderCoins(); renderMovers(); }
  loadMarkets(true);
}
$("coinSearch").addEventListener("input", renderCoins);
$("currencySelect").addEventListener("change", updateCryptoCurrency);
$("fromAmount").addEventListener("input", calculateConversion);
$("fromCurrency").addEventListener("change", calculateConversion);
$("toCurrency").addEventListener("change", calculateConversion);
$("swapCurrencies").addEventListener("click", () => {
  const oldFrom = $("fromCurrency").value;
  $("fromCurrency").value = $("toCurrency").value;
  $("toCurrency").value = oldFrom;
  calculateConversion();
});
$("convertButton").addEventListener("click", () => {
  if (!state.rates) loadRates(true); else { calculateConversion(); showToast("Conversion updated using the latest rates loaded."); }
});
$("refreshAll").addEventListener("click", () => { loadMarkets(true); loadRates(true); });
$("year").textContent = new Date().getFullYear();
fillCurrencySelects();
loadMarkets();
loadRates();
// Poll conservatively: public endpoints can rate-limit requests and may serve cached data.
setInterval(() => loadMarkets(), 2 * 60 * 1000);
// Reference FX rates generally update daily, so checking every 6 hours is sufficient.
setInterval(() => loadRates(), 6 * 60 * 60 * 1000);
