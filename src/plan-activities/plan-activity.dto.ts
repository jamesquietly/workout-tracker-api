import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePlanActivityDto {
  @IsNumber()
  @IsNotEmpty()
  planId: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsNotEmpty()
  assignedDate: string;
}

export class UpdatePlanActivityDto {
  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  assignedDate?: string;
}
