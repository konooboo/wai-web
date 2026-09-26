# Wai pricing research

Date: 26/09/2026. Currency: NZD unless stated. Units: metric (1 ha = 2.471 acres).

Scope: pricing page patterns, NZ farm facts, competitor pricing, and a per-hectare price recommendation for the founders.

**All Wai prices in this document are suggestions for the founders. The site keeps bracket placeholders (for example `$[price]/ha/month`) until the founders confirm the numbers.**

Current state of the site (`src/sections/Pricing.tsx`): one plan, a farm-size slider (10 to 2,000 ha), a draft flat rate of $2.50/ha/month, an "Included" list (sensors, installation, app, AI alerts, compliance reports, support), and a "Book a demo" mailto button. The heading says hardware and installation are included.

---

## 1. Pricing page patterns that convert

### 1.1 Show a price

- In the TrustRadius 2022 B2B Buying Disconnect survey (2,185 buyers of software or hardware), 81 % of buyers want to find pricing without a sales call. 54 % look for pricing at the start of their research. When they cannot find it, 16 % remove the vendor from their list. 71 % say published pricing makes them more likely to buy. https://solutions.trustradius.com/vendor-blog/2022-b2b-buying-disconnect-the-age-of-the-self-serve-buyer/ and https://venturebeat.com/data-infrastructure/report-todays-b2b-buyers-want-self-serve-not-salespeople
- In the 2023 report, "no pricing on the website" was the first reason (54 %) buyers were less likely to purchase. In the 2026 report, transparent pricing was the buyers' first wish for the fourth year. https://solutions.trustradius.com/vendor-blog/2023-b2b-disconnect/ and https://hginsights.com/news/trustradius-2026-b2b-buying-disconnect-report-reveals-ai-has-changed-how-buyers-research-but-not-what-they-trust/
- Nielsen Norman Group (NN/g): "request a quote" adds a step and makes a product look unaffordable to every budget. The first site that shows a price anchors the buyer's expectation. https://www.nngroup.com/articles/b2b-trust-from-b2c/

Result for Wai: keep a visible price or a "from" price next to "Book a demo". A demo-led sale and a public price do not conflict. Figured (demo-led) publishes prices; Halter publishes a "from" price.

### 1.2 Number of tiers

- Common guidance: 3 options, with the preferred option in the middle. The often-quoted "CXL study of 280 pricing pages" has no primary source that I could find. Treat it as unverified. https://www.getmonetizely.com/articles/customer-choice-overload-how-many-pricing-options-are-too-many and https://ema1.medium.com/how-to-get-your-pricing-page-right-cxl-institute-digital-psychology-persuasion-minidegree-review-e7983c5cc518
- For a product with one feature set and a usage metric (hectares), a single plan plus a calculator is a valid structure. Tiers are useful only when features differ. Wai currently has one feature set.

### 1.3 Anchoring

- Anchoring (a high reference number near the target price) has replicated reasonably well in research. https://atticusli.com/replication-crisis/decoy-effect-asymmetric-dominance/
- CXL example: a watch at $2,000 looks cheaper next to a watch at $10,000. https://cxl.com/blog/constructing-pricing-strategy-for-subscription-products/
- Useful anchors for Wai that do not need invented data: the cost of the problem (for example a fine, or a lost day of milk), the per-cow equivalent next to Halter's $9.90/cow/month, or the price as a percentage of farm operating profit (section 4).

### 1.4 Decoy tier

- The Ariely/Economist example (84 % chose print+web when a print-only decoy was present, 32 % without it) was a class demonstration with 100 MIT students. Large replications in 2014 found the effect mostly disappears with realistic choices. https://en.wikipedia.org/wiki/Decoy_effect and https://atticusli.com/replication-crisis/decoy-effect-asymmetric-dominance/
- Recommendation: do not add a decoy tier. It adds complexity and the evidence is weak.

### 1.5 Annual versus monthly display

