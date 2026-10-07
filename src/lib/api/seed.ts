import { addMonths, daysInMonth, toISODate } from "@/lib/dates";
import type { Budget, CategoryId, Transaction, TransactionType } from "@/types";

/** Deterministic PRNG (mulberry32) so demo data is stable across reloads. */
export function createRandom(seed: number) {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min: number, max: number) => Math.floor(min + next() * (max - min + 1)),
    /** Amount rounded to a "realistic" step (e.g. nearest ₹10). */
    amount: (min: number, max: number, step = 10) =>
      Math.round((min + next() * (max - min)) / step) * step,
    pick: <T>(items: readonly T[]): T => items[Math.floor(next() * items.length)],
    chance: (p: number) => next() < p,
  };
}

type Random = ReturnType<typeof createRandom>;

interface Draft {
  day: number;
  description: string;
  amount: number;
  type: TransactionType;
  category: CategoryId;
  note?: string;
}

const MERCHANTS = {
  groceries: ["BigBasket", "DMart", "Zepto", "Blinkit", "Nature's Basket", "Reliance Fresh"],
  food: ["Swiggy", "Zomato", "Starbucks", "Third Wave Coffee", "Social", "Haldiram's", "Domino's"],
  transport: ["Uber", "Ola", "Namma Metro", "Rapido", "IndianOil Petrol"],
  shopping: ["Amazon", "Myntra", "Flipkart", "Decathlon", "IKEA", "Croma", "Nykaa"],
  entertainment: ["BookMyShow", "PVR INOX", "Steam", "Kindle Store"],
  health: ["Apollo Pharmacy", "Practo Consultation", "1mg", "Dr. Lal PathLabs"],
  freelance: ["Upwork — UI audit", "Freelance — landing page", "Toptal — React consulting"],
} as const;

function monthDrafts(rand: Random, monthIndex: number): Draft[] {
  const drafts: Draft[] = [
    {
      day: 1,
      description: "Salary — Acme Technologies",
      amount: 145000,
      type: "income",
      category: "salary",
    },
    {
      day: 3,
      description: "House rent",
      amount: 32000,
      type: "expense",
      category: "rent",
      note: "2BHK, Indiranagar",
    },
    {
      day: 5,
      description: "SIP — Nifty 50 Index Fund",
      amount: 15000,
      type: "expense",
      category: "investments",
    },
    {
      day: 5,
      description: "SIP — Flexi Cap Fund",
      amount: 5000,
      type: "expense",
      category: "investments",
    },
    {
      day: 7,
      description: "BESCOM electricity bill",
      amount: rand.amount(1400, 3200),
      type: "expense",
      category: "bills",
    },
    { day: 9, description: "ACT Fibernet", amount: 1180, type: "expense", category: "bills" },
    { day: 12, description: "Airtel postpaid", amount: 599, type: "expense", category: "bills" },
    {
      day: 2,
      description: "cult.fit membership",
      amount: 2499,
      type: "expense",
      category: "health",
    },
    { day: 15, description: "Netflix", amount: 649, type: "expense", category: "entertainment" },
    {
      day: 18,
      description: "Spotify Premium",
      amount: 119,
      type: "expense",
      category: "entertainment",
    },
  ];

  // Weekly groceries.
  for (const day of [4, 11, 18, 25]) {
    drafts.push({
      day: day + rand.int(0, 2),
      description: rand.pick(MERCHANTS.groceries),
      amount: rand.amount(1200, 4200),
      type: "expense",
      category: "groceries",
    });
  }

  const repeat = (count: number, make: () => Omit<Draft, "day">) => {
    for (let i = 0; i < count; i++) drafts.push({ day: rand.int(1, 28), ...make() });
  };

  repeat(rand.int(8, 13), () => ({
    description: rand.pick(MERCHANTS.food),
    amount: rand.amount(180, 1900),
    type: "expense",
    category: "food",
  }));
  repeat(rand.int(6, 10), () => {
    const merchant = rand.pick(MERCHANTS.transport);
    const isFuel = merchant.includes("Petrol");
    return {
      description: merchant,
      amount: isFuel ? rand.amount(1500, 3000, 50) : rand.amount(60, 650),
      type: "expense",
      category: "transport",
    };
  });
  repeat(rand.int(2, 4), () => ({
    description: rand.pick(MERCHANTS.shopping),
    amount: rand.amount(600, 7500),
    type: "expense",
    category: "shopping",
  }));
  repeat(rand.int(1, 2), () => ({
    description: rand.pick(MERCHANTS.entertainment),
    amount: rand.amount(250, 1600),
    type: "expense",
    category: "entertainment",
  }));
  if (rand.chance(0.6)) {
    drafts.push({
      day: rand.int(1, 28),
      description: rand.pick(MERCHANTS.health),
      amount: rand.amount(300, 2800),
      type: "expense",
      category: "health",
    });
  }
  // Freelance income lands most months, larger on alternating months.
  if (rand.chance(0.75)) {
    drafts.push({
      day: rand.int(10, 26),
      description: rand.pick(MERCHANTS.freelance),
      amount: rand.amount(monthIndex % 2 ? 18000 : 9000, monthIndex % 2 ? 42000 : 22000, 500),
      type: "income",
      category: "freelance",
    });
  }
  return drafts;
}

/**
 * Generates ~6 months of realistic transactions ending today. Future-dated
 * entries in the current month are dropped so the data never "predicts".
 */
export function generateSeedTransactions(now = new Date(), seed = 42, months = 6): Transaction[] {
  const rand = createRandom(seed);
  const today = toISODate(now);
  const transactions: Transaction[] = [];
  let counter = 0;

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = addMonths(new Date(now.getFullYear(), now.getMonth(), 1), -i);
    const lastDay = daysInMonth(monthStart);

    for (const draft of monthDrafts(rand, i)) {
      const date = toISODate(
        new Date(monthStart.getFullYear(), monthStart.getMonth(), Math.min(draft.day, lastDay)),
      );
      if (date > today) continue;
      const timestamp = `${date}T09:00:00.000Z`;
      transactions.push({
        id: `seed_${String(++counter).padStart(4, "0")}`,
        date,
        description: draft.description,
        amount: draft.amount,
        type: draft.type,
        category: draft.category,
        ...(draft.note ? { note: draft.note } : {}),
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }
  }

  return transactions.sort((a, b) => b.date.localeCompare(a.date));
}

export const DEFAULT_BUDGETS: Budget[] = [
  { category: "rent", limit: 32000 },
  { category: "groceries", limit: 12000 },
  { category: "food", limit: 8000 },
  { category: "transport", limit: 5000 },
  { category: "shopping", limit: 10000 },
  { category: "bills", limit: 5000 },
  { category: "entertainment", limit: 2500 },
  { category: "health", limit: 5000 },
  { category: "investments", limit: 20000 },
];
