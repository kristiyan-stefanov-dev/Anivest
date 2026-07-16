import { Link } from '@/libs/I18nNavigation';
import type { ProjectWithStudio } from '@/models/Schema';
import { ProgressBar } from './ProgressBar';

export const ProjectCard = (props: { project: ProjectWithStudio }) => {
  const { project } = props;
  const percent =
    project.goalAmount > 0
      ? Math.min(100, Math.round((project.raisedAmount / project.goalAmount) * 100))
      : 0;

  return (
    <Link
      href={`/projects/${project.slug}/`}
      className="flex w-72 shrink-0 snap-start flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:shadow-md"
    >
      <div className="aspect-video w-full overflow-hidden bg-gray-100">
        {project.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.coverImageUrl}
            alt={project.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 text-lg font-semibold text-gray-900">{project.title}</h3>
        <p className="line-clamp-2 text-sm text-gray-600">{project.tagline}</p>

        <p className="text-xs text-gray-500">{project.studio.name}</p>

        <div className="mt-auto pt-2">
          <ProgressBar
            raised={project.raisedAmount}
            goal={project.goalAmount}
            currency={project.currency}
            backers={project.backersCount}
          />
        </div>

        <span className="sr-only">{percent}% funded</span>
      </div>
    </Link>
  );
};
