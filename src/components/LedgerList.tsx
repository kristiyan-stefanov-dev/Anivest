import type { Ledger } from '@/models/Schema';
import { formatCurrency } from '@/utils/format';

export const LedgerList = (props: { ledgers: Ledger[] }) => {
  if (props.ledgers.length === 0) {
    return <p className="text-sm text-gray-500">No fund allocation listed yet.</p>;
  }

  const total = props.ledgers.reduce((sum, ledger) => sum + ledger.amount, 0);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-600">
          <tr>
            <th className="px-4 py-2 font-medium">Item</th>
            <th className="px-4 py-2 font-medium">Note</th>
            <th className="px-4 py-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {props.ledgers.map((ledger) => (
            <tr key={ledger.id}>
              <td className="px-4 py-2 font-medium text-gray-900">{ledger.label}</td>
              <td className="px-4 py-2 text-gray-600">{ledger.note}</td>
              <td className="px-4 py-2 text-right text-gray-900">
                {formatCurrency(ledger.amount, ledger.currency)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50 font-semibold">
          <tr>
            <td className="px-4 py-2" colSpan={2}>
              Total
            </td>
            <td className="px-4 py-2 text-right">
              {formatCurrency(total, props.ledgers[0]?.currency ?? 'USD')}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
