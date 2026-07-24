'use client';

import { useUser } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Link } from '@/libs/I18nNavigation';
import { formatCurrency, extractErrorMessage } from '@/utils/format';

type ContributeFormProps = {
  tierId: number;
  tierTitle: string;
  tierDescription: string;
  price: number;
  currency: string;
  reward: string;
  projectSlug: string;
};

export const ContributeForm = (props: ContributeFormProps) => {
  const t = useTranslations('Contribute');
  const { isSignedIn, user } = useUser();
  const [name, setName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress ?? '');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-gray-600">{t('sign_in_required')}</p>
        <Link
          href="/sign-in/"
          className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
        >
          {t('sign_in')}
        </Link>
      </div>
    );
  }

  const submit = async () => {
    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tierId: props.tierId,
          backerName: name || 'Anonymous',
          email,
          address,
          notes,
        }),
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
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{t('success_title')}</h2>
        <p className="text-gray-600">{t('success_message')}</p>
        <Link
          href={`/projects/${props.projectSlug}`}
          className="mt-4 rounded-md bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
        >
          {t('back_to_project')}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
          className="flex flex-col gap-5"
        >
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
              {t('label_name')}
            </label>
            <input
              id="name"
              type="text"
              required
              aria-label={t('label_name')}
              value={name}
              onChange={(event) => {
                setName(event.target.value);
              }}
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-hidden"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
              {t('label_email')}
            </label>
            <input
              id="email"
              type="email"
              required
              aria-label={t('label_email')}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
              }}
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-hidden"
            />
          </div>

          <div>
            <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-gray-700">
              {t('label_address')}
            </label>
            <textarea
              id="address"
              required
              rows={3}
              aria-label={t('label_address')}
              value={address}
              onChange={(event) => {
                setAddress(event.target.value);
              }}
              placeholder={t('placeholder_address')}
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-hidden"
            />
          </div>

          <div>
            <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-gray-700">
              {t('label_notes')}
            </label>
            <textarea
              id="notes"
              rows={3}
              aria-label={t('label_notes')}
              value={notes}
              onChange={(event) => {
                setNotes(event.target.value);
              }}
              placeholder={t('placeholder_notes')}
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="mt-2 w-full rounded-md bg-blue-600 px-6 py-3 text-base font-bold text-white hover:bg-blue-700 disabled:opacity-50 lg:w-auto"
          >
            {status === 'submitting' ? t('submitting') : t('submit')}
          </button>

          {status === 'error' && <p className="text-sm text-red-500">{errorMessage}</p>}
        </form>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-4 rounded-lg border border-gray-200 bg-gray-50 p-5">
          <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
            {t('selected_reward')}
          </p>
          <h3 className="mt-2 text-lg font-bold text-gray-900">{props.tierTitle}</h3>
          <p className="mt-1 text-xl font-bold text-blue-700">
            {formatCurrency(props.price, props.currency)}
          </p>
          {props.tierDescription && (
            <p className="mt-3 text-sm text-gray-600">{props.tierDescription}</p>
          )}
          {props.reward && (
            <p className="mt-2 text-sm text-gray-700">
              <span className="font-medium">Reward: </span>
              {props.reward}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
