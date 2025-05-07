import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Character, addCharacter, updateCharacter } from '../../store/slices/characterSlice';

interface CharacterFormProps {
  character?: Character;
  onClose: () => void;
}

const CharacterForm: React.FC<CharacterFormProps> = ({ character, onClose }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    parameters: {
      hp: 100,
      mp: 100,
      attack: 10,
      defense: 10,
    },
  });

  useEffect(() => {
    if (character) {
      setFormData({
        name: character.name,
        description: character.description,
        imageUrl: character.imageUrl,
        parameters: { ...character.parameters },
      });
    }
  }, [character]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const characterData: Character = {
      id: character?.id || Date.now().toString(),
      ...formData,
      createdAt: character?.createdAt || now,
      updatedAt: now,
    };

    if (character) {
      dispatch(updateCharacter(characterData));
    } else {
      dispatch(addCharacter(characterData));
    }
    onClose();
  };

  const handleParameterChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [key]: parseInt(value) || 0,
      },
    }));
  };

  return (
    <form className="character-form" onSubmit={handleSubmit}>
      <h2>{character ? 'キャラクター編集' : '新規キャラクター作成'}</h2>
      
      <div className="form-group">
        <label htmlFor="name">名前</label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">説明</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="imageUrl">画像URL</label>
        <input
          type="url"
          id="imageUrl"
          value={formData.imageUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
          required
        />
      </div>

      <div className="form-group">
        <h3>パラメータ</h3>
        {Object.entries(formData.parameters).map(([key, value]) => (
          <div key={key} className="parameter-input">
            <label htmlFor={key}>{key.toUpperCase()}</label>
            <input
              type="number"
              id={key}
              value={value}
              onChange={(e) => handleParameterChange(key, e.target.value)}
              min="0"
              required
            />
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary">
          {character ? '更新' : '作成'}
        </button>
        <button type="button" className="btn-secondary" onClick={onClose}>
          キャンセル
        </button>
      </div>
    </form>
  );
};

export default CharacterForm; 