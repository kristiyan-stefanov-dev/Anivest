import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import * as z from 'zod';
import { getStudioByClerkId } from '@/libs/Anivest';
import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { studios } from '@/models/Schema';
import { StudioValidation } from '@/validations/AnivestValidation';

export const POST = async (request: Request) => {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existing = await getStudioByClerkId(user.id);

  if (existing) {
    return NextResponse.json({ studio: existing }, { status: 200 });
  }

  const json = await request.json();
  const parse = StudioValidation.safeParse(json);

  if (!parse.success) {
    return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
  }

  const [studio] = await db
    .insert(studios)
    .values({
      ...parse.data,
      clerkUserId: user.id,
    })
    .returning();

  logger.info('Studio created');

  return NextResponse.json({ studio }, { status: 201 });
};
