import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from 'src/entities/Plan';
import { CreatePlanDto, UpdatePlanDto } from './plan.dto';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {}

  async findById(id: number) {
    const plan = await this.planRepository.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }
    return plan;
  }

  findByUserId(userId: number) {
    return this.planRepository.find({ where: { user: { id: userId } } });
  }

  createPlan(createPlanDto: CreatePlanDto) {
    const plan = this.planRepository.create({
      title: createPlanDto.title,
      description: createPlanDto.description,
      user: { id: createPlanDto.userId },
    });
    return this.planRepository.save(plan);
  }

  async updatePlan(id: number, updatePlanDto: UpdatePlanDto) {
    const plan = await this.findById(id);
    if (plan) {
      await this.planRepository.update(plan.id, updatePlanDto);
    }

    return this.findById(id);
  }

  async deletePlan(id: number) {
    const plan = await this.findById(id);
    if (plan) {
      await this.planRepository.softDelete({ id: plan.id });
    }

    return this.planRepository.findOne({ where: { id }, withDeleted: true });
  }
}
