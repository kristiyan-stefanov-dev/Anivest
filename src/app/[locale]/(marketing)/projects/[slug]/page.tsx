import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ImageCarousel } from '@/components/ImageCarousel';
import { LedgerList } from '@/components/LedgerList';
import { ProgressBar } from '@/components/ProgressBar';
import { TierCard } from '@/components/TierCard';
import {
  getBlocksForProject,
  getImagesForProject,
  getLedgersForProject,
  getProjectBySlug,
  getTiersForProject,
} from '@/libs/Anivest';
import { Link } from '@/libs/I18nNavigation';
import type { ProjectBlock } from '@/models/Schema';

type ProjectDetailProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata(props: ProjectDetailProps): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return { title: 'Project not found' };
  }

  const t = await getTranslations({
    locale,
    namespace: 'ProjectDetail',
  });

  return {
    title: `${project.title} · ${t('meta_title')}`,
    description: project.tagline,
  };
}

const renderBlock = (block: ProjectBlock) => {
  if (block.type !== 'text') {
    return null;
  }

  const raw = block.content;
  const content =
    raw && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as { heading?: unknown; body?: unknown })
      : ({} as { heading?: unknown; body?: unknown });
  const heading = typeof content.heading === 'string' ? content.heading : '';
  const body = typeof content.body === 'string' ? content.body : '';

  return (
    <div key={block.id} className="mb-6">
      {heading && <h3 className="mb-2 text-xl font-semibold text-gray-900">{heading}</h3>}
      {body && <p className="whitespace-pre-line text-gray-700">{body}</p>}
    </div>
  );
};

const getTimeRemaining = (endsAt: Date | null) => {
  if (!endsAt) {
    return null;
  }

  const now = new Date();
  const diff = endsAt.getTime() - now.getTime();

  if (diff <= 0) {
    return 'Ended';
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days} day${days === 1 ? '' : 's'} left`;
  }

  return `${hours} hour${hours === 1 ? '' : 's'} left`;
};

export default async function ProjectDetail(props: ProjectDetailProps) {
  const { locale, slug } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'ProjectDetail',
  });

  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const [tiers, ledgers, blocks, images] = await Promise.all([
    getTiersForProject(project.id),
    getLedgersForProject(project.id),
    getBlocksForProject(project.id),
    getImagesForProject(project.id),
  ]);

  const { studio } = project;
  const timeRemaining = getTimeRemaining(project.endsAt);

  return (
    <div className="pb-12">
      <div className="mb-8 overflow-hidden rounded-lg">
        <ImageCarousel
          images={images.map((img) => ({
            id: img.id,
            imageUrl: img.imageUrl,
            altText: img.altText,
          }))}
          coverImageUrl={project.coverImageUrl || undefined}
        />
      </div>

      <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">{project.title}</h1>
      {project.tagline && <p className="mt-2 text-lg text-gray-600">{project.tagline}</p>}

      <nav className="mt-6 flex gap-6 border-b border-gray-200">
        <span className="border-b-2 border-blue-600 pb-3 text-sm font-semibold text-blue-600">
          {t('about_tab')}
        </span>
      </nav>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mt-8">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('about_title')}</h2>
            <p className="whitespace-pre-line text-gray-700">{project.description}</p>
          </div>

          {blocks.length > 0 && (
            <div className="mt-8 border-t border-gray-200 pt-6">{blocks.map(renderBlock)}</div>
          )}

          {ledgers.length > 0 && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h2 className="mb-3 text-2xl font-bold text-gray-900">{t('about_funds')}</h2>
              <LedgerList ledgers={ledgers} />
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-4 flex flex-col gap-5 rounded-lg border border-gray-200 bg-white p-5 shadow-xs">
            <p className="text-sm font-semibold tracking-wide text-gray-500 uppercase">
              {t('reached')}
            </p>

            <p className="text-3xl font-bold text-gray-900">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: project.currency,
                maximumFractionDigits: 0,
              }).format(project.raisedAmount)}
              {project.goalAmount > 0 && (
                <span className="ml-2 text-lg font-normal text-gray-500">
                  ({Math.round((project.raisedAmount / project.goalAmount) * 100)}%)
                </span>
              )}
            </p>

            <ProgressBar
              raised={project.raisedAmount}
              goal={project.goalAmount}
              currency={project.currency}
            />

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">{t('requested')}</p>
                <p className="font-semibold text-gray-900">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: project.currency,
                    maximumFractionDigits: 0,
                  }).format(project.goalAmount)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">{t('contributors')}</p>
                <p className="font-semibold text-gray-900">{project.backersCount}</p>
              </div>
              {timeRemaining && (
                <div className="col-span-2">
                  <p className="text-gray-500">{t('time_left')}</p>
                  <p className="font-semibold text-gray-900">{timeRemaining}</p>
                </div>
              )}
            </div>

            <Link
              href={`/projects/${slug}/contribute`}
              className="block w-full rounded-md bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-700"
            >
              {t('contribute')}
            </Link>

            {studio.slug && (
              <Link
                href={`/studio/${studio.slug}`}
                className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
              >
                {studio.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={studio.logoUrl}
                    alt={studio.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-500">
                    {studio.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500">{t('by_studio_label')}</p>
                  <p className="text-sm font-semibold text-gray-900">{studio.name}</p>
                </div>
              </Link>
            )}

            {tiers.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                  {t('rewards_title')}
                </h3>
                <div className="flex flex-col gap-3">
                  {tiers.map((tier) => (
                    <TierCard
                      key={tier.id}
                      tierId={tier.id}
                      projectSlug={slug}
                      title={tier.title}
                      description={tier.description}
                      price={tier.price}
                      currency={tier.currency}
                      remaining={tier.remaining}
                      reward={tier.reward}
                      imageUrl={tier.imageUrl}
                      deliveryDate={tier.deliveryDate}
                      compact
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
