import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterBlogsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1; // Pagina predefinita

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 10; // Numero di risultati per pagina (default 10, max 100)

  @IsOptional()
  @IsString()
  search?: string; // Testo per filtrare per titolo o contenuto
}
