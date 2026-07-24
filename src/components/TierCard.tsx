import { Link } from '@/libs/I18nNavigation';
import { formatCurrency } from '@/utils/format';

export const TierCard = (props: {
  tierId: number;
  projectSlug: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  remaining: number | null;
  reward: string;
  imageUrl: string;
  deliveryDate: string;
  compact?: boolean;
}) => {
  let availability = 'Unlimited';

  if (props.remaining !== null) {
    availability = props.remaining > 0 ? `${props.remaining} remaining` : 'Sold out';
  }

  const soldOut = props.remaining !== null && props.remaining <= 0;

  if (props.compact) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3">
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="text-sm font-semibold text-gray-900">{props.title}</h4>
          <span className="text-sm font-bold text-blue-700">
            {formatCurrency(props.price, props.currency)}
          </span>
        </div>

        {props.description && (
          <p className="line-clamp-2 text-xs text-gray-600">{props.description}</p>
        )}

        {props.deliveryDate && (
          <p className="text-xs text-gray-400">Delivery: {props.deliveryDate}</p>
        )}

        <p className="text-xs text-gray-400">{availability}</p>

        {soldOut ? (
          <span className="inline-block w-full rounded-md bg-gray-100 px-3 py-1.5 text-center text-xs font-medium text-gray-400">
            Sold out
          </span>
        ) : (
          <Link
            href={`/projects/${props.projectSlug}/contribute/${props.tierId}`}
            className="inline-block w-full rounded-md bg-blue-600 px-3 py-1.5 text-center text-xs font-bold text-white hover:bg-blue-700"
          >
            Choose reward
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
      {props.imageUrl && (
        <div className="aspect-video w-full overflow-hidden bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={props.imageUrl} alt={props.title} className="h-full w-full object-cover" />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-lg font-semibold text-gray-900">{props.title}</h3>
          <span className="text-lg font-bold text-blue-700">
            {formatCurrency(props.price, props.currency)}
          </span>
        </div>

        <p className="text-sm text-gray-600">{props.description}</p>

        {props.reward && (
          <p className="text-sm text-gray-700">
            <span className="font-medium">Reward: </span>
            {props.reward}
          </p>
        )}

        {props.deliveryDate && (
          <p className="text-xs text-gray-500">Expected delivery: {props.deliveryDate}</p>
        )}

        <p className="text-xs text-gray-500">{availability}</p>

        <div className="mt-auto pt-2">
          {soldOut ? (
            <span className="inline-block w-full rounded-md bg-gray-100 px-4 py-2.5 text-center text-sm font-medium text-gray-400">
              Sold out
            </span>
          ) : (
            <Link
              href={`/projects/${props.projectSlug}/contribute/${props.tierId}`}
              className="inline-block w-full rounded-md bg-blue-600 px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-blue-700"
            >
              Choose reward
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
