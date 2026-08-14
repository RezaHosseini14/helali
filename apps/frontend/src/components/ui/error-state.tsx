'use client';

interface IErrorStateProps {
  readonly title: string;
  readonly description?: string;
  readonly onRetry?: () => void;
}

export function ErrorState({ title, description, onRetry }: IErrorStateProps) {
  return (
    <div className="grid place-content-center gap-4 rounded-2xl border border-red-200/70 bg-red-50/70 px-6 py-16 text-center">
      <div className="space-y-2">
        <p className="text-xl font-semibold text-red-700">{title}</p>
        {description ? <p className="max-w-md text-sm leading-relaxed text-red-600/80">{description}</p> : null}
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mx-auto rounded-xl bg-mainColor px-4 py-2 text-sm text-white transition hover:opacity-90"
        >
          تلاش مجدد
        </button>
      ) : null}
    </div>
  );
}
