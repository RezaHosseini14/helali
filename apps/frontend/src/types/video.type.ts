export type videoTypes = {
  id: number;
  title: string;
  originalName: string;
  path: string;
  mimetype: string;
  size: string;
  text: string;

  posterOriginalName: string;
  posterPath: string;
  posterMimetype: string;
  posterSize: string;

  categories?: number[];
  like: number;
  view: number;
  created_at: string;
  relatedAudio?: {
    id: number;
    title: string;
    posterPath: string;
  } | null;
};
