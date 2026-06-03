import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanActivity } from 'src/entities/PlanActivity';
import { CreatePlanActivityDto, UpdatePlanActivityDto } from './plan-activity.dto';

@Injectable()
export class PlanActivityService {
  constructor(
    @InjectRepository(PlanActivity)
    private readonly planActivityRepository: Repository<PlanActivity>,
  ) {}

  async findById(id: number) {
    const planActivity = await this.planActivityRepository.findOne({
      where: { id },
    });
    if (!planActivity) {
      throw new NotFoundException('Plan activity not found');
    }
    return planActivity;
  }

  getPlanActivitiesByUserId(userId: number) {
    return this.planActivityRepository.find({
      where: { user: { id: userId } },
    });
  }
  
  createPlanActivity(planActivityData: CreatePlanActivityDto) {
    const planActivity = this.planActivityRepository.create({
      ...planActivityData,
      user: { id: planActivityData.userId },
    });
    return this.planActivityRepository.save(planActivity);
  }
  
  async updatePlanActivity(id: number, updatePlanActivityDto: UpdatePlanActivityDto) {
    const planActivity = await this.findById(id);
    if (planActivity) {
      await this.planActivityRepository.update(id, updatePlanActivityDto);
    }
    return this.findById(id);
  }

  async deletePlanActivity(id: number) {
    const planActivity = await this.findById(id);
    if (planActivity) {
      await this.planActivityRepository.softDelete(id);
    }
    return this.planActivityRepository.findOne({ where: { id }, withDeleted: true });
  }
}
