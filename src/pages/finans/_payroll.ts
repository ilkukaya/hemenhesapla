// Bordro (brüt-net) hesaplama çekirdeği. DOM kullanmaz; test edilebilir.
import type { Bracket } from './_shared';

export interface PayrollParams {
  brackets: Bracket[]; // ücret gelirleri tarifesi
  minGross: number; // brüt asgari ücret
  sgkWorker: number; // %
  unemploymentWorker: number; // %
  sgkEmployer: number; // % (teşviksiz)
  unemploymentEmployer: number; // %
  stampTax: number; // % (binde 7,59 => 0.759)
  sgkCeiling: number; // aylık prime esas kazanç üst sınırı
}

export interface MonthResult {
  month: number; // 1-12
  gross: number;
  sgkBase: number;
  sgkWorker: number;
  unemploymentWorker: number;
  taxBase: number; // aylık GV matrahı
  cumulativeTaxBase: number; // ay sonu kümülatif matrah
  incomeTaxCalculated: number;
  incomeTaxExemption: number;
  incomeTax: number; // ödenecek
  stampTaxCalculated: number;
  stampTaxExemption: number;
  stampTax: number; // ödenecek
  net: number;
  sgkEmployer: number;
  unemploymentEmployer: number;
  employerCost: number;
  marginalRate: number;
}

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** [from, to] aralığına isabet eden vergi (aylık kümülatif fark). */
function taxBetween(from: number, to: number, brackets: Bracket[]): number {
  let prev = 0;
  let total = 0;
  for (const b of brackets) {
    const upper = b.upTo === null ? Infinity : b.upTo;
    const lo = Math.max(from, prev);
    const hi = Math.min(to, upper);
    if (hi > lo) total += (hi - lo) * (b.rate / 100);
    prev = upper;
  }
  return total;
}

function rateAt(matrah: number, brackets: Bracket[]): number {
  for (const b of brackets) if (b.upTo === null || matrah <= b.upTo) return b.rate;
  return brackets[brackets.length - 1].rate;
}

/**
 * Yıl başından itibaren her ay aynı brüt ücretin ödendiği varsayımıyla
 * 12 aylık bordroyu hesaplar. Asgari ücret gelir ve damga vergisi istisnası
 * (GVK md. 23/18, DVK 2 sayılı tablo IV-35) ay bazında, asgari ücretin kendi
 * kümülatif matrahı üzerinden uygulanır.
 * @param incentivePoints işveren SGK primi Hazine indirimi (puan)
 */
export function yearlyPayroll(gross: number, p: PayrollParams, incentivePoints = 0): MonthResult[] {
  const months: MonthResult[] = [];
  const minSgk = Math.min(p.minGross, p.sgkCeiling);
  const minTaxBase = r2(p.minGross - r2(minSgk * p.sgkWorker / 100) - r2(minSgk * p.unemploymentWorker / 100));
  const minStamp = r2(p.minGross * p.stampTax / 100);
  let cum = 0;
  let minCum = 0;

  for (let m = 1; m <= 12; m++) {
    const sgkBase = Math.min(gross, p.sgkCeiling);
    const sgkW = r2(sgkBase * p.sgkWorker / 100);
    const unempW = r2(sgkBase * p.unemploymentWorker / 100);
    const taxBase = r2(gross - sgkW - unempW);
    const prevCum = cum;
    cum = r2(cum + taxBase);
    const itCalc = Math.max(0, r2(taxBetween(prevCum, cum, p.brackets)));

    const prevMinCum = minCum;
    minCum = r2(minCum + minTaxBase);
    const minTax = r2(taxBetween(prevMinCum, minCum, p.brackets));
    const itExempt = Math.min(itCalc, minTax);
    const it = r2(itCalc - itExempt);

    const stCalc = r2(gross * p.stampTax / 100);
    const stExempt = Math.min(stCalc, minStamp);
    const st = r2(stCalc - stExempt);

    const net = r2(gross - sgkW - unempW - it - st);
    const employerRate = Math.max(0, p.sgkEmployer - incentivePoints);
    const sgkE = r2(sgkBase * employerRate / 100);
    const unempE = r2(sgkBase * p.unemploymentEmployer / 100);

    months.push({
      month: m,
      gross,
      sgkBase,
      sgkWorker: sgkW,
      unemploymentWorker: unempW,
      taxBase,
      cumulativeTaxBase: cum,
      incomeTaxCalculated: itCalc,
      incomeTaxExemption: itExempt,
      incomeTax: it,
      stampTaxCalculated: stCalc,
      stampTaxExemption: stExempt,
      stampTax: st,
      net,
      sgkEmployer: sgkE,
      unemploymentEmployer: unempE,
      employerCost: r2(gross + sgkE + unempE),
      marginalRate: rateAt(cum, p.brackets),
    });
  }
  return months;
}

/**
 * Seçilen ayda hedef net ücrete ulaşmak için gereken brüt ücreti bulur
 * (her ay aynı brüt ödendiği varsayımıyla, ikiye bölme yöntemiyle).
 */
export function grossForNet(targetNet: number, month: number, p: PayrollParams): number {
  if (!(targetNet > 0)) return 0;
  const idx = Math.min(12, Math.max(1, month)) - 1;
  const netAt = (g: number) => yearlyPayroll(g, p, 0)[idx].net;
  let lo = targetNet;
  let hi = targetNet * 2 + 1000;
  while (netAt(hi) < targetNet) hi *= 2;
  for (let i = 0; i < 80 && hi - lo > 0.001; i++) {
    const mid = (lo + hi) / 2;
    if (netAt(mid) < targetNet) lo = mid;
    else hi = mid;
  }
  // En yakın kuruşa yuvarla; hedefi aşmayan en küçük brüt.
  let g = Math.round(hi * 100) / 100;
  if (netAt(g - 0.01) >= targetNet) g = r2(g - 0.01);
  return g;
}
