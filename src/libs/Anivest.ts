import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '@/libs/DB';
import {
  categories,
  ledgers,
  pledges,
  projectBlocks,
  projectImages,
  projects,
  studios,
  tiers,
} from '@/models/Schema';
import type {
  Category,
  Pledge,
  Project,
  ProjectImage,
  ProjectWithStudio,
  Studio,
  TierWithStats,
} from '@/models/Schema';

export const getStudioByClerkId = async (clerkUserId: string) =>
  await db.query.studios.findFirst({
    where: eq(studios.clerkUserId, clerkUserId),
  });

export const listStudios = async (options: { limit?: number } = {}) => {
  const rows = await db.query.studios.findMany({
    orderBy: [asc(studios.name)],
    limit: options.limit,
  });

  return rows;
};

const getProjectStats = async (projectIds: number[]) => {
  if (projectIds.length === 0) {
    return new Map<number, { backersCount: number; raisedAmount: number }>();
  }

  const rows = await db
    .select({
      projectId: pledges.projectId,
      backersCount: sql<number>`count(*)::int`,
      raisedAmount: sql<number>`coalesce(sum(${pledges.amount}), 0)::int`,
    })
    .from(pledges)
    .where(and(eq(pledges.status, 'confirmed'), inArray(pledges.projectId, projectIds)))
    .groupBy(pledges.projectId);

  return new Map(rows.map((row) => [row.projectId, row]));
};

const withStudioAndStats = async (project: Project): Promise<ProjectWithStudio> => {
  const studio = await db.query.studios.findFirst({
    where: eq(studios.id, project.studioId),
    columns: { id: true, name: true, slug: true, logoUrl: true },
  });

  const stats = await getProjectStats([project.id]);

  return {
    ...project,
    studio: studio ?? { id: 0, name: '', slug: '', logoUrl: '' },
    backersCount: stats.get(project.id)?.backersCount ?? 0,
    raisedAmount: stats.get(project.id)?.raisedAmount ?? 0,
  };
};

export const listProjectsByCategory = async (
  category: Category['slug'],
  options: { limit?: number } = {},
) => {
  const rows = await db.query.projects.findMany({
    where: eq(projects.category, category),
    orderBy: [desc(projects.createdAt)],
    limit: options.limit,
  });

  return await Promise.all(rows.map(async (project) => await withStudioAndStats(project)));
};

export const getFeaturedProjects = async (limit = 12) => {
  const rows = await db.query.projects.findMany({
    where: eq(projects.featured, true),
    orderBy: [desc(projects.createdAt)],
    limit,
  });

  return await Promise.all(rows.map(async (project) => await withStudioAndStats(project)));
};

export const listCategories = async () =>
  await db.query.categories.findMany({
    orderBy: [categories.displayOrder],
  });

export const getProjectBySlug = async (slug: string) => {
  const project = await db.query.projects.findFirst({
    where: eq(projects.slug, slug),
  });

  return project ? await withStudioAndStats(project) : undefined;
};

export const getProjectById = async (id: number) => {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });

  return project ? await withStudioAndStats(project) : undefined;
};

export const getTiersForProject = async (projectId: number): Promise<TierWithStats[]> => {
  const rows = await db.query.tiers.findMany({
    where: eq(tiers.projectId, projectId),
    orderBy: [tiers.displayOrder],
  });

  return rows.map((tier) => ({
    ...tier,
    remaining: tier.limitedQuantity === null ? null : tier.limitedQuantity - tier.claimedQuantity,
  }));
};

export const getLedgersForProject = async (projectId: number) =>
  await db.query.ledgers.findMany({
    where: eq(ledgers.projectId, projectId),
    orderBy: [ledgers.displayOrder],
  });

export const getBlocksForProject = async (projectId: number) =>
  await db.query.projectBlocks.findMany({
    where: eq(projectBlocks.projectId, projectId),
    orderBy: [projectBlocks.displayOrder],
  });

export const getImagesForProject = async (projectId: number): Promise<ProjectImage[]> =>
  await db.query.projectImages.findMany({
    where: eq(projectImages.projectId, projectId),
    orderBy: [projectImages.displayOrder],
  });

export const getTierById = async (tierId: number) =>
  await db.query.tiers.findFirst({
    where: eq(tiers.id, tierId),
  });

export const getProjectsByStudio = async (studioId: number) => {
  const rows = await db.query.projects.findMany({
    where: eq(projects.studioId, studioId),
    orderBy: [desc(projects.createdAt)],
  });

  return await Promise.all(rows.map(async (project) => await withStudioAndStats(project)));
};

export const createStudio = async (clerkUserId: string, data: typeof studios.$inferInsert) => {
  const [studio] = await db
    .insert(studios)
    .values({ ...data, clerkUserId })
    .returning();

  return studio;
};

export const createProject = async (studioId: number, data: typeof projects.$inferInsert) => {
  const [project] = await db
    .insert(projects)
    .values({ ...data, studioId })
    .returning();

  return project;
};

export const updateProject = async (
  studioId: number,
  projectId: number,
  data: Partial<typeof projects.$inferInsert>,
) => {
  const [project] = await db
    .update(projects)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(projects.id, projectId), eq(projects.studioId, studioId)))
    .returning();

  return project;
};

export const createTier = async (projectId: number, data: typeof tiers.$inferInsert) => {
  const [tier] = await db
    .insert(tiers)
    .values({ ...data, projectId })
    .returning();

  return tier;
};

