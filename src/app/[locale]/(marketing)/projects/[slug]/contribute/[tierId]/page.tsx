import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ContributeForm } from '@/components/ContributeForm';
import { getProjectBySlug, getTierById } from '@/libs/Anivest';
import { Link } from '@/libs/I18nNavigation';

type ContributePageProps = {
  params: Promise<{ locale: string; slug: string; tierId: string }>;
};

export async function generateMetadata(props: ContributePageProps): Promise<Metadata> {
  const { locale, slug, tierId } = await props.params;
  const project = await getProjectBySlug(slug);
  const tier = await getTierById(Number(tierId));

  if (!project || !tier) {
    return { title: 'Not found' };
  }

  const t = await getTranslations({
    locale,
    namespace: 'Contribute',
  });

  return {
    title: `${t('meta_title')} · ${project.title}`,
    description: `${t('meta_description')} - ${tier.title}`,
  };
}

export default async function ContributePage(props: ContributePageProps) {
  const { locale, slug, tierId } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Contribute',
  });

  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const tier = await getTierById(Number(tierId));

  if (!tier || tier.projectId !== project.id) {
    notFound();
  }

  const soldOut = tier.limitedQuantity !== null && tier.claimedQuantity >= tier.limitedQuantity;

  if (soldOut) {
    notFound();
  }

  return (
    <div className="pb-12">
      <nav className="mb-6">
        <Link href={`/projects/${slug}`} className="text-sm text-blue-600 hover:underline">
          ← {t('back_to_project', { title: project.title })}
        </Link>
      </nav>

      <h1 className="mb-2 text-3xl font-bold text-gray-900">{t('title')}</h1>
      <p className="mb-8 text-gray-600">{t('subtitle')}</p>

      <ContributeForm
        tierId={tier.id}
        tierTitle={tier.title}
        tierDescription={tier.description}
        price={tier.price}
        currency={tier.currency}
        reward={tier.reward}
        projectSlug={slug}
      />
    </div>
  );
}
