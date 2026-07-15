import {
  date,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// It automatically run the command `db-server:file`, which apply the migration before Next.js starts in development mode,
// Alternatively, if your database is running, you can run `npm run db:migrate` and there is no need to restart the server.

// Need a database for production? Check out https://get.neon.com/BMFYNtx
// Tested and compatible with Next.js Boilerplate

export const counterSchema = pgTable('counter', {
  id: serial('id').primaryKey(),
  count: integer('count').default(0),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const userRoleEnum = pgEnum('user_role', [
  'backer',
  'studio',
  'admin',
]);

export const projectStatusEnum = pgEnum('project_status', [
  'draft',
  'live',
  'funded',
  'failed',
  'cancelled',
]);

export const backingStatusEnum = pgEnum('backing_status', [
  'pending',
  'completed',
  'cancelled',
  'refunded',
]);

export const userSchema = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkUserId: varchar('clerk_user_id', { length: 256 }).notNull().unique(),
  role: userRoleEnum('role').default('backer').notNull(),
  displayName: varchar('display_name', { length: 256 }).notNull(),
  email: varchar('email', { length: 320 }).notNull(),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const studioSchema = pgTable('studios', {
  id: serial('id').primaryKey(),
  ownerId: integer('owner_id')
    .notNull()
    .references(() => userSchema.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 256 }).notNull(),
  slug: varchar('slug', { length: 256 }).notNull().unique(),
  description: text('description'),
  logoUrl: text('logo_url'),
  websiteUrl: text('website_url'),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const projectSchema = pgTable('projects', {
  id: serial('id').primaryKey(),
  studioId: integer('studio_id')
    .notNull()
    .references(() => studioSchema.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 256 }).notNull(),
  slug: varchar('slug', { length: 256 }).notNull().unique(),
  description: text('description').notNull(),
  targetAmount: integer('target_amount').notNull(),
  pledgedAmount: integer('pledged_amount').default(0).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  status: projectStatusEnum('status').default('draft').notNull(),
  deadline: timestamp('deadline', { mode: 'date' }),
  imageUrl: text('image_url'),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const pledgeSchema = pgTable('pledges', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => projectSchema.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 256 }).notNull(),
  description: text('description'),
  amount: integer('amount').notNull(),
  estimatedDelivery: date('estimated_delivery'),
  quantityLimit: integer('quantity_limit'),
  claimedCount: integer('claimed_count').default(0).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const backingSchema = pgTable('backings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => userSchema.id, { onDelete: 'cascade' }),
  projectId: integer('project_id')
    .notNull()
    .references(() => projectSchema.id, { onDelete: 'cascade' }),
  pledgeId: integer('pledge_id')
    .notNull()
    .references(() => pledgeSchema.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  status: backingStatusEnum('status').default('pending').notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});