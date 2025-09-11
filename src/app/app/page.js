'use client';
import { useState, useEffect } from 'react';
import LogoutButton from '../logout-button';
import { useRouter } from 'next/navigation';

// Statuses for the update tasks
const STATUSES = ['Pending', 'In Progress', 'Completed'];
const PRIORITIES = ['All', 'Low', 'Medium', 'High'];

// Priority-based color mapping
const priorityColors = {
  Low: 'bg-green-500',
  Medium: 'bg-yellow-500',
  High: 'bg-red-500',
};

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [openTask, setOpenTask] = useState(null); // New state for the open task
  const [editDescription, setEditDescription] = useState(''); // New state for editing description
  const router = useRouter();

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await res.json();
      setTasks(data);
    } catch (e) {
      setError(`Failed to load tasks: ${e.message}`);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        fetchTasks();
      } else {
        router.push('/login');
      }
    };
    fetchUserProfile();
  }, [router]);

  useEffect(() => {
    let tempTasks = [...tasks];

    if (priorityFilter !== 'All') {
      tempTasks = tempTasks.filter(task => task.priority === priorityFilter);
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      tempTasks = tempTasks.filter(
        task =>
          task.name.toLowerCase().includes(lowerSearchTerm) ||
          (task.description && task.description.toLowerCase().includes(lowerSearchTerm))
      );
    }
    setFilteredTasks(tempTasks);
  }, [tasks, searchTerm, priorityFilter]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((currentTasks) =>
        currentTasks.map((task) => ({
          ...task,
          _updatedAt: Date.now(),
        }))
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTaskName.trim()) {
      setError('Task name cannot be empty.');
      return;
    }
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newTaskName, description: '', priority: 'Medium' }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add task');
      }
      setNewTaskName('');
      setSuccess('Task added successfully!');
      fetchTasks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(`Failed to add task: ${e.message}`);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
    setDraggedItem(taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    setDraggedItem(null);
    const taskToUpdate = tasks.find(t => t._id === taskId);
    if (taskToUpdate.status === newStatus) {
      return;
    }
    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: taskId, updates: { status: newStatus } }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update status');
      }
      setSuccess('Status updated!');
      fetchTasks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(`Failed to update status: ${e.message}`);
      setTimeout(() => setError(''), 5000);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: taskId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete task');
      }
      setSuccess('Task deleted!');
      fetchTasks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(`Failed to delete task: ${e.message}`);
      setTimeout(() => setError(''), 5000);
    }
  };

  const updatePriority = async (taskId, newPriority) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: taskId, updates: { priority: newPriority } }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update priority');
      }
      setSuccess('Priority updated!');
      fetchTasks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(`Failed to update priority: ${e.message}`);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleOpenTask = (task) => {
    setOpenTask(task);
    setEditDescription(task.description);
  };

  const handleCloseTask = () => {
    setOpenTask(null);
    setEditDescription('');
  };

  const handleSaveDescription = async () => {
    if (!openTask) return;
    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: openTask._id, updates: { description: editDescription } }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update description');
      }
      setSuccess('Description updated successfully!');
      fetchTasks();
      handleCloseTask();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(`Failed to update description: ${e.message}`);
      setTimeout(() => setError(''), 5000);
    }
  };

  const getTimeInStatus = (history) => {
    if (!history || history.length === 0) return 'N/A';
    const lastEntry = history[history.length - 1];
    const timestamp = lastEntry.timestamp;
    if (!timestamp) return 'Calculating...';
    const now = Date.now();
    const lastChange = new Date(timestamp).getTime();
    const diffInSeconds = Math.floor((now - lastChange) / 1000);
    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    const seconds = diffInSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const getPriorityColor = (priority) => {
    return priorityColors[priority] || 'bg-gray-400';
  };

  return (
    <div className="min-h-screen p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans flex flex-col items-center">
      <div className="w-full max-w-5xl bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div className="text-left">
            <h1 className="text-4xl font-bold mb-2">Update Tracker</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Drag and drop tasks to update their status.</p>
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">Logged in as: <span className="text-blue-500">{user}</span></span>
              <LogoutButton />
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500 text-white p-4 rounded-lg text-center animate-pulse">
            {success}
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            {PRIORITIES.map(priority => (
              <option key={priority} value={priority}>{priority} Priority</option>
            ))}
          </select>
        </div>

        {/* Form to add a new task */}
        <form onSubmit={addTask} className="flex gap-4">
          <input
            type="text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            placeholder="Add a new update task..."
            className="flex-1 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-300"
          >
            Add Task
          </button>
        </form>

        {/* Task Sections (Drag and Drop) */}
        <div className="grid md:grid-cols-3 gap-6">
          {STATUSES.map((status) => (
            <div
              key={status}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm min-h-[300px] border-4 border-dashed border-transparent transition-all"
              style={{ borderColor: draggedItem ? 'rgb(59, 130, 246)' : 'transparent' }}
            >
              <h2 className="text-2xl font-bold mb-4 text-center">{status}</h2>
              <div className="space-y-4">
                {filteredTasks
                  .filter((task) => task.status === status)
                  .map((task) => (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task._id)}
                      className={`cursor-grab bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 relative`}
                    >
                      {/* Priority Color Bar */}
                      <div className={`absolute -left-2 top-0 bottom-0 w-2 rounded-tl-lg rounded-bl-lg ${getPriorityColor(task.priority)}`}></div>
                      
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-medium truncate">{task.name}</h3>
                        <div className="flex items-center space-x-2">
                          <select
                            value={task.priority}
                            onChange={(e) => updatePriority(task._id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs p-1 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {PRIORITIES.slice(1).map(p => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => deleteTask(task._id)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600 transition-colors"
                            aria-label="Delete task"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-6 h-6"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.36-.299.81-.61.81-.61c.424-.465.424-1.226 0-1.691L15.36 2.31a1.2 1.2 0 00-1.691 0L8.14 5.21c-.465.424-.465 1.185 0 1.61L12.78 10.51a1.2 1.2 0 001.691 0z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {task.description && (
                          <p className="mb-2 truncate">{task.description}</p>
                        )}
                        <button
                          onClick={() => handleOpenTask(task)}
                          className="text-blue-500 hover:underline text-xs"
                        >
                          Open Task
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Task Description Modal */}
      {openTask && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-md space-y-4">
            <h2 className="text-2xl font-bold mb-4">{openTask.name}</h2>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows="4"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-gray-100 p-2"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCloseTask}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDescription}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}