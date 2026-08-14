function shouldIgnorePlayError(error: unknown): boolean {
  const name = error instanceof DOMException || error instanceof Error ? error.name : '';

  return name === 'AbortError' || name === 'NotAllowedError';
}

/**
 * HTMLMediaElement / WaveSurfer `play()` rejects with AbortError when `pause()`
 * or a new load interrupts the pending request. Catch it so it never surfaces
 * as an unhandledRejection.
 */
export function playMediaSafely(play: () => Promise<unknown> | void): void {
  let playPromise: Promise<unknown> | void;

  try {
    playPromise = play();
  } catch (error: unknown) {
    if (shouldIgnorePlayError(error)) {
      return;
    }

    throw error;
  }

  if (!playPromise) {
    return;
  }

  void playPromise.catch((error: unknown) => {
    if (shouldIgnorePlayError(error)) {
      return;
    }

    console.error(error);
  });
}
