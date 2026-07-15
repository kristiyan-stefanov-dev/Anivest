import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import * as z from 'zod';
import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { studioSchema, userSchema } from '@/models/Schema';
import { StudioValidation } from '@/validations/StudioValidation';

export const GET = async () => {
  const studios = await db
    .select({
      id: studioSchema.id,
      name: studioSchema.name,
      slug: studioSchema.slug,
      description: studioSchema.description,
      logoUrl: studioSchema.logoUrl,
      websiteUrl: studioSchema.websiteUrl,
    })
    .from(studioSchema);

  return NextResponse.json({ studios });
};

export const POST = async (request: Request) => {
  const json = await request.json();
  const parse = StudioValidation.safeParse(json);

  if (!parse.success) {
    return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
  }

  const clerkUser = await currentUser();

  if (!clerkUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userRecord = await db
    .select()
    .from(userSchema)
    .where(eq(userSchema.clerkUserId, clerkUser.id))
    .limit(1);

  const user = userRecord[0];

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (user.role !== 'studio' && user.role !== 'admin') {
    return NextResponse.json({ error: 'Only studio accounts can create studios' }, { status: 403 });
  }

  const studio = await db
    .insert(studioSchema)
    .values({
      ownerId: user.id,
      name: parse.data.name,
      slug: parse.data.slug,
      description: parse.data.description,
      logoUrl: parse.data.logoUrl,
      websiteUrl: parse.data.websiteUrl,
    })
    .returning();

  logger.info(`Studio created: ${parse.data.slug}`);

  return NextResponse.json({ studio: studio[0] });
};