- ProfitWell (now Paddle): a customer needs a 15–20 % discount to change to annual billing. Only 1 in 5 of 270 SaaS companies studied offered both options. https://blog.profitwell.com/here-is-why-every-saas-company-needs-an-annual-plan and https://www.profitwell.com/recur/all/annual-vs-monthly
- Baremetrics: about 92 % retention after 12 months on annual plans versus 68 % on monthly plans. This is a third-party figure; the source method is not published. https://baremetrics.com/blog/annual-vs-monthly-pricing-better-retention
- Show the monthly figure as the main number (it matches farm cash-flow thinking), with a toggle or a second line for the annual total and the saving.

### 1.6 Price-per-unit framing

- Gourville (Journal of Consumer Research, 1998): the "pennies-a-day" frame (a large cost shown as small repeated amounts) makes buyers compare the price with small everyday costs, and increases acceptance. The effect is weaker at high price levels. https://academic.oup.com/jcr/article-abstract/24/4/395/1797969 and https://repository.lsu.edu/cgi/viewcontent.cgi?article=3216&context=gradschool_dissertations
- For Wai: show $/ha/month (the unit), the monthly total, and one translation into a unit the farmer already uses (per cow per month for dairy, per kg MS, or per stock unit for sheep and beef).

### 1.7 Calculator or slider

- A slider fits a per-hectare price because the farmer knows the farm area. The site already has one. Add a farm-type control if the price differs by land use (section 4).
- Show the rate that applies at the selected size, so that a graduated price stays transparent.
- Monetizely: agtech buyers respond differently by farm size; most agtech vendors combine an area or usage part with a simple subscription. https://www.getmonetizely.com/articles/agtech-software-pricing-models-usage-based-vs-acreage-based-vs-subscription

### 1.8 "What's included" list

- FarmIQ lists what every pack includes: unlimited users, month-to-month terms, phone support, training. Halter lists hardware replacement and 24/7 local support. https://www.farmiq.co.nz/compare-packs/ and https://www.halterhq.com/en-au/dairy/pricing
- For Wai, state the items a farmer will ask about first: number of sensors included, installation, replacement of damaged sensors, connectivity (cellular or LoRa (long-range low-power radio) data cost), unlimited app users, AI alerts, support hours, contract term.

### 1.9 Hardware cost handling

Three models exist in the market:

| Model | Examples | Effect |
|---|---|---|
| Upfront hardware + subscription | Waterwatch ($897 + $11.50/sensor/month), Halo ($2,490 soil kit + $300/year), CropX (AUD 2,398 incl. first year, then AUD 399/year), Farmbot (AUD 1,290 + AUD 342/year) | High entry cost. Low vendor risk. A Substack essay argues ownership increases use. https://agstartupengine.substack.com/p/the-hidden-economics-of-hardware |
| Hardware bundled in the subscription, with a term | Samsara (3-year term, hardware included, 30-day free trial with hardware), Halter (collars included and replaced; towers bought separately) | Low entry cost. Vendor carries hardware cost until the subscription pays it back. Needs a minimum term. https://kb.samsara.com/hc/en-us/articles/360051430351-Samsara-for-Small-Business-FAQ |
| Lease | CropX offers leases for large volumes (PIRSA) | Middle option. https://www.pir.sa.gov.au/research/agtech/find_solutions/products/cropx |

Monetizely calls the key number the "hardware subsidy recovery period": the months of subscription needed to pay back the hardware. https://www.getmonetizely.com/articles/maximizing-value-through-iot-device-pricing-the-art-of-hardware-software-bundling

### 1.10 Risk reversal

- Meta-analysis of 21 papers (Janakiraman, Syrdal & Freling, Journal of Retailing, 2016): lenient return policies increase purchases more than they increase returns. Longer return windows reduce returns. https://www.sciencedirect.com/science/article/abs/pii/S0022435915000822
- Money-back guarantees increase purchase intention and willingness to pay a premium (Journal of Retailing, 2011). https://www.sciencedirect.com/science/article/abs/pii/S0022435911000820
- Market examples: Samsara 30-day hardware trial; FarmIQ free trial; Halter free hardware replacement.
- For Wai: a trial period long enough to see one real event (for example 60 or 90 days, or one rain event), with free removal of sensors if the farmer cancels.

