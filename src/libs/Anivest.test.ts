import { describe, expect, it, vi } from 'vitest';
import { getBackedProjectsByBacker, getBackersForProject } from '@/libs/Anivest';

const { mainRows, statsRows, mockStudio } = vi.hoisted(() => ({
  mainRows: [] as Record<string, unknown>[],
  statsRows: [] as Record<string, unknown>[],
  mockStudio: { id: 10, name: 'Test Studio', slug: 'test-studio', logoUrl: '' },
}));

// eslint-disable-next-line vitest/prefer-import-in-mock -- vitest types reject import() as the first argument
vi.mock('@/libs/DB', async () => {
  await import('@/libs/DB');

  const chain = {
    innerJoin: () => chain,
    where: () => chain,
    orderBy: () => mainRows,
    groupBy: () => statsRows,
  };
  const fromFn = vi.fn<() => typeof chain>(() => chain);
  const selectFn = vi.fn<() => { from: typeof fromFn }>(() => ({ from: fromFn }));

  return {
    db: {
      select: selectFn,
      query: {
        studios: {
          findFirst: vi.fn<() => typeof mockStudio>(() => mockStudio),
        },
      },
    },
  };
});

describe('Anivest pledge queries', () => {
  describe('backed projects for a backer', () => {
    it('groups pledges by project and sums the total', async () => {
      mainRows.length = 0;
      mainRows.push(
        {
          project: { id: 1, slug: 'p1', title: 'Project One', studioId: 10 },
          pledge: {
            id: 1,
            tierId: 1,
            projectId: 1,
            backerClerkUserId: 'u1',
            backerName: 'Alice',
            amount: 50,
            currency: 'USD',
            reward: 'Reward A',
            status: 'confirmed',
            createdAt: new Date('2024-01-01'),
          },
        },
        {
          project: { id: 1, slug: 'p1', title: 'Project One', studioId: 10 },
          pledge: {
            id: 2,
            tierId: 2,
            projectId: 1,
            backerClerkUserId: 'u1',
            backerName: 'Alice',
            amount: 25,
            currency: 'USD',
            reward: 'Reward B',
            status: 'confirmed',
            createdAt: new Date('2024-02-01'),
          },
        },
      );
      statsRows.length = 0;

      const result = await getBackedProjectsByBacker('u1');

      expect(result).toHaveLength(1);
      const [first] = result;

      if (!first) {
        throw new Error('Expected a backed project');
      }

      expect(first.id).toBe(1);
      expect(first.pledges).toHaveLength(2);
      expect(first.totalAmount).toBe(75);
    });

    it('returns an empty list when the backer has no pledges', async () => {
      mainRows.length = 0;
      statsRows.length = 0;

      const result = await getBackedProjectsByBacker('u2');

      expect(result).toHaveLength(0);
    });
  });

  describe('backers for a project', () => {
    it('returns backers joined with their tier title', async () => {
      mainRows.length = 0;
      mainRows.push(
        {
          pledge: {
            id: 1,
            tierId: 1,
            projectId: 1,
            backerClerkUserId: 'u1',
            backerName: 'Alice',
            amount: 50,
            currency: 'USD',
            reward: 'Reward A',
            status: 'confirmed',
            createdAt: new Date('2024-01-01'),
          },
          tierTitle: 'Tier A',
        },
        {
          pledge: {
            id: 2,
            tierId: 2,
            projectId: 1,
            backerClerkUserId: 'u2',
            backerName: 'Bob',
            amount: 100,
            currency: 'USD',
            reward: 'Reward B',
            status: 'confirmed',
            createdAt: new Date('2024-02-01'),
          },
          tierTitle: 'Tier B',
        },
      );

      const result = await getBackersForProject(1);

      expect(result).toHaveLength(2);
      const [alice, bob] = result;

      if (!alice || !bob) {
        throw new Error('Expected two backers');
      }

      expect(alice.backerName).toBe('Alice');
      expect(alice.tierTitle).toBe('Tier A');
      expect(bob.backerName).toBe('Bob');
      expect(bob.tierTitle).toBe('Tier B');
    });
  });
});
