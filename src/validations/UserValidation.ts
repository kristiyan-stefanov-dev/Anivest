import * as z from 'zod';

export const userRoleValidation = z.enum(['backer', 'studio', 'admin']);

export const UserValidation = z.object({
  clerkUserId: z.string().min(1).max(256),
  role: userRoleValidation.default('backer'),
  displayName: z.string().min(1).max(256),
  email: z.string().email().max(320),
  avatarUrl: z.string().url().optional(),
  bio: z.string().max(2000).optional(),
});