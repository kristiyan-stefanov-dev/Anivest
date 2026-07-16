import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
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

export const categorySlug = pgEnum('category_slug', [
  'popular',
  'isekai',
  'drama',
  'action',
  'fantasy',
  'slice-of-life',
  'mecha',
  'romance',
]);

/** Anime project categories used to group projects on the home page carousels. */
export const categories = pgTable('categories', {
  slug: categorySlug('slug').primaryKey(),
  name: varchar('name', { length: 64 }).notNull(),
  displayOrder: integer('display_order').notNull().default(0),
});

/** A studio account, keyed by the Clerk user id. Created when a user opts in to be a studio. */
export const studios = pgTable('studios', {
  id: serial('id').primaryKey(),
  clerkUserId: varchar('clerk_user_id', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 128 }).notNull(),
  slug: varchar('slug', { length: 128 }).notNull().unique(),
  description: text('description').notNull().default(''),
  logoUrl: varchar('logo_url', { length: 512 }).notNull().default(''),
  website: varchar('website', { length: 512 }).notNull().default(''),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

/** A crowdfunding project created by a studio. */
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  studioId: integer('studio_id')
    .notNull()
    .references(() => studios.id, { onDelete: 'cascade' }),
  slug: varchar('slug', { length: 160 }).notNull().unique(),
  title: varchar('title', { length: 160 }).notNull(),
  tagline: varchar('tagline', { length: 200 }).notNull().default(''),
  description: text('description').notNull().default(''),
  coverImageUrl: varchar('cover_image_url', { length: 512 }).notNull().default(''),
  category: categorySlug('category').notNull().default('popular'),
  goalAmount: integer('goal_amount').notNull().default(0),
  currency: varchar('currency', { length: 8 }).notNull().default('USD'),
  status: varchar('status', { length: 16 }).notNull().default('draft'),
  featured: boolean('featured').notNull().default(false),
  endsAt: timestamp('ends_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/** A backing tier (reward level) offered by a project. */
export const tiers = pgTable('tiers', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 120 }).notNull(),
  description: text('description').notNull().default(''),
  price: integer('price').notNull(),
  currency: varchar('currency', { length: 8 }).notNull().default('USD'),
  limitedQuantity: integer('limited_quantity'),
  claimedQuantity: integer('claimed_quantity').notNull().default(0),
  reward: text('reward').notNull().default(''),
  displayOrder: integer('display_order').notNull().default(0),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

/** A pledge (backing) made by a backer against a tier. Payment is mocked. */
export const pledges = pgTable('pledges', {
  id: serial('id').primaryKey(),
  tierId: integer('tier_id')
    .notNull()
    .references(() => tiers.id, { onDelete: 'cascade' }),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  backerClerkUserId: varchar('backer_clerk_user_id', { length: 255 }).notNull(),
  backerName: varchar('backer_name', { length: 128 }).notNull().default('Anonymous'),
  amount: integer('amount').notNull(),
  currency: varchar('currency', { length: 8 }).notNull().default('USD'),
  reward: text('reward').notNull().default(''),
  status: varchar('status', { length: 16 }).notNull().default('confirmed'),
  paymentRef: varchar('payment_ref', { length: 64 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

/** Join table linking a project to its additional categories. */
export const projectCategories = pgTable(
  'project_categories',
  {
    projectId: integer('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    category: categorySlug('category').notNull(),
  },
  (table) => [primaryKey({ columns: [table.projectId, table.category] })],
);

export type Studio = typeof studios.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Tier = typeof tiers.$inferSelect;
export type Pledge = typeof pledges.$inferSelect;
export type Category = typeof categories.$inferSelect;

/** Shape of a project row joined with its studio and aggregate stats. */
export type ProjectWithStudio = Project & {
  studio: Pick<Studio, 'id' | 'name' | 'slug' | 'logoUrl'>;
  backersCount: number;
  raisedAmount: number;
};

export type TierWithStats = Tier & {
  remaining: number | null;
};

export const projectStatuses = ['draft', 'live', 'funded', 'closed'] as const;

/** A ledger entry attached to a project, describing how funds are used. */
export const ledgers = pgTable('ledgers', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  label: varchar('label', { length: 160 }).notNull(),
  amount: integer('amount').notNull(),
  currency: varchar('currency', { length: 8 }).notNull().default('USD'),
  note: text('note').notNull().default(''),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export type Ledger = typeof ledgers.$inferSelect;

/** Arbitrary content blocks a studio composes for its project page. */
export const projectBlocks = pgTable('project_blocks', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 32 }).notNull().default('text'),
  content: jsonb('content').notNull().default({}),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export type ProjectBlock = typeof projectBlocks.$inferSelect;
