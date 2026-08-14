export interface IEncryptedEnvelope {
  readonly v: number;
  readonly iv: string;
  readonly data: string;
  readonly tag: string;
}
