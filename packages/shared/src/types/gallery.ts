export interface IGallery {
  readonly id: number;
  readonly originalName: string;
  readonly mimetype: string;
  readonly size: string;
  readonly desc?: string | null;
  readonly like?: number | null;
  readonly view?: number | null;
  readonly isFeatured?: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly imageUrl?: string;
  readonly path?: string;
}

export interface ICreateGalleryInput {
  readonly desc?: string;
  readonly isFeatured?: boolean;
}
