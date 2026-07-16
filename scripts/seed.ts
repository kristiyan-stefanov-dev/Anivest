/* oxlint-disable unicorn/numeric-separators-style */

import { eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../src/models/Schema';
import {
  categories,
  ledgers,
  pledges,
  projectBlocks,
  projects,
  studios,
  tiers,
} from '../src/models/Schema';
import type { Category } from '../src/models/Schema';

type CategorySlug = Category['slug'];

const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:5432/postgres';

const pool = new Pool({ connectionString });
const db = drizzle({ client: pool, schema });

const CATEGORY_NAMES: Record<CategorySlug, string> = {
  popular: 'Popular',
  isekai: 'Isekai',
  drama: 'Drama',
  action: 'Action',
  fantasy: 'Fantasy',
  'slice-of-life': 'Slice of Life',
  mecha: 'Mecha',
  romance: 'Romance',
};

const SEED_STUDIOS = [
  {
    clerkUserId: 'seed_studio_1',
    name: 'Sakura Animation Works',
    slug: 'sakura-animation-works',
    description: 'A studio crafting heartfelt stories with hand-drawn warmth.',
    logoUrl: 'https://picsum.photos/seed/sakura-logo/200',
    website: 'https://example.com/sakura',
  },
  {
    clerkUserId: 'seed_studio_2',
    name: 'Neon Forge Studio',
    slug: 'neon-forge-studio',
    description: 'High-octane sci-fi and mecha with a cyberpunk edge.',
    logoUrl: 'https://picsum.photos/seed/neon-logo/200',
    website: 'https://example.com/neon',
  },
];

type SeedProject = {
  studioSlug: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  coverImageUrl: string;
  category: CategorySlug;
  goalAmount: number;
  status: string;
  featured: boolean;
  endsAtDays: number | null;
  tiers: {
    title: string;
    description: string;
    price: number;
    limitedQuantity: number | null;
    reward: string;
    displayOrder: number;
  }[];
  ledgers: { label: string; amount: number; note: string; displayOrder: number }[];
  blocks: { type: string; content: Record<string, unknown>; displayOrder: number }[];
};

const SEED_PROJECTS: SeedProject[] = [
  {
    studioSlug: 'sakura-animation-works',
    slug: 'whispers-of-the-lantern-festival',
    title: 'Whispers of the Lantern Festival',
    tagline: 'A gentle slice-of-life tale of a town that lights the sky each summer.',
    description:
      "Follow Hina, a shy lantern-maker, as she rediscovers her village's forgotten festival. A soft, hand-painted story about community, loss, and quiet courage.",
    coverImageUrl: 'https://picsum.photos/seed/lantern/800/450',
    category: 'slice-of-life',
    goalAmount: 25_000,
    status: 'live',
    featured: true,
    endsAtDays: 30,
    tiers: [
      {
        title: 'Digital Supporter',
        description: 'Name in credits and a digital art booklet.',
        price: 15,
        limitedQuantity: null,
        reward: 'Digital art booklet + credits',
        displayOrder: 0,
      },
      {
        title: 'Lantern Poster',
        description: 'A signed A2 poster of the festival art.',
        price: 45,
        limitedQuantity: 300,
        reward: 'Signed A2 poster',
        displayOrder: 1,
      },
      {
        title: 'Studio Visit',
        description: 'A virtual studio tour with the directors.',
        price: 150,
        limitedQuantity: 50,
        reward: 'Virtual studio tour',
        displayOrder: 2,
      },
    ],
    ledgers: [
      {
        label: 'Animation production',
        amount: 12_000,
        note: 'Key frames and in-betweening.',
        displayOrder: 0,
      },
      {
        label: 'Music and sound',
        amount: 5_000,
        note: 'Original score and voice cast.',
        displayOrder: 1,
      },
      {
        label: 'Distribution',
        amount: 8_000,
        note: 'Festival and streaming release.',
        displayOrder: 2,
      },
    ],
    blocks: [
      {
        type: 'text',
        content: {
          heading: 'The Story',
          body: 'Hina returns to her hometown to find the lantern festival abandoned.',
        },
        displayOrder: 0,
      },
      {
        type: 'text',
        content: { heading: 'Our Vision', body: 'We want every frame to feel handmade and warm.' },
        displayOrder: 1,
      },
    ],
  },
  {
    studioSlug: 'neon-forge-studio',
    slug: 'chrome-vanguard',
    title: 'Chrome Vanguard',
    tagline: 'When the mechs fell silent, one pilot refused to power down.',
    description:
      'A cyberpunk mecha epic about a rogue pilot and an AI that wants to remember. Explosions, philosophy, and chrome.',
    coverImageUrl: 'https://picsum.photos/seed/chrome/800/450',
    category: 'mecha',
    goalAmount: 80_000,
    status: 'live',
    featured: true,
    endsAtDays: 45,
    tiers: [
      {
        title: 'Recruit',
        description: 'Digital wallpapers and a thank-you.',
        price: 20,
        limitedQuantity: null,
        reward: 'Wallpaper pack',
        displayOrder: 0,
      },
      {
        title: 'Mech Model',
        description: 'A 3D printable Chrome Vanguard mech model.',
        price: 80,
        limitedQuantity: 500,
        reward: '3D printable mech',
        displayOrder: 1,
      },
      {
        title: 'Executive Producer',
        description: 'Your name in the end credits as an EP.',
        price: 1_000,
        limitedQuantity: 20,
        reward: 'Executive producer credit',
        displayOrder: 2,
      },
    ],
    ledgers: [
      { label: 'Mech design', amount: 30_000, note: 'Concept and 3D modeling.', displayOrder: 0 },
      {
        label: 'Animation pipeline',
        amount: 35_000,
        note: 'Rigging and rendering farm.',
        displayOrder: 1,
      },
      {
        label: 'Marketing',
        amount: 15_000,
        note: 'Trailer and convention booths.',
        displayOrder: 2,
      },
    ],
    blocks: [
      {
        type: 'text',
        content: {
          heading: 'Logline',
          body: 'A pilot and an AI fight to keep memory alive in a forgotten war.',
        },
        displayOrder: 0,
      },
    ],
  },
  {
    studioSlug: 'sakura-animation-works',
    slug: 'the-bakers-otherworldly-bakery',
    title: "The Baker's Otherworldly Bakery",
    tagline: 'A washed-up baker is reincarnated into a world that runs on pastries.',
    description:
      'A cozy isekai comedy where bread is magic and the recipe book is a sacred relic. Sweet, silly, and surprisingly strategic.',
    coverImageUrl: 'https://picsum.photos/seed/bakery/800/450',
    category: 'isekai',
    goalAmount: 40_000,
    status: 'live',
    featured: true,
    endsAtDays: 25,
    tiers: [
      {
        title: 'Apprentice',
        description: 'Digital recipe zine.',
        price: 12,
        limitedQuantity: null,
        reward: 'Recipe zine',
        displayOrder: 0,
      },
      {
        title: 'Head Baker',
        description: 'A printed cookbook of in-world recipes.',
        price: 60,
        limitedQuantity: 400,
        reward: 'Printed cookbook',
        displayOrder: 1,
      },
    ],
    ledgers: [
      {
        label: 'Character design',
        amount: 15_000,
        note: 'Cute cast and creatures.',
        displayOrder: 0,
      },
      {
        label: 'Backgrounds',
        amount: 12_000,
        note: 'The bustling otherworld market.',
        displayOrder: 1,
      },
      {
        label: 'Voice acting',
        amount: 13_000,
        note: 'Comedy timing is everything.',
        displayOrder: 2,
      },
    ],
    blocks: [
      {
        type: 'text',
        content: {
          heading: 'About',
          body: 'A feel-good isekai about food, friendship, and second chances.',
        },
        displayOrder: 0,
      },
    ],
  },
  {
    studioSlug: 'neon-forge-studio',
    slug: 'crimson-duel-academy',
    title: 'Crimson Duel Academy',
    tagline: 'Enroll in a school where every friendship is a blades-edge rivalry.',
    description:
      'An action-packed academy anime full of tournaments, secret societies, and one protagonist who refuses to give up.',
    coverImageUrl: 'https://picsum.photos/seed/crimson/800/450',
    category: 'action',
    goalAmount: 60_000,
    status: 'live',
    featured: false,
    endsAtDays: 40,
    tiers: [
      {
        title: 'First Year',
        description: 'Digital badge set.',
        price: 18,
        limitedQuantity: null,
        reward: 'Badge set',
        displayOrder: 0,
      },
      {
        title: 'Duelist',
        description: 'A enamel pin of your house crest.',
        price: 50,
        limitedQuantity: 250,
        reward: 'Enamel pin',
        displayOrder: 1,
      },
    ],
    ledgers: [
      {
        label: 'Fight choreography',
        amount: 25_000,
        note: 'Storyboarded action set pieces.',
        displayOrder: 0,
      },
      {
        label: 'Character animation',
        amount: 25_000,
        note: 'Expressive duelists.',
        displayOrder: 1,
      },
      { label: 'Soundtrack', amount: 1_0000, note: 'Orchestral battle themes.', displayOrder: 2 },
    ],
    blocks: [
      {
        type: 'text',
        content: {
          heading: 'The Academy',
          body: 'Three houses, one tournament, and a secret that could unravel them all.',
        },
        displayOrder: 0,
      },
    ],
  },
  {
    studioSlug: 'sakura-animation-works',
    slug: 'song-of-the-drowned-city',
    title: 'Song of the Drowned City',
    tagline: 'A grief-stricken musician hears a song rising from the sea.',
    description:
      'A slow, emotional drama about memory, mourning, and the city that the tide took. Tissues not included.',
    coverImageUrl: 'https://picsum.photos/seed/drowned/800/450',
    category: 'drama',
    goalAmount: 35_000,
    status: 'live',
    featured: false,
    endsAtDays: 35,
    tiers: [
      {
        title: 'Listener',
        description: 'The original soundtrack.',
        price: 25,
        limitedQuantity: null,
        reward: 'Digital soundtrack',
        displayOrder: 0,
      },
      {
        title: 'Composer',
        description: 'A vinyl press of the score.',
        price: 90,
        limitedQuantity: 200,
        reward: 'Vinyl score',
        displayOrder: 1,
      },
    ],
    ledgers: [
      {
        label: 'Layout and backgrounds',
        amount: 14_000,
        note: 'The drowned cityscapes.',
        displayOrder: 0,
      },
      { label: 'Music production', amount: 12_000, note: 'Strings and piano.', displayOrder: 1 },
      { label: 'Editing', amount: 9_000, note: 'Pacing the silence.', displayOrder: 2 },
    ],
    blocks: [
      {
        type: 'text',
        content: { heading: 'Tone', body: 'Quiet, melancholic, and finally hopeful.' },
        displayOrder: 0,
      },
    ],
  },
  {
    studioSlug: 'neon-forge-studio',
    slug: 'realm-of-the-nine-tails',
    title: 'Realm of the Nine Tails',
    tagline: 'A fox spirit inherits a kingdom and a thousand years of grudges.',
    description:
      'A sweeping fantasy adventure across floating islands, ancient pacts, and a reluctant heir to a dying throne.',
    coverImageUrl: 'https://picsum.photos/seed/ninetails/800/450',
    category: 'fantasy',
    goalAmount: 70_000,
    status: 'live',
    featured: true,
    endsAtDays: 50,
    tiers: [
      {
        title: 'Wanderer',
        description: 'Map of the nine realms.',
        price: 22,
        limitedQuantity: null,
        reward: 'Realm map',
        displayOrder: 0,
      },
      {
        title: 'Heir',
        description: 'An art print of the fox throne.',
        price: 70,
        limitedQuantity: 350,
        reward: 'Art print',
        displayOrder: 1,
      },
    ],
    ledgers: [
      { label: 'Worldbuilding', amount: 28_000, note: 'Creatures and lore.', displayOrder: 0 },
      { label: 'Environment art', amount: 25_000, note: 'Floating islands.', displayOrder: 1 },
      { label: 'Animation', amount: 17_000, note: 'Magic and transformation.', displayOrder: 2 },
    ],
    blocks: [
      {
        type: 'text',
        content: {
          heading: 'World',
          body: 'Nine floating realms, each ruled by a tail of the old fox king.',
        },
        displayOrder: 0,
      },
    ],
  },
  {
    studioSlug: 'sakura-animation-works',
    slug: 'love-letter-to-the-stars',
    title: 'Love Letter to the Stars',
    tagline: 'Two astronomers, one rooftop, and a comet that only returns every century.',
    description:
      'A tender romance about timing, ambition, and the people we almost miss. Set against a summer sky full of wishes.',
    coverImageUrl: 'https://picsum.photos/seed/stars/800/450',
    category: 'romance',
    goalAmount: 30_000,
    status: 'live',
    featured: false,
    endsAtDays: 20,
    tiers: [
      {
        title: 'Wisher',
        description: 'A digital postcard set.',
        price: 14,
        limitedQuantity: null,
        reward: 'Postcard set',
        displayOrder: 0,
      },
      {
        title: 'Stargazer',
        description: 'A star chart printed on soft cotton.',
        price: 55,
        limitedQuantity: 220,
        reward: 'Star chart cloth',
        displayOrder: 1,
      },
    ],
    ledgers: [
      {
        label: 'Character animation',
        amount: 13_000,
        note: 'Subtle, honest performances.',
        displayOrder: 0,
      },
      { label: 'Backgrounds', amount: 9_000, note: 'Night skies and rooftops.', displayOrder: 1 },
      {
        label: 'Score',
        amount: 8_000,
        note: 'A love theme for piano and strings.',
        displayOrder: 2,
      },
    ],
    blocks: [
      {
        type: 'text',
        content: { heading: 'Premise', body: 'Some comets, and some people, you only meet once.' },
        displayOrder: 0,
      },
    ],
  },
  {
    studioSlug: 'neon-forge-studio',
    slug: 'gate-of-the-fallen-hero',
    title: 'Gate of the Fallen Hero',
    tagline: 'The hero died. Now the sidekick has to finish the quest.',
    description:
      'A genre-bending isekai where the chosen one is gone and the quiet support character must step into the light.',
    coverImageUrl: 'https://picsum.photos/seed/gate/800/450',
    category: 'isekai',
    goalAmount: 5_0000,
    status: 'live',
    featured: false,
    endsAtDays: 38,
    tiers: [
      {
        title: 'Sidekick',
        description: 'A digital sticker pack.',
        price: 16,
        limitedQuantity: null,
        reward: 'Sticker pack',
        displayOrder: 0,
      },
      {
        title: 'Hero',
        description: 'A acrylic standee of the fallen hero.',
        price: 65,
        limitedQuantity: 300,
        reward: 'Acrylic standee',
        displayOrder: 1,
      },
    ],
    ledgers: [
      {
        label: 'Action animation',
        amount: 22_000,
        note: 'The final gate battle.',
        displayOrder: 0,
      },
      { label: 'Character design', amount: 15_000, note: 'A reluctant hero.', displayOrder: 1 },
      { label: 'Sound', amount: 13_000, note: 'Epic and intimate.', displayOrder: 2 },
    ],
    blocks: [
      {
        type: 'text',
        content: { heading: 'Twist', body: 'The real quest was the friends we made at the gate.' },
        displayOrder: 0,
      },
    ],
  },
];

const seed = async () => {
  console.log('Seeding categories...');
  const categorySlugs: CategorySlug[] = [
    'popular',
    'isekai',
    'drama',
    'action',
    'fantasy',
    'slice-of-life',
    'mecha',
    'romance',
  ];
  await db
    .insert(categories)
    .values(
      categorySlugs.map((slug, index) => ({
        slug,
        name: CATEGORY_NAMES[slug],
        displayOrder: index,
      })),
    )
    .onConflictDoUpdate({
      target: categories.slug,
      set: { name: sql`excluded.name`, displayOrder: sql`excluded.display_order` },
    });

  console.log('Seeding studios...');
  const studioIds = new Map<string, number>();
  for (const studio of SEED_STUDIOS) {
    const [row] = await db
      .insert(studios)
      .values(studio)
      .onConflictDoUpdate({
        target: studios.clerkUserId,
        set: {
          name: sql`excluded.name`,
          slug: sql`excluded.slug`,
          description: sql`excluded.description`,
          logoUrl: sql`excluded.logo_url`,
          website: sql`excluded.website`,
        },
      })
      .returning({ id: studios.id });
    studioIds.set(studio.slug, row?.id ?? 0);
  }

  for (const project of SEED_PROJECTS) {
    const studioId = studioIds.get(project.studioSlug);
    if (studioId === undefined) {
      throw new Error(`Unknown studio slug: ${project.studioSlug}`);
    }

    console.log(`Seeding project: ${project.slug}`);
    const [projectRow] = await db
      .insert(projects)
      .values({
        studioId,
        slug: project.slug,
        title: project.title,
        tagline: project.tagline,
        description: project.description,
        coverImageUrl: project.coverImageUrl,
        category: project.category,
        goalAmount: project.goalAmount,
        status: project.status,
        featured: project.featured,
        endsAt:
          project.endsAtDays === null
            ? null
            : new Date(Date.now() + project.endsAtDays * 8640_0000),
        currency: 'USD',
      })
      .onConflictDoUpdate({
        target: projects.slug,
        set: {
          title: sql`excluded.title`,
          tagline: sql`excluded.tagline`,
          description: sql`excluded.description`,
          coverImageUrl: sql`excluded.cover_image_url`,
          category: sql`excluded.category`,
          goalAmount: sql`excluded.goal_amount`,
          status: sql`excluded.status`,
          featured: sql`excluded.featured`,
          endsAt: sql`excluded.ends_at`,
        },
      })
      .returning({ id: projects.id });

    const projectId = projectRow?.id;

    if (projectId === undefined) {
      throw new Error(`Failed to insert project: ${project.slug}`);
    }

    await db.delete(tiers).where(eq(tiers.projectId, projectId));
    for (const tier of project.tiers) {
      await db.insert(tiers).values({
        projectId,
        title: tier.title,
        description: tier.description,
        price: tier.price,
        currency: 'USD',
        limitedQuantity: tier.limitedQuantity,
        reward: tier.reward,
        displayOrder: tier.displayOrder,
        active: true,
      });
    }

    await db.delete(ledgers).where(eq(ledgers.projectId, projectId));
    for (const ledger of project.ledgers) {
      await db.insert(ledgers).values({
        projectId,
        label: ledger.label,
        amount: ledger.amount,
        currency: 'USD',
        note: ledger.note,
        displayOrder: ledger.displayOrder,
      });
    }

    await db.delete(projectBlocks).where(eq(projectBlocks.projectId, projectId));
    for (const block of project.blocks) {
      await db.insert(projectBlocks).values({
        projectId,
        type: block.type,
        content: block.content,
        displayOrder: block.displayOrder,
      });
    }
  }

  console.log('Seeding sample pledges...');
  const allTiers = await db.select().from(tiers);
  const sampleBackers = [
    { id: 'seed_backer_1', name: 'Mika' },
    { id: 'seed_backer_2', name: 'Devon' },
    { id: 'seed_backer_3', name: 'Aria' },
  ];
  let pledgeIndex = 0;
  for (const tier of allTiers) {
    if (tier.limitedQuantity !== null && tier.limitedQuantity < 2) {
      continue;
    }
    const backer = sampleBackers[pledgeIndex % sampleBackers.length] ?? sampleBackers[0];
    if (!backer) {
      continue;
    }
    pledgeIndex += 1;
    await db
      .insert(pledges)
      .values({
        tierId: tier.id,
        projectId: tier.projectId,
        backerClerkUserId: backer.id,
        backerName: backer.name,
        amount: tier.price,
        currency: tier.currency,
        reward: tier.reward,
        status: 'confirmed',
        paymentRef: crypto.randomUUID(),
      })
      .onConflictDoNothing();
    await db
      .update(tiers)
      .set({ claimedQuantity: sql`${tiers.claimedQuantity} + 1` })
      .where(eq(tiers.id, tier.id));
  }

  console.log('Seed complete.');
  await pool.end();
};

void (async () => {
  try {
    await seed();
  } catch (error: unknown) {
    console.error(error);
    process.exit(1);
  }
})();
