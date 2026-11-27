// Home Ledger data: the demo household's categories, monthly plans, transactions,
// savings goals and recurring bills. Everything lives in this file so the site
// works with no network; the app copies this seed into localStorage on first
// load and from then on the household's own edits are what it shows.

// A category is one bucket of money. kind is 'income' or 'expense'; color is
// used for chips, bars and the spending chart.
export const CATEGORIES = [
  { id: 'salary', name: 'Salary', kind: 'income', color: '#1f6f4a' },
  { id: 'freelance', name: 'Freelance', kind: 'income', color: '#2f8a6b' },
  { id: 'other-income', name: 'Other income', kind: 'income', color: '#7d9b76' },
  { id: 'housing', name: 'Housing', kind: 'expense', color: '#8a5a2b' },
  { id: 'groceries', name: 'Groceries', kind: 'expense', color: '#3e7d3a' },
  { id: 'dining', name: 'Dining out', kind: 'expense', color: '#b3402f' },
  { id: 'transport', name: 'Transport', kind: 'expense', color: '#2f5d8a' },
  { id: 'utilities', name: 'Utilities', kind: 'expense', color: '#7a5fb0' },
  { id: 'health', name: 'Health', kind: 'expense', color: '#c05a8a' },
  { id: 'entertainment', name: 'Entertainment', kind: 'expense', color: '#d97706' },
  { id: 'shopping', name: 'Shopping', kind: 'expense', color: '#0e7490' },
  { id: 'kids', name: 'Kids & school', kind: 'expense', color: '#65a30d' },
  { id: 'savings', name: 'Savings', kind: 'expense', color: '#14532d' },
  { id: 'other', name: 'Other', kind: 'expense', color: '#6b7280' },
];

// The monthly plan: what the household means to receive or spend per category.
// Keyed by month ("2026-11"); a month with no plan of its own falls back to the
// nearest earlier one, so the plan carries forward until it is changed.
export const PLANS = {
  '2026-10': {
    salary: 6300, freelance: 500, 'other-income': 0,
    housing: 1850, groceries: 500, dining: 160, transport: 430, utilities: 290,
    health: 120, entertainment: 90, shopping: 180, kids: 500, savings: 700, other: 100,
  },
  '2026-11': {
    salary: 6300, freelance: 500, 'other-income': 0,
    housing: 1850, groceries: 520, dining: 180, transport: 420, utilities: 300,
    health: 120, entertainment: 90, shopping: 200, kids: 500, savings: 700, other: 100,
  },
};

