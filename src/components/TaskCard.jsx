import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { GripVertical, Clock, Trash2 } from 'lucide-react';

export default function TaskCard({ task, index, onDeleteTask }) {
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3>{task.title}</h3>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button 
                  className="btn-icon" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTask();
                  }}
                  style={{ color: 'var(--text-muted)' }}
                  title="Delete Task"
                >
                  <Trash2 size={16} />
                </button>
                <button className="btn-icon" style={{ cursor: 'grab', color: 'var(--text-muted)' }}>
                  <GripVertical size={16} />
                </button>
              </div>
            </div>
            {task.description && <p>{task.description}</p>}
            <div className="task-meta">
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> {task.date || new Date().toLocaleDateString()}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </Draggable>
  );
}
