import { useState, useCallback } from 'react';

interface CharacterState {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  angle: number;
}

interface RepositionState {
  isRepositioning: boolean;
  targetCharacter: CharacterState | null;
  targetIndex: number | null;
  position: { x: number; y: number } | null;
  angle: number | null;
  isNewCharacter: boolean;
}

export const useRepositionManager = () => {
  const [state, setState] = useState<RepositionState>({
    isRepositioning: false,
    targetCharacter: null,
    targetIndex: null,
    position: null,
    angle: null,
    isNewCharacter: false
  });

  // 新規キャラクターの設置開始
  const startNewCharacterPlacement = useCallback((character: CharacterState) => {
    setState({
      isRepositioning: true,
      targetCharacter: character,
      targetIndex: null,
      position: { x: 0, y: 0 },
      angle: 0,
      isNewCharacter: true
    });
  }, []);

  // 既存キャラクターの再設置開始
  const startReposition = useCallback((character: CharacterState, index: number) => {
    setState({
      isRepositioning: true,
      targetCharacter: character,
      targetIndex: index,
      position: { x: character.x, y: character.y },
      angle: character.angle,
      isNewCharacter: false
    });
  }, []);

  // 位置の更新
  const updatePosition = useCallback((x: number, y: number) => {
    setState(prev => ({
      ...prev,
      position: { x, y }
    }));
  }, []);

  // 角度の更新
  const updateAngle = useCallback((angle: number) => {
    setState(prev => ({
      ...prev,
      angle
    }));
  }, []);

  // 設置の確定
  const confirmPlacement = useCallback(() => {
    if (!state.targetCharacter || !state.position || state.angle === null) {
      return null;
    }

    const result = {
      id: state.targetCharacter.id,
      name: state.targetCharacter.name,
      color: state.targetCharacter.color,
      x: state.position.x,
      y: state.position.y,
      angle: state.angle
    };

    // 状態をリセット
    setState({
      isRepositioning: false,
      targetCharacter: null,
      targetIndex: null,
      position: null,
      angle: null,
      isNewCharacter: false
    });

    return {
      ...result,
      isNewCharacter: state.isNewCharacter
    };
  }, [state]);

  // 設置のキャンセル
  const cancelPlacement = useCallback(() => {
    setState({
      isRepositioning: false,
      targetCharacter: null,
      targetIndex: null,
      position: null,
      angle: null,
      isNewCharacter: false
    });
  }, []);

  return {
    ...state,
    startNewCharacterPlacement,
    startReposition,
    updatePosition,
    updateAngle,
    confirmPlacement,
    cancelPlacement
  };
}; 