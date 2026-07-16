export const formatCurrency = (amount: number, currency = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
};

export const extractErrorMessage = (value: unknown): string | undefined => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const candidate = (value as { error?: unknown }).error;

    if (typeof candidate === 'string') {
      return candidate;
    }
  }

  return undefined;
};
