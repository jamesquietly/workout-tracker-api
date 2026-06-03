import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanActivity } from 'src/entities/PlanActivity';
import { CreatePlanActivityDto, UpdatePlanActivityDto } from './plan-activity.dto';
import { CurrentUserPayload } from 'src/decorators/current-user.decorator';

@Injectable()
export class PlanActivityService {
  constructor(
    @InjectRepository(PlanActivity)
    private readonly planActivityRepository: Repository<PlanActivity>,
  ) {}

  async findById(id: number) {
    const planActivity = await this.planActivityRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!planActivity) {
      throw new NotFoundException('Plan activity not found');
    }
    return planActivity;
  }

  checkOwnership(planActivity: PlanActivity, userId: number) {
    if (planActivity.user.id !== userId) {
      throw new BadRequestException('Only owner can perform this action');
    }
  }

  getPlanActivitiesByUserId(userId: number) {
    return this.planActivityRepository.find({
      where: { user: { id: userId } },
    });
  }
  
  createPlanActivity(planActivityData: CreatePlanActivityDto, user: CurrentUserPayload) {
    const planActivity = this.planActivityRepository.create({
      ...planActivityData,
      user: { id: user.userId },
    });
    return this.planActivityRepository.save(planActivity);
  }
  
  async updatePlanActivity(id: number, updatePlanActivityDto: UpdatePlanActivityDto, user: CurrentUserPayload) {
    const planActivity = await this.findById(id);
    this.checkOwnership(planActivity, user.userId);
    if (planActivity) {
      await this.planActivityRepository.update(id, updatePlanActivityDto);
    }
    return this.findById(id);
  }

  async deletePlanActivity(id: number, user: CurrentUserPayload) {
    const planActivity = await this.findById(id);
    this.checkOwnership(planActivity, user.userId);
    if (planActivity) {
      await this.planActivityRepository.softDelete(id);
    }
    return this.planActivityRepository.findOne({ where: { id }, withDeleted: true });
  }
}
