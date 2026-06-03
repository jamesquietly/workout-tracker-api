import { Controller } from '@nestjs/common';
import { PlanActivityService } from './plan-activity.service';

@Controller('plan-activities')
export class PlanActivityController {
  constructor(private readonly planActivityService: PlanActivityService) {}
}