### 1.11 FAQ near the price

- Figured has 7 FAQs on its pricing page (trial, setup fees, contracts, billing, which product, accounting software, limits). Halter has its "from" price inside its FAQ. https://www.figured.com/pricing
- Wai FAQ candidates: What does "effective hectares" mean? How many sensors do I get? Who installs them? What if a sensor breaks or a cow damages it? What is the contract term? Do I need mobile coverage? Can my sharemilker and staff use the app? Is GST included? Does it help with my freshwater farm plan?

### 1.12 Trust signals that do not need testimonials

- Price transparency itself (section 1.1).
- NZ-based company, NZ support hours, named support contact.
- Clear hardware facts: IP rating, battery life, reading interval (from `READING_INTERVAL_MIN`), data ownership statement.
- Clear terms: GST status, contract term, cancellation, what happens to data at exit.
- Show the calculation behind the price (rate × hectares).
- Do not show customer logos, counts or quotes until the team has real ones (project rule).

### 1.13 CTA wording for demo-led sales

- No published A/B test compares "Book a demo", "Get a demo" and "Talk to sales". Guidance says a literal CTA that states the next step works best. https://www.storylane.io/blog/tips-to-boost-conversion-rates-on-request-a-demo-landing-pages-with-examples and https://www.zoho.com/landingpage/cta-button-tips.html
- GoCardless changed "request a demo" to "watch a demo now" (a 10-minute video) and reported a 114 % increase in conversion. That changed the offer, not only the words.
- Halter uses "Chat to your local rep". Figured uses "Book a Demo". Halo uses "Enquire Now".
- For Wai: keep "Book a demo" (project rule). Add one line under the button that says what happens next, for example "We reply within [X] working days and visit your farm." `// TODO(data)`. A mailto link gives the farmer no confirmation, so this line has more effect than the button words.

---

## 2. NZ farm facts

### 2.1 Farm counts and size by type (Stats NZ, at 30/06/2022)

Source: Stats NZ, Agricultural production statistics: Year to June 2022 (final), farm counts by farm size and farm type. https://www.stats.govt.nz/information-releases/agricultural-production-statistics-year-to-june-2022-final/ (Excel file "farm counts by farm size, region, territorial authority and farm type").

Notes:
- Coverage: GST-registered farms with more than $60,000 turnover. Figures are randomly rounded.
- Area is total land, not effective (grazed or cropped) area.
- Median and quartiles are my linear interpolation inside the Stats NZ size bands.

| Farm type (ANZSIC06 code) | Farms | Lower quartile ha | Median ha | Upper quartile ha | Share ≥ 1,000 ha |
|---|---|---|---|---|---|
| Dairy cattle (A0160) | 9,852 | ~100 | ~175 | ~310 | 1 % |
| Sheep-beef cattle mixed (A0144) | 4,878 | ~45 | ~300 | ~750 | 18 % |
| Sheep specialised (A0141) | 5,211 | ~15 | ~125 | ~480 | 12 % |
| Beef cattle specialised (A0142) | 11,508 | ~10 | ~35 | ~115 | 1 % |
| All sheep and beef (A0141, A0142, A0144, A0145) | 22,002 | ~15 | ~65 | ~315 | 8 % |
| Horticulture (A011–A013) | 6,972 | ~3 | ~7 | ~18 | 0 % |
| Arable (A0145 grain-sheep/beef + A0149 other grain) | 876 | ~85 | ~190 | ~375 | 2 % |
| All farm types | 47,244 | ~12 | ~65 | ~230 | 5 % |

Totals (Stats NZ indicator): 47,250 farms in 2022 (70,336 in 2002); 13.2 million ha (15.6 million ha in 2002); average about 279 ha. https://www.miragenews.com/farm-numbers-and-farm-size-data-to-2022-1376430/ (re-publication of https://www.stats.govt.nz/indicators/farm-numbers-and-farm-size-data-to-2022/)

The "all sheep and beef" median is low because Stats NZ includes many small beef blocks. For Wai's target market, use the commercial figures in 2.3.

