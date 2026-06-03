import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';
import { User } from './User';
import { Plan } from './Plan';

@Entity()
export class PlanActivity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'text', nullable: true })
  public notes: string;

  @Column({ type: 'timestamptz' })
  public assignedDate: Date;

  @CreateDateColumn()
  public created: Date;

  @UpdateDateColumn()
  public modified: Date;

  @DeleteDateColumn()
  public deleted: Date;

  @ManyToOne(() => User)
  public user: User;

  @ManyToOne(() => Plan)
  public plan: Plan;
}
