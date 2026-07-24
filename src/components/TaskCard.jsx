import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { GripVertical, Clock, Trash2, Edit2, Timer, CheckSquare } from 'lucide-react';

export default function TaskCard({ task, index, onDeleteTask, onEditTask }) {
  const completedSubtasks = task.subtasks ? task.subtasks.filter(st => st.completed).length : 0;
  const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const tagClass = task.tag ? `tag-${task.tag}` : 'tag-work';

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            zIndex: snapshot.isDragging ? 100 : 'auto',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="task-card"
            style={{
              boxShadow: snapshot.isDragging 
                ? '0 10px 25px -5px rgba(138, 43, 226, 0.5)' 
                : 'var(--shadow-sm)',
              transform: snapshot.isDragging ? 'scale(1.02)' : 'scale(1)',
              borderColor: snapshot.isDragging ? 'var(--accent-color)' : 'var(--glass-border)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className={`tag-badge ${tagClass}`}>{task.tag || 'Work'}</span>
                {task.pomodoros > 0 && (
                  <span style={{ fontSize: '0.75rem', color: '#ff6b6b', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
                    🍅 {task.pomodoros}
                  </span>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '0.2rem' }}>
                <button 
                  className="btn-icon" 
                  onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
                  style={{ color: 'var(--text-muted)' }}
                  title="Edit Task"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  className="btn-icon" 
                  onClick={(e) => { e.stopPropagation(); onDeleteTask(); }}
                  style={{ color: 'var(--text-muted)' }}
                  title="Delete Task"
                >
                  <Trash2 size={14} />
                </button>
                <button className="btn-icon" style={{ cursor: 'grab', color: 'var(--text-muted)' }}>
                  <GripVertical size={14} />
                </button>
              </div>
            </div>

            <h3>{task.title}</h3>
            {task.description && <p>{task.description}</p>}

            {/* Subtasks Progress */}
            {totalSubtasks > 0 && (
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckSquare size={12} /> Subtasks
                  </span>
                  <span>{completedSubtasks}/{totalSubtasks}</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${subtaskProgress}%` }} />
                </div>
              </div>
            )}

            <div className="task-meta">
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> {task.dueDate ? `Due: ${task.dueDate}` : (task.date || new Date().toLocaleDateString())}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </Draggable>
  );
}
