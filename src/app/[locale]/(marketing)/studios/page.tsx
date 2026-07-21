import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProgressBar } from '@/components/ProgressBar';
import { getProjectsByStudio, listStudios } from '@/libs/Anivest';
import { Link } from '@/libs/I18nNavigation';
import type { Studio } from '@/models/Schema';

type StudiosPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: StudiosPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Studios',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

const StudioProjects = async (props: { studioId: number }) => {
  const t = await getTranslations('Studios');
  const projects = await getProjectsByStudio(props.studioId);

  if (projects.length === 0) {
    return <p className="text-gray-500">{t('no_projects')}</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {projects.map((project) => (
        <li key={project.id} className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href={`/projects/${project.slug}/`}
                className="text-lg font-semibold text-gray-900 hover:underline"
              >
                {project.title}
              </Link>
              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {project.status}
              </span>
            </div>
          </div>
          <div className="mt-3">
            <ProgressBar
              raised={project.raisedAmount}
              goal={project.goalAmount}
              currency={project.currency}
              backers={project.backersCount}
            />
          </div>
        </li>
      ))}
    </ul>
  );
};

export default async function StudiosPage(props: StudiosPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Studios',
  });

  const studios = await listStudios();

  return (
    <div className="py-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">{t('title')}</h1>

      {studios.length === 0 ? (
        <p className="text-gray-500">{t('empty')}</p>
      ) : (
        <div className="flex flex-col gap-10">
          {studios.map((studio: Studio) => (
            <section key={studio.id} className="rounded-xl border border-gray-200 p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">{studio.name}</h2>
                {studio.description && <p className="mt-1 text-gray-600">{studio.description}</p>}
                {studio.website && (
                  <a
                    href={studio.website}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-sm text-blue-700 hover:underline"
                  >
                    {studio.website}
                  </a>
                )}
              </div>

              <StudioProjects studioId={studio.id} />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