### 2.2 Dairy (DairyNZ and LIC, New Zealand Dairy Statistics 2024/25)

Source: https://www.dairynz.co.nz/media/oglesqfm/nz-dairy-statistics-24-25.pdf (published late 2025).

| Measure (2024/25 season) | Value |
|---|---|
| Herds | 10,370 (115 fewer than 2023/24) |
| Average herd size | 451 cows |
| Median herd size | ~375 cows (my estimate: 45 % of herds < 350 cows, 54 % < 400 cows) |
| Most common herd size band | 200–249 cows (11.3 % of herds) |
| Herds < 200 cows / ≥ 700 / ≥ 1,000 | 14 % / 16 % / 6 % |
| Average effective area | 164 ha (151 ha in 2017/18) |
| Median effective area | ~135 ha (my estimate: median herd ÷ stocking rate) |
| Total effective area | 1.70 million ha (milking platform, support land excluded) |
| Cows | 4.68 million |
| Stocking rate | ~2.75 cows/ha (4.68 million ÷ 1.70 million ha) |
| North Island average | 138 ha, 368 cows, 2.66 cows/ha |
| South Island average | 224 ha, 644 cows, 2.87 cows/ha |
| Milksolids per cow | 414 kg MS |

Profit (for price-to-value checks): DairyNZ Economic Survey 2023/24: operating profit $2,845/ha for owner-operators. The 2024/25 update (03/06/2026) reports dairy operating profit of $2,154/ha; the two surveys use different measures, so do not compare them directly. https://www.dairynz.co.nz/resources/resource-list/dairynz-economic-survey-2023-24/ and https://business.scoop.co.nz/2026/06/03/dairynz-economic-update-higher-milk-price-but-costs-adding-pressure/

### 2.3 Sheep and beef (Beef + Lamb New Zealand)

| Measure | Value | Year | Source |
|---|---|---|---|
| Commercial sheep and beef farms | 9,165 (classes 1–8) | 2019/20 | https://beeflambnz.com/industry-data/farm-data-and-industry-production/farm-classes |
| By class | SI high country 200; SI hill 620; NI hard hill 920; NI hill 3,055; NI finishing 1,045; SI finishing-breeding 1,820; SI finishing 1,040; SI mixed finishing 465 | 2019/20 | same |
| Average grazing area, all classes | 700 ha | baseline at 01/07/2023 | https://beeflambnz.com/knowledge-hub/PDF/new-season-outlook-2023-24.pdf |
| Range by land type | ~200 ha (intensive) to > 1,500 ha (SI hill country) | 2021 | https://www.tupu.nz/en/fact-sheets/sheep-and-beef/ |
| Farm profit before tax per farm | $106,500 (March 2025 forecast); $146,515 (later reported actual) | 2024/25 | https://beeflambnz.com/knowledge-hub/PDF/mid-season-update-2024-2025.pdf and https://www.farmersweekly.co.nz/markets/nz-sheep-and-beef-profits-forecast-to-hit-50-year-high/ |
| Profit forecast | $287,600 per farm | 2025/26 | same Farmers Weekly article |

Profit per hectare is about $150–210/ha/year for an average 700 ha farm in 2024/25 (my calculation). Dairy operating profit is about 10–15 times higher per hectare. This difference controls the price design in section 4.

### 2.4 Horticulture and arable

- Horticulture: 6,972 farms, median ~7 ha total land (Stats NZ 2022, table 2.1). Kiwifruit is the largest group (1,947 orchards, median band 5–9 ha).
- Arable: 876 grain farms, median ~190 ha (Stats NZ 2022). A further 2,166 "other crop growing" farms have a median band of 20–39 ha.

### 2.5 Paddocks and troughs

No official source publishes paddock or trough counts per farm. DairyNZ, LIC and Stats NZ do not collect them.

