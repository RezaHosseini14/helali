export interface ICategory {
  readonly id: number;
  readonly title: string;
  readonly sort: number;
}

export interface ICreateCategoryInput {
  readonly title: string;
  readonly sort: number;
}

export interface IUpdateCategoryInput {
  readonly title?: string;
  readonly sort?: number;
}
