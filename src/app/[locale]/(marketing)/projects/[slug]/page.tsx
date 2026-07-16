import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { LedgerList } from '@/components/LedgerList';
import { ProgressBar } from '@/components/ProgressBar';
import { TierList } from '@/components/TierList';
import {
  getBlocksForProject,
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
      {body && <p className="text-gray-700">{body}</p>}
    </div>
  );
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

  const [tiers, ledgers, blocks] = await Promise.all([
    getTiersForProject(project.id),
    getLedgersForProject(project.id),
    getBlocksForProject(project.id),
  ]);

  const { studio } = project;

  return (
    <div className="py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
            {project.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={project.coverImageUrl}
                alt={project.title}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>

          <h1 className="mt-4 text-3xl font-bold text-gray-900">{project.title}</h1>
          <p className="mt-1 text-lg text-gray-600">{project.tagline}</p>

          <p className="mt-4 whitespace-pre-line text-gray-700">{project.description}</p>

          {blocks.length > 0 && (
            <div className="mt-8 border-t border-gray-200 pt-6">{blocks.map(renderBlock)}</div>
          )}

          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="mb-3 text-2xl font-bold text-gray-900">{t('about_funds')}</h2>
            <LedgerList ledgers={ledgers} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-4 flex flex-col gap-6 rounded-lg border border-gray-200 p-5">
            <ProgressBar
              raised={project.raisedAmount}
              goal={project.goalAmount}
              currency={project.currency}
              backers={project.backersCount}
            />

            {studio.slug && (
              <Link href={`/studio/`} className="text-sm text-blue-700 hover:underline">
                {t('by_studio', { name: studio.name })}
              </Link>
            )}

            <div>
              <h2 className="mb-3 text-xl font-bold text-gray-900">{t('tiers_title')}</h2>
              <TierList tiers={tiers} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
