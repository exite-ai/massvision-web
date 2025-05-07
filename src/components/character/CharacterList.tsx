import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Character, setCurrentCharacter, deleteCharacter } from '../../store/slices/characterSlice';

const CharacterList: React.FC = () => {
  const dispatch = useDispatch();
  const { characters, loading, error } = useSelector((state: RootState) => state.character);

  const handleCharacterClick = (character: Character) => {
    dispatch(setCurrentCharacter(character));
  };

  const handleDeleteCharacter = (e: React.MouseEvent, characterId: string) => {
    e.stopPropagation();
    if (window.confirm('このキャラクターを削除してもよろしいですか？')) {
      dispatch(deleteCharacter(characterId));
    }
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return <div>エラーが発生しました: {error}</div>;
  }

  return (
    <div className="character-list">
      <h2>キャラクター一覧</h2>
      <div className="character-grid">
        {characters.map((character) => (
          <div
            key={character.id}
            className="character-card"
            onClick={() => handleCharacterClick(character)}
          >
            <div className="character-image">
              <img src={character.imageUrl} alt={character.name} />
            </div>
            <h3>{character.name}</h3>
            <p>{character.description}</p>
            <div className="character-meta">
              <span>作成日: {new Date(character.createdAt).toLocaleDateString()}</span>
              <span>更新日: {new Date(character.updatedAt).toLocaleDateString()}</span>
            </div>
            <div className="character-parameters">
              {Object.entries(character.parameters).map(([key, value]) => (
                <div key={key} className="parameter">
                  <span className="parameter-name">{key}:</span>
                  <span className="parameter-value">{value}</span>
                </div>
              ))}
            </div>
            <button
              className="btn-delete"
              onClick={(e) => handleDeleteCharacter(e, character.id)}
            >
              削除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterList; 