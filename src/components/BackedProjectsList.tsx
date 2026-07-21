import { getTranslations } from 'next-intl/server';
import type { BackedProject } from '@/libs/Anivest';
import { Link } from '@/libs/I18nNavigation';
import { formatCurrency, formatDate } from '@/utils/format';

export const BackedProjectsList = async (props: { projects: BackedProject[] }) => {
  const t = await getTranslations('Backed');

  if (props.projects.length === 0) {
    return <p className="text-gray-500">{t('empty')}</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {props.projects.map((project) => (
        <li key={project.id} className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Link
                href={`/projects/${project.slug}/`}
                className="text-lg font-semibold text-gray-900 hover:underline"
              >
                {project.title}
              </Link>
              {project.studio.name ? (
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {project.studio.name}
                </span>
              ) : null}
            </div>
            <span className="shrink-0 text-sm font-medium text-gray-700">
              {t('total_label')}: {formatCurrency(project.totalAmount, project.currency)}
            </span>
          </div>

          <ul className="mt-3 flex flex-col gap-1">
            {project.pledges.map((pledge) => (
              <li key={pledge.id} className="text-sm text-gray-700">
                <span className="font-medium">
                  {formatCurrency(pledge.amount, pledge.currency)}
                </span>
                {' · '}
                {t('backed_on', { date: formatDate(pledge.createdAt) })}
                {pledge.reward ? (
                  <span className="ml-2 text-gray-500">
                    {t('reward_label')}: {pledge.reward}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>

          <div className="mt-3">
            <Link
              href={`/projects/${project.slug}/`}
              className="text-sm font-medium text-blue-700 hover:underline"
            >
              {t('view_project')}
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
};
