# Orbit — Crypto Tracker & Currency Converter

A responsive, dark-themed **frontend-only** market dashboard with two focused features:

1. **Crypto tracker:** top 50 crypto listings by market capitalization, current listed price, 24-hour price change, market-cap/volume snapshot for the tracked set, search, and 7-day sparklines where the API provides them.
2. **Currency converter:** converts amounts between currencies supported by the latest Frankfurter reference-rate response, with swap controls and the rate date shown in the UI.

## Technology

- HTML, CSS, and vanilla JavaScript
- CoinGecko public API for cryptocurrency market data
- Frankfurter API for exchange-rate reference data
- No backend, database, login/signup, build step, or API key required

## Run locally on Windows

1. Download and extract this ZIP.
2. Open the extracted `Crypto-Tracker-Frontend-Only` folder in VS Code.
3. Install the **Live Server** extension if you do not already have it.
4. Right-click `index.html` and choose **Open with Live Server**.
5. Keep an internet connection available for API data.

Opening `index.html` directly may work, but using Live Server is the recommended local test.

## Publish with GitHub Pages

1. Sign in to GitHub and create a **new public repository**, for example `crypto-tracker`.
2. Extract this ZIP. Open the inner `Crypto-Tracker-Frontend-Only` folder.
3. Upload the files **inside that folder** (`index.html`, `styles.css`, `app.js`, `README.md`, and `.nojekyll`) to the **root** of the repository. Do not upload only the ZIP, and do not leave the website files nested inside another folder.
4. Open the repository's **Settings → Pages**.
5. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
6. Select branch **main** and folder **/(root)**, then click **Save**.
7. Wait for the deployment to finish. In **Settings → Pages**, click **Visit site**. A project site normally has a URL like `https://YOUR-USERNAME.github.io/crypto-tracker/`.
8. If it does not load immediately, check the **Actions** tab for the Pages deployment status and wait a few minutes. GitHub says publishing can take up to 10 minutes.

Official guide: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

## API behavior and limitations

- CoinGecko data is fetched in the visitor's browser. The dashboard requests the top 50 markets and automatically tries to refresh about every 2 minutes; users can also press the refresh button. Public APIs can throttle requests, temporarily fail, or serve cached data, so the app cannot guarantee real-time tick-by-tick prices or uninterrupted availability.
- CoinGecko attribution is included in the footer. Check the provider's current terms and rate limits before using the site for high traffic or commercial use.
- Frankfurter provides reference exchange rates, generally updated daily; these are **not** live trading prices. The converter only offers currencies returned by the provider at the time of the request.
- The market-cap and volume snapshot sums the 50 displayed assets, not the entire global market.
- If an API fails, the website can still load, but live data may be unavailable until the provider responds again.
- Do not add private API keys to frontend JavaScript. Anything shipped to a browser is public.

## Before sharing the link

- Open the deployed page on desktop and mobile.
- Check that crypto rows load, search works, and changing the quote currency refreshes market prices.
- Check conversion in both directions, amount changes, and the swap button.
- Test again after a hard refresh and check the repository's **Actions** tab if Pages fails.
- This package was checked for JavaScript syntax and ZIP integrity; a full live-browser test against third-party APIs was not performed here.

## Disclaimer

This is a portfolio/demo project for informational use, not financial advice. Crypto markets are volatile. Currency calculations are approximate reference conversions and may differ from bank, card, or money-transfer rates.


This project is licensed under the MIT License — see the LICENSE file for details.
