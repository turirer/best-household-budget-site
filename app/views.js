// Home Ledger views: one function per page, each turning the ledger state
// into HTML. Every value that came from the household (or the demo data) is
// escaped before it lands in the page, and every control carries a
// data-action so main.js can wire it up with one set of listeners.

import { donutChart, weekBars, progressRing } from './charts.js';

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// ---- money and month helpers -------------------------------------------------

// "$1,234.56" — full cents, for tables and lists.
export function money(n) {
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  const [whole, cents] = abs.toFixed(2).split('.');
  return `${sign}$${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${cents}`;
}

// "$1,235" — rounded, for summary cards where cents are noise.
export function money0(n) {
  const sign = n < 0 ? '-' : '';
  return `${sign}$${Math.round(Math.abs(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export function monthLabel(key) {
  const [y, m] = key.split('-').map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

export function shiftMonth(key, delta) {
  const [y, m] = key.split('-').map(Number);
  const total = y * 12 + (m - 1) + delta;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  return `${ny}-${String(nm).padStart(2, '0')}`;
}

export function monthOf(dateStr) {
  return dateStr.slice(0, 7);
}

export function prettyDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d} ${MONTH_NAMES[m - 1].slice(0, 3)} ${y}`;
}

// ---- ledger maths --------------------------------------------------------------

export function categoryById(state, id) {
  return state.categories.find((c) => c.id === id) || { id, name: id, kind: 'expense', color: '#6b7280' };
}

// The plan in force for a month: its own if it has one, else the nearest
// earlier month's, else empty.
export function planFor(state, month) {
  if (state.plans[month]) return state.plans[month];
  const earlier = Object.keys(state.plans).filter((k) => k < month).sort();
  return earlier.length ? state.plans[earlier[earlier.length - 1]] : {};
}

export function monthTransactions(state, month) {
  return state.transactions
    .filter((t) => monthOf(t.date) === month)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

// Income, expenses and per-category sums for one month.
export function monthTotals(state, month) {
  const byCategory = new Map();
  let income = 0;
  let expenses = 0;
  for (const t of monthTransactions(state, month)) {
    byCategory.set(t.category, (byCategory.get(t.category) || 0) + t.amount);
    if (categoryById(state, t.category).kind === 'income') income += t.amount;
    else expenses += t.amount;
  }
  return { income, expenses, byCategory };
}

function pct(part, whole) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}

// ---- shared fragments ------------------------------------------------------------

export function monthSwitcher(month) {
  return `<div class="month-switch" role="group" aria-label="Choose month">
  <button type="button" class="btn btn-ghost" data-action="month-prev" aria-label="Previous month">&larr;</button>
  <span class="month-name">${esc(monthLabel(month))}</span>
  <button type="button" class="btn btn-ghost" data-action="month-next" aria-label="Next month">&rarr;</button>
</div>`;
}

function chip(cat) {
  return `<span class="chip" style="--chip:${cat.color}">${esc(cat.name)}</span>`;
}

function progressBar(spent, planned, over) {
  const width = planned > 0 ? Math.min((spent / planned) * 100, 100) : (spent > 0 ? 100 : 0);
  return `<div class="bar${over ? ' bar-over' : ''}" role="progressbar" aria-valuenow="${Math.round(width)}" aria-valuemin="0" aria-valuemax="100"><span style="width:${width.toFixed(1)}%"></span></div>`;
}

function emptyNote(text) {
  return `<p class="empty">${esc(text)}</p>`;
}

// ---- dashboard -------------------------------------------------------------------

