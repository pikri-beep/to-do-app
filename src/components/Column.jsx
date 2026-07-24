import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import { Plus, X, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Column({ column, tasks, onAddTask, onDeleteTask, onMoveTask, onEditTask }) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onAddTask(column.id, newTaskTitle.trim());
      setNewTaskTitle('');
      setIsAddingTask(false);
    }
  };

  return (
    <div className={`column-container col-${column.id}`}>
      <div className="column-header">
        <div className="column-title">
          {column.title}
          <span className="task-count">{tasks.length}</span>
        </div>
        <button 
          className="btn-icon" 
          onClick={() => setIsAddingTask(!isAddingTask)}
          title="Add Task"
        >
          {isAddingTask ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {isAddingTask && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddTask}
            className="new-task-form"
          >
            <input
              type="text"
              autoFocus
              className="add-task-input"
              placeholder="What needs to be done?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setIsAddingTask(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1rem' }}>
                Add
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            className="task-list"
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              backgroundColor: snapshot.isDraggingOver ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
            }}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '2rem 1rem', 
                color: 'var(--text-muted)',
                textAlign: 'center',
                border: '1px dashed var(--glass-border)',
                borderRadius: '12px'
              }}>
                <Inbox size={28} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                <span style={{ fontSize: '0.85rem' }}>No tasks in {column.title.toLowerCase()}</span>
              </div>
            )}

            {tasks.map((task, index) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                index={index} 
                columnId={column.id}
                onDeleteTask={() => onDeleteTask(task.id, column.id)}
                onMoveTask={(targetCol) => onMoveTask(task.id, column.id, targetCol)}
                onEditTask={onEditTask}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
