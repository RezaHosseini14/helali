import type { ICategory } from './category';
import type { IRelatedMediaSummary } from './related-media';

export interface IVideo {
  readonly id: number;
  readonly title: string;
  readonly originalName: string;
  readonly mimetype: string;
  readonly size: string;
  readonly text: string;
  readonly posterOriginalName: string;
  readonly posterMimetype: string;
  readonly posterSize: string;
  readonly like: number;
  readonly view: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly categories?: ReadonlyArray<ICategory>;
  readonly videoUrl?: string;
  readonly posterUrl?: string;
  readonly relatedAudio?: IRelatedMediaSummary | null;
}

export interface ICreateVideoInput {
  readonly title: string;
  readonly text: string;
  readonly categories: ReadonlyArray<number>;
  readonly relatedAudioId?: number | null;
}

export interface IUpdateVideoInput {
  readonly title?: string;
  readonly text?: string;
  readonly categories?: ReadonlyArray<number>;
  readonly relatedAudioId?: number | null;
}
