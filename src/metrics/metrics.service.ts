import { Injectable } from '@nestjs/common';
import {
  Counter,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from 'prom-client';

@Injectable()
export class MetricsService {
  readonly registry: Registry;
  readonly httpRequestsTotal: Counter<string>;
  readonly httpRequestDurationSeconds: Histogram<string>;
  readonly cacheCoursesHits: Counter<string>;
  readonly cacheCoursesMisses: Counter<string>;
  readonly queuePublished: Counter<string>;
  readonly queueConsumed: Counter<string>;

  constructor() {
    this.registry = new Registry();
    collectDefaultMetrics({ register: this.registry });

    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total de requisições HTTP',
      labelNames: ['method', 'route', 'status'],
      registers: [this.registry],
    });

    this.httpRequestDurationSeconds = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duração das requisições HTTP em segundos',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.registry],
    });

    this.cacheCoursesHits = new Counter({
      name: 'cache_courses_hits_total',
      help: 'Hits de cache na listagem de cursos',
      registers: [this.registry],
    });

    this.cacheCoursesMisses = new Counter({
      name: 'cache_courses_misses_total',
      help: 'Misses de cache na listagem de cursos',
      registers: [this.registry],
    });

    this.queuePublished = new Counter({
      name: 'queue_events_published_total',
      help: 'Eventos publicados na fila',
      labelNames: ['type'],
      registers: [this.registry],
    });

    this.queueConsumed = new Counter({
      name: 'queue_events_consumed_total',
      help: 'Eventos consumidos da fila',
      labelNames: ['type'],
      registers: [this.registry],
    });
  }
}
