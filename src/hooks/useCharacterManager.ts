import { useState, useCallback } from 'react';
import { indexedDBManager, Character } from '../utils/IndexedDBManager';

interface CharacterState {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  angle: number;
}

interface UseCharacterManagerProps {
  projectId: string;
}

export const useCharacterManager = ({ projectId }: UseCharacterManagerProps) => {
  const [characters, setCharacters] = useState<CharacterState[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // キャラクターリストの初期化
  const initializeCharacters = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await indexedDBManager.init();
      const project = await indexedDBManager.getProject(projectId);
      
      if (!project) {
        setCharacters([]);
        return;
      }

      const initialCharacters = project.characters.map(c => ({
        id: c.id.toString(),
        name: c.name,
        color: c.color,
        x: c.initialPosition.x,
        y: c.initialPosition.y,
        angle: c.initialDirection
      }));

      setCharacters(initialCharacters);
    } catch (err) {
      setError('キャラクターの読み込みに失敗しました');
      console.error('Error initializing characters:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // キャラクターの更新
  const updateCharacter = useCallback(async (index: number, updates: Partial<CharacterState>) => {
    try {
      setError(null);
      const updatedCharacters = [...characters];
      updatedCharacters[index] = { ...updatedCharacters[index], ...updates };
      setCharacters(updatedCharacters);

      // IndexedDBの更新
      await indexedDBManager.init();
      const project = await indexedDBManager.getProject(projectId);
      if (!project) return;

      const dbCharacters = project.characters.map((c, i) => {
        if (i === index) {
          return {
            ...c,
            name: updates.name ?? c.name,
            color: updates.color ?? c.color,
            initialPosition: {
              x: updates.x ?? c.initialPosition.x,
              y: updates.y ?? c.initialPosition.y
            },
            initialDirection: updates.angle ?? c.initialDirection
          };
        }
        return c;
      });

      await indexedDBManager.updateProject({
        ...project,
        characters: dbCharacters
      });
    } catch (err) {
      setError('キャラクターの更新に失敗しました');
      console.error('Error updating character:', err);
      // エラー時は元の状態に戻す
      await initializeCharacters();
    }
  }, [characters, projectId, initializeCharacters]);

  // キャラクターの追加
  const addCharacter = useCallback(async (character: Omit<CharacterState, 'id'>) => {
    try {
      setError(null);
      await indexedDBManager.init();
      const project = await indexedDBManager.getProject(projectId);
      if (!project) return;

      const newId = project.characters.length > 0 
        ? Math.max(...project.characters.map(c => c.id)) + 1 
        : 1;

      const newCharacter: Character = {
        id: newId,
        name: character.name,
        color: character.color,
        initialPosition: { x: character.x, y: character.y },
        initialDirection: character.angle
      };

      const updatedProject = {
        ...project,
        characters: [...project.characters, newCharacter]
      };

      await indexedDBManager.updateProject(updatedProject);
      await initializeCharacters();
    } catch (err) {
      setError('キャラクターの追加に失敗しました');
      console.error('Error adding character:', err);
    }
  }, [projectId, initializeCharacters]);

  // キャラクターの削除
  const deleteCharacter = useCallback(async (index: number) => {
    try {
      setError(null);
      await indexedDBManager.init();
      const project = await indexedDBManager.getProject(projectId);
      if (!project) return;

      const updatedCharacters = project.characters.filter((_, i) => i !== index);
      await indexedDBManager.updateProject({
        ...project,
        characters: updatedCharacters
      });

      await initializeCharacters();
    } catch (err) {
      setError('キャラクターの削除に失敗しました');
      console.error('Error deleting character:', err);
    }
  }, [projectId, initializeCharacters]);

  return {
    characters,
    isLoading,
    error,
    initializeCharacters,
    updateCharacter,
    addCharacter,
    deleteCharacter
  };
}; 