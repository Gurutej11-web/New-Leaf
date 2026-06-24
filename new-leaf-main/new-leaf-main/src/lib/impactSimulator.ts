export interface ProgramEstimate {
  key: string;
  name: string;
  category: "cash" | "oneTime" | "coverage";
  amount: number;
  cadence: "monthly" | "one-time";
  confidence: "High" | "Medium" | "Low";
  assumption: string;
  source: string;
}

export interface ImpactInput {
  text: string;
  householdSize?: number | string;
  hasChildren?: string;
  incomeBand?: string;
  veteranOrDisability?: string;
  location?: string;
}

export interface ImpactResult {
  programs: ProgramEstimate[];
  monthlyTotal: number;
  oneTimeTotal: number;
  coverageTotal: number;
  assumptions: string[];
}

// USDA SNAP maximum monthly allotment, 48 contiguous states + DC (FY2024).
const SNAP_MAX_ALLOTMENT = [291, 535, 766, 973, 1155, 1386, 1532, 1751];

const NON_US_HINTS = [
  "india", "united kingdom", "u.k.", "uk", "england", "scotland", "canada",
  "australia", "mexico", "germany", "france", "nigeria", "pakistan",
  "bangladesh", "philippines", "kenya", "ghana", "spain", "italy", "brazil",
  "japan", "china", "ireland", "netherlands",
];

function round5(n: number) {
  return Math.round(n / 5) * 5;
}

function snapMaxAllotment(hh: number) {
  if (hh <= 8) return SNAP_MAX_ALLOTMENT[Math.max(1, hh) - 1];
  return 1751 + (hh - 8) * 219;
}

function parseHousehold(input: ImpactInput): number {
  const raw = input.householdSize;
  let hh = 0;
  if (typeof raw === "number") hh = raw;
  else if (typeof raw === "string") {
    const m = raw.match(/\d+/);
    if (m) hh = parseInt(m[0], 10);
  }
  if (!hh || hh < 1) hh = input.hasChildren === "Yes" ? 3 : 1;
  return Math.min(hh, 12);
}

function has(text: string, words: string[]) {
  return words.some(w => text.includes(w));
}

function resolveIncome(input: ImpactInput, t: string): { monthly: number; assumed: boolean } {
  switch (input.incomeBand) {
    case "No income": return { monthly: 0, assumed: false };
    case "Under $1,500/month": return { monthly: 900, assumed: false };
    case "$1,500-$3,000/month": return { monthly: 2250, assumed: false };
    case "Over $3,000/month": return { monthly: 3500, assumed: false };
  }
  const hardship = has(t, [
    "lost my job", "lost job", "laid off", "fired", "can't pay", "cant pay",
    "evict", "shut off", "shutoff", "no money", "no income", "homeless",
  ]);
  return { monthly: hardship ? 600 : 1500, assumed: true };
}

