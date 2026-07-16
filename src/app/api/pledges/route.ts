import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import * as z from 'zod';
import { createPledge } from '@/libs/Anivest';
import { PledgeValidation } from '@/validations/AnivestValidation';

export const POST = async (request: Request) => {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const json = await request.json();
  const parse = PledgeValidation.safeParse(json);

  if (!parse.success) {
    return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
  }

  try {
    const pledge = await createPledge({
      tierId: parse.data.tierId,
      backerClerkUserId: user.id,
      backerName: parse.data.backerName ?? 'Anonymous',
    });

    return NextResponse.json({ pledge }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not create pledge';

    return NextResponse.json({ error: message }, { status: 409 });
  }
};
