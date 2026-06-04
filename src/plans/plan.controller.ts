import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PlanService } from './plan.service';
import {
  CurrentUser,
  type CurrentUserPayload,
} from 'src/decorators/current-user.decorator';
import { CreatePlanDto, UpdatePlanDto } from './plan.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Get('user-plans')
  @UseGuards(JwtAuthGuard)
  findUserPlans(@CurrentUser() user: CurrentUserPayload) {
    return this.planService.findByUserId(user.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createPlan(
    @Body() createPlanDto: CreatePlanDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.planService.createPlan(createPlanDto, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updatePlan(
    @Param('id') id: number,
    @Body() updatePlanDto: UpdatePlanDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.planService.updatePlan(id, updatePlanDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deletePlan(@Param('id') id: number, @CurrentUser() user: CurrentUserPayload) {
    return this.planService.deletePlan(id, user);
  }
}
