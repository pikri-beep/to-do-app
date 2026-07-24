import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, CheckSquare, Square, Tag, Calendar as CalendarIcon } from 'lucide-react';

export default function TaskModal({ task, onSave, onClose }) {
  const [title, setTitle] = useState(task.title || '');
  const [description, setDescription] = useState(task.description || '');
  const [tag, setTag] = useState(task.tag || 'work');
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [newSubtask, setNewSubtask] = useState('');

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    setSubtasks([...subtasks, { id: Date.now().toString(), text: newSubtask.trim(), completed: false }]);
    setNewSubtask('');
  };

  const toggleSubtask = (id) => {
    setSubtasks(subtasks.map(st => st.id === id ? { ...st, completed: !st.completed } : st));
  };

  const removeSubtask = (id) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      ...task,
      title: title.trim(),
      description: description.trim(),
      tag,
      dueDate,
      subtasks
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div 
        className="modal-content"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600 }}>Edit Task</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Title</label>
            <input 
              type="text" 
              className="add-task-input" 
              style={{ marginBottom: 0 }}
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Task Title"
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Description</label>
            <textarea 
              className="add-task-input" 
              style={{ marginBottom: 0, height: '80px', resize: 'vertical' }}
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Add details..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <Tag size={14} /> Tag Category
              </label>
              <select 
                value={tag} 
                onChange={(e) => setTag(e.target.value)}
                className="add-task-input"
                style={{ marginBottom: 0, cursor: 'pointer' }}
              >
                <option value="work" style={{ background: '#12121e' }}>Work</option>
                <option value="personal" style={{ background: '#12121e' }}>Personal</option>
                <option value="urgent" style={{ background: '#12121e' }}>Urgent</option>
                <option value="health" style={{ background: '#12121e' }}>Health</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <CalendarIcon size={14} /> Due Date
              </label>
              <input 
                type="date" 
                className="add-task-input" 
                style={{ marginBottom: 0, colorScheme: 'dark' }}
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Subtasks Section */}
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Subtasks Checklist</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <input 
                type="text" 
                className="add-task-input"
                style={{ marginBottom: 0, padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
                placeholder="Add subtask..."
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
              />
              <button type="button" className="btn-secondary" onClick={handleAddSubtask} style={{ padding: '0.5rem 1rem' }}>
                <Plus size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '140px', overflowY: 'auto' }}>
              {subtasks.map(st => (
                <div key={st.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => toggleSubtask(st.id)}>
                    {st.completed ? <CheckSquare size={16} color="var(--accent-color)" /> : <Square size={16} color="var(--text-muted)" />}
                    <span style={{ fontSize: '0.9rem', textDecoration: st.completed ? 'line-through' : 'none', color: st.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}>{st.text}</span>
                  </div>
                  <button type="button" className="btn-icon" onClick={() => removeSubtask(st.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
