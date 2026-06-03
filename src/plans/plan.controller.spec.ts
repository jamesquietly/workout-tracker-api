import { AuthModule } from 'src/auth/auth.module';
import { PlanModule } from './plan.module';
import { PlanService } from './plan.service';
import { UserService } from 'src/users/user.service';
import { createTestModule, TestingInstance } from 'src/utils/test-utils';
import request from 'supertest';

describe('PlanController (integration with test DB)', () => {
  let testingInstance: TestingInstance;
  let planService: PlanService;
  let userService: UserService;

  beforeAll(async () => {
    testingInstance = await createTestModule({
      imports: [PlanModule, AuthModule],
    });

    planService = testingInstance.module.get<PlanService>(PlanService);
    userService = testingInstance.module.get<UserService>(UserService);
  });

  afterAll(async () => {
    await testingInstance.app.close();
  });

  describe('POST /plans', () => {
    it('should create a plan when authenticated', async () => {
      const { cookies } = await testingInstance.registerAndLogin(
        'post-create-plan@example.com',
      );

      const res = await request(testingInstance.server)
        .post('/plans')
        .set('Cookie', cookies)
        .send({ title: 'My Plan', description: 'A great plan' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('My Plan');
      expect(res.body.description).toBe('A great plan');
    });

    it('should return 401 when not authenticated', async () => {
      await request(testingInstance.server)
        .post('/plans')
        .send({ title: 'My Plan', description: 'A great plan' })
        .expect(401);
    });
  });

  describe('GET /plans/user-plans', () => {
    it('should return empty array when user has no plans', async () => {
      const { cookies } = await testingInstance.registerAndLogin('get-empty-plans@example.com');

      const res = await request(testingInstance.server)
        .get('/plans/user-plans')
        .set('Cookie', cookies)
        .expect(200);

      expect(res.body).toEqual([]);
    });

    it('should return user plans when authenticated', async () => {
      const { cookies, user } = await testingInstance.registerAndLogin(
        'get-user-plans@example.com',
      );
      await planService.createPlan({
        title: 'My Plan',
        description: 'Desc',
        userId: user.id,
      });

      const res = await request(testingInstance.server)
        .get('/plans/user-plans')
        .set('Cookie', cookies)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe('My Plan');
      expect(res.body[0].description).toBe('Desc');
    });

    it('should not return plans belonging to other users', async () => {
      const userA = await testingInstance.registerAndLogin('get-other-user-a@example.com');
      await planService.createPlan({
        title: 'User A Plan',
        description: 'Desc',
        userId: userA.user.id,
      });

      const userB = await testingInstance.registerAndLogin('get-other-user-b@example.com');

      const res = await request(testingInstance.server)
        .get('/plans/user-plans')
        .set('Cookie', userB.cookies)
        .expect(200);

      expect(res.body).toEqual([]);
    });

    it('should return 401 when not authenticated', async () => {
      await request(testingInstance.server)
        .get('/plans/user-plans')
        .expect(401);
    });
  });

  describe('PATCH /plans/:id', () => {
    it('should update a plan when authenticated', async () => {
      const { cookies, user } = await testingInstance.registerAndLogin(
        'patch-update-plan@example.com',
      );
      const plan = await planService.createPlan({
        title: 'Original',
        description: 'Original desc',
        userId: user.id,
      });

      const res = await request(testingInstance.server)
        .patch(`/plans/${plan.id}`)
        .set('Cookie', cookies)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(res.body.title).toBe('Updated Title');
      expect(res.body.description).toBe('Original desc');
    });

    it('should return 401 when not authenticated', async () => {
      await request(testingInstance.server)
        .patch('/plans/1')
        .send({ title: 'Updated' })
        .expect(401);
    });
  });

  describe('DELETE /plans/:id', () => {
    it('should delete a plan when authenticated', async () => {
      const { cookies, user } = await testingInstance.registerAndLogin(
        'delete-my-plan@example.com',
      );
      const plan = await planService.createPlan({
        title: 'To Delete',
        description: 'Desc',
        userId: user.id,
      });

      await request(testingInstance.server)
        .delete(`/plans/${plan.id}`)
        .set('Cookie', cookies)
        .expect(200);

      const deletedPlan = await planService.findById(plan.id);
      expect(deletedPlan).toBeNull();
    });

    it('should return 401 when not authenticated', async () => {
      await request(testingInstance.server).delete('/plans/1').expect(401);
    });
  });
});
