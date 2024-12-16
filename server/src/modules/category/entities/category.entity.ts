import { AudioEntity } from 'src/modules/audio/entities/audio.entity';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToMany } from 'typeorm';

@Entity('category')
export class CategoryEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  title: string;

  @Column({ type: 'int', unique: true })
  sort: number;

  @ManyToMany(() => AudioEntity, (audio) => audio.categories)
  audios: AudioEntity[];
}
