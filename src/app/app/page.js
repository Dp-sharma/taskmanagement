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
        <div className="p-4 md:p-8 transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-10">
                {/* Header Container */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-8 gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                            Task Tracker
                        </h1>
                        <p className="text-gray-500 font-mono text-xs mt-2 uppercase tracking-widest">Neural Operational Workflow</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-center font-bold">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-2xl text-center animate-pulse font-bold">
                        {success}
                    </div>
                )}

                {/* Controls Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Search and Filter */}
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Search protocol..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 p-4 rounded-2xl glass focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-sm"
                        />
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="p-4 rounded-2xl glass focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold text-xs uppercase"
                        >
                            {PRIORITIES.map(priority => (
                                <option key={priority} value={priority} className="bg-background text-foreground">{priority} Priority</option>
                            ))}
                        </select>
                    </div>

                    {/* New Task Form */}
                    <form onSubmit={addTask} className="flex gap-4">
                        <input
                            type="text"
                            value={newTaskName}
                            onChange={(e) => setNewTaskName(e.target.value)}
                            placeholder="Initialize new task..."
                            className="flex-1 p-4 rounded-2xl glass focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-sm"
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-4 px-8 rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95"
                        >
                            Add
                        </button>
                    </form>
                </div>

                {/* Task Sections (Drag and Drop) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {STATUSES.map((status) => (
                        <div
                            key={status}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, status)}
                            className={`glass rounded-[2rem] p-6 min-h-[500px] transition-all border-2 border-dashed ${
                                draggedItem ? 'border-blue-500/50 bg-blue-500/5' : 'border-transparent'
                            }`}
                        >
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-6 text-center text-foreground/40">{status}</h2>
                            <div className="space-y-4">
                                {filteredTasks
                                    .filter((task) => task.status === status)
                                    .map((task) => (
                                        <div
                                            key={task._id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, task._id)}
                                            className="cursor-grab glass p-5 rounded-3xl hover:scale-[1.02] hover:border-blue-500/30 transition-all group relative overflow-hidden"
                                        >
                                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getPriorityColor(task.priority)} opacity-50`}></div>
                                            
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="text-base font-bold text-foreground/80 group-hover:text-blue-500 transition-colors truncate pr-2">{task.name}</h3>
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={task.priority}
                                                        onChange={(e) => updatePriority(task._id, e.target.value)}
                                                        className="text-[10px] font-black uppercase tracking-tighter bg-gray-500/10 rounded-lg px-2 py-1 focus:outline-none border-none"
                                                    >
                                                        {PRIORITIES.slice(1).map(p => (
                                                            <option key={p} value={p} className="bg-background">{p}</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={() => deleteTask(task._id)}
                                                        className="text-red-500/40 hover:text-red-500 transition-colors p-1"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-xs text-foreground/30 truncate mb-4">
                                                {task.description || 'No descriptive data set.'}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <button
                                                    onClick={() => handleOpenTask(task)}
                                                    className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 group-hover:scale-110 transition-transform"
                                                >
                                                    Open Data
                                                </button>
                                                <span className="text-[10px] font-mono text-gray-500">{getTimeInStatus(task.statusHistory)}</span>
                                            </div>
                                            <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all"></div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Task Modal */}
            {openTask && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fade-in">
                    <div className="glass p-8 rounded-[2.5rem] w-full max-w-lg space-y-6 shadow-2xl border border-white/20">
                        <h2 className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">{openTask.name}</h2>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 block">Neural Data Log</label>
                            <textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                rows="6"
                                className="w-full bg-white/5 dark:bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                placeholder="Enter task intelligence update..."
                            ></textarea>
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={handleCloseTask}
                                className="px-6 py-3 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-foreground transition-colors"
                            >
                                Abort
                            </button>
                            <button
                                onClick={handleSaveDescription}
                                className="px-8 py-3 text-xs font-black uppercase tracking-widest text-white bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all"
                            >
                                Commit Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
