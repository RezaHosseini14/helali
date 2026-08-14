import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { audioTypes } from 'types/audio.type';

export type AudioRepeatMode = 'off' | 'one' | 'all';

interface IAudioPlayerState {
  queue: audioTypes[];
  queueLoading: boolean;
  currentId: number | null;
  currentIndex: number;
  isOpen: boolean;
  isPlaying: boolean;
  isMinimized: boolean;
  volume: number;
  isMuted: boolean;
  repeatMode: AudioRepeatMode;
  /** Bumps when the same track should restart from 0. */
  playbackToken: number;
}

const VOLUME_STORAGE_KEY = 'helali-audio-volume';

function readStoredVolume(): number {
  if (typeof window === 'undefined') {
    return 0.85;
  }

  const raw = window.localStorage.getItem(VOLUME_STORAGE_KEY);
  const parsed = raw == null ? Number.NaN : Number(raw);

  if (!Number.isFinite(parsed)) {
    return 0.85;
  }

  return Math.min(1, Math.max(0, parsed));
}

function clampIndex(index: number, length: number): number {
  if (length <= 0) {
    return -1;
  }

  return Math.min(Math.max(index, 0), length - 1);
}

function syncCurrentFromIndex(state: IAudioPlayerState): void {
  if (state.currentIndex < 0 || state.currentIndex >= state.queue.length) {
    state.currentIndex = -1;
    state.currentId = null;
    return;
  }

  state.currentId = state.queue[state.currentIndex]?.id ?? null;
}

function applyQueue(state: IAudioPlayerState, queue: audioTypes[]): void {
  const previous = state.currentIndex >= 0 ? state.queue[state.currentIndex] : null;
  state.queue = queue;

  if (!previous) {
    state.currentIndex = -1;
    state.currentId = null;
    return;
  }

  let nextIndex = state.queue.findIndex((item) => item.id === previous.id);

  if (nextIndex === -1) {
    state.queue = [previous, ...state.queue];
    nextIndex = 0;
  }

  state.currentIndex = nextIndex;
  state.currentId = previous.id;
}

function applyPlayById(state: IAudioPlayerState, id: number): void {
  const index = state.queue.findIndex((item) => item.id === id);

  if (index === -1) {
    return;
  }

  state.currentIndex = index;
  state.currentId = id;
  state.isOpen = true;
  state.isMinimized = false;
  state.isPlaying = true;
}

function applySeekByIndex(state: IAudioPlayerState, index: number): void {
  const nextIndex = clampIndex(index, state.queue.length);

  if (nextIndex < 0) {
    return;
  }

  state.currentIndex = nextIndex;
  syncCurrentFromIndex(state);
  state.isOpen = true;
  state.isPlaying = true;
  state.isMinimized = false;
}

const initialState: IAudioPlayerState = {
  queue: [],
  queueLoading: true,
  currentId: null,
  currentIndex: -1,
  isOpen: false,
  isPlaying: false,
  isMinimized: false,
  volume: 0.85,
  isMuted: false,
  repeatMode: 'off',
  playbackToken: 0,
};

