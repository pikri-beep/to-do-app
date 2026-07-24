import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { GripVertical, Clock, Trash2, Edit2, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export default function TaskCard({ task, index, columnId, onDeleteTask, onMoveTask, onEditTask }) {
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className={`tag-badge ${tagClass}`}>{task.tag || 'Work'}</span>
                {task.pomodoros > 0 && (
                  <span style={{ fontSize: '0.85rem', color: '#ff6b6b', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    🍅 {task.pomodoros}
                  </span>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button 
                  className="btn-icon" 
                  onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
                  title="Edit Task"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  className="btn-icon" 
                  onClick={(e) => { e.stopPropagation(); onDeleteTask(); }}
                  title="Delete Task"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <h3>{task.title}</h3>
            {task.description && <p>{task.description}</p>}

            {/* Subtasks Progress */}
            {totalSubtasks > 0 && (
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span>Subtasks</span>
                  <span>{completedSubtasks}/{totalSubtasks}</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${subtaskProgress}%` }} />
                </div>
              </div>
            )}

            <div className="task-meta" style={{ marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                <Clock size={14} /> {task.dueDate || task.date || new Date().toLocaleDateString()}
              </span>

              {/* Quick Move Tap Controls (Essential for mobile touch usability!) */}
              <div className="quick-move-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                {columnId === 'todo' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onMoveTask('inprogress'); }} 
                    className="btn-quick-move" 
                    title="Move to In Progress"
                  >
                    Start <ArrowRight size={14} />
                  </button>
                )}

                {columnId === 'inprogress' && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onMoveTask('todo'); }} 
                      className="btn-quick-move" 
                      title="Move back to To Do"
                    >
                      <ArrowLeft size={14} /> To Do
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onMoveTask('done'); }} 
                      className="btn-quick-move btn-quick-done" 
                      title="Mark as Done"
                    >
                      <CheckCircle size={14} /> Done
                    </button>
                  </>
                )}

                {columnId === 'done' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onMoveTask('inprogress'); }} 
                    className="btn-quick-move" 
                    title="Re-open Task"
                  >
                    <ArrowLeft size={14} /> Re-open
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </Draggable>
  );
}
