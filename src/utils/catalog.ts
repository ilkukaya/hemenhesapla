import categoriesData from '../data/categories.json';

export interface CalcEntry {
  slug: string;
  title: string;
  description: string;
  icon: string;
  popular: boolean;
  category: string;
  categoryName: string;
  href: string;
}

export interface CategoryEntry {
  slug: string;
  name: string;
  color: string;
  icon: string;
  description: string;
  shortDescription: string;
  calculators: CalcEntry[];
}

// Eski emoji ikonlar için güvenli eşleme (categories.json güncellenene kadar).
const CATEGORY_ICON: Record<string, string> = {
  finans: 'wallet',
  saglik: 'heart-pulse',
  gunluk: 'calendar',
  insaat: 'hammer',
  matematik: 'sigma',
  egitim: 'graduation-cap',
  donusum: 'arrow-left-right',
};

const isIconKey = (s: string | undefined) => !!s && /^[a-z0-9-]+$/.test(s);

export const categories: CategoryEntry[] = categoriesData.categories.map((cat: any) => ({
  slug: cat.slug,
  name: cat.name,
  color: cat.color,
  icon: isIconKey(cat.icon) ? cat.icon : CATEGORY_ICON[cat.slug] || 'calculator',
  description: cat.description,
  shortDescription: cat.shortDescription,
  calculators: cat.calculators.map((c: any) => ({
    slug: c.slug,
    title: c.title,
    description: c.description,
    icon: isIconKey(c.icon) ? c.icon : CATEGORY_ICON[cat.slug] || 'calculator',
    popular: !!c.popular,
    category: cat.slug,
    categoryName: cat.name,
    href: `/${cat.slug}/${c.slug}/`,
  })),
}));

export const allCalcs: CalcEntry[] = categories.flatMap((c) => c.calculators);
export const popularCalcs: CalcEntry[] = allCalcs.filter((c) => c.popular);

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

/** "kategori/slug" ya da yalnızca "slug" referansını çözer. */
export function findCalc(ref: string, fallbackCategory?: string): CalcEntry | undefined {
  const clean = ref.replace(/^\/|\/$/g, '');
  if (clean.includes('/')) {
    const [cat, slug] = clean.split('/');
    return allCalcs.find((c) => c.category === cat && c.slug === slug);
  }
  return (
    allCalcs.find((c) => c.slug === clean && c.category === fallbackCategory) ||
    allCalcs.find((c) => c.slug === clean)
  );
}

/** Aramada Türkçe karakterlerden bağımsız eşleşme için normalleştirme. */
export function normalizeTr(s: string) {
  return s
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/â/g, 'a')
    .replace(/î/g, 'i')
    .replace(/û/g, 'u');
}
