import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({name: "match_history"})
export class MatchHistoryEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roomName: string;

  @Column()
  is_matched: boolean;
}