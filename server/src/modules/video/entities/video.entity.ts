import { AudioCommentsEntity } from 'src/modules/comments/entities/audioComment.entity';
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';

@Entity('video')
export class VideoEntity {
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

  //   @OneToMany(() => AudioCommentsEntity, (comment) => comment.audio)
  //   comments: AudioCommentsEntity[];

  @CreateDateColumn()
  created_at: Date;
}
