import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import Column from './Column';

// Initial data structure
const initialData = {
  tasks: {
    'task-1': { id: 'task-1', title: 'Design premium UI', description: 'Create a stunning glassmorphism interface.' },
    'task-2': { id: 'task-2', title: 'Add drag and drop', description: 'Implement fluid interactions with framer-motion.' },
    'task-3': { id: 'task-3', title: 'Launch App', description: 'Ship it to production.' },
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
      taskIds: [],
    },
    'done': {
      id: 'done',
      title: 'Done',
      taskIds: ['task-3'],
    },
  },
  columnOrder: ['todo', 'inprogress', 'done'],
};

export default function KanbanBoard() {
  const [data, setData] = useState(() => {
    // Load from local storage if available
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

  // Save to local storage on change
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

    // Moving within the same column
    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...start,
        taskIds: newTaskIds,
      };

      setData({
        ...data,
        columns: {
          ...data.columns,
          [newColumn.id]: newColumn,
        },
      });
      return;
    }

    // Moving from one list to another
    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = {
      ...start,
      taskIds: startTaskIds,
    };

    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finish,
      taskIds: finishTaskIds,
    };

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
      date: new Date().toLocaleDateString()
    };

    setData((prevData) => {
      const column = prevData.columns[columnId];
      const newTaskIds = Array.from(column.taskIds);
      newTaskIds.push(newTaskId);

      return {
        ...prevData,
        tasks: {
          ...prevData.tasks,
          [newTaskId]: newTask,
        },
        columns: {
          ...prevData.columns,
          [columnId]: {
            ...column,
            taskIds: newTaskIds,
          },
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
          [columnId]: {
            ...column,
            taskIds: newTaskIds,
          },
        },
      };
    });
  };

  return (
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
            />
          );
        })}
      </div>
    </DragDropContext>
  );
}
