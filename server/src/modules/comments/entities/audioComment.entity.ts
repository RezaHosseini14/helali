import { AudioEntity } from 'src/modules/audio/entities/audio.entity';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('audioComments')
export class AudioCommentsEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  author: string;

  @Column()
  text: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'published', 'rejected'],
    default: 'pending',
  })
  status: 'pending' | 'published' | 'rejected';

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => AudioEntity, (audio) => audio.comments, {
    onDelete: 'CASCADE',
  })
  audio: AudioEntity;
}
