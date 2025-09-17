import { IsInt, IsOptional, IsString, Min } from 'class-validator';
export class PaginationQueryDto {
  @IsOptional() @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @IsInt() @Min(1) limit?: number = 10;
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsInt() min_price?: number;
  @IsOptional() @IsInt() max_price?: number;
}