export const updateTier = async (
  studioId: number,
  tierId: number,
  data: Partial<typeof tiers.$inferInsert>,
) => {
  const [tier] = await db
    .update(tiers)
    .set(data)
    .from(projects)
    .where(
      and(eq(tiers.id, tierId), eq(tiers.projectId, projects.id), eq(projects.studioId, studioId)),
    )
    .returning();

  return tier;
};

export const deleteTier = async (studioId: number, tierId: number) => {
  const [tier] = await db
    .delete(tiers)
    .where(
      and(
        eq(tiers.id, tierId),
        inArray(
          tiers.projectId,
          db.select({ id: projects.id }).from(projects).where(eq(projects.studioId, studioId)),
        ),
      ),
    )
    .returning();

  return tier;
};

export const createLedger = async (projectId: number, data: typeof ledgers.$inferInsert) => {
  const [ledger] = await db
    .insert(ledgers)
    .values({ ...data, projectId })
    .returning();

  return ledger;
};

export const updateLedger = async (
  studioId: number,
  ledgerId: number,
  data: Partial<typeof ledgers.$inferInsert>,
) => {
  const [ledger] = await db
    .update(ledgers)
    .set(data)
    .from(projects)
    .where(
      and(
        eq(ledgers.id, ledgerId),
        eq(ledgers.projectId, projects.id),
        eq(projects.studioId, studioId),
      ),
    )
    .returning();

  return ledger;
};

export const deleteLedger = async (studioId: number, ledgerId: number) => {
  const [ledger] = await db
    .delete(ledgers)
    .where(
      and(
        eq(ledgers.id, ledgerId),
        inArray(
          ledgers.projectId,
          db.select({ id: projects.id }).from(projects).where(eq(projects.studioId, studioId)),
        ),
      ),
    )
    .returning();

  return ledger;
};

export const deleteProject = async (studioId: number, projectId: number) => {
  const [project] = await db
    .delete(projects)
    .where(and(eq(projects.id, projectId), eq(projects.studioId, studioId)))
    .returning();

  return project;
};

export const createPledge = async (props: {
  tierId: number;
  backerClerkUserId: string;
  backerName: string;
  email?: string;
  address?: string;
  notes?: string;
}) => {
  const tier = await db.query.tiers.findFirst({
    where: eq(tiers.id, props.tierId),
  });

  if (!tier) {
    throw new Error('Tier not found');
  }

  if (tier.limitedQuantity !== null && tier.claimedQuantity >= tier.limitedQuantity) {
    throw new Error('Tier sold out');
  }

  const [pledge] = await db
    .insert(pledges)
    .values({
      tierId: tier.id,
      projectId: tier.projectId,
      backerClerkUserId: props.backerClerkUserId,
      backerName: props.backerName,
      email: props.email ?? '',
      address: props.address ?? '',
      notes: props.notes ?? '',
      amount: tier.price,
      currency: tier.currency,
      reward: tier.reward,
      status: 'confirmed',
      paymentRef: crypto.randomUUID(),
    })
    .returning();

  await db
    .update(tiers)
    .set({ claimedQuantity: tier.claimedQuantity + 1 })
    .where(eq(tiers.id, tier.id));

  return pledge;
};

/** A project a backer has pledged to, with their pledges and total pledged amount. */
export type BackedProject = ProjectWithStudio & {
  pledges: Pledge[];
  totalAmount: number;
};

/** A backer of a project, with the pledged tier title. */
export type ProjectBacker = Pledge & {
  tierTitle: string;
};

/** Projects a backer has confirmed pledges on, grouped with their pledges.
 *
 * @param clerkUserId - Clerk id of the backer.
 * @returns Projects the backer pledged to, with their pledges and total.
 */
export const getBackedProjectsByBacker = async (clerkUserId: string): Promise<BackedProject[]> => {
  const rows = await db
    .select({
      project: projects,
      pledge: pledges,
    })
    .from(pledges)
    .innerJoin(projects, eq(pledges.projectId, projects.id))
    .where(and(eq(pledges.backerClerkUserId, clerkUserId), eq(pledges.status, 'confirmed')))
    .orderBy(desc(pledges.createdAt));

  const byProject = new Map<number, { project: Project; pledges: Pledge[] }>();

  for (const { project, pledge } of rows) {
    const entry = byProject.get(project.id) ?? { project, pledges: [] };
    entry.pledges.push(pledge);
    byProject.set(project.id, entry);
  }

  return await Promise.all(
    [...byProject.values()].map(async ({ project, pledges: projectPledges }) => {
      const withStats = await withStudioAndStats(project);
      const totalAmount = projectPledges.reduce((sum, pledge) => sum + pledge.amount, 0);

      return { ...withStats, pledges: projectPledges, totalAmount };
    }),
  );
};

/** Confirmed backers of a project, joined with their tier title, newest first.
 *
 * @param projectId - Id of the project.
 * @returns Backers with their pledged tier title.
 */
export const getBackersForProject = async (projectId: number): Promise<ProjectBacker[]> => {
  const rows = await db
    .select({
      pledge: pledges,
      tierTitle: tiers.title,
    })
    .from(pledges)
    .innerJoin(tiers, eq(pledges.tierId, tiers.id))
    .where(and(eq(pledges.projectId, projectId), eq(pledges.status, 'confirmed')))
    .orderBy(desc(pledges.createdAt));

  return rows.map(({ pledge, tierTitle }) => ({ ...pledge, tierTitle }));
};

export type { Studio, ProjectWithStudio };