- Advice for dairy water supply: a 400-cow herd needs two 1,200 L troughs per paddock and a supply of 4,800 L/h; cows do not walk more than about 250 m to drink. https://ruralnewsgroup.co.nz/dairy-news/dairy-management/don-t-run-out-of-water
- Estimate (not a published figure): an average 164 ha dairy platform with 2–4 ha paddocks has about 40–80 paddocks and about 50–100 troughs.
- Recommendation: ask the first demo farms for real counts. The number of water points controls how many water sensors Wai installs.

---

## 3. Competitor and analog pricing

| Company | Product | Model | Public price (NZD unless stated) | Page pattern | Source |
|---|---|---|---|---|---|
| Halter (NZ) | Cow collars, virtual fencing | Per cow per month, 3 tiers (Core, Pro, Unlimited); towers extra | From $9.90/cow/month (cut 37 % on 23/04/2024). Towers about $7,800 each. Collar and tower replacement included. Bank finance for NZ dairy. | "From" price in FAQ, feature table, CTA "Chat to your local rep" | https://www.halterhq.com/en-au/dairy/pricing, https://www.odt.co.nz/rural-life/dairy/halter-package-price-cut-37, https://www.forbes.com/sites/catzxwang/2025/12/11/smart-collars-for-cows-how-this-31-year-old-entrepreneur-is-transforming-cattle-farming/ |
| Farmote (now Gallagher + Barenbrug JV) | Pasture sensors (Motes) | Per device + per ha per month | 2019: $750 per Mote + $5/ha/month; about 10 Motes per 100 ha. Current price not public. | — | https://www.ruralnewsgroup.co.nz/dairy-news/dairy-machinery-products/taking-the-guesswork-out-of-pasture-monitoring, https://www.ruralnewsgroup.co.nz/rural-news/rural-agribusiness/gallagher-barenbrug-snap-pasture-monitoring-company |
| Pasture.io (AU/NZ) | Satellite pasture cover | Fixed annual fee + per ha per year | AUD 1,099/year + AUD 3.99/ha (Essential) or AUD 9.48/ha (Ultimate). 162 ha on Ultimate: ~AUD 2,635/year (~AUD 1.36/ha/month). Annual contract. | Public calculator-style examples | https://pasture.io/plans, https://help.pasture.io/what-is-the-price-or-what-is-the-cost |
| LIC SPACE | Satellite pasture | Annual, by farm ha | Price not published. Service closed 31/05/2025. | — | https://www.lic.co.nz/products-and-services/space/ |
| Waterwatch (NZ) | Tank level sensor | Hardware + per sensor per month | $897 per monitor + $11.50/sensor/month (unlimited users and app alerts, 10 SMS/month) | CTA "Buy now" | https://waterwatch.io/pages/farm-water-tank |
| Halo Systems (NZ) | Soil, rain, tank, flow, effluent telemetry | Hardware + annual per input | Soil kit from $2,490; soil + rain from $3,400; tank from $2,555; subscription $300/year first input + $120/year per extra input; effluent $1,200/year | Price list, CTA "Enquire now" | https://www.halosystems.co.nz/pricing |
| CropX (incl. former NZ Regen) | Soil moisture/EC/temperature probe | Hardware + annual per sensor | AUD 2,398 + GST incl. first year; then AUD 399 + GST/year per sensor. Leases for large volumes. | Reseller pricing only | https://www.instrumentchoice.com.au/products/cropx-vertex-all-in-one-vertex-soil-sensor-sv4 |
| Gallagher | Tank level and satellite liquid monitoring | Hardware + app/annual subscription | Satellite unit: first year included, then ~AUD 90/year ex GST (AU reseller). NZ app subscription price not public. | Retail product pages | https://4tags.com.au/shop/gallagher-satellite-water-liquid-monitoring-system/, https://shop.am.gallagher.com/nz/en_NZ/animal-management/wireless-water-monitoring/tank-level-systems/tank-level-starter-kit-/p/G99131 |
| Farmbot (AU) | Tank level monitor | Hardware + annual per device | AUD 1,290 per cellular monitor; AUD 342/year cellular, AUD 456/year satellite | — | https://sadroughthub.com.au/wp-content/uploads/2024/02/FINAL-Case-Study-Farmbot-Tank-Level-Monitor-Fargher.pdf |
| FarmIQ (NZ) | Farm management software | Per farm per month, 4 packs | Lite $42, Essentials $84, Performance+ $190 ("Most popular"), Pro $249, all ex GST, month to month. 25 % off farms 2–3, 50 % off farm 4+. | Highlighted middle tier, CTA "Try for free" | https://www.farmiq.co.nz/compare-packs/ |
| Figured (NZ) | Farm finance software | Per farm per month | Farm Manager USD 90/month; page currently shows USD. No free trial; demo farm available. | 7-question FAQ, CTA "Book a Demo" | https://www.figured.com/pricing |
| Hectre (NZ) | Orchard software | Annual subscription, unlimited users | Not public (quote via demo) | Demo-only | https://hectre.com/ |
| MetWatch / HortPlus (NZ) | Weather and disease models | Subscription; free through some grower bodies | Not public | — | https://www.hortplus.com/metwatch |
| Agrigate (Fonterra/LIC) | Farm dashboard | Was free from 2019 | Wound up (2023); features move to LIC MINDA | — | https://agrigate.co.nz/ |
| Tracksy, MyFarm, Loc8tor | — | — | I found no public pricing for Tracksy. I did not research MyFarm (farm investment and advisory) or Loc8tor (tracking tags) in depth; neither is a close analog. | — | — |

