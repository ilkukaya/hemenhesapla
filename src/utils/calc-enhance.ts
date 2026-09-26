// Tüm hesaplayıcı sayfalarında ortak davranışlar:
// sonucu kopyalama/paylaşma, formu temizleme, mobilde yüzen sonuç göstergesi,
// son kullanılan hesaplayıcılar ve ölçüm olayları.

function toast(msg: string) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('is-visible');
  window.clearTimeout((el as any)._t);
  (el as any)._t = window.setTimeout(() => el.classList.remove('is-visible'), 2200);
}

function track(name: string, params: Record<string, unknown> = {}) {
  const g = (window as any).gtag;
  if (typeof g === 'function') g('event', name, params);
}

function text(el: Element | null | undefined) {
  return (el?.textContent || '').replace(/\s+/g, ' ').trim();
}

function resultSummary(result: HTMLElement): string {
  const title = text(document.querySelector('h1'));
  const lines: string[] = [title];
  const label = text(result.querySelector('.calc-result-label'));
  const value = text(result.querySelector('.calc-result-value'));
  if (value && value !== '—') lines.push(`${label ? label + ': ' : ''}${value}`);
  result.querySelectorAll('.calc-detail-row').forEach((row) => {
    if ((row as HTMLElement).offsetParent === null) return;
    const l = text(row.querySelector('.calc-detail-label'));
    const v = text(row.querySelector('.calc-detail-value'));
    if (l && v && v !== '—') lines.push(`${l}: ${v}`);
  });
  lines.push('', location.href);
  return lines.join('\n');
}

async function copy(str: string) {
  try {
    await navigator.clipboard.writeText(str);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = str;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

function rememberRecent() {
  const root = document.querySelector<HTMLElement>('[data-calc]');
  const ref = root?.dataset.calc;
  if (!ref) return;
  try {
    const list: string[] = JSON.parse(localStorage.getItem('hh-recent') || '[]');
    const next = [ref, ...list.filter((r) => r !== ref)].slice(0, 8);
    localStorage.setItem('hh-recent', JSON.stringify(next));
  } catch {}
}

export function initCalcEnhancements() {
  rememberRecent();

  const results = Array.from(document.querySelectorAll<HTMLElement>('.calc-result'));
  const primary = results[0];

  // Butonlar (her sonuç kutusunda)
  document.querySelectorAll<HTMLButtonElement>('.calc-result [data-action]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const result = btn.closest<HTMLElement>('.calc-result')!;
      const action = btn.dataset.action;
      if (action === 'copy-result') {
        if (await copy(resultSummary(result))) toast('Sonuç panoya kopyalandı');
        track('result_copy', { page: location.pathname });
      } else if (action === 'share') {
        const summary = resultSummary(result);
        const data = { title: document.title, text: summary.replace(location.href, '').trim(), url: location.href };
        track('result_share', { page: location.pathname });
        if (navigator.share) {
          try { await navigator.share(data); } catch {}
        } else {
          window.open(`https://wa.me/?text=${encodeURIComponent(summary)}`, '_blank', 'noopener');
        }
      } else if (action === 'reset') {
        document.querySelectorAll<HTMLFormElement>('.calc-shell form').forEach((f) => f.reset());
        document.querySelectorAll<HTMLInputElement>('.calc-shell input:not([type=radio]):not([type=checkbox]):not([type=hidden])').forEach((i) => {
          if (!i.defaultValue) i.value = '';
        });
        results.forEach((r) => r.classList.add('hidden'));
        history.replaceState(null, '', location.pathname);
        peek?.classList.remove('is-visible');
        const first = document.querySelector<HTMLElement>('.calc-shell input, .calc-shell select');
        first?.focus({ preventScroll: true });
        document.querySelector('.calc-shell')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Mobil: sonuç ekranda değilken yüzen gösterge
  const peek = document.getElementById('result-peek');
  const peekLabel = document.getElementById('result-peek-label');
  const peekValue = document.getElementById('result-peek-value');
  if (!primary || !peek) return;

  let resultInView = false;
  let tracked = false;

  const update = () => {
    const shown = !primary.classList.contains('hidden');
    const value = text(primary.querySelector('.calc-result-value'));
    if (shown && value && value !== '—') {
      if (!tracked) { tracked = true; track('calculate', { page: location.pathname }); }
      if (peekLabel) peekLabel.textContent = text(primary.querySelector('.calc-result-label')) || 'Sonuç';
      if (peekValue) peekValue.textContent = value;
      const below = primary.getBoundingClientRect().top > window.innerHeight - 40;
      peek.classList.toggle('is-visible', !resultInView && below);
    } else {
      peek.classList.remove('is-visible');
    }
  };

  new IntersectionObserver((entries) => {
    resultInView = entries.some((e) => e.isIntersecting);
    update();
  }, { threshold: 0.15 }).observe(primary);

  new MutationObserver(update).observe(primary, { attributes: true, attributeFilter: ['class'], subtree: true, childList: true, characterData: true });
  window.addEventListener('scroll', () => { if (peek.classList.contains('is-visible')) update(); }, { passive: true });

  peek.addEventListener('click', () => {
    primary.scrollIntoView({ behavior: 'smooth', block: 'center' });
    peek.classList.remove('is-visible');
  });
}
