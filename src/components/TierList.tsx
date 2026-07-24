import type { TierWithStats } from '@/models/Schema';
import { TierCard } from './TierCard';

export const TierList = (props: { tiers: TierWithStats[]; projectSlug: string }) => {
  if (props.tiers.length === 0) {
    return <p className="text-sm text-gray-500">No tiers available yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {props.tiers.map((tier) => (
        <TierCard
          key={tier.id}
          tierId={tier.id}
          projectSlug={props.projectSlug}
          title={tier.title}
          description={tier.description}
          price={tier.price}
          currency={tier.currency}
          remaining={tier.remaining}
          reward={tier.reward}
          imageUrl={tier.imageUrl}
          deliveryDate={tier.deliveryDate}
        />
      ))}
    </div>
  );
};
