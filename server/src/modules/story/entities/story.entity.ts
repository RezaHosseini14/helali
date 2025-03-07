import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('story')
export class StoryEntity {
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
}

// id: number;
// content: string;
// type: 'image' | 'video';
// thumbnail: string;
// title: string;
