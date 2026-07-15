import * as z from 'zod';

export const backingStatusValidation = z.enum([
  'pending',
  'completed',
  'cancelled',
  'refunded',
]);

export const BackingValidation = z.object({
  projectId: z.number().int().positive(),
  pledgeId: z.number().int().positive(),
  amount: z.number().int().positive(),
  status: backingStatusValidation.default('pending'),
});