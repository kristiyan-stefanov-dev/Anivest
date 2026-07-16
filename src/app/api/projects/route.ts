import { currentUser } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import * as z from 'zod';
import { getStudioByClerkId } from '@/libs/Anivest';
import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { projects } from '@/models/Schema';
import { ProjectValidation } from '@/validations/AnivestValidation';

const parseEndsAt = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
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
  const parse = ProjectValidation.safeParse(json);

  if (!parse.success) {
    return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
  }

  const [project] = await db
    .insert(projects)
    .values({
      studioId: studio.id,
      title: parse.data.title,
      slug: parse.data.slug,
      tagline: parse.data.tagline,
      description: parse.data.description,
      coverImageUrl: parse.data.coverImageUrl ?? '',
      category: parse.data.category,
      goalAmount: parse.data.goalAmount,
      currency: parse.data.currency,
      featured: parse.data.featured,
      endsAt: parseEndsAt(parse.data.endsAt),
    })
    .returning();

  logger.info('Project created');

  return NextResponse.json({ project }, { status: 201 });
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

  const parse = ProjectValidation.partial().safeParse(json);

  if (!parse.success) {
    return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
  }

  const [project] = await db
    .update(projects)
    .set({
      ...parse.data,
      endsAt: parse.data.endsAt === undefined ? undefined : parseEndsAt(parse.data.endsAt),
      updatedAt: new Date(),
    })
    .where(and(eq(projects.id, id), eq(projects.studioId, studio.id)))
    .returning();

  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ project });
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

  const [project] = await db
    .delete(projects)
    .where(and(eq(projects.id, id), eq(projects.studioId, studio.id)))
    .returning();

  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ project });
};
