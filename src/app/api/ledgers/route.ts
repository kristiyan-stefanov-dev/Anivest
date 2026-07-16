import { currentUser } from '@clerk/nextjs/server';
import { and, eq, inArray } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import * as z from 'zod';
import { getStudioByClerkId } from '@/libs/Anivest';
import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { ledgers, projects } from '@/models/Schema';
import { LedgerValidation } from '@/validations/AnivestValidation';

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
  const parse = LedgerValidation.safeParse(json);

  if (!parse.success) {
    return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
  }

  const projectId = Number(json.projectId);

  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.studioId, studio.id)),
    columns: { id: true },
  });

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const [ledger] = await db
    .insert(ledgers)
    .values({
      projectId,
      label: parse.data.label,
      amount: parse.data.amount,
      currency: parse.data.currency,
      note: parse.data.note,
      displayOrder: parse.data.displayOrder,
    })
    .returning();

  logger.info('Ledger created');

  return NextResponse.json({ ledger }, { status: 201 });
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

  const parse = LedgerValidation.partial().safeParse(json);

  if (!parse.success) {
    return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
  }

  const [ledger] = await db
    .update(ledgers)
    .set(parse.data)
    .from(projects)
    .where(
      and(eq(ledgers.id, id), eq(ledgers.projectId, projects.id), eq(projects.studioId, studio.id)),
    )
    .returning();

  if (!ledger) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ ledger });
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

  const [ledger] = await db
    .delete(ledgers)
    .where(
      and(
        eq(ledgers.id, id),
        inArray(
          ledgers.projectId,
          db.select({ id: projects.id }).from(projects).where(eq(projects.studioId, studio.id)),
        ),
      ),
    )
    .returning();

  if (!ledger) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ ledger });
};
