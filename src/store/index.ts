import { configureStore } from '@reduxjs/toolkit'
import projectReducer from './slices/projectSlice'
import characterReducer from './slices/characterSlice'

export const store = configureStore({
  reducer: {
    project: projectReducer,
    character: characterReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 