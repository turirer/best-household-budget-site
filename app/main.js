// Home Ledger: a household budget book in the browser. The ledger lives in
// localStorage (seeded from data.js on first load), pages are hash routes,
// and one set of delegated listeners wires every control on every page.
//
//   #/              dashboard for the viewed month
//   #/budget        planned vs actual per category
//   #/transactions  every transaction, with filters and an add/edit form
//   #/goals         savings goals with progress
//   #/bills         recurring bills and subscriptions
//   #/about         how it works, export and reset
//
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import { seedState } from './data.js';
import {
  dashboard, budget, transactions, transactionRows, goals, bills, about, notFound,
  shiftMonth, monthLabel,
} from './views.js';

const STORE_KEY = 'home-ledger-v1';
const app = document.getElementById('app');
const navLinks = document.querySelectorAll('[data-nav]');

// ---- state -------------------------------------------------------------------

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 1 && Array.isArray(parsed.transactions)) return parsed;
    }
  } catch { /* storage unavailable or corrupt: fall through to the seed */ }
  return seedState();
}

let state = loadState();

function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch { /* storage full or blocked: the page still works for this visit */ }
}

let counter = 0;
function uid(prefix) {
  counter += 1;
  return `${prefix}${Date.now().toString(36)}${counter}`;
}

// Transient page state: transaction filters and which transaction is being
// edited. Deliberately not persisted.
const filters = { query: '', category: 'all', kind: 'all' };
let editingId = null;

// ---- rendering -----------------------------------------------------------------

function currentRoute() {
  const hash = location.hash || '#/';
  if (hash === '#/' || hash === '#') return 'dashboard';
  if (hash === '#/budget') return 'budget';
  if (hash === '#/transactions') return 'transactions';
  if (hash === '#/goals') return 'goals';
  if (hash === '#/bills') return 'bills';
  if (hash === '#/about') return 'about';
  return 'missing';
}

const TITLES = {
  dashboard: 'Dashboard',
  budget: 'Budget planner',
  transactions: 'Transactions',
  goals: 'Savings goals',
  bills: 'Bills & subscriptions',
  about: 'About',
  missing: 'Not found',
};

