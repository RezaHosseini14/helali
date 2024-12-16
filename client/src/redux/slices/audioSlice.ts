import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { audioTypes } from "types/audio.type";

type audioInitialStateType = {
  audios: audioTypes[];
  currentAudioId: number;
  currentAudioIndex: number;
  currentAudioStatus: boolean;
  audiosLoading: boolean;
};

const initialState: audioInitialStateType = {
  audios: [],
  currentAudioId: -1,
  currentAudioIndex: -1,
  currentAudioStatus: false,
  audiosLoading: true,
};

export const audioSlice = createSlice({
  name: "audio",
  initialState,
  reducers: {
    SET_AUDIOS: (state, action: PayloadAction<audioTypes[]>) => {
      state.audios = action.payload;
    },
    SET_AUDIOS_LOADING: (state, action: PayloadAction<boolean>) => {
      state.audiosLoading = action.payload;
    },
    SET_CURRENT_AUDIO_ID: (state, action: PayloadAction<number>) => {
      state.currentAudioId = action.payload;
      state.currentAudioIndex = state.audios.findIndex((item) => item.id === action.payload);
    },
    SET_CURRENT_AUDIO_INDEX: (state, action: PayloadAction<number>) => {
      state.currentAudioIndex = action.payload;
      state.currentAudioId = state.audios[action.payload].id;
    },
    SET_CURRENT_AUDIO_STATUS: (state, action: PayloadAction<boolean>) => {
      state.currentAudioStatus = action.payload;
    },
  },
});

export const {
  SET_AUDIOS,
  SET_CURRENT_AUDIO_ID,
  SET_CURRENT_AUDIO_INDEX,
  SET_CURRENT_AUDIO_STATUS,
  SET_AUDIOS_LOADING,
} = audioSlice.actions;

export default audioSlice.reducer;
