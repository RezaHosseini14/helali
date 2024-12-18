'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Loader, LoaderProps } from 'rsuite';

type LoaderProviderPropsType = {
  children: ReactNode;
  loading: boolean;
  size?: LoaderProps['size'];
};

function LoaderProvider(props: LoaderProviderPropsType) {
  const [showLoader, setShowLoader] = useState(props.loading);

  useEffect(() => {
    if (props.loading) {
      setShowLoader(true);
    } else {
      const timer = setTimeout(() => setShowLoader(false), 500);
      return () => clearTimeout(timer);
    }
  }, [props.loading]);

  return (
    <>
      {showLoader ? (
        <div
          className={`absolute right-0 top-0 size-full z-50 backdrop-blur-md transition-opacity duration-700 ${
            props.loading ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Loader
            size={props.size ? props.size : 'lg'}
            center
            content={<p className="font-bold">درحال بارگزاری...</p>}
            vertical
          />
        </div>
      ) : null}
      {props.children}
    </>
  );
}

export default LoaderProvider;
