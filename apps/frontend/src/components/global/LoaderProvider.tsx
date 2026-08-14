'use client';

import { type ReactNode, useEffect, useState } from 'react';

import { Spinner } from '@/components/ui/spinner';

interface ILoaderProviderProps {
  readonly children: ReactNode;
  readonly loading: boolean;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly className?: string;
}

function LoaderProvider(props: ILoaderProviderProps) {
  const [showLoader, setShowLoader] = useState(props.loading);

  useEffect(() => {
    if (props.loading) {
      setShowLoader(true);
      return;
    }
    const timer = setTimeout(() => setShowLoader(false), 500);
    return () => clearTimeout(timer);
  }, [props.loading]);

  return (
    <>
      {showLoader ? (
        <div
          className={`absolute right-0 top-0 z-50 size-full overflow-hidden backdrop-blur-md transition-opacity duration-700 ${
            props.className ?? ''
          } ${props.loading ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Spinner className="size-8 text-primary" />
            <p className="font-bold">درحال بارگزاری...</p>
          </div>
        </div>
      ) : null}
      {props.children}
    </>
  );
}

export default LoaderProvider;
