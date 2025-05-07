import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { Project, loadProjects, saveProjects } from './store/slices/projectSlice';
import { Character, loadCharacters, saveCharacters } from './store/slices/characterSlice';
import ProjectList from './components/project/ProjectList';
import ProjectForm from './components/project/ProjectForm';
import CharacterList from './components/character/CharacterList';
import CharacterForm from './components/character/CharacterForm';
import './styles/app.css';
import './styles/project.css';
import './styles/character.css';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [isCharacterFormOpen, setIsCharacterFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [editingCharacter, setEditingCharacter] = useState<Character | undefined>();
  const currentProject = useSelector((state: RootState) => state.project.currentProject);
  const projects = useSelector((state: RootState) => state.project.projects);
  const characters = useSelector((state: RootState) => state.character.characters);

  useEffect(() => {
    dispatch(loadProjects());
    dispatch(loadCharacters());
  }, [dispatch]);

  useEffect(() => {
    dispatch(saveProjects());
  }, [dispatch, projects]);

  useEffect(() => {
    dispatch(saveCharacters());
  }, [dispatch, characters]);

  const handleOpenProjectForm = (project?: Project) => {
    setEditingProject(project);
    setIsProjectFormOpen(true);
  };

  const handleCloseProjectForm = () => {
    setIsProjectFormOpen(false);
    setEditingProject(undefined);
  };

  const handleOpenCharacterForm = (character?: Character) => {
    setEditingCharacter(character);
    setIsCharacterFormOpen(true);
  };

  const handleCloseCharacterForm = () => {
    setIsCharacterFormOpen(false);
    setEditingCharacter(undefined);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Massvision Web</h1>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={() => handleOpenProjectForm()}
          >
            新規プロジェクト作成
          </button>
          <button 
            className="btn-primary"
            onClick={() => handleOpenCharacterForm()}
          >
            新規キャラクター作成
          </button>
        </div>
      </header>

      <main className="app-main">
        {isProjectFormOpen ? (
          <ProjectForm
            project={editingProject}
            onClose={handleCloseProjectForm}
          />
        ) : isCharacterFormOpen ? (
          <CharacterForm
            character={editingCharacter}
            onClose={handleCloseCharacterForm}
          />
        ) : (
          <div className="content-container">
            <ProjectList />
            <CharacterList />
          </div>
        )}
      </main>

      {currentProject && (
        <div className="current-project-info">
          <h2>現在のプロジェクト: {currentProject.name}</h2>
          <p>{currentProject.description}</p>
        </div>
      )}
    </div>
  );
};

export default App; 