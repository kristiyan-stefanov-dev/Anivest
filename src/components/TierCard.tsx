import { formatCurrency } from '@/utils/format';

export const TierCard = (props: {
  title: string;
  description: string;
  price: number;
  currency: string;
  remaining: number | null;
  reward: string;
}) => {
  let availability = 'Unlimited';

  if (props.remaining !== null) {
    availability = props.remaining > 0 ? `${props.remaining} remaining` : 'Sold out';
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-900">{props.title}</h3>
        <span className="font-bold text-blue-700">
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

      <p className="text-xs text-gray-500">{availability}</p>
    </div>
  );
};
