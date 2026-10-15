export const CATEGORIES = [
  { slug: '8va', label: '8va' },
  { slug: '7ma', label: '7ma' },
  { slug: 'mas-10', label: '+10' },
  { slug: 'mas-15fem', label: '+15FEM' },
] as const;

export type Category = (typeof CATEGORIES)[number];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
