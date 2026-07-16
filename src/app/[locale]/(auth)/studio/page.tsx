import { currentUser } from '@clerk/nextjs/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ProgressBar } from '@/components/ProgressBar';
import { StudioRegisterForm } from '@/components/StudioRegisterForm';
import { getProjectsByStudio, getStudioByClerkId } from '@/libs/Anivest';
import { Link } from '@/libs/I18nNavigation';

type StudioPageProps = {
  params: Promise<{ locale: string }>;
};

const StudioProjects = async (props: { studioId: number }) => {
  const t = await getTranslations('Studio');
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
            <Link
              href={`/studio/projects/${project.id}/edit/`}
              className="rounded-sm border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
            >
              {t('manage')}
            </Link>
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

export default async function StudioPage(props: StudioPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Studio',
  });

  const user = await currentUser();

  if (!user) {
    notFound();
  }

  const studio = await getStudioByClerkId(user.id);

  return (
    <div className="mx-auto max-w-3xl py-8">
      {studio ? (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{studio.name}</h1>
              <p className="text-gray-600">{studio.description}</p>
            </div>
            <Link
              href="/studio/projects/new/"
              className="rounded-sm bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
            >
              {t('new_project')}
            </Link>
          </div>

          <StudioProjects studioId={studio.id} />
        </div>
      ) : (
        <div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900">{t('become_title')}</h1>
          <p className="mb-6 text-gray-600">{t('become_subtitle')}</p>
          <StudioRegisterForm />
        </div>
      )}
    </div>
  );
}
