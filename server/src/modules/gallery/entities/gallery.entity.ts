import { GalleryCommentsEntity } from 'src/modules/comments/entities/galleryComments.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('gallery')
export class GalleryEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;
  @Column()
  originalName: string;
  @Column()
  path: string;
  @Column()
  mimetype: string;
  @Column()
  size: string;
  @Column({ nullable: true })
  desc: string;
  @Column({ nullable: true })
  like: number;
  @Column({ nullable: true })
  view: number;
  @OneToMany(() => GalleryCommentsEntity, (comment) => comment.gallery)
  comments: GalleryCommentsEntity[];
}
