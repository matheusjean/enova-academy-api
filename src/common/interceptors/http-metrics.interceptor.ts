import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { MetricsService } from '../../metrics/metrics.service';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const http = ctx.switchToHttp();
    const req = http.getRequest<Request>() as any;
    const res = http.getResponse<Response>() as any;

    if (req?.route?.path === '/metrics') {
      return next.handle();
    }

    const method = (req?.method || 'GET').toUpperCase();
    const route = req?.route?.path || req?.originalUrl || req?.url || 'unknown';
    const start = process.hrtime.bigint();

    return next.handle().pipe(
      tap({
        next: () => {
          const status = String(res?.statusCode ?? 200);
          this.metrics.httpRequestsTotal.labels(method, route, status).inc();
          const end = process.hrtime.bigint();
          const seconds = Number(end - start) / 1e9;
          this.metrics.httpRequestDurationSeconds
            .labels(method, route, status)
            .observe(seconds);
        },
        error: () => {
          const status = String(res?.statusCode ?? 500);
          this.metrics.httpRequestsTotal.labels(method, route, status).inc();
          const end = process.hrtime.bigint();
          const seconds = Number(end - start) / 1e9;
          this.metrics.httpRequestDurationSeconds
            .labels(method, route, status)
            .observe(seconds);
        },
      }),
    );
  }
}