export const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    hydrateVolume: (state) => {
      state.volume = readStoredVolume();
    },

    setQueue: (state, action: PayloadAction<audioTypes[]>) => {
      applyQueue(state, action.payload);
    },

    setQueueLoading: (state, action: PayloadAction<boolean>) => {
      state.queueLoading = action.payload;
    },

    playAudio: (state, action: PayloadAction<audioTypes>) => {
      const audio = action.payload;
      let index = state.queue.findIndex((item) => item.id === audio.id);

      if (index === -1) {
        state.queue = [audio, ...state.queue];
        index = 0;
      } else {
        state.queue[index] = { ...state.queue[index], ...audio };
      }

      state.currentIndex = index;
      state.currentId = audio.id;
      state.isOpen = true;
      state.isMinimized = false;
      state.isPlaying = true;
    },

    playById: (state, action: PayloadAction<number>) => {
      applyPlayById(state, action.payload);
    },

    togglePlayback: (state) => {
      if (!state.isOpen || state.currentIndex < 0) {
        return;
      }

      state.isPlaying = !state.isPlaying;
    },

    setPlaying: (state, action: PayloadAction<boolean>) => {
      if (!state.isOpen || state.currentIndex < 0) {
        state.isPlaying = false;
        return;
      }

      state.isPlaying = action.payload;
    },

    playNext: (state) => {
      if (state.queue.length === 0 || state.currentIndex < 0) {
        return;
      }

      const isLast = state.currentIndex >= state.queue.length - 1;

      if (isLast) {
        if (state.repeatMode === 'all') {
          state.currentIndex = 0;
          syncCurrentFromIndex(state);
          state.isPlaying = true;
          return;
        }

        state.isPlaying = false;
        return;
      }

      state.currentIndex += 1;
      syncCurrentFromIndex(state);
      state.isOpen = true;
      state.isPlaying = true;
    },

    playPrev: (state) => {
      if (state.queue.length === 0 || state.currentIndex < 0) {
        return;
      }

      if (state.currentIndex === 0) {
        if (state.repeatMode === 'all') {
          state.currentIndex = state.queue.length - 1;
          syncCurrentFromIndex(state);
          state.isPlaying = true;
          return;
        }

        state.isPlaying = true;
        return;
      }

      state.currentIndex -= 1;
      syncCurrentFromIndex(state);
      state.isOpen = true;
      state.isPlaying = true;
    },

    seekTrackByIndex: (state, action: PayloadAction<number>) => {
      applySeekByIndex(state, action.payload);
    },

    closePlayer: (state) => {
      state.isOpen = false;
      state.isPlaying = false;
      state.isMinimized = false;
      state.currentIndex = -1;
      state.currentId = null;
    },

    setMinimized: (state, action: PayloadAction<boolean>) => {
      if (!state.isOpen) {
        return;
      }

      state.isMinimized = action.payload;
    },

    setVolume: (state, action: PayloadAction<number>) => {
      const next = Math.min(1, Math.max(0, action.payload));
      state.volume = next;

      if (next > 0) {
        state.isMuted = false;
      }

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(VOLUME_STORAGE_KEY, String(next));
      }
    },

    toggleMute: (state) => {
      state.isMuted = !state.isMuted;
    },

    cycleRepeatMode: (state) => {
      const order: AudioRepeatMode[] = ['off', 'all', 'one'];
      const current = order.indexOf(state.repeatMode);
      state.repeatMode = order[(current + 1) % order.length] ?? 'off';
    },

    replayCurrent: (state) => {
      if (state.currentIndex < 0) {
        return;
      }

      state.isOpen = true;
      state.isPlaying = true;
      state.playbackToken += 1;
    },

    /** @deprecated Prefer `setQueue` */
    SET_AUDIOS: (state, action: PayloadAction<audioTypes[]>) => {
      applyQueue(state, action.payload);
    },
    /** @deprecated Prefer `setQueueLoading` */
    SET_AUDIOS_LOADING: (state, action: PayloadAction<boolean>) => {
      state.queueLoading = action.payload;
    },
    /** @deprecated Prefer `playById` */
    SET_CURRENT_AUDIO_ID: (state, action: PayloadAction<number>) => {
      applyPlayById(state, action.payload);
    },
    /** @deprecated Prefer `seekTrackByIndex` */
    SET_CURRENT_AUDIO_INDEX: (state, action: PayloadAction<number>) => {
      applySeekByIndex(state, action.payload);
    },
    /** @deprecated Prefer `setPlaying` / `togglePlayback` */
    SET_CURRENT_AUDIO_STATUS: (state, action: PayloadAction<boolean>) => {
      if (action.payload) {
        state.isOpen = true;
        state.isPlaying = true;
      } else {
        state.isPlaying = false;
      }
    },
  },
});

export const {
  hydrateVolume,
  setQueue,
  setQueueLoading,
  playAudio,
  playById,
  togglePlayback,
  setPlaying,
  playNext,
  playPrev,
  seekTrackByIndex,
  closePlayer,
  setMinimized,
  setVolume,
  toggleMute,
  cycleRepeatMode,
  replayCurrent,
  SET_AUDIOS,
  SET_AUDIOS_LOADING,
  SET_CURRENT_AUDIO_ID,
  SET_CURRENT_AUDIO_INDEX,
  SET_CURRENT_AUDIO_STATUS,
} = audioSlice.actions;

export const selectAudioPlayer = (state: { audio: IAudioPlayerState }) => state.audio;

export const selectCurrentAudio = (state: { audio: IAudioPlayerState }) => {
  const { queue, currentIndex } = state.audio;

  if (currentIndex < 0 || currentIndex >= queue.length) {
    return undefined;
  }

  return queue[currentIndex];
};

export default audioSlice.reducer;
