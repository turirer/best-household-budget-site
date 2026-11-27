# Home Ledger — the best household budget site

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/turirer/best-household-budget-site/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/turirer/best-household-budget-site/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

Home Ledger is a household budget book that lives entirely in the browser:
a monthly plan per category, every transaction in and out, savings goals
with progress rings, and the bills that land every month — all added up on
a dashboard that shows what came in, what went out, and what is left.

It ships with demo data for a fictional household (two months of salary,
freelance work, rent, groceries and the rest), so every page has real
figures from the first load. Everything is editable: add, edit or delete
transactions, change the monthly plan, top up a goal, tick off a bill, add
your own categories. Changes are kept in the browser's local storage, and
the site works fully offline — plain static files, no build step, no
libraries, hand-rolled SVG charts.

Pages, all on hash routes from `app/index.html`:

- **Dashboard** — money in, money out, what's left, budget-vs-actual bars,
  a spending donut, weekly spending rhythm, bills still to pay, goal
  progress and latest activity.
- **Budget** — planned vs actual for every income and spending category,
  with editable plan amounts and on-track/over status.
- **Transactions** — the full ledger for the month, searchable and
  filterable, with an add/edit form.
- **Goals** — savings goals with progress rings and one-tap contributions.
- **Bills** — recurring bills and subscriptions, marked paid per month.
- **About** — how it works, JSON export, and a reset back to the demo data.

Run it locally with `node serve.ts`, then open http://localhost:8080.
Hand it in with `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`.

Entry for the make.fun bounty: https://make.fun/bounty/best-household-budget-site-20261126-1457

Referral: https://make.fun/r/d6btpjsv
