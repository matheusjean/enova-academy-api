import { Injectable, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async create(data: {
    title: string;
    slug: string;
    price_cents: number;
    capacity?: number | null;
  }) {
    const course = await this.prisma.course.create({ data });
    await this.cache.del('courses:list:*');
    return course;
  }

  async list(params: {
    page: number;
    limit: number;
    q?: string;
    min_price?: number;
    max_price?: number;
  }) {
    const { page, limit, q, min_price, max_price } = params;

    const key = `courses:list:${page}:${limit}:${q ?? ''}:${min_price ?? ''}:${max_price ?? ''}`;
    const cached = await this.cache.get<any>(key);
    if (cached) {
      this.logger.log(`CACHE HIT ${key}`);
      return cached;
    }

    const where: any = {};
    if (q)
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
      ];
    if (min_price !== undefined)
      where.price_cents = { ...(where.price_cents || {}), gte: min_price };
    if (max_price !== undefined)
      where.price_cents = { ...(where.price_cents || {}), lte: max_price };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.course.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.course.count({ where }),
    ]);

    const payload = { items, total, page, limit };
    await this.cache.set(key, payload, 30_000);
    this.logger.log(`CACHE MISS ${key}`);
    return payload;
  }

  getByIdOrSlug(idOrSlug: string) {
    return this.prisma.course.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    });
  }
}
