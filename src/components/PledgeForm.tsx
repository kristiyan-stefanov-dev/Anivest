'use client';

import { useUser } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Link } from '@/libs/I18nNavigation';
import { extractErrorMessage } from '@/utils/format';

export const PledgeForm = (props: {
  tierId: number;
  price: number;
  currency: string;
  soldOut: boolean;
}) => {
  const t = useTranslations('Pledge');
  const { isSignedIn, user } = useUser();
  const [name, setName] = useState(user?.primaryEmailAddress?.emailAddress ?? '');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (props.soldOut) {
    return <p className="text-sm font-medium text-gray-500">{t('sold_out')}</p>;
  }

  if (!isSignedIn) {
    return (
      <Link
        href="/sign-in/"
        className="inline-block text-sm font-medium text-blue-700 hover:underline"
      >
        {t('sign_in_to_back')}
      </Link>
    );
  }

  const submit = async () => {
    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/pledges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId: props.tierId, backerName: name || 'Anonymous' }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(extractErrorMessage(data) ?? t('error_generic'));
      }

      setStatus('done');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : t('error_generic'));
    }
  };

  if (status === 'done') {
    return (
      <output aria-label={t('success')} className="text-sm font-medium text-green-700">
        {t('success')}
      </output>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      className="flex flex-wrap items-end gap-2"
    >
      <label htmlFor="backer-name" className="flex flex-col text-xs text-gray-600">
        {t('label_name')}
        <input
          id="backer-name"
          type="text"
          aria-label={t('label_name')}
          value={name}
          onChange={(event) => {
            setName(event.target.value);
          }}
          className="mt-1 w-48 rounded-sm border border-gray-200 px-2 py-1 text-sm text-gray-800 focus:ring-2 focus:ring-blue-300 focus:outline-hidden"
        />
      </label>

      <button
        type="submit"
        aria-label={t('back_this')}
        disabled={status === 'submitting'}
        className="rounded-sm bg-blue-600 px-4 py-1.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {status === 'submitting' ? t('backing') : t('back_this')}
      </button>

      {status === 'error' && <p className="w-full text-xs text-red-500">{errorMessage}</p>}
    </form>
  );
};