Per-hectare equivalents (my calculations, for comparison only):

| Product | Approx. $/ha/month |
|---|---|
| Halter at $9.90/cow and 2.75 cows/ha | ~$27 (plus towers) |
| Farmote 2019 | $5 (plus $750 per Mote) |
| Pasture.io Ultimate, 162 ha | ~AUD 1.36 |
| Waterwatch, 7 sensors on 164 ha (subscription only) | ~$0.49 (plus $6,279 hardware) |
| Halo, 7 inputs on 164 ha (subscription only) | ~$0.52 (plus ~$17,000 hardware) |
| Wai draft on site | $2.50, hardware included |

Findings:
- Every NZ sensor competitor charges for hardware upfront. Wai's "hardware included" is a real difference. Put it in the price line, not only in the heading.
- Area pricing exists in this market (Farmote, Pasture.io, LIC SPACE). Farmers understand it.
- A fixed platform fee plus a per-ha rate (Pasture.io) keeps small farms viable for the vendor.

---

## 4. Recommendation (suggestions for the founders)

### 4.1 Problem with one flat rate

At the draft $2.50/ha/month:
- 164 ha dairy farm: $410/month, $4,920/year. That is about 1.4 % of dairy operating profit ($2,154/ha).
- 700 ha sheep and beef farm: $1,750/month, $21,000/year. That is about 14–20 % of 2024/25 profit before tax ($106,500–146,515).
- 7 ha orchard: $17.50/month. This does not pay for one installed sensor.

Hardware need does not grow with area at a constant rate. A 700 ha hill farm does not need 4 times the sensors of a 164 ha dairy platform. A flat rate overprices extensive farms and underprices small farms.

### 4.2 Suggested structure

One plan (same features for everyone), priced per **effective hectare** (grazed or cropped area; the term farmers use in DairyNZ and B+LNZ reports). Two rate cards by land use, graduated like tax brackets (each rate applies only to the hectares inside its band, so there is no price jump at a band edge).

**Intensive: dairy, arable, horticulture, irrigated land**

| Effective hectares | Rate | Per acre |
|---|---|---|
| First 150 ha (371 ac) | $[3.00]/ha/month | $1.21/ac |
| 151–400 ha (372–988 ac) | $[2.00]/ha/month | $0.81/ac |
| 401–1,000 ha (989–2,471 ac) | $[1.00]/ha/month | $0.40/ac |
| More than 1,000 ha | Quote | — |

**Extensive: sheep and beef, deer, dryland grazing**

| Effective hectares | Rate | Per acre |
|---|---|---|
| First 300 ha (741 ac) | $[0.80]/ha/month | $0.32/ac |
| 301–1,000 ha (742–2,471 ac) | $[0.40]/ha/month | $0.16/ac |
| 1,001–3,000 ha (2,472–7,413 ac) | $[0.15]/ha/month | $0.06/ac |
| More than 3,000 ha | Quote | — |

