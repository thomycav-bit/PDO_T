import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import { CourtIcon } from './CourtIcon';

export function CategoryCards({ base, verb }: { base: 'grupos' | 'cruces'; verb: string }) {
  return (
    <div className="cats">
      {CATEGORIES.map((c) => (
        <Link key={c.slug} className="cat" href={`/${base}/${c.slug}`}>
          <CourtIcon />
          <span className="cat-body">
            <strong>{c.label}</strong>
            <small>{verb}</small>
          </span>
        </Link>
      ))}
    </div>
  );
}