// One row of money in or out. amount is always positive; the category's kind
// says which way it flows. Dates are plain YYYY-MM-DD strings.
export const TRANSACTIONS = [
  // ---- October 2026 ----
  { id: 't001', date: '2026-10-01', description: 'Salary — Northwind Studio', category: 'salary', amount: 3150.00 },
  { id: 't002', date: '2026-10-01', description: 'Rent — Maple Court 4B', category: 'housing', amount: 1850.00 },
  { id: 't003', date: '2026-10-01', description: 'Monthly bus pass', category: 'transport', amount: 34.00 },
  { id: 't004', date: '2026-10-02', description: 'Transfer to emergency fund', category: 'savings', amount: 650.00 },
  { id: 't005', date: '2026-10-03', description: 'Gym membership', category: 'health', amount: 45.00 },
  { id: 't006', date: '2026-10-04', description: 'Market Basket — weekly shop', category: 'groceries', amount: 94.65 },
  { id: 't007', date: '2026-10-05', description: 'Internet — fibre 300', category: 'utilities', amount: 59.00 },
  { id: 't008', date: '2026-10-05', description: 'After-school club (October)', category: 'kids', amount: 420.00 },
  { id: 't009', date: '2026-10-06', description: 'Car payment', category: 'transport', amount: 312.00 },
  { id: 't010', date: '2026-10-07', description: 'Fuel', category: 'transport', amount: 46.80 },
  { id: 't011', date: '2026-10-09', description: 'Streaming bundle', category: 'entertainment', amount: 15.49 },
  { id: 't012', date: '2026-10-10', description: 'Freelance invoice #1031 — brochure', category: 'freelance', amount: 480.00 },
  { id: 't013', date: '2026-10-11', description: 'Market Basket — weekly shop', category: 'groceries', amount: 71.20 },
  { id: 't014', date: '2026-10-12', description: 'Electricity', category: 'utilities', amount: 88.30 },
  { id: 't015', date: '2026-10-13', description: 'Pizza night with neighbours', category: 'dining', amount: 38.50 },
  { id: 't016', date: '2026-10-15', description: 'Salary — Northwind Studio', category: 'salary', amount: 3150.00 },
  { id: 't017', date: '2026-10-16', description: 'Pharmacy — vitamins', category: 'health', amount: 19.40 },
  { id: 't018', date: '2026-10-18', description: 'Water & trash', category: 'utilities', amount: 36.90 },
  { id: 't019', date: '2026-10-18', description: 'Market Basket — weekly shop', category: 'groceries', amount: 88.45 },
  { id: 't020', date: '2026-10-19', description: 'Cinema — family tickets', category: 'entertainment', amount: 36.00 },
  { id: 't021', date: '2026-10-20', description: 'Mobile phones (2 lines)', category: 'utilities', amount: 84.00 },
  { id: 't022', date: '2026-10-21', description: 'School lunch account top-up', category: 'kids', amount: 60.00 },
  { id: 't023', date: '2026-10-22', description: 'Freelance — menu redesign', category: 'freelance', amount: 260.00 },
  { id: 't024', date: '2026-10-24', description: 'Car insurance', category: 'transport', amount: 132.00 },
  { id: 't025', date: '2026-10-25', description: 'Market Basket — weekly shop', category: 'groceries', amount: 79.95 },
  { id: 't026', date: '2026-10-26', description: 'New kettle & kitchen bits', category: 'shopping', amount: 54.30 },
  { id: 't027', date: '2026-10-27', description: 'Brunch at Corner Café', category: 'dining', amount: 31.75 },
  { id: 't028', date: '2026-10-29', description: 'Fuel', category: 'transport', amount: 49.10 },
  { id: 't029', date: '2026-10-30', description: 'Halloween costumes', category: 'kids', amount: 42.60 },
  { id: 't030', date: '2026-10-31', description: 'Interest — savings account', category: 'other-income', amount: 11.85 },

  // ---- November 2026 ----
  { id: 't031', date: '2026-11-01', description: 'Salary — Northwind Studio', category: 'salary', amount: 3150.00 },
  { id: 't032', date: '2026-11-01', description: 'Rent — Maple Court 4B', category: 'housing', amount: 1850.00 },
  { id: 't033', date: '2026-11-01', description: 'Monthly bus pass', category: 'transport', amount: 34.00 },
  { id: 't034', date: '2026-11-02', description: 'Transfer to emergency fund', category: 'savings', amount: 600.00 },
  { id: 't035', date: '2026-11-02', description: 'Market Basket — weekly shop', category: 'groceries', amount: 86.20 },
  { id: 't036', date: '2026-11-03', description: 'Gym membership', category: 'health', amount: 45.00 },
  { id: 't037', date: '2026-11-03', description: 'Interest — savings account', category: 'other-income', amount: 12.40 },
  { id: 't038', date: '2026-11-04', description: 'Fuel', category: 'transport', amount: 48.20 },
  { id: 't039', date: '2026-11-05', description: 'Internet — fibre 300', category: 'utilities', amount: 59.00 },
  { id: 't040', date: '2026-11-05', description: 'After-school club (November)', category: 'kids', amount: 420.00 },
  { id: 't041', date: '2026-11-06', description: 'Car payment', category: 'transport', amount: 312.00 },
  { id: 't042', date: '2026-11-06', description: 'Market Basket — top-up shop', category: 'groceries', amount: 64.55 },
  { id: 't043', date: '2026-11-07', description: 'Pizza night', category: 'dining', amount: 42.00 },
  { id: 't044', date: '2026-11-08', description: 'Freelance invoice #1042 — logo pack', category: 'freelance', amount: 620.00 },
  { id: 't045', date: '2026-11-09', description: 'Streaming bundle', category: 'entertainment', amount: 15.49 },
  { id: 't046', date: '2026-11-09', description: 'Pharmacy — cold medicine', category: 'health', amount: 23.60 },
  { id: 't047', date: '2026-11-10', description: 'Winter boots', category: 'shopping', amount: 89.00 },
  { id: 't048', date: '2026-11-11', description: 'Market Basket — weekly shop', category: 'groceries', amount: 92.30 },
  { id: 't049', date: '2026-11-12', description: 'Electricity', category: 'utilities', amount: 96.40 },
  { id: 't050', date: '2026-11-12', description: 'Art supplies for school project', category: 'kids', amount: 24.30 },
  { id: 't051', date: '2026-11-13', description: 'Household supplies', category: 'shopping', amount: 36.25 },
  { id: 't052', date: '2026-11-14', description: 'Coffee & brunch', category: 'dining', amount: 28.50 },
  { id: 't053', date: '2026-11-15', description: 'Salary — Northwind Studio', category: 'salary', amount: 3150.00 },
  { id: 't054', date: '2026-11-15', description: 'Cinema — family tickets', category: 'entertainment', amount: 32.00 },
  { id: 't055', date: '2026-11-16', description: 'Market Basket — weekly shop', category: 'groceries', amount: 58.75 },
  { id: 't056', date: '2026-11-17', description: 'Dentist copay', category: 'health', amount: 45.00 },
  { id: 't057', date: '2026-11-18', description: 'Fuel', category: 'transport', amount: 52.60 },
  { id: 't058', date: '2026-11-19', description: 'Paperback novel', category: 'shopping', amount: 18.50 },
  { id: 't059', date: '2026-11-20', description: 'Mobile phones (2 lines)', category: 'utilities', amount: 84.00 },
  { id: 't060', date: '2026-11-20', description: 'Parking — city centre', category: 'transport', amount: 12.00 },
  { id: 't061', date: '2026-11-21', description: 'Freelance — website fixes', category: 'freelance', amount: 340.00 },
  { id: 't062', date: '2026-11-21', description: 'Market Basket — weekly shop', category: 'groceries', amount: 101.40 },
  { id: 't063', date: '2026-11-22', description: 'Ramen with friends', category: 'dining', amount: 56.80 },
  { id: 't064', date: '2026-11-23', description: 'Indie game (sale)', category: 'entertainment', amount: 19.99 },
  { id: 't065', date: '2026-11-24', description: 'Birthday gift — Mum', category: 'other', amount: 40.00 },
  { id: 't066', date: '2026-11-25', description: 'Market Basket — top-up shop', category: 'groceries', amount: 47.90 },
];

