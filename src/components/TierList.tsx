import type { TierWithStats } from '@/models/Schema';
import { PledgeForm } from './PledgeForm';
import { TierCard } from './TierCard';

export const TierList = (props: { tiers: TierWithStats[] }) => {
  if (props.tiers.length === 0) {
    return <p className="text-sm text-gray-500">No tiers available yet.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {props.tiers.map((tier) => (
        <div key={tier.id}>
          <TierCard
            title={tier.title}
            description={tier.description}
            price={tier.price}
            currency={tier.currency}
            remaining={tier.remaining}
            reward={tier.reward}
          />
          <div className="mt-2 pl-1">
            <PledgeForm
              tierId={tier.id}
              soldOut={(tier.remaining ?? 1) <= 0}
              price={tier.price}
              currency={tier.currency}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
