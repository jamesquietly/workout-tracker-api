import { Module } from '@nestjs/common';
import { PlanActivityController } from './plan-activity.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanActivity } from 'src/entities/PlanActivity';
import { PlanActivityService } from './plan-activity.service';

@Module({
  imports: [TypeOrmModule.forFeature([PlanActivity])],
  controllers: [PlanActivityController],
  providers: [PlanActivityService],
  exports: [PlanActivityService],
})
export class PlanActivityModule {}
