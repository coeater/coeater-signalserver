import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity({name: "stage"})
export class StageEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  leftKo: string;

  @Column()
  rightKo: string;

  @Column()
  leftEn: string;

  @Column()
  rightEn: string;
}