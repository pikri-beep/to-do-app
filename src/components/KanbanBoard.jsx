import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import Column from './Column';
import TaskModal from './TaskModal';

const initialData = {
  tasks: {
    'task-1': { id: 'task-1', title: 'Design Pro Max UI', description: 'Create a stunning glassmorphism interface with custom accents.', tag: 'work', pomodoros: 2, subtasks: [{ id: '1', text: 'Theme tokens', completed: true }, { id: '2', text: 'Glass panels', completed: true }] },
    'task-2': { id: 'task-2', title: 'Add drag and drop', description: 'Implement fluid interactions with framer-motion.', tag: 'urgent', pomodoros: 1, subtasks: [] },
    'task-3': { id: 'task-3', title: 'Daily Workout', description: '30 mins cardio & core.', tag: 'health', pomodoros: 0, subtasks: [] },
  },
  columns: {
    'todo': {
      id: 'todo',
      title: 'To Do',
      taskIds: ['task-1', 'task-2'],
    },
    'inprogress': {
      id: 'inprogress',
      title: 'In Progress',
      taskIds: ['task-3'],
    },
    'done': {
      id: 'done',
      title: 'Done',
      taskIds: [],
    },
  },
  columnOrder: ['todo', 'inprogress', 'done'],
};

export default function KanbanBoard() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('kanban-data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse kanban data', e);
      }
    }
    return initialData;
  });

  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    localStorage.setItem('kanban-data', JSON.stringify(data));
  }, [data]);

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const start = data.columns[source.droppableId];
    const finish = data.columns[destination.droppableId];

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = { ...start, taskIds: newTaskIds };
      setData({
        ...data,
        columns: { ...data.columns, [newColumn.id]: newColumn },
      });
      return;
    }

    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = { ...start, taskIds: startTaskIds };

    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = { ...finish, taskIds: finishTaskIds };

    setData({
      ...data,
      columns: {
        ...data.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    });
  };

  const handleAddTask = (columnId, title) => {
    const newTaskId = `task-${Date.now()}`;
    const newTask = {
      id: newTaskId,
      title: title,
      description: '',
      tag: 'work',
      pomodoros: 0,
      subtasks: [],
      date: new Date().toLocaleDateString()
    };

    setData((prevData) => {
      const column = prevData.columns[columnId];
      const newTaskIds = Array.from(column.taskIds);
      newTaskIds.push(newTaskId);

      return {
        ...prevData,
        tasks: { ...prevData.tasks, [newTaskId]: newTask },
        columns: {
          ...prevData.columns,
          [columnId]: { ...column, taskIds: newTaskIds },
        },
      };
    });
  };

  const handleDeleteTask = (taskId, columnId) => {
    setData((prevData) => {
      const column = prevData.columns[columnId];
      const newTaskIds = column.taskIds.filter(id => id !== taskId);
      const newTasks = { ...prevData.tasks };
      delete newTasks[taskId];

      return {
        ...prevData,
        tasks: newTasks,
        columns: {
          ...prevData.columns,
          [columnId]: { ...column, taskIds: newTaskIds },
        },
      };
    });
  };

  const handleMoveTask = (taskId, sourceColId, targetColId) => {
    setData((prevData) => {
      const sourceCol = prevData.columns[sourceColId];
      const targetCol = prevData.columns[targetColId];
      
      const sourceTaskIds = sourceCol.taskIds.filter(id => id !== taskId);
      const targetTaskIds = [...targetCol.taskIds, taskId];

      return {
        ...prevData,
        columns: {
          ...prevData.columns,
          [sourceColId]: { ...sourceCol, taskIds: sourceTaskIds },
          [targetColId]: { ...targetCol, taskIds: targetTaskIds },
        }
      };
    });
  };

  const handleSaveTask = (updatedTask) => {
    setData((prevData) => ({
      ...prevData,
      tasks: {
        ...prevData.tasks,
        [updatedTask.id]: updatedTask
      }
    }));
    setEditingTask(null);
  };

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            const tasks = column.taskIds.map((taskId) => data.tasks[taskId]).filter(Boolean);

            return (
              <Column
                key={column.id}
                column={column}
                tasks={tasks}
                onAddTask={handleAddTask}
                onDeleteTask={handleDeleteTask}
                onMoveTask={handleMoveTask}
                onEditTask={(task) => setEditingTask(task)}
              />
            );
          })}
        </div>
      </DragDropContext>

      {editingTask && (
        <TaskModal 
          task={editingTask}
          onSave={handleSaveTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </>
  );
}
