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

@Entity()
export class Plan {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'text' })
  public title: string;

  @Column({ type: 'text' })
  public description: string;

  @CreateDateColumn()
  public created: Date;

  @UpdateDateColumn()
  public modified: Date;

  @DeleteDateColumn()
  public deleted: Date;

  @ManyToOne(() => User)
  public user: User;
}
