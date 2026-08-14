interface IMediaSelectItem {
  readonly id: number;
  readonly title: string;
}

export function resolveMediaSelectOptions(
  kind: 'audio' | 'video',
  payload: unknown,
): IMediaSelectItem[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const root = payload as Record<string, unknown>;
  const nested =
    root.data && typeof root.data === 'object'
      ? (root.data as Record<string, unknown>)
      : null;
  const source =
    nested && (Array.isArray(nested.audios) || Array.isArray(nested.videos)) ? nested : root;
  const items = kind === 'audio' ? source.audios : source.videos;

  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item) => ({
      id: Number(item.id),
      title: String(item.title ?? ''),
    }))
    .filter((item) => Number.isInteger(item.id) && item.id > 0 && item.title.length > 0);
}