// Savings goals: what the household is putting money aside for, and how far
// along each one is. saved and target are plain dollar amounts.
export const GOALS = [
  { id: 'g1', name: 'Emergency fund', note: 'Six months of essentials', target: 10000, saved: 6420 },
  { id: 'g2', name: 'Family holiday — Japan', note: 'Flights + 10 nights, spring 2027', target: 4200, saved: 2380 },
  { id: 'g3', name: 'New laptop', note: 'For freelance work', target: 1800, saved: 1800 },
  { id: 'g4', name: 'Car repair fund', note: 'Tyres and brakes due soon', target: 1200, saved: 340 },
];

// Recurring bills and subscriptions. dueDay is the day of the month each one
// lands; paidMonths lists the months already settled.
export const BILLS = [
  { id: 'b1', name: 'Rent — Maple Court 4B', amount: 1850.00, dueDay: 1, category: 'housing', paidMonths: ['2026-10', '2026-11'] },
  { id: 'b2', name: 'Gym membership', amount: 45.00, dueDay: 3, category: 'health', paidMonths: ['2026-10', '2026-11'] },
  { id: 'b3', name: 'Internet — fibre 300', amount: 59.00, dueDay: 5, category: 'utilities', paidMonths: ['2026-10', '2026-11'] },
  { id: 'b4', name: 'Streaming bundle', amount: 15.49, dueDay: 9, category: 'entertainment', paidMonths: ['2026-10', '2026-11'] },
  { id: 'b5', name: 'Electricity', amount: 96.40, dueDay: 12, category: 'utilities', paidMonths: ['2026-10', '2026-11'] },
  { id: 'b6', name: 'Water & trash', amount: 38.10, dueDay: 18, category: 'utilities', paidMonths: ['2026-10'] },
  { id: 'b7', name: 'Mobile phones (2 lines)', amount: 84.00, dueDay: 20, category: 'utilities', paidMonths: ['2026-10', '2026-11'] },
  { id: 'b8', name: 'Car insurance', amount: 132.00, dueDay: 24, category: 'transport', paidMonths: ['2026-10'] },
];

// The household the demo data belongs to, shown in the header.
export const HOUSEHOLD = 'The Miller household';

// A fresh copy of the whole ledger, for first load and for "reset demo data".
export function seedState() {
  return {
    version: 1,
    household: HOUSEHOLD,
    categories: CATEGORIES.map((c) => ({ ...c })),
    plans: JSON.parse(JSON.stringify(PLANS)),
    transactions: TRANSACTIONS.map((t) => ({ ...t })),
    goals: GOALS.map((g) => ({ ...g })),
    bills: BILLS.map((b) => ({ ...b, paidMonths: [...b.paidMonths] })),
    viewMonth: '2026-11',
  };
}
