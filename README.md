# Orbit — Crypto Tracker & Currency Converter

A responsive, dark-themed **frontend-only** market dashboard with two focused features:

1. **Crypto tracker:** top 50 crypto listings by market capitalization, current listed price, 24-hour price change, market-cap/volume snapshot for the tracked set, search, and 7-day sparklines where the API provides them.
2. **Currency converter:** converts amounts between currencies supported by the latest Frankfurter reference-rate response, with swap controls and the rate date shown in the UI.

## Technology

- HTML, CSS, and vanilla JavaScript
- CoinGecko public API for cryptocurrency market data
- Frankfurter API for exchange-rate reference data
- No backend, database, login/signup, build step, or API key required

## API behavior and limitations

- CoinGecko data is fetched in the visitor's browser. The dashboard requests the top 50 markets and automatically tries to refresh about every 2 minutes; users can also press the refresh button. Public APIs can throttle requests, temporarily fail, or serve cached data, so the app cannot guarantee real-time tick-by-tick prices or uninterrupted availability.
- CoinGecko attribution is included in the footer. Check the provider's current terms and rate limits before using the site for high traffic or commercial use.
- Frankfurter provides reference exchange rates, generally updated daily; these are **not** live trading prices. The converter only offers currencies returned by the provider at the time of the request.
- The market-cap and volume snapshot sums the 50 displayed assets, not the entire global market.
- If an API fails, the website can still load, but live data may be unavailable until the provider responds again.
- Do not add private API keys to frontend JavaScript. Anything shipped to a browser is public.


## Disclaimer

This is a portfolio/demo project for informational use, not financial advice. Crypto markets are volatile. Currency calculations are approximate reference conversions and may differ from bank, card, or money-transfer rates.


This project is licensed under the MIT License — see the LICENSE file for details.
