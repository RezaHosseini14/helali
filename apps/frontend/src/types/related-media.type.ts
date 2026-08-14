export type TRelatedMediaKind = 'audio' | 'video';

export interface IRelatedMediaSummary {
  readonly id: number;
  readonly title: string;
  readonly posterPath: string;
}

export interface IRelatedMediaLinkProps {
  readonly kind: TRelatedMediaKind;
  readonly media: IRelatedMediaSummary;
}