function render() {
  window.__shotReady = false;
  const route = currentRoute();
  const month = state.viewMonth;
  document.title = `${TITLES[route]} · Home Ledger`;
  for (const link of navLinks) {
    link.classList.toggle('active', link.dataset.nav === route);
  }
  if (route === 'dashboard') app.innerHTML = dashboard(state, month);
  else if (route === 'budget') app.innerHTML = budget(state, month);
  else if (route === 'transactions') {
    const editing = editingId ? state.transactions.find((t) => t.id === editingId) || null : null;
    app.innerHTML = transactions(state, month, filters, editing);
  } else if (route === 'goals') app.innerHTML = goals(state);
  else if (route === 'bills') app.innerHTML = bills(state, month);
  else if (route === 'about') app.innerHTML = about(state);
  else app.innerHTML = notFound();
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

// Re-render only the transaction rows, so typing in the search box keeps focus.
function refreshTxRows() {
  const body = document.getElementById('tx-rows');
  if (body) body.innerHTML = transactionRows(state, state.viewMonth, filters);
}

function update(mutator) {
  mutator(state);
  save();
  render();
}

// ---- actions ---------------------------------------------------------------------

function slugify(name) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'category';
  let id = base;
  let n = 2;
  while (state.categories.some((c) => c.id === id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  return id;
}

function onClick(event) {
  const el = event.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  const id = el.dataset.id;

  if (action === 'month-prev' || action === 'month-next') {
    update((s) => { s.viewMonth = shiftMonth(s.viewMonth, action === 'month-prev' ? -1 : 1); });
  } else if (action === 'edit-tx') {
    editingId = id;
    render();
    const desc = app.querySelector('form[data-form="tx"] input[name="description"]');
    if (desc) desc.focus();
  } else if (action === 'cancel-edit') {
    editingId = null;
    render();
  } else if (action === 'delete-tx') {
    if (editingId === id) editingId = null;
    update((s) => { s.transactions = s.transactions.filter((t) => t.id !== id); });
  } else if (action === 'toggle-bill') {
    update((s) => {
      const bill = s.bills.find((b) => b.id === id);
      if (!bill) return;
      const month = s.viewMonth;
      bill.paidMonths = bill.paidMonths.includes(month)
        ? bill.paidMonths.filter((m) => m !== month)
        : [...bill.paidMonths, month].sort();
    });
  } else if (action === 'delete-bill') {
    update((s) => { s.bills = s.bills.filter((b) => b.id !== id); });
  } else if (action === 'delete-goal') {
    update((s) => { s.goals = s.goals.filter((g) => g.id !== id); });
  } else if (action === 'export-data') {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'home-ledger.json';
    a.click();
    URL.revokeObjectURL(url);
  } else if (action === 'reset-data') {
    state = seedState();
    editingId = null;
    filters.query = '';
    filters.category = 'all';
    filters.kind = 'all';
    save();
    render();
  }
}

function onSubmit(event) {
  const form = event.target.closest('form[data-form]');
  if (!form) return;
  event.preventDefault();
  const data = new FormData(form);
  const kind = form.dataset.form;

  if (kind === 'tx') {
    const entry = {
      date: String(data.get('date')),
      description: String(data.get('description')).trim(),
      category: String(data.get('category')),
      amount: Math.round(Number(data.get('amount')) * 100) / 100,
    };
    if (!entry.date || !entry.description || !(entry.amount > 0)) return;
    if (editingId) {
      const id = editingId;
      editingId = null;
      update((s) => {
        const tx = s.transactions.find((t) => t.id === id);
        if (tx) Object.assign(tx, entry);
      });
    } else {
      update((s) => { s.transactions.push({ id: uid('t'), ...entry }); });
    }
  } else if (kind === 'add-category') {
    const name = String(data.get('name')).trim();
    if (!name) return;
    const planned = Math.max(Number(data.get('planned')) || 0, 0);
    update((s) => {
      const id = slugify(name);
      s.categories.push({ id, name, kind: String(data.get('kind')), color: String(data.get('color')) });
      if (!s.plans[s.viewMonth]) s.plans[s.viewMonth] = {};
      s.plans[s.viewMonth][id] = planned;
    });
  } else if (kind === 'add-goal') {
    const name = String(data.get('name')).trim();
    const target = Number(data.get('target'));
    if (!name || !(target > 0)) return;
    update((s) => {
      s.goals.push({
        id: uid('g'),
        name,
        note: String(data.get('note')).trim(),
        target,
        saved: Math.max(Number(data.get('saved')) || 0, 0),
      });
    });
  } else if (kind === 'contribute') {
    const amount = Number(data.get('amount'));
    if (!(amount > 0)) return;
    const id = form.dataset.id;
    update((s) => {
      const goal = s.goals.find((g) => g.id === id);
      if (goal) goal.saved = Math.round((goal.saved + amount) * 100) / 100;
    });
  } else if (kind === 'add-bill') {
    const name = String(data.get('name')).trim();
    const amount = Math.round(Number(data.get('amount')) * 100) / 100;
    const dueDay = Math.min(Math.max(Number(data.get('dueDay')) || 1, 1), 31);
    if (!name || !(amount > 0)) return;
    update((s) => {
      s.bills.push({
        id: uid('b'),
        name,
        amount,
        dueDay,
        category: String(data.get('category')),
        paidMonths: [],
      });
    });
  }
}

// Budget plan inputs save when the field loses focus (change, not input, so
// typing is never interrupted by a re-render).
function onChange(event) {
  const input = event.target.closest('[data-plan-cat]');
  if (!input) return;
  const value = Math.max(Number(input.value) || 0, 0);
  update((s) => {
    if (!s.plans[s.viewMonth]) s.plans[s.viewMonth] = {};
    s.plans[s.viewMonth][input.dataset.planCat] = value;
  });
}

// Transaction filters: search re-renders only the rows; the selects re-render
// the page (focus is not in a text field, so nothing is lost).
function onInput(event) {
  if (event.target.id === 'tx-search') {
    filters.query = event.target.value;
    refreshTxRows();
  }
}

function onFilterChange(event) {
  if (event.target.id === 'tx-cat') {
    filters.category = event.target.value;
    render();
  } else if (event.target.id === 'tx-kind') {
    filters.kind = event.target.value;
    render();
  }
}

app.addEventListener('click', onClick);
app.addEventListener('submit', onSubmit);
app.addEventListener('change', onChange);
app.addEventListener('change', onFilterChange);
app.addEventListener('input', onInput);
window.addEventListener('hashchange', render);

// The viewed month defaults to the newest month in the ledger, so a first
// visit (or a reset) lands on real figures rather than an empty month.
if (!state.viewMonth) {
  const months = state.transactions.map((t) => t.date.slice(0, 7)).sort();
  state.viewMonth = months[months.length - 1] || '2026-11';
}
document.getElementById('household-name').textContent = state.household;
render();

// Keep the month name in the footer honest after navigation.
const footerMonth = document.getElementById('footer-month');
if (footerMonth) footerMonth.textContent = monthLabel(state.viewMonth);
