import { CategoryEntity } from 'src/modules/category/entities/category.entity';
import { AudioCommentsEntity } from 'src/modules/comments/entities/audioComment.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinTable,
  ManyToMany,
} from 'typeorm';

@Entity('audio')
export class AudioEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  title: string;

  @Column()
  originalName: string;

  @Column()
  path: string;

  @Column()
  mimetype: string;

  @Column()
  size: string;

  @Column()
  text: string;

  @Column()
  posterOriginalName: string;

  @Column()
  posterPath: string;

  @Column()
  posterMimetype: string;

  @Column()
  posterSize: string;

  @Column({ default: 0, nullable: true })
  like: number;

  @Column({ default: 0, nullable: true })
  view: number;

  @OneToMany(() => AudioCommentsEntity, (comment) => comment.audio)
  comments: AudioCommentsEntity[];

  @CreateDateColumn()
  created_at: Date;

  @ManyToMany(() => CategoryEntity, (category) => category.audios)
  @JoinTable({
    name: 'audioCategories',
    joinColumn: {
      name: 'audio_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'id',
    },
  })
  categories: CategoryEntity[];
}
