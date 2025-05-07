import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Character {
  id: string
  name: string
  description: string
  imageUrl: string
  parameters: {
    [key: string]: number
  }
  createdAt: string
  updatedAt: string
}

interface CharacterState {
  characters: Character[]
  currentCharacter: Character | null
  loading: boolean
  error: string | null
}

const initialState: CharacterState = {
  characters: [],
  currentCharacter: null,
  loading: false,
  error: null,
}

const characterSlice = createSlice({
  name: 'character',
  initialState,
  reducers: {
    setCharacters: (state, action: PayloadAction<Character[]>) => {
      state.characters = action.payload
    },
    setCurrentCharacter: (state, action: PayloadAction<Character | null>) => {
      state.currentCharacter = action.payload
    },
    addCharacter: (state, action: PayloadAction<Character>) => {
      state.characters.push(action.payload)
    },
    updateCharacter: (state, action: PayloadAction<Character>) => {
      const index = state.characters.findIndex(c => c.id === action.payload.id)
      if (index !== -1) {
        state.characters[index] = action.payload
      }
    },
    deleteCharacter: (state, action: PayloadAction<string>) => {
      state.characters = state.characters.filter(c => c.id !== action.payload)
      if (state.currentCharacter?.id === action.payload) {
        state.currentCharacter = null
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    saveCharacters: (state) => {
      try {
        localStorage.setItem('characters', JSON.stringify(state.characters))
      } catch (error) {
        state.error = 'キャラクターの保存に失敗しました'
      }
    },
    loadCharacters: (state) => {
      try {
        const savedCharacters = localStorage.getItem('characters')
        if (savedCharacters) {
          state.characters = JSON.parse(savedCharacters)
        }
      } catch (error) {
        state.error = 'キャラクターの読み込みに失敗しました'
      }
    },
  },
})

export const {
  setCharacters,
  setCurrentCharacter,
  addCharacter,
  updateCharacter,
  deleteCharacter,
  setLoading,
  setError,
  saveCharacters,
  loadCharacters,
} = characterSlice.actions

export default characterSlice.reducer 