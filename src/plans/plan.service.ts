import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from 'src/entities/Plan';
import { CreatePlanDto, UpdatePlanDto } from './plan.dto';
import { CurrentUserPayload } from 'src/decorators/current-user.decorator';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {}

  async findById(id: number) {
    const plan = await this.planRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }
    return plan;
  }

  checkPlanOwnership(plan: Plan, currentUser: CurrentUserPayload) {
    if (plan.user.id !== currentUser.userId) {
      throw new BadRequestException('Only owner can perform this action');
    }
  }

  findByUserId(userId: number) {
    return this.planRepository.find({
      where: { user: { id: userId } },
      order: { created: 'ASC' },
    });
  }

  createPlan(createPlanDto: CreatePlanDto, user: CurrentUserPayload) {
    const plan = this.planRepository.create({
      title: createPlanDto.title,
      description: createPlanDto.description,
      user: { id: user.userId },
    });
    return this.planRepository.save(plan);
  }

  async updatePlan(
    id: number,
    updatePlanDto: UpdatePlanDto,
    user: CurrentUserPayload,
  ) {
    const plan = await this.findById(id);
    this.checkPlanOwnership(plan, user);
    if (plan) {
      await this.planRepository.update(plan.id, updatePlanDto);
    }

    return this.findById(id);
  }

  async deletePlan(id: number, user: CurrentUserPayload) {
    const plan = await this.findById(id);
    this.checkPlanOwnership(plan, user);
    if (plan) {
      await this.planRepository.softDelete({ id: plan.id });
    }

    return this.planRepository.findOne({ where: { id }, withDeleted: true });
  }
}