export function dashboard(state, month) {
  const plan = planFor(state, month);
  const totals = monthTotals(state, month);
  const txs = monthTransactions(state, month);
  const plannedIncome = state.categories.filter((c) => c.kind === 'income')
    .reduce((s, c) => s + (plan[c.id] || 0), 0);
  const plannedExpenses = state.categories.filter((c) => c.kind === 'expense')
    .reduce((s, c) => s + (plan[c.id] || 0), 0);
  const left = totals.income - totals.expenses;

  // Budget-vs-actual bars: the six expense categories with the most spent.
  const spentRows = state.categories
    .filter((c) => c.kind === 'expense')
    .map((c) => ({ cat: c, spent: totals.byCategory.get(c.id) || 0, planned: plan[c.id] || 0 }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 6);
  const budgetBars = spentRows.length
    ? spentRows.map(({ cat, spent, planned }) => `
      <div class="budget-row">
        <div class="budget-row-head">${chip(cat)}<span class="budget-figs"><strong>${money0(spent)}</strong> of ${money0(planned)}</span></div>
        ${progressBar(spent, planned, planned > 0 && spent > planned)}
      </div>`).join('')
    : emptyNote('No spending recorded this month yet.');

  // Donut: top five expense categories plus everything else folded together.
  const expenseSlices = state.categories
    .filter((c) => c.kind === 'expense')
    .map((c) => ({ label: c.name, value: totals.byCategory.get(c.id) || 0, color: c.color }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);
  const topSlices = expenseSlices.slice(0, 5);
  const rest = expenseSlices.slice(5).reduce((s, x) => s + x.value, 0);
  if (rest > 0) topSlices.push({ label: 'Everything else', value: rest, color: '#b9b09a' });
  for (const s of topSlices) s.display = money0(s.value);
  const legend = topSlices.map((s) => `
    <li><span class="dot" style="background:${s.color}"></span>${esc(s.label)}
      <span class="legend-figs">${money0(s.value)} · ${pct(s.value, totals.expenses)}%</span></li>`).join('');

  // Day-to-day spending by week (savings transfers left out so the rhythm shows).
  const weekSums = [0, 0, 0, 0];
  for (const t of txs) {
    const cat = categoryById(state, t.category);
    if (cat.kind !== 'expense' || cat.id === 'savings') continue;
    const day = Number(t.date.slice(8, 10));
    weekSums[Math.min(Math.floor((day - 1) / 7), 3)] += t.amount;
  }
  const weeks = weekSums.map((v, i) => ({ label: `Week ${i + 1}`, value: v, display: money0(v) }));

  // Bills still to pay in the viewed month.
  const unpaid = state.bills
    .filter((b) => !b.paidMonths.includes(month))
    .sort((a, b) => a.dueDay - b.dueDay);
  const billsHtml = unpaid.length
    ? `<ul class="mini-list">${unpaid.map((b) => `
        <li><span>${esc(b.name)} <span class="muted">· due ${b.dueDay} ${esc(monthLabel(month).split(' ')[0].slice(0, 3))}</span></span>
        <strong>${money(b.amount)}</strong></li>`).join('')}</ul>`
    : emptyNote(`All bills are settled for ${monthLabel(month)}.`);

  // Goals snapshot: the three closest to done (unfinished first).
  const goalRows = [...state.goals]
    .sort((a, b) => (pct(b.saved, b.target) - pct(a.saved, a.target)))
    .slice(0, 3)
    .map((g) => `
      <div class="goal-mini">
        <div class="goal-mini-head"><span>${esc(g.name)}</span><span class="muted">${money0(g.saved)} of ${money0(g.target)}</span></div>
        ${progressBar(g.saved, g.target, false)}
      </div>`).join('');

  const recent = txs.slice(0, 6).map((t) => {
    const cat = categoryById(state, t.category);
    const sign = cat.kind === 'income' ? '+' : '−';
    return `<li><span class="tx-desc">${esc(t.description)} <span class="muted">${esc(prettyDate(t.date))}</span></span>
      <span class="tx-amount ${cat.kind}">${sign}${money(t.amount)}</span></li>`;
  }).join('');

  return `
<section class="page-head">
  <div>
    <h1>${esc(monthLabel(month))} at a glance</h1>
    <p class="lede">${esc(state.household)} · planned income ${money0(plannedIncome)}, planned spending ${money0(plannedExpenses)}.</p>
  </div>
  ${monthSwitcher(month)}
</section>

<section class="cards">
  <div class="card stat"><span class="stat-label">Money in</span><span class="stat-value income">${money0(totals.income)}</span><span class="stat-note">of ${money0(plannedIncome)} planned</span></div>
  <div class="card stat"><span class="stat-label">Money out</span><span class="stat-value">${money0(totals.expenses)}</span><span class="stat-note">of ${money0(plannedExpenses)} planned</span></div>
  <div class="card stat"><span class="stat-label">Left this month</span><span class="stat-value ${left < 0 ? 'danger' : 'income'}">${money0(left)}</span><span class="stat-note">income minus spending</span></div>
  <div class="card stat"><span class="stat-label">Saved this month</span><span class="stat-value">${money0(totals.byCategory.get('savings') || 0)}</span><span class="stat-note">moved to savings</span></div>
</section>

<section class="grid-2">
  <div class="card">
    <h2>Budget vs actual</h2>
    ${budgetBars}
    <p class="card-link"><a href="#/budget">Open the full budget planner &rarr;</a></p>
  </div>
  <div class="card">
    <h2>Where it went</h2>
    <div class="donut-wrap">
      ${donutChart(topSlices, money0(totals.expenses), 'spent')}
      <ul class="legend">${legend || '<li class="muted">Nothing spent yet.</li>'}</ul>
    </div>
    <h3>Day-to-day spending by week</h3>
    ${weekBars(weeks)}
    <p class="muted small">Savings transfers are left out of the weekly bars.</p>
  </div>
</section>

<section class="grid-3">
  <div class="card">
    <h2>Still to pay</h2>
    ${billsHtml}
    <p class="card-link"><a href="#/bills">All bills &amp; subscriptions &rarr;</a></p>
  </div>
  <div class="card">
    <h2>Savings goals</h2>
    ${goalRows || emptyNote('No goals yet.')}
    <p class="card-link"><a href="#/goals">All goals &rarr;</a></p>
  </div>
  <div class="card">
    <h2>Latest activity</h2>
    <ul class="mini-list">${recent || '<li class="muted">No transactions this month.</li>'}</ul>
    <p class="card-link"><a href="#/transactions">All transactions &rarr;</a></p>
  </div>
</section>`;
}

// ---- budget planner ----------------------------------------------------------------

export function budget(state, month) {
  const plan = planFor(state, month);
  const totals = monthTotals(state, month);

  const rowsFor = (kind) => state.categories
    .filter((c) => c.kind === kind)
    .map((c) => {
      const planned = plan[c.id] || 0;
      const actual = totals.byCategory.get(c.id) || 0;
      const over = kind === 'expense' && planned > 0 && actual > planned;
      const remaining = planned - actual;
      const status = kind === 'expense'
        ? (over ? '<span class="tag tag-over">Over</span>' : planned === 0 && actual > 0 ? '<span class="tag tag-over">Unplanned</span>' : '<span class="tag tag-ok">On track</span>')
        : (planned > 0 && actual >= planned ? '<span class="tag tag-ok">Fully in</span>' : '<span class="tag tag-wait">Still to come</span>');
      return `<tr>
        <td>${chip(c)}</td>
        <td class="num"><input class="plan-input" type="number" min="0" step="1" value="${planned}"
          data-plan-cat="${esc(c.id)}" aria-label="Planned amount for ${esc(c.name)}"></td>
        <td class="num">${money(actual)}</td>
        <td class="num ${remaining < 0 ? 'danger' : ''}">${money(remaining)}</td>
        <td class="bar-cell">${progressBar(actual, planned, over)}</td>
        <td>${status}</td>
      </tr>`;
    }).join('');

  const sumKind = (kind, pick) => state.categories
    .filter((c) => c.kind === kind)
    .reduce((s, c) => s + pick(c), 0);
  const plannedOut = sumKind('expense', (c) => plan[c.id] || 0);
  const plannedIn = sumKind('income', (c) => plan[c.id] || 0);

  const colorOptions = ['#8a5a2b', '#3e7d3a', '#b3402f', '#2f5d8a', '#7a5fb0', '#c05a8a', '#d97706', '#0e7490', '#65a30d', '#6b7280']
    .map((col) => `<option value="${col}">${col}</option>`).join('');

  return `
<section class="page-head">
  <div>
    <h1>Budget planner</h1>
    <p class="lede">Plan ${money0(plannedIn)} in and ${money0(plannedOut)} out for ${esc(monthLabel(month))}. Edit any planned amount — it saves as you leave the field.</p>
  </div>
  ${monthSwitcher(month)}
</section>

<section class="card">
  <h2>Spending plan</h2>
  <div class="table-wrap"><table class="ledger">
    <thead><tr><th>Category</th><th class="num">Planned</th><th class="num">Spent</th><th class="num">Left</th><th>Progress</th><th>Status</th></tr></thead>
    <tbody>${rowsFor('expense')}</tbody>
    <tfoot><tr><td>Total</td><td class="num">${money(plannedOut)}</td><td class="num">${money(totals.expenses)}</td><td class="num">${money(plannedOut - totals.expenses)}</td><td></td><td></td></tr></tfoot>
  </table></div>
</section>

<section class="card">
  <h2>Income plan</h2>
  <div class="table-wrap"><table class="ledger">
    <thead><tr><th>Category</th><th class="num">Planned</th><th class="num">Received</th><th class="num">Still to come</th><th>Progress</th><th>Status</th></tr></thead>
    <tbody>${rowsFor('income')}</tbody>
    <tfoot><tr><td>Total</td><td class="num">${money(plannedIn)}</td><td class="num">${money(totals.income)}</td><td class="num">${money(plannedIn - totals.income)}</td><td></td><td></td></tr></tfoot>
  </table></div>
</section>

<section class="card">
  <h2>Add a category</h2>
  <form data-form="add-category" class="form-grid">
    <label>Name <input name="name" required maxlength="40" placeholder="e.g. Pets"></label>
    <label>Kind
      <select name="kind"><option value="expense">Spending</option><option value="income">Income</option></select>
    </label>
    <label>Colour <select name="color">${colorOptions}</select></label>
    <label>Planned this month <input name="planned" type="number" min="0" step="1" value="0"></label>
    <button type="submit" class="btn btn-primary">Add category</button>
  </form>
</section>`;
}

// ---- transactions --------------------------------------------------------------------

export function transactionRows(state, month, filters) {
  const rows = monthTransactions(state, month).filter((t) => {
    const cat = categoryById(state, t.category);
    if (filters.kind !== 'all' && cat.kind !== filters.kind) return false;
    if (filters.category !== 'all' && t.category !== filters.category) return false;
    if (filters.query && !`${t.description} ${cat.name}`.toLowerCase().includes(filters.query.toLowerCase())) return false;
    return true;
  });
  if (!rows.length) {
    return `<tr><td colspan="5" class="muted">No transactions match. Try a different filter, or add one above.</td></tr>`;
  }
  return rows.map((t) => {
    const cat = categoryById(state, t.category);
    const sign = cat.kind === 'income' ? '+' : '−';
    return `<tr>
      <td class="nowrap">${esc(prettyDate(t.date))}</td>
      <td>${esc(t.description)}</td>
      <td>${chip(cat)}</td>
      <td class="num tx-amount ${cat.kind}">${sign}${money(t.amount)}</td>
      <td class="row-actions">
        <button type="button" class="btn btn-small" data-action="edit-tx" data-id="${esc(t.id)}">Edit</button>
        <button type="button" class="btn btn-small btn-danger" data-action="delete-tx" data-id="${esc(t.id)}">Delete</button>
      </td>
    </tr>`;
  }).join('');
}

export function transactions(state, month, filters, editing) {
  const totals = monthTotals(state, month);
  const catOptions = (selected) => {
    const group = (kind, label) => `<optgroup label="${label}">${state.categories
      .filter((c) => c.kind === kind)
      .map((c) => `<option value="${esc(c.id)}"${c.id === selected ? ' selected' : ''}>${esc(c.name)}</option>`).join('')}</optgroup>`;
    return group('income', 'Money in') + group('expense', 'Money out');
  };
  const filterCats = `<option value="all"${filters.category === 'all' ? ' selected' : ''}>All categories</option>` +
    state.categories.map((c) => `<option value="${esc(c.id)}"${filters.category === c.id ? ' selected' : ''}>${esc(c.name)}</option>`).join('');

  const formTitle = editing ? 'Edit transaction' : 'Add a transaction';
  const f = editing || { date: `${month}-15`, description: '', category: 'groceries', amount: '' };

  return `
<section class="page-head">
  <div>
    <h1>Transactions</h1>
    <p class="lede">${esc(monthLabel(month))}: ${money0(totals.income)} in, ${money0(totals.expenses)} out, ${money0(totals.income - totals.expenses)} left.</p>
  </div>
  ${monthSwitcher(month)}
</section>

<section class="card">
  <h2>${formTitle}</h2>
  <form data-form="tx" class="form-grid">
    <label>Date <input name="date" type="date" required value="${esc(f.date)}"></label>
    <label class="wide">Description <input name="description" required maxlength="80" value="${esc(f.description)}" placeholder="e.g. Market Basket — weekly shop"></label>
    <label>Category <select name="category">${catOptions(f.category)}</select></label>
    <label>Amount <input name="amount" type="number" required min="0.01" step="0.01" value="${f.amount === '' ? '' : esc(f.amount)}" placeholder="0.00"></label>
    <div class="form-actions">
      <button type="submit" class="btn btn-primary">${editing ? 'Save changes' : 'Add transaction'}</button>
      ${editing ? '<button type="button" class="btn btn-ghost" data-action="cancel-edit">Cancel</button>' : ''}
    </div>
  </form>
</section>

<section class="card">
  <div class="filter-bar">
    <label class="grow">Search <input id="tx-search" type="search" value="${esc(filters.query)}" placeholder="Search descriptions…"></label>
    <label>Category <select id="tx-cat">${filterCats}</select></label>
    <label>Type
      <select id="tx-kind">
        <option value="all"${filters.kind === 'all' ? ' selected' : ''}>All</option>
        <option value="income"${filters.kind === 'income' ? ' selected' : ''}>Money in</option>
        <option value="expense"${filters.kind === 'expense' ? ' selected' : ''}>Money out</option>
      </select>
    </label>
  </div>
  <div class="table-wrap"><table class="ledger">
    <thead><tr><th>Date</th><th>Description</th><th>Category</th><th class="num">Amount</th><th></th></tr></thead>
    <tbody id="tx-rows">${transactionRows(state, month, filters)}</tbody>
  </table></div>
</section>`;
}

// ---- savings goals ---------------------------------------------------------------------

export function goals(state) {
  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);

  const cards = state.goals.map((g) => {
    const p = pct(g.saved, g.target);
    const done = g.saved >= g.target;
    return `<article class="card goal-card">
      <div class="goal-top">
        ${progressRing(p, `${p}%`)}
        <div>
          <h3>${esc(g.name)} ${done ? '<span class="tag tag-done">Reached</span>' : ''}</h3>
          <p class="muted">${esc(g.note || '')}</p>
          <p class="goal-figs"><strong>${money(g.saved)}</strong> of ${money(g.target)}</p>
          <p class="muted small">${done ? 'Fully funded — nice work.' : `${money(g.target - g.saved)} to go`}</p>
        </div>
      </div>
      <form data-form="contribute" data-id="${esc(g.id)}" class="inline-form">
        <label>Add <input name="amount" type="number" min="1" step="1" placeholder="50" required></label>
        <button type="submit" class="btn btn-primary btn-small">Add money</button>
        <button type="button" class="btn btn-small btn-danger" data-action="delete-goal" data-id="${esc(g.id)}">Remove</button>
      </form>
    </article>`;
  }).join('');

  return `
<section class="page-head">
  <div>
    <h1>Savings goals</h1>
    <p class="lede">${money0(totalSaved)} saved toward ${money0(totalTarget)} of goals (${pct(totalSaved, totalTarget)}%).</p>
  </div>
</section>

<section class="goals-grid">${cards || emptyNote('No goals yet — add your first one below.')}</section>

<section class="card">
  <h2>Start a new goal</h2>
  <form data-form="add-goal" class="form-grid">
    <label>Name <input name="name" required maxlength="50" placeholder="e.g. New sofa"></label>
    <label>Note <input name="note" maxlength="80" placeholder="What is it for?"></label>
    <label>Target <input name="target" type="number" required min="1" step="1" placeholder="1000"></label>
    <label>Already saved <input name="saved" type="number" min="0" step="1" value="0"></label>
    <button type="submit" class="btn btn-primary">Add goal</button>
  </form>
</section>`;
}

// ---- bills & subscriptions ----------------------------------------------------------------

export function bills(state, month) {
  const sorted = [...state.bills].sort((a, b) => a.dueDay - b.dueDay);
  const total = sorted.reduce((s, b) => s + b.amount, 0);
  const paidTotal = sorted.filter((b) => b.paidMonths.includes(month)).reduce((s, b) => s + b.amount, 0);

  const rows = sorted.map((b) => {
    const paid = b.paidMonths.includes(month);
    const cat = categoryById(state, b.category);
    return `<li class="bill ${paid ? 'bill-paid' : ''}">
      <span class="bill-due"><strong>${b.dueDay}</strong><span>${esc(monthLabel(month).split(' ')[0].slice(0, 3))}</span></span>
      <span class="bill-main"><span class="bill-name">${esc(b.name)}</span>${chip(cat)}</span>
      <span class="bill-amount">${money(b.amount)}</span>
      <button type="button" class="btn btn-small ${paid ? 'btn-ghost' : 'btn-primary'}" data-action="toggle-bill" data-id="${esc(b.id)}">${paid ? 'Paid ✓ — undo' : 'Mark paid'}</button>
      <button type="button" class="btn btn-small btn-danger" data-action="delete-bill" data-id="${esc(b.id)}" aria-label="Remove ${esc(b.name)}">Remove</button>
    </li>`;
  }).join('');

  const expenseCats = state.categories.filter((c) => c.kind === 'expense')
    .map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');

  return `
<section class="page-head">
  <div>
    <h1>Bills &amp; subscriptions</h1>
    <p class="lede">${esc(monthLabel(month))}: ${money(total)} of regular bills — ${money(paidTotal)} paid, ${money(total - paidTotal)} still to go.</p>
  </div>
  ${monthSwitcher(month)}
</section>

<section class="card">
  <ul class="bills-list">${rows || '<li class="muted">No bills yet — add one below.</li>'}</ul>
</section>

<section class="card">
  <h2>Add a bill or subscription</h2>
  <form data-form="add-bill" class="form-grid">
    <label>Name <input name="name" required maxlength="60" placeholder="e.g. Phone contract"></label>
    <label>Amount <input name="amount" type="number" required min="0.01" step="0.01" placeholder="0.00"></label>
    <label>Due day of month <input name="dueDay" type="number" required min="1" max="31" step="1" placeholder="15"></label>
    <label>Category <select name="category">${expenseCats}</select></label>
    <button type="submit" class="btn btn-primary">Add bill</button>
  </form>
</section>`;
}

// ---- about ---------------------------------------------------------------------------------

export function about(state) {
  const txCount = state.transactions.length;
  return `
<section class="page-head">
  <div>
    <h1>About Home Ledger</h1>
    <p class="lede">A household budget book that lives entirely in your browser.</p>
  </div>
</section>

<section class="card prose">
  <h2>How it works</h2>
  <p>Home Ledger keeps one household's money in one place: a monthly plan per category,
  every transaction in and out, savings goals with progress, and the bills that land
  every month. The dashboard adds it all up — what came in, what went out, and what
  is left — and the budget planner shows each category against its plan.</p>
  <p>It ships with demo data for ${esc(state.household)} (${txCount} transactions across
  October and November 2026) so every page has real figures from the first load.
  Change anything you like: add transactions, edit the plan, top up a goal, tick off
  a bill. Your changes are saved in this browser's local storage and are still here
  when you come back. Nothing is sent anywhere — the site works offline.</p>
  <h2>Your data</h2>
  <p>Export a copy of the whole ledger as JSON, or start again from the demo data.</p>
  <div class="form-actions">
    <button type="button" class="btn btn-primary" data-action="export-data">Export my data (JSON)</button>
    <button type="button" class="btn btn-danger" data-action="reset-data">Reset to demo data</button>
  </div>
  <p class="muted small">Resetting replaces everything in this browser with the original demo household. Export first if you want to keep your numbers.</p>
</section>`;
}

export function notFound() {
  return `<section class="card prose">
  <h1>Page not found</h1>
  <p>There is nothing at this address. <a href="#/">Back to the dashboard</a>.</p>
</section>`;
}
