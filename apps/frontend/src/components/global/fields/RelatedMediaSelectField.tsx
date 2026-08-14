'use client';

import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import SelectField from '@/components/global/fields/SelectField';
import { resolveMediaSelectOptions } from '@/lib/resolve-media-select-options';
import { allAudio } from 'services/audio/audioServices';
import { allVideo } from 'services/video/videoServices';

import type { IRelatedMediaSummary } from 'types/related-media.type';

const LIST_LIMIT = 100;

interface IRelatedMediaSelectFieldProps {
  readonly kind: 'audio' | 'video';
  readonly name: string;
  readonly title: string;
  readonly containerClassName?: string;
  readonly disabled?: boolean;
  readonly enabled?: boolean;
  readonly value: number | null | undefined;
  readonly selectedMedia?: IRelatedMediaSummary | null;
  readonly onChange: (value: number | null) => void;
}

export default function RelatedMediaSelectField(props: IRelatedMediaSelectFieldProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['relatedMediaSelect', props.kind],
    queryFn: async () => {
      const response =
        props.kind === 'audio'
          ? await allAudio(1, LIST_LIMIT)
          : await allVideo(1, LIST_LIMIT);

      return response.data;
    },
    enabled: props.enabled ?? true,
    staleTime: 60_000,
  });

  const options = useMemo(() => {
    const items = resolveMediaSelectOptions(props.kind, data);
    const mapped = items.map((item) => ({
      label: item.title,
      value: item.id,
    }));

    if (!props.selectedMedia || props.selectedMedia.id <= 0) {
      return mapped;
    }

    if (mapped.some((item) => item.value === props.selectedMedia?.id)) {
      return mapped;
    }

    return [{ label: props.selectedMedia.title, value: props.selectedMedia.id }, ...mapped];
  }, [data, props.kind, props.selectedMedia]);

  return (
    <SelectField
      name={props.name}
      title={props.title}
      containerClassName={props.containerClassName}
      disabled={props.disabled}
      loading={isLoading}
      nullable
      data={options}
      value={props.value ?? null}
      onChange={(value) => props.onChange(value == null ? null : Number(value))}
    />
  );
}
