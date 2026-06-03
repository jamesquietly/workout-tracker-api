import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlanAndActivites1780522877288 implements MigrationInterface {
  name = 'AddPlanAndActivites1780522877288';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "plan" ("id" SERIAL NOT NULL, "title" text NOT NULL, "description" text NOT NULL, "created" TIMESTAMP NOT NULL DEFAULT now(), "modified" TIMESTAMP NOT NULL DEFAULT now(), "deleted" TIMESTAMP, "user_id" integer, CONSTRAINT "PK_54a2b686aed3b637654bf7ddbb3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "plan_activity" ("id" SERIAL NOT NULL, "notes" text, "assigned_date" TIMESTAMP WITH TIME ZONE NOT NULL, "created" TIMESTAMP NOT NULL DEFAULT now(), "modified" TIMESTAMP NOT NULL DEFAULT now(), "deleted" TIMESTAMP, "user_id" integer, "plan_id" integer, CONSTRAINT "PK_00cb65642d534b808c35bb2f707" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan" ADD CONSTRAINT "FK_1b04c143d25a1db138b529a694d" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_activity" ADD CONSTRAINT "FK_3c9493fd88030eaa1e40b96ed2f" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_activity" ADD CONSTRAINT "FK_ff2c7bad86f87884126491d6e29" FOREIGN KEY ("plan_id") REFERENCES "plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "plan_activity" DROP CONSTRAINT "FK_ff2c7bad86f87884126491d6e29"`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_activity" DROP CONSTRAINT "FK_3c9493fd88030eaa1e40b96ed2f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan" DROP CONSTRAINT "FK_1b04c143d25a1db138b529a694d"`,
    );
    await queryRunner.query(`DROP TABLE "plan_activity"`);
    await queryRunner.query(`DROP TABLE "plan"`);
  }
}
