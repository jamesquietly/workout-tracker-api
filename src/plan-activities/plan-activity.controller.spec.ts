import { AuthModule } from 'src/auth/auth.module';
import { PlanActivityModule } from './plan-activity.module';
import { PlanModule } from 'src/plans/plan.module';
import { PlanActivityService } from './plan-activity.service';
import { PlanService } from 'src/plans/plan.service';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { createTestModule, TestingInstance } from 'src/utils/test-utils';
import request from 'supertest';

describe('PlanActivityController (integration with test DB)', () => {
  let testingInstance: TestingInstance;
  let planActivityService: PlanActivityService;
  let planService: PlanService;

  beforeAll(async () => {
    testingInstance = await createTestModule({
      imports: [PlanActivityModule, PlanModule, AuthModule],
    });

    planActivityService = testingInstance.module.get<PlanActivityService>(PlanActivityService);
    planService = testingInstance.module.get<PlanService>(PlanService);

    const dataSource = testingInstance.module.get<DataSource>(getDataSourceToken());
    await dataSource.query('TRUNCATE plan_activity, plan, "user" CASCADE');
  });

  afterAll(async () => {
    await testingInstance.app.close();
  });

  describe('POST /plan-activities', () => {
    it('should create a plan activity when authenticated', async () => {
      const { cookies, user } = await testingInstance.registerAndLogin(
        'post-create-plan-activity@example.com',
      );
      const plan = await planService.createPlan(
        {
          title: 'Test Plan',
          description: 'Desc',
        },
        { userId: user.id, email: user.email },
      );

      const res = await request(testingInstance.server)
        .post('/plan-activities')
        .set('Cookie', cookies)
        .send({
          planId: plan.id,
          notes: 'Test activity',
          assignedDate: new Date().toISOString(),
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.notes).toBe('Test activity');
    });

    it('should return 401 when not authenticated', async () => {
      await request(testingInstance.server)
        .post('/plan-activities')
        .send({
          planId: 1,
          notes: 'Test',
          assignedDate: new Date().toISOString(),
        })
        .expect(401);
    });
  });

  describe('GET /plan-activities/user-plan-activities', () => {
    it('should return empty array when user has no plan activities', async () => {
      const { cookies } = await testingInstance.registerAndLogin(
        'get-empty-plan-activities@example.com',
      );

      const res = await request(testingInstance.server)
        .get('/plan-activities/user-plan-activities')
        .set('Cookie', cookies)
        .expect(200);

      expect(res.body).toEqual([]);
    });

    it('should return user plan activities when authenticated', async () => {
      const { cookies, user } = await testingInstance.registerAndLogin(
        'get-user-plan-activities@example.com',
      );
      const plan = await planService.createPlan(
        {
          title: 'Plan',
          description: 'Desc',
        },
        { userId: user.id, email: user.email },
      );
      await planActivityService.createPlanActivity({
        planId: plan.id,
        notes: 'Activity item',
        assignedDate: new Date(),
      }, { userId: user.id, email: user.email });

      const res = await request(testingInstance.server)
        .get('/plan-activities/user-plan-activities')
        .set('Cookie', cookies)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].notes).toBe('Activity item');
    });

    it('should not return plan activities belonging to other users', async () => {
      const userA = await testingInstance.registerAndLogin('get-other-activity-a@example.com');
      const planA = await planService.createPlan(
        {
          title: 'Plan A',
          description: 'Desc',
        },
        { userId: userA.user.id, email: userA.user.email },
      );
      await planActivityService.createPlanActivity({
        planId: planA.id,
        notes: 'User A activity',
        assignedDate: new Date(),
      }, { userId: userA.user.id, email: userA.user.email });

      const userB = await testingInstance.registerAndLogin('get-other-activity-b@example.com');

      const res = await request(testingInstance.server)
        .get('/plan-activities/user-plan-activities')
        .set('Cookie', userB.cookies)
        .expect(200);

      expect(res.body).toEqual([]);
    });

    it('should return 401 when not authenticated', async () => {
      await request(testingInstance.server)
        .get('/plan-activities/user-plan-activities')
        .expect(401);
    });
  });

  describe('PATCH /plan-activities/:id', () => {
    it('should update a plan activity when authenticated', async () => {
      const { cookies, user } = await testingInstance.registerAndLogin(
        'patch-update-pa@example.com',
      );
      const plan = await planService.createPlan(
        {
          title: 'Plan',
          description: 'Desc',
        },
        { userId: user.id, email: user.email },
      );
      const activity = await planActivityService.createPlanActivity({
        planId: plan.id,
        notes: 'Original notes',
        assignedDate: new Date(),
      }, { userId: user.id, email: user.email });

      const res = await request(testingInstance.server)
        .patch(`/plan-activities/${activity.id}`)
        .set('Cookie', cookies)
        .send({ notes: 'Updated notes' })
        .expect(200);

      expect(res.body.notes).toBe('Updated notes');
    });

    it('should return 401 when not authenticated', async () => {
      await request(testingInstance.server)
        .patch('/plan-activities/1')
        .send({ notes: 'Updated' })
        .expect(401);
    });

    it('should return 404 when plan activity does not exist', async () => {
      const { cookies } = await testingInstance.registerAndLogin('patch-nonexistent-pa@example.com');

      await request(testingInstance.server)
        .patch('/plan-activities/99999')
        .set('Cookie', cookies)
        .send({ notes: 'Updated' })
        .expect(404);
    });
  });

  describe('DELETE /plan-activities/:id', () => {
    it('should delete a plan activity when authenticated', async () => {
      const { cookies, user } = await testingInstance.registerAndLogin(
        'delete-pa@example.com',
      );
      const plan = await planService.createPlan(
        {
          title: 'Plan',
          description: 'Desc',
        },
        { userId: user.id, email: user.email },
      );
      const activity = await planActivityService.createPlanActivity({
        planId: plan.id,
        notes: 'To delete',
        assignedDate: new Date(),
      }, { userId: user.id, email: user.email });

      const res = await request(testingInstance.server)
        .delete(`/plan-activities/${activity.id}`)
        .set('Cookie', cookies)
        .expect(200);

      expect(res.body.id).toBe(activity.id);
      expect(res.body.deleted).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      await request(testingInstance.server).delete('/plan-activities/1').expect(401);
    });

    it('should return 404 when plan activity does not exist', async () => {
      const { cookies } = await testingInstance.registerAndLogin('delete-nonexistent-pa@example.com');

      await request(testingInstance.server)
        .delete('/plan-activities/99999')
        .set('Cookie', cookies)
        .expect(404);
    });
  });
});
