import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GroupsBoard } from '@/components/GroupsBoard';
import { getCategory } from '@/lib/categories';
import { getGroups } from '@/lib/store';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ categoria: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const category = getCategory(categoria);
  return { title: category ? `Grupos ${category.label}` : 'Grupos' };
}

export default async function GruposPage({ params }: Props) {
  const { categoria } = await params;
  const category = getCategory(categoria);
  if (!category) notFound();

  const groups = await getGroups(category.slug);
  return <GroupsBoard slug={category.slug} title={`Grupos ${category.label}`} initial={groups} />;
}
