// Finans hesaplayıcıları için ortak istemci yardımcıları.
// Alt çizgi ile başlayan dosyalar Astro tarafından sayfa olarak yayınlanmaz.

export interface Bracket {
  upTo: number | null;
  rate: number; // yüzde
}

const tlFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatTL(num: number): string {
  return tlFormatter.format(Number.isFinite(num) ? num : 0);
}

export function formatNumber(num: number, minDec = 2, maxDec = minDec): string {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: minDec,
    maximumFractionDigits: maxDec,
  }).format(Number.isFinite(num) ? num : 0);
}

export function formatPercent(num: number, dec = 2): string {
  return `%${formatNumber(num, dec)}`;
}

/** Kuruş hassasiyetinde yuvarlama (bordro uygulamasıyla uyumlu). */
export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function debounce<T extends unknown[]>(fn: (...args: T) => void, delay = 150) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: T) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Sayfaya `<script type="application/json" id="...">` ile gömülen veriyi okur. */
export function readJSON<T>(id: string): T {
  const el = document.getElementById(id);
  return JSON.parse(el?.textContent || '{}') as T;
}

/** Input değerini sayı olarak okur; virgüllü girişleri de kabul eder. Geçersizse NaN. */
export function readNumber(id: string): number {
  const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
  if (!el) return NaN;
  const raw = String(el.value ?? '').trim().replace(/\s/g, '');
  if (raw === '') return NaN;
  const normalized = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : NaN;
}

export function readValue(id: string): string {
  const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
  return el ? String(el.value ?? '') : '';
}

export function setText(id: string, text: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

export function showResult(show: boolean): void {
  const resultArea = document.getElementById('calc-result');
  if (resultArea) resultArea.classList.toggle('hidden', !show);
}

/**
 * Artan oranlı tarifeye göre vergi hesaplar.
 * @returns toplam vergi ve dilim bazında vergi dağılımı
 */
export function progressiveTax(matrah: number, brackets: Bracket[]): { total: number; perBracket: number[] } {
  const perBracket: number[] = [];
  let prev = 0;
  let total = 0;
  const base = Math.max(0, matrah);
  for (const b of brackets) {
    const upper = b.upTo === null ? Infinity : b.upTo;
    const slice = Math.max(0, Math.min(base, upper) - prev);
    const tax = slice * (b.rate / 100);
    perBracket.push(tax);
    total += tax;
    prev = upper;
  }
  return { total, perBracket };
}

/** Matrahın düştüğü dilimin oranı (marjinal oran). */
export function marginalRate(matrah: number, brackets: Bracket[]): number {
  for (const b of brackets) {
    if (b.upTo === null || matrah <= b.upTo) return b.rate;
  }
  return brackets[brackets.length - 1].rate;
}

interface InitOptions {
  /** Geçerli bir sonuç üretildiyse true döndürmeli; URL yalnızca o zaman güncellenir. */
  calculate: () => boolean;
  /** Eski URL parametrelerini yeni alan kimliklerine eşlemek için. */
  onParams?: (params: URLSearchParams) => void;
  /** Sayfa açılışında URL parametresi olmasa da hesapla. */
  calculateOnLoad?: boolean;
}

/**
 * Form alanlarını dinler, URL paylaşımını (query string) yönetir.
 */
export function initCalculator({ calculate, onParams, calculateOnLoad = false }: InitOptions) {
  const form = document.getElementById('calc-form');
  if (!form) return;
  const fields = () =>
    Array.from(form.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input[id], select[id]'));

  function updateURL() {
    const params = new URLSearchParams();
    fields().forEach((el) => {
      if (el.value !== '' && el.id) params.set(el.id, el.value);
    });
    const qs = params.toString();
    history.replaceState(null, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }

  const run = () => {
    if (calculate()) updateURL();
  };
  const debounced = debounce(run, 150);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    run();
  });
  fields().forEach((el) => {
    el.addEventListener('input', debounced);
    el.addEventListener('change', debounced);
  });

  const params = new URLSearchParams(window.location.search);
  let hasParams = false;
  fields().forEach((el) => {
    if (el.id && params.has(el.id)) {
      el.value = params.get(el.id) ?? '';
      hasParams = true;
    }
  });
  if (onParams) onParams(params);
  if (hasParams || calculateOnLoad) {
    if (hasParams) run();
    else calculate();
  }
}
