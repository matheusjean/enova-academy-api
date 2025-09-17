import { CoursesService } from '../../src/courses/courses.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PrismaServiceMock } from '../mocks/prisma.service';
import { CacheMock } from '../mocks/cache';
import { MetricsService } from '../../src/metrics/metrics.service';
import { MetricsServiceMock } from '../mocks/metrics.service';

describe('CoursesService', () => {
  let service: CoursesService;
  let prisma: PrismaServiceMock;
  let cache: CacheMock;

  beforeEach(() => {
    prisma = new PrismaServiceMock();
    cache = new CacheMock();
    service = new CoursesService(
      prisma as unknown as PrismaService,
      cache as any,
      new MetricsServiceMock() as unknown as MetricsService,
    );
  });

  it('should return MISS then HIT', async () => {
    prisma.course.findMany.mockResolvedValue([
      { id: 'c1', title: 'Node', slug: 'node', price_cents: 100 },
    ]);
    prisma.course.count.mockResolvedValue(1);

    const miss = await service.list({ page: 1, limit: 10, q: 'node' });
    expect(miss.items).toHaveLength(1);

    prisma.course.findMany.mockResolvedValue([]);
    const hit = await service.list({ page: 1, limit: 10, q: 'node' });
    expect(hit.items).toHaveLength(1);
  });
});
