import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BracketBoard } from '@/components/BracketBoard';
import { getCategory } from '@/lib/categories';
import { getBracket } from '@/lib/store';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ categoria: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const category = getCategory(categoria);
  return { title: category ? `Cruces ${category.label}` : 'Cruces' };
}

export default async function CrucesPage({ params }: Props) {
  const { categoria } = await params;
  const category = getCategory(categoria);
  if (!category) notFound();

  const matches = await getBracket(category.slug);
  return <BracketBoard slug={category.slug} title={`Cruces ${category.label}`} initial={matches} />;
}
