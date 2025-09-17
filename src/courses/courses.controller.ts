import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private service: CoursesService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(
    @Body()
    body: {
      title: string;
      slug: string;
      price_cents: number;
      capacity?: number;
    },
  ) {
    return this.service.create(body);
  }

  @Get()
  list(@Query() query: PaginationQueryDto) {
    const { page = 1, limit = 10, q, min_price, max_price } = query as any;
    return this.service.list({ page, limit, q, min_price, max_price });
  }

  @Get(':idOrSlug')
  detail(@Param('idOrSlug') idOrSlug: string) {
    return this.service.getByIdOrSlug(idOrSlug);
  }
}
