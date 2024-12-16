import { GalleryEntity } from 'src/modules/gallery/entities/gallery.entity';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('galleryComments')
export class GalleryCommentsEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  author: string;

  @Column()
  text: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => GalleryEntity, (gallery) => gallery.comments, {
    onDelete: 'CASCADE',
  })
  gallery: GalleryEntity;
}
