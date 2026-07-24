import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Column({ column, tasks, onAddTask, onDeleteTask }) {
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
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} onDeleteTask={() => onDeleteTask(task.id, column.id)} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
