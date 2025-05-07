import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Project, setCurrentProject, deleteProject } from '../../store/slices/projectSlice';

const ProjectList: React.FC = () => {
  const dispatch = useDispatch();
  const { projects, loading, error } = useSelector((state: RootState) => state.project);

  const handleProjectClick = (project: Project) => {
    dispatch(setCurrentProject(project));
  };

  const handleDeleteProject = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (window.confirm('このプロジェクトを削除してもよろしいですか？')) {
      dispatch(deleteProject(projectId));
    }
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return <div>エラーが発生しました: {error}</div>;
  }

  return (
    <div className="project-list">
      <h2>プロジェクト一覧</h2>
      <div className="project-grid">
        {projects.map((project) => (
          <div
            key={project.id}
            className="project-card"
            onClick={() => handleProjectClick(project)}
          >
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <div className="project-meta">
              <span>作成日: {new Date(project.createdAt).toLocaleDateString()}</span>
              <span>更新日: {new Date(project.updatedAt).toLocaleDateString()}</span>
            </div>
            <button
              className="btn-delete"
              onClick={(e) => handleDeleteProject(e, project.id)}
            >
              削除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectList; 