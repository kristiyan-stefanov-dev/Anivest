import { formatCurrency } from '@/utils/format';

export const ProgressBar = (props: {
  raised: number;
  goal: number;
  currency?: string;
  backers?: number;
}) => {
  const percent = props.goal > 0 ? Math.min(100, Math.round((props.raised / props.goal) * 100)) : 0;

  return (
    <div className="w-full">
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div className="h-full rounded-full bg-blue-600" style={{ width: `${percent}%` }} />
      </div>

      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
        <span className="font-semibold text-gray-900">
          {formatCurrency(props.raised, props.currency)}
          <span className="font-normal text-gray-500">
            {' '}
            / {formatCurrency(props.goal, props.currency)}
          </span>
        </span>

        <span className="text-gray-600">
          {percent}%{' '}
          {typeof props.backers === 'number' && (
            <span className="text-gray-500">· {props.backers} backers</span>
          )}
        </span>
      </div>
    </div>
  );
};
