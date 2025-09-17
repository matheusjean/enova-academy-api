export class MetricsServiceMock {
  registry = { metrics: () => '# mock' } as any;
  httpRequestsTotal = { labels: () => ({ inc: () => {} }) } as any;
  httpRequestDurationSeconds = { labels: () => ({ observe: () => {} }) } as any;
  cacheCoursesHits = { inc: () => {} } as any;
  cacheCoursesMisses = { inc: () => {} } as any;
  queuePublished = { labels: () => ({ inc: () => {} }) } as any;
  queueConsumed = { labels: () => ({ inc: () => {} }) } as any;
}
