import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addProject, updateProject } from '../../store/slices/projectSlice';
import { Project } from '../../store/slices/projectSlice';

interface ProjectFormProps {
  project?: Project;
  onClose: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onClose }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();

    if (project) {
      dispatch(updateProject({
        ...project,
        ...formData,
        updatedAt: now,
      }));
    } else {
      dispatch(addProject({
        id: crypto.randomUUID(),
        ...formData,
        createdAt: now,
        updatedAt: now,
      }));
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="project-form">
      <h2>{project ? 'プロジェクト編集' : '新規プロジェクト作成'}</h2>
      
      <div className="form-group">
        <label htmlFor="name">プロジェクト名</label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">説明</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary">
          {project ? '更新' : '作成'}
        </button>
        <button type="button" onClick={onClose} className="btn-secondary">
          キャンセル
        </button>
      </div>
    </form>
  );
};

export default ProjectForm; 