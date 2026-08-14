import type { ICategory } from './category';
import type { IRelatedMediaSummary } from './related-media';

export interface IAudio {
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
  readonly audioUrl?: string;
  readonly posterUrl?: string;
  readonly relatedVideo?: IRelatedMediaSummary | null;
}

export interface ICreateAudioInput {
  readonly title: string;
  readonly text: string;
  readonly categories: ReadonlyArray<number>;
  readonly relatedVideoId?: number | null;
}

export interface IUpdateAudioInput {
  readonly title?: string;
  readonly text?: string;
  readonly categories?: ReadonlyArray<number>;
  readonly relatedVideoId?: number | null;
}