**Minimum:** $[150]/month per farm. This equals 50 ha intensive or 187 ha extensive. It covers sensor, install and support cost on small blocks and orchards.

**Annual prepay:** [15] % discount. This is inside the ProfitWell 15–20 % range. Show the monthly price first and the annual total on a second line.

**Hardware:** included in the subscription.
- State a sensor allowance, for example "[N] water and [N] soil sensors per [X] ha" `// TODO(data)`. Extra sensors: $[X]/sensor/month. This keeps hardware cost bounded per hectare.
- Minimum term: [24] months, because Wai carries the hardware cost. If the farmer exits early, charge the remaining hardware value, or let the farmer buy the sensors. The founders must check the term against real sensor cost (hardware subsidy recovery period); I do not have Wai's sensor cost.
- Include replacement of damaged sensors (Halter does this).

**Risk reversal:** [90]-day trial on the farm. If Wai does not find a useful alert in that time, the farmer pays nothing and Wai removes the sensors. 90 days covers at least one rain event in most regions.

**GST:** state "excl. GST" on every price. FarmIQ and Halo do this; NZ farm businesses are GST-registered.

### 4.3 Worked examples

Monthly-billing prices. Annual price = 12 × monthly × 0.85.

| Farm | Area | Monthly | Annual (monthly billing) | Annual (prepay, −15 %) | Check |
|---|---|---|---|---|---|
| Average dairy (DairyNZ 2024/25) | 164 ha, 451 cows | $478 | $5,736 | $4,876 | $1.06/cow/month (Halter: $9.90); $0.031/kg MS; ~1.6 % of operating profit |
| Median dairy (estimate) | ~135 ha, ~375 cows | $405 | $4,860 | $4,131 | $1.08/cow/month |
| Median sheep-beef mixed farm (Stats NZ 2022) | 300 ha | $240 | $2,880 | $2,448 | ~2–3 % of average S&B profit before tax |
| Average commercial sheep and beef (B+LNZ) | 700 ha | $400 | $4,800 | $4,080 | $0.57/ha/month; ~3–4.5 % of 2024/25 profit before tax |
| Median orchard (Stats NZ 2022) | 7 ha | $150 (minimum) | $1,800 | $1,530 | Minimum applies |

The sheep and beef price is still a larger share of profit than the dairy price. If the founders target sheep and beef, test $0.50/ha on the first band.

### 4.4 Simpler alternative

If two rate cards are too complex for the page: one graduated rate card (the intensive card) with a monthly cap of $[600] for farms up to 2,000 ha, then a quote. This keeps the page simple. It overprices a 300 ha sheep and beef farm ($750/month).

### 4.5 Changes for the pricing section (for the orchestrator; not done)

1. Keep one plan and the slider. Add a farm-type control ("Dairy, cropping or orchard" / "Sheep and beef").
2. Show: rate at this size, monthly total, annual prepay total, and one translation (per cow for dairy).
3. Change the price line to "$[x]/ha/month · sensors included · excl. GST".
4. Keep all numbers as bracket placeholders with `// TODO(data)` until the founders confirm.
5. Add an FAQ block next to the price (section 1.11 list).
6. Add one line under "Book a demo" that says what happens next and how fast.
7. Show the contract term and the trial terms next to the price.
8. Change the slider range: minimum 5 ha (orchards), maximum 3,000 ha, with a "More than [X] ha? Book a demo for a quote" note.

---

## Data gaps

- Wai sensor cost, install cost and sensors per hectare. The price recommendation cannot be checked for margin without these.
- Official paddock and trough counts (not published).
- B+LNZ final 2023/24 or 2024/25 "all classes" average effective area (700 ha is a 01/07/2023 baseline).
- Current NZD prices for Gallagher water app, Farmote, CropX NZ, Hectre, MetWatch (not public).
- Median figures in 2.1 and 2.2 are my interpolations from banded data, not published medians.
