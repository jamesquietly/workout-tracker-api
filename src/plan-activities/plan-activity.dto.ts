import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePlanActivityDto {
  @IsNumber()
  @IsNotEmpty()
  planId: number;
  
  @IsString()
  @IsNotEmpty()
  notes: string;
  
  @IsDate()
  @IsNotEmpty()
  assignedDate: Date;
}

export class UpdatePlanActivityDto {
  @IsString()
  @IsOptional()
  notes?: string;
  
  @IsDate()
  @IsOptional()
  assignedDate?: Date;
}
