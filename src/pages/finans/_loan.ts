// Eşit taksitli kredi (annüite) hesabı; KKDF ve BSMV faiz üzerinden alınır.

export interface LoanRow {
  period: number;
  payment: number;
  principal: number;
  interest: number;
  kkdf: number;
  bsmv: number;
  balance: number;
}

export interface LoanResult {
  payment: number;
  totalPayment: number;
  totalInterest: number;
  totalKkdf: number;
  totalBsmv: number;
  rows: LoanRow[];
}

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * @param principal kredi tutarı
 * @param monthlyRatePct aylık akdi faiz oranı (%), vergiler hariç
 * @param months vade (ay)
 * @param kkdfPct faiz üzerinden KKDF oranı (%)
 * @param bsmvPct faiz üzerinden BSMV oranı (%)
 */
export function amortize(principal: number, monthlyRatePct: number, months: number, kkdfPct = 0, bsmvPct = 0): LoanResult {
  const n = Math.max(1, Math.round(months));
  const r = monthlyRatePct / 100;
  const tax = (kkdfPct + bsmvPct) / 100;
  const re = r * (1 + tax); // vergiler dahil efektif aylık oran
  const payment = re === 0 ? principal / n : (principal * re * Math.pow(1 + re, n)) / (Math.pow(1 + re, n) - 1);

  const rows: LoanRow[] = [];
  let balance = principal;
  let totalInterest = 0;
  let totalKkdf = 0;
  let totalBsmv = 0;
  let totalPayment = 0;
  for (let i = 1; i <= n; i++) {
    const interest = balance * r;
    const kkdf = interest * kkdfPct / 100;
    const bsmv = interest * bsmvPct / 100;
    let principalPart = payment - interest - kkdf - bsmv;
    let pay = payment;
    if (i === n) {
      principalPart = balance;
      pay = principalPart + interest + kkdf + bsmv;
    }
    balance = Math.max(0, balance - principalPart);
    totalInterest += interest;
    totalKkdf += kkdf;
    totalBsmv += bsmv;
    totalPayment += pay;
    rows.push({ period: i, payment: r2(pay), principal: r2(principalPart), interest: r2(interest), kkdf: r2(kkdf), bsmv: r2(bsmv), balance: r2(balance) });
  }
  return {
    payment: r2(payment),
    totalPayment: r2(totalPayment),
    totalInterest: r2(totalInterest),
    totalKkdf: r2(totalKkdf),
    totalBsmv: r2(totalBsmv),
    rows,
  };
}

/** Ödeme planı tablosunu doldurur. */
export function renderSchedule(tbodyId: string, rows: LoanRow[], fmt: (n: number) => string, withTax: boolean) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  tbody.replaceChildren(
    ...rows.map((row) => {
      const tr = document.createElement('tr');
      const cells = [String(row.period), fmt(row.payment), fmt(row.principal), fmt(row.interest), withTax ? fmt(row.kkdf + row.bsmv) : '—', fmt(row.balance)];
      cells.forEach((c, i) => {
        const cell = document.createElement(i === 0 ? 'th' : 'td');
        if (i === 0) cell.setAttribute('scope', 'row');
        cell.textContent = c;
        tr.appendChild(cell);
      });
      return tr;
    })
  );
}
