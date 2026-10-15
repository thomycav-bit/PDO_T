import { CategoryCards } from '@/components/CategoryCards';
import { FlyerSection } from '@/components/FlyerSection';
import { InfoCards } from '@/components/InfoCards';
import { SiteHeader } from '@/components/SiteHeader';
import { getFlyerVersion } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const version = await getFlyerVersion();

  return (
    <>
      <SiteHeader />
      <main>
        <section id="inicio">
          <FlyerSection version={version} />
        </section>

        <section id="informacion">
          <h2>Información</h2>
          <InfoCards />
        </section>

        <section id="grupos">
          <h2>Grupos</h2>
          <CategoryCards base="grupos" verb="Ver grupos" />
        </section>

        <section id="cruces">
          <h2>Cruces</h2>
          <CategoryCards base="cruces" verb="Ver cruces" />
        </section>

        <section id="sponsors">
          <h2>Sponsors</h2>
          <p>Las marcas que hacen posible el torneo.</p>
        </section>
      </main>
    </>
  );
}
