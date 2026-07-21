import { getTranslations } from 'next-intl/server';
import type { ProjectBacker } from '@/libs/Anivest';
import { formatCurrency } from '@/utils/format';

export const ProjectBackersList = async (props: { backers: ProjectBacker[] }) => {
  const t = await getTranslations('Backers');

  if (props.backers.length === 0) {
    return <p className="text-gray-500">{t('empty')}</p>;
  }

  const currency = props.backers[0]?.currency ?? 'USD';
  const totalRaised = props.backers.reduce((sum, backer) => sum + backer.amount, 0);

  return (
    <div>
      <p className="mb-4 text-sm text-gray-600">
        {t('total_backers', { count: props.backers.length })}
        {' · '}
        {t('total_raised', { amount: formatCurrency(totalRaised, currency) })}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-300 text-left text-gray-600">
              <th className="py-2 pr-4 font-medium">{t('backer_label')}</th>
              <th className="py-2 pr-4 font-medium">{t('tier_label')}</th>
              <th className="py-2 pr-4 font-medium">{t('amount_label')}</th>
              <th className="py-2 pr-4 font-medium">{t('reward_label')}</th>
              <th className="py-2 pr-4 font-medium">{t('status_label')}</th>
            </tr>
          </thead>
          <tbody>
            {props.backers.map((backer) => (
              <tr key={backer.id} className="border-b border-gray-200">
                <td className="py-2 pr-4">{backer.backerName}</td>
                <td className="py-2 pr-4">{backer.tierTitle}</td>
                <td className="py-2 pr-4">{formatCurrency(backer.amount, backer.currency)}</td>
                <td className="py-2 pr-4">{backer.reward || '—'}</td>
                <td className="py-2 pr-4">{backer.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
