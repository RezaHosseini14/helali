interface IJsonLdProps {
  readonly data: Record<string, unknown> | Record<string, unknown>[];
}

export function JsonLd({ data }: IJsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
