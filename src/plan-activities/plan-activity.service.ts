import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanActivity } from 'src/entities/PlanActivity';

@Injectable()
export class PlanActivityService {
  constructor(
    @InjectRepository(PlanActivity)
    private readonly planActivityRepository: Repository<PlanActivity>,
  ) {}
}
