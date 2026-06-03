import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PlanActivityService } from './plan-activity.service';
import { CurrentUser, type CurrentUserPayload } from 'src/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreatePlanActivityDto, UpdatePlanActivityDto } from './plan-activity.dto';

@Controller('plan-activities')
export class PlanActivityController {
  constructor(private readonly planActivityService: PlanActivityService) { }

  @Get('user-plan-activities')
  @UseGuards(JwtAuthGuard)
  getUserPlanActivities(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.planActivityService.getPlanActivitiesByUserId(currentUser.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createPlanActivity(@Body() createPlanActivityDto: CreatePlanActivityDto, @CurrentUser() currentUser: CurrentUserPayload) {
    return this.planActivityService.createPlanActivity({
      ...createPlanActivityDto,
      userId: currentUser.userId,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updatePlanActivity(@Param('id') id: number, @Body() updatePlanActivityDto: UpdatePlanActivityDto) {
    return this.planActivityService.updatePlanActivity(id, updatePlanActivityDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deletePlanActivity(@Param('id') id: number) {
    return this.planActivityService.deletePlanActivity(id);
  }
}
