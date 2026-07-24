import * as z from 'zod';

export const StudioValidation = z.object({
  name: z.string().min(2).max(128),
  slug: z
    .string()
    .min(2)
    .max(128)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u, 'Use a lowercase slug with hyphens'),
  description: z.string().max(2000).default(''),
  logoUrl: z.url().max(512).or(z.literal('')).optional().default(''),
  website: z.url().max(512).or(z.literal('')).optional().default(''),
});

export const ProjectValidation = z.object({
  title: z.string().min(3).max(160),
  slug: z
    .string()
    .min(3)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u, 'Use a lowercase slug with hyphens'),
  tagline: z.string().max(200).default(''),
  description: z.string().max(10_000).default(''),
  coverImageUrl: z.url().max(512).or(z.literal('')).optional().default(''),
  category: z
    .enum(['popular', 'isekai', 'drama', 'action', 'fantasy', 'slice-of-life', 'mecha', 'romance'])
    .default('popular'),
  goalAmount: z.number().int().min(0).default(0),
  currency: z.string().length(3).default('USD'),
  featured: z.boolean().default(false),
  endsAt: z.iso.datetime({ local: true }).or(z.literal('')).optional().nullable(),
});

export const TierValidation = z.object({
  title: z.string().min(2).max(120),
  description: z.string().max(2000).default(''),
  price: z.number().int().min(1),
  currency: z.string().length(3).default('USD'),
  limitedQuantity: z.number().int().min(1).optional().nullable(),
  reward: z.string().max(2000).default(''),
  imageUrl: z.url().max(512).or(z.literal('')).optional().default(''),
  deliveryDate: z.string().max(64).default(''),
  displayOrder: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const LedgerValidation = z.object({
  label: z.string().min(2).max(160),
  amount: z.number().int().min(0),
  currency: z.string().length(3).default('USD'),
  note: z.string().max(2000).default(''),
  displayOrder: z.number().int().min(0).default(0),
});

export const PledgeValidation = z.object({
  tierId: z.number().int().positive(),
  backerName: z.string().max(128).optional().default('Anonymous'),
});

export const ContributeFormValidation = z.object({
  tierId: z.number().int().positive(),
  backerName: z.string().min(1).max(128),
  email: z.email().max(256),
  address: z.string().min(1).max(2000),
  notes: z.string().max(2000).default(''),
});