export function estimateImpact(input: ImpactInput): ImpactResult {
  const t = (input.text || "").toLowerCase();
  const loc = (input.location || "").toLowerCase();

  if (loc && NON_US_HINTS.some(h => loc.includes(h))) {
    return { programs: [], monthlyTotal: 0, oneTimeTotal: 0, coverageTotal: 0, assumptions: [] };
  }

  const hh = parseHousehold(input);
  const { monthly: income, assumed: incomeAssumed } = resolveIncome(input, t);
  const hasKids = input.hasChildren === "Yes";
  const programs: ProgramEstimate[] = [];

  const foodNeed = has(t, ["food", "hungry", "eat", "grocer", "snap", "meal", "feed", "hunger"]);
  const housingNeed = has(t, ["rent", "evict", "housing", "homeless", "shelter", "landlord", "mortgage"]);
  const utilityNeed = has(t, ["electric", "utility", "power", "gas", "heat", "light", "bill", "shutoff", "shut off", "water"]);
  const jobLoss = has(t, ["lost my job", "lost job", "laid off", "fired", "unemploy", "lost work", "no job", "out of work"]);
  const medicalNeed = has(t, ["medical", "doctor", "health", "insurance", "prescription", "medicaid", "clinic", "hospital"]);
  const childcareNeed = hasKids && has(t, ["childcare", "child care", "daycare", "day care", "babysit", "after school", "work", "job"]);
  const lowIncome = income <= 900;

  if (foodNeed || lowIncome) {
    const maxA = snapMaxAllotment(hh);
    const est = Math.max(income === 0 ? maxA : 23, maxA - 0.3 * income);
    const amount = round5(Math.min(maxA, est));
    if (amount > 0) {
      programs.push({
        key: "snap",
        name: "SNAP (food assistance)",
        category: "cash",
        amount,
        cadence: "monthly",
        confidence: income === 0 ? "High" : "Medium",
        assumption: `USDA max SNAP allotment for a household of ${hh} is $${snapMaxAllotment(hh)}/mo; benefits drop ~30¢ per $1 of net income. Estimated at your ${incomeAssumed ? "assumed " : ""}income level.`,
        source: "USDA Food & Nutrition Service (FY2024 allotments)",
      });
    }
  }

  if (housingNeed) {
    const typicalRent = hh <= 2 ? 1300 : hh <= 4 ? 1600 : 2000;
    const subsidy = round5(Math.max(0, typicalRent - 0.3 * income));
    if (subsidy > 0) {
      programs.push({
        key: "rental",
        name: "Rental assistance (Section 8)",
        category: "cash",
        amount: subsidy,
        cadence: "monthly",
        confidence: "Low",
        assumption: `Section 8 covers Fair Market Rent (~$${typicalRent}/mo for your household size) minus 30% of your income. Vouchers often have waitlists, so timing varies.`,
        source: "HUD Housing Choice Voucher program",
      });
    }
  }

  if (jobLoss) {
    programs.push({
      key: "unemployment",
      name: "Unemployment insurance",
      category: "cash",
      amount: 1500,
      cadence: "monthly",
      confidence: "Medium",
      assumption: "Based on the national average benefit (~$385/week). Your state and prior wages set the actual amount, and benefits are time-limited.",
      source: "U.S. Dept. of Labor (state UI programs)",
    });
  }

  if (childcareNeed) {
    programs.push({
      key: "childcare",
      name: "Childcare assistance (CCDF)",
      category: "cash",
      amount: 700,
      cadence: "monthly",
      confidence: "Low",
      assumption: "Average state childcare subsidy per child. Actual award depends on provider rates, work status, and waitlists.",
      source: "Child Care & Development Fund (HHS)",
    });
  }

  if (hasKids) {
    programs.push({
      key: "wic",
      name: "WIC (nutrition for kids)",
      category: "cash",
      amount: 75,
      cadence: "monthly",
      confidence: "High",
      assumption: "Average WIC monthly food benefit per participant, for families with children under 5 or who are pregnant/nursing.",
      source: "USDA WIC program",
    });
  }

  if (utilityNeed) {
    programs.push({
      key: "liheap",
      name: "Utility assistance (LIHEAP)",
      category: "oneTime",
      amount: 500,
      cadence: "one-time",
      confidence: "Medium",
      assumption: "Typical LIHEAP seasonal benefit toward heating, cooling, or a shut-off. Amount varies by state and energy costs.",
      source: "LIHEAP (HHS Administration for Children & Families)",
    });
  }

  if (medicalNeed || income <= 900) {
    programs.push({
      key: "medicaid",
      name: "Health coverage (Medicaid)",
      category: "coverage",
      amount: 450,
      cadence: "monthly",
      confidence: "Medium",
      assumption: "Estimated value of Medicaid coverage based on average per-enrollee cost. This is the value of health coverage, not a cash payment.",
      source: "Centers for Medicare & Medicaid Services",
    });
  }

  programs.sort((a, b) => b.amount - a.amount);

  const monthlyTotal = programs.filter(p => p.category === "cash").reduce((s, p) => s + p.amount, 0);
  const oneTimeTotal = programs.filter(p => p.category === "oneTime").reduce((s, p) => s + p.amount, 0);
  const coverageTotal = programs.filter(p => p.category === "coverage").reduce((s, p) => s + p.amount, 0);

  const assumptions: string[] = [];
  assumptions.push(`Household size: ${hh}${input.householdSize ? "" : " (assumed — add it for a sharper estimate)"}.`);
  assumptions.push(`Monthly income used: $${income.toLocaleString()}${incomeAssumed ? " (assumed from your situation)" : ""}.`);
  assumptions.push(
    input.location
      ? `Location: ${input.location}. National figures shown; your state's amounts may differ.`
      : "No location given — national averages used; your state's amounts may differ."
  );

  return { programs, monthlyTotal, oneTimeTotal, coverageTotal, assumptions };
}
