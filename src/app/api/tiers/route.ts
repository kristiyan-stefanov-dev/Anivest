import { currentUser } from '@clerk/nextjs/server';
import { and, eq, inArray } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import * as z from 'zod';
import { getStudioByClerkId } from '@/libs/Anivest';
import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { projects, tiers } from '@/models/Schema';
import { TierValidation } from '@/validations/AnivestValidation';

const ownsProject = async (studioId: number, projectId: number) => {
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.studioId, studioId)),
    columns: { id: true },
  });

  return Boolean(project);
};

export const POST = async (request: Request) => {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const studio = await getStudioByClerkId(user.id);

  if (!studio) {
    return NextResponse.json({ error: 'Studio required' }, { status: 403 });
  }

  const json = await request.json();
  const parse = TierValidation.safeParse(json);

  if (!parse.success) {
    return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
  }

  const projectId = Number(json.projectId);

  if (!Number.isInteger(projectId) || !(await ownsProject(studio.id, projectId))) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const [tier] = await db
    .insert(tiers)
    .values({
      projectId,
      title: parse.data.title,
      description: parse.data.description,
      price: parse.data.price,
      currency: parse.data.currency,
      limitedQuantity: parse.data.limitedQuantity ?? null,
      reward: parse.data.reward,
      displayOrder: parse.data.displayOrder,
      active: parse.data.active,
    })
    .returning();

  logger.info('Tier created');

  return NextResponse.json({ tier }, { status: 201 });
};

export const PATCH = async (request: Request) => {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const studio = await getStudioByClerkId(user.id);

  if (!studio) {
    return NextResponse.json({ error: 'Studio required' }, { status: 403 });
  }

  const json = await request.json();
  const id = Number(json.id);

  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 422 });
  }

  const parse = TierValidation.partial().safeParse(json);

  if (!parse.success) {
    return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
  }

  const [tier] = await db
    .update(tiers)
    .set(parse.data)
    .from(projects)
    .where(
      and(eq(tiers.id, id), eq(tiers.projectId, projects.id), eq(projects.studioId, studio.id)),
    )
    .returning();

  if (!tier) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ tier });
};

export const DELETE = async (request: Request) => {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const studio = await getStudioByClerkId(user.id);

  if (!studio) {
    return NextResponse.json({ error: 'Studio required' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get('id'));

  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 422 });
  }

  const [tier] = await db
    .delete(tiers)
    .where(
      and(
        eq(tiers.id, id),
        inArray(
          tiers.projectId,
          db.select({ id: projects.id }).from(projects).where(eq(projects.studioId, studio.id)),
        ),
      ),
    )
    .returning();

  if (!tier) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ tier });
};
