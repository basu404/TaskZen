import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const SortableTask = ({ task, handleToggle, handleDelete, handleEdit, expandedTask, setExpandedTask }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dueDateObj = task.dueDate ? new Date(task.dueDate) : null;
  const hasDueTime = dueDateObj && (dueDateObj.getHours() !== 0 || dueDateObj.getMinutes() !== 0);
  const isOverdue = dueDateObj && dueDateObj < new Date() && !task.completed;
  const isExpanded = expandedTask === task._id;

  const priorityBorderColors = {
    high: 'border-l-red-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-green-500',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 border-l-4 ${priorityBorderColors[task.priority || 'medium']} hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1`}
    >
      <div className="flex items-start gap-4">
        <button
          type="button"
          className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10 cursor-grab active:cursor-grabbing transition-all"
          {...attributes}
          {...listeners}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => handleToggle(task)}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 mt-1 ${
            task.completed
              ? 'bg-gradient-to-r from-emerald-500 to-green-400 border-emerald-500'
              : 'border-white/30 hover:border-purple-400 hover:bg-purple-500/10'
          }`}
          aria-label="Toggle task"
        >
          {task.completed && (
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <p className={`text-base font-medium ${task.completed ? 'text-white/40 line-through' : 'text-white'}`}>
              {task.title}
            </p>
            {task.priority && (
              <span className="text-sm">
                {task.priority === 'high' && '🔴'}
                {task.priority === 'medium' && '🟡'}
                {task.priority === 'low' && '🟢'}
              </span>
            )}
          </div>
          
          {task.description && (
            <p className={`text-sm text-white/60 mt-2 ${isExpanded ? '' : 'line-clamp-2'}`}>
              {task.description}
            </p>
          )}
          
          {task.description && task.description.length > 100 && (
            <button
              type="button"
              onClick={() => setExpandedTask(isExpanded ? null : task._id)}
              className="text-xs text-purple-400 hover:text-purple-300 mt-1 transition-colors"
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}

          <div className="flex flex-wrap gap-3 mt-3">
            {task.category && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium">
                📁 {task.category}
              </span>
            )}
            {dueDateObj && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                isOverdue ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'
              }`}>
                📅 {hasDueTime
                  ? dueDateObj.toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })
                  : dueDateObj.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                {isOverdue && ' (Overdue!)'}
              </span>
            )}
            {task.completedAt && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-medium">
                ✅ Completed {new Date(task.completedAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>

          <span className={`inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full text-xs font-medium ${
            task.completed
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            <div className={`w-2 h-2 rounded-full ${task.completed ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></div>
            {task.completed ? 'Completed' : 'In Progress'}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-white/40 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleEdit(task)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all text-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleDelete(task._id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all text-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [newDueTime, setNewDueTime] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [expandedTask, setExpandedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('order');
  
  // Edit task state
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState('medium');
  const [editDueDate, setEditDueDate] = useState('');
  const [editDueTime, setEditDueTime] = useState('');
  const [editCategory, setEditCategory] = useState('');

  // Calendar state
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState(null);

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // User profile state
  const [user, setUser] = useState(() => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleOpenProfileEdit = () => {
    setProfileName(user?.fullName || '');
    setProfileEmail(user?.email || '');
    setCurrentPassword('');
    setNewPassword('');
    setProfileError('');
    setProfileSuccess('');
    setIsEditingProfile(true);
  };

  const handleCloseProfileEdit = () => {
    setIsEditingProfile(false);
    setProfileError('');
    setProfileSuccess('');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setIsSavingProfile(true);

    try {
      const updateData = {};
      
      if (profileName.trim() && profileName.trim() !== user?.fullName) {
        updateData.fullName = profileName.trim();
      }
      
      if (profileEmail.trim() && profileEmail.trim().toLowerCase() !== user?.email?.toLowerCase()) {
        updateData.email = profileEmail.trim();
      }
      
      if (newPassword) {
        if (!currentPassword) {
          setProfileError('Current password is required to change password.');
          setIsSavingProfile(false);
          return;
        }
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
      }

      if (Object.keys(updateData).length === 0) {
        setProfileError('No changes to save.');
        setIsSavingProfile(false);
        return;
      }

      const response = await api.put('/api/auth/profile', updateData);
      
      const updatedUser = response.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setProfileSuccess('Profile updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      
      setTimeout(() => {
        handleCloseProfileEdit();
      }, 1500);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const api = useMemo(() => {
    const token = localStorage.getItem('authToken');
    return axios.create({
      baseURL: API_BASE_URL,
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await api.get('/api/tasks');
      setTasks(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/auth/profile');
      const profileData = response.data;
      setUser(profileData);
      localStorage.setItem('user', JSON.stringify(profileData));
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchProfile();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    try {
      setIsSaving(true);
      setError('');
      const taskData = { title };
      if (newDescription.trim()) taskData.description = newDescription.trim();
      if (newPriority) taskData.priority = newPriority;
      if (newDueDate) {
        taskData.dueDate = newDueTime ? `${newDueDate}T${newDueTime}` : newDueDate;
      }
      if (newCategory.trim()) taskData.category = newCategory.trim();

      const response = await api.post('/api/tasks', taskData);
      setTasks((prev) => [response.data, ...prev]);
      setNewTitle('');
      setNewDescription('');
      setNewPriority('medium');
      setNewDueDate('');
      setNewDueTime('');
      setNewCategory('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (task) => {
    try {
      setError('');
      const response = await api.put(`/api/tasks/${task._id}`, {
        completed: !task.completed,
      });
      setTasks((prev) => prev.map((item) => (item._id === task._id ? response.data : item)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task.');
    }
  };

  const handleDelete = async (taskId) => {
    try {
      setError('');
      await api.delete(`/api/tasks/${taskId}`);
      setTasks((prev) => prev.filter((item) => item._id !== taskId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task.');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditPriority(task.priority || 'medium');
    if (task.dueDate) {
      const date = new Date(task.dueDate);
      setEditDueDate(date.toISOString().split('T')[0]);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      if (hours !== 0 || minutes !== 0) {
        setEditDueTime(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
      } else {
        setEditDueTime('');
      }
    } else {
      setEditDueDate('');
      setEditDueTime('');
    }
    setEditCategory(task.category || '');
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditTitle('');
    setEditDescription('');
    setEditPriority('medium');
    setEditDueDate('');
    setEditDueTime('');
    setEditCategory('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingTask || !editTitle.trim()) return;

    try {
      setIsSaving(true);
      setError('');
      const taskData = {
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority,
        dueDate: editDueDate ? (editDueTime ? `${editDueDate}T${editDueTime}` : editDueDate) : null,
        category: editCategory.trim(),
      };

      const response = await api.put(`/api/tasks/${editingTask._id}`, taskData);
      setTasks((prev) => prev.map((item) => (item._id === editingTask._id ? response.data : item)));
      handleCancelEdit();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task.');
    } finally {
      setIsSaving(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((task) => task._id === active.id);
      const newIndex = tasks.findIndex((task) => task._id === over.id);

      const newTasks = arrayMove(tasks, oldIndex, newIndex);
      setTasks(newTasks);

      try {
        const taskOrders = newTasks.map((task, index) => ({
          id: task._id,
          order: index,
        }));
        await api.post('/api/tasks/reorder', { taskOrders });
      } catch (err) {
        setError('Failed to reorder tasks.');
        setTasks(tasks);
      }
    }
  };

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.category?.toLowerCase().includes(query)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((task) =>
        filterStatus === 'completed' ? task.completed : !task.completed
      );
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter((task) => task.priority === filterPriority);
    }

    const sorted = [...filtered];
    switch (sortBy) {
      case 'order':
        sorted.sort((a, b) => (a.order || 0) - (b.order || 0));
        break;
      case 'date-new':
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'date-old':
        sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        sorted.sort((a, b) => priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium']);
        break;
      case 'alphabetical':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'due-date':
        sorted.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        });
        break;
      default:
        break;
    }

    return sorted;
  }, [tasks, searchQuery, filterStatus, filterPriority, sortBy]);

  const completedCount = filteredAndSortedTasks.filter((t) => t.completed).length;
  const activeCount = filteredAndSortedTasks.length - completedCount;

  // Calendar helpers
  const getCalendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const days = [];

    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false });
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  }, [calendarDate]);

  const getTasksForDate = (date) => {
    const dateStr = date.toDateString();
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate).toDateString() === dateStr;
    });
  };

  const prevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCalendarDate(new Date());
  };

  const totalTasks = tasks.length;
  const totalCompletedCount = tasks.filter((t) => t.completed).length;
  const progressPercentage = totalTasks > 0 ? Math.round((totalCompletedCount / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-[#0a0e27] via-[#1a0b2e] to-[#16213e] relative overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[120px] -top-[200px] -left-[200px] animate-pulse"></div>
        <div className="absolute w-[500px] h-[500px] rounded-full bg-pink-600/15 blur-[100px] top-1/2 -right-[150px] animate-pulse delay-1000"></div>
        <div className="absolute w-[400px] h-[400px] rounded-full bg-indigo-600/20 blur-[80px] -bottom-[100px] left-1/3 animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* User Info Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
          <div className="flex flex-col gap-1">
            <span className="text-lg font-semibold text-white tracking-tight">
              Welcome back, {user?.fullName || 'User'} 👋
            </span>
            {user?.email && (
              <span className="text-sm text-white/50">{user.email}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleOpenProfileEdit} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-medium hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-all hover:-translate-y-0.5">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Edit Profile
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/20 hover:border-red-500/50 transition-all hover:-translate-y-0.5">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-12">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span>Live Dashboard</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight mb-3 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
              Your Focus Board
            </h1>
            <p className="text-white/60 text-lg max-w-xl">
              Capture your most important tasks and keep momentum. Every action syncs instantly with your account.
            </p>
          </div>
          
          {/* Stats */}
          <div className="flex gap-4">
            <div className="px-6 py-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 min-w-[100px] text-center">
              <div className="text-sm text-white/50 mb-1">Active</div>
              <div className="text-3xl font-bold text-white">{activeCount}</div>
            </div>
            <div className="px-6 py-4 rounded-2xl bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 min-w-[100px] text-center">
              <div className="text-sm text-emerald-400/70 mb-1">Done</div>
              <div className="text-3xl font-bold text-emerald-400">{completedCount}</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 p-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-white font-medium">Overall Progress</span>
              <span className="text-white/50 text-sm ml-3">
                {totalCompletedCount} of {totalTasks} tasks completed
              </span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {progressPercentage}%
            </span>
          </div>
          <div className="h-3 rounded-full bg-white/10 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 transition-all duration-500 relative"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-6 lg:p-8 mb-8 shadow-2xl">
          {/* Add Task Form */}
          <form onSubmit={handleAddTask} className="mb-8 pb-8 border-b border-white/10">
            <div className="space-y-4">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                required
              />
              
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Add description (optional)"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
                rows="2"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all cursor-pointer"
                >
                  <option value="low" className="bg-slate-800">🟢 Low Priority</option>
                  <option value="medium" className="bg-slate-800">🟡 Medium Priority</option>
                  <option value="high" className="bg-slate-800">🔴 High Priority</option>
                </select>

                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all [color-scheme:dark]"
                />

                <input
                  type="time"
                  value={newDueTime}
                  onChange={(e) => setNewDueTime(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all [color-scheme:dark]"
                />

                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Category (e.g., Work)"
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSaving} 
              className="mt-4 w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5"
            >
              {isSaving ? 'Saving...' : '+ Add Task'}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          {/* Search, Filter, and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all cursor-pointer"
            >
              <option value="all" className="bg-slate-800">All Status</option>
              <option value="active" className="bg-slate-800">Active</option>
              <option value="completed" className="bg-slate-800">Completed</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all cursor-pointer"
            >
              <option value="all" className="bg-slate-800">All Priorities</option>
              <option value="high" className="bg-slate-800">🔴 High</option>
              <option value="medium" className="bg-slate-800">🟡 Medium</option>
              <option value="low" className="bg-slate-800">🟢 Low</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all cursor-pointer"
            >
              <option value="order" className="bg-slate-800">Custom Order</option>
              <option value="date-new" className="bg-slate-800">Newest First</option>
              <option value="date-old" className="bg-slate-800">Oldest First</option>
              <option value="priority" className="bg-slate-800">Priority</option>
              <option value="alphabetical" className="bg-slate-800">Alphabetical</option>
              <option value="due-date" className="bg-slate-800">Due Date</option>
            </select>
          </div>

          {/* Tasks Grid */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredAndSortedTasks.map((task) => task._id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-white/50">Loading your tasks...</p>
                  </div>
                ) : filteredAndSortedTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <svg className="w-10 h-10 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-white text-lg font-medium mb-2">
                      {tasks.length === 0 ? 'All clear! No tasks yet.' : 'No matching tasks found.'}
                    </p>
                    <p className="text-white/50">
                      {tasks.length === 0 ? 'Add your first task above to get started' : 'Try adjusting your search or filters'}
                    </p>
                  </div>
                ) : (
                  filteredAndSortedTasks.map((task) => (
                    <SortableTask
                      key={task._id}
                      task={task}
                      handleToggle={handleToggle}
                      handleDelete={handleDelete}
                      handleEdit={handleEdit}
                      expandedTask={expandedTask}
                      setExpandedTask={setExpandedTask}
                    />
                  ))
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Calendar Section */}
        <div className="rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-6 lg:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="flex items-center gap-3 text-xl font-semibold text-white">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-purple-400">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Task Calendar
            </h2>
            <div className="flex items-center gap-2">
              <button type="button" onClick={prevMonth} className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="px-4 py-2 min-w-[180px] text-center text-white font-medium">
                {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button type="button" onClick={nextMonth} className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button type="button" onClick={goToToday} className="ml-2 px-4 py-2 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-all text-sm font-medium">
                Today
              </button>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden border border-white/10">
            <div className="grid grid-cols-7 bg-white/5">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="py-3 text-center text-sm font-medium text-white/50">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {getCalendarDays.map(({ date, isCurrentMonth }, index) => {
                const dayTasks = getTasksForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const dateKey = date.toISOString();

                return (
                  <div
                    key={index}
                    className={`relative min-h-[80px] p-2 border-t border-l border-white/5 ${
                      !isCurrentMonth ? 'bg-white/[0.02] text-white/30' : 'text-white/70'
                    } ${isToday ? 'bg-purple-500/10' : ''} ${dayTasks.length > 0 ? 'hover:bg-white/5' : ''} transition-colors group`}
                    onMouseEnter={() => setHoveredDate(dateKey)}
                    onMouseLeave={() => setHoveredDate(null)}
                  >
                    <span className={`text-sm ${isToday ? 'w-7 h-7 flex items-center justify-center rounded-full bg-purple-500 text-white font-semibold' : ''}`}>
                      {date.getDate()}
                    </span>
                    {dayTasks.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {dayTasks.slice(0, 3).map((task) => (
                          <div
                            key={task._id}
                            className={`w-2 h-2 rounded-full ${
                              task.completed
                                ? 'bg-emerald-400'
                                : task.priority === 'high'
                                ? 'bg-red-400'
                                : task.priority === 'low'
                                ? 'bg-green-400'
                                : 'bg-yellow-400'
                            }`}
                          />
                        ))}
                        {dayTasks.length > 3 && (
                          <span className="text-[10px] text-white/50">+{dayTasks.length - 3}</span>
                        )}
                      </div>
                    )}
                    {hoveredDate === dateKey && dayTasks.length > 0 && (
                      <div className="absolute z-50 left-1/2 -translate-x-1/2 top-full mt-2 w-56 p-3 rounded-xl bg-slate-900/95 backdrop-blur-sm border border-white/20 shadow-xl">
                        <div className="text-xs font-medium text-white/50 mb-2 pb-2 border-b border-white/10">
                          {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {dayTasks.map((task) => (
                            <div key={task._id} className={`flex items-center gap-2 text-xs ${task.completed ? 'opacity-50' : ''}`}>
                              <span>
                                {task.priority === 'high' ? '🔴' : task.priority === 'low' ? '🟢' : '🟡'}
                              </span>
                              <span className={`flex-1 truncate text-white ${task.completed ? 'line-through' : ''}`}>{task.title}</span>
                              {task.completed && <span className="text-emerald-400">✓</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <span className="text-sm text-white/50">High Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <span className="text-sm text-white/50">Medium Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span className="text-sm text-white/50">Low Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              <span className="text-sm text-white/50">Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={handleCancelEdit}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">Edit Task</h2>
              <button type="button" onClick={handleCancelEdit} className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium text-white/70 mb-2">Title</label>
                <input
                  id="edit-title"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium text-white/70 mb-2">Description</label>
                <textarea
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-priority" className="block text-sm font-medium text-white/70 mb-2">Priority</label>
                  <select
                    id="edit-priority"
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all cursor-pointer"
                  >
                    <option value="low" className="bg-slate-800">🟢 Low</option>
                    <option value="medium" className="bg-slate-800">🟡 Medium</option>
                    <option value="high" className="bg-slate-800">🔴 High</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="edit-category" className="block text-sm font-medium text-white/70 mb-2">Category</label>
                  <input
                    id="edit-category"
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    placeholder="e.g., Work, Personal"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-due-date" className="block text-sm font-medium text-white/70 mb-2">Due Date</label>
                  <input
                    id="edit-due-date"
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label htmlFor="edit-due-time" className="block text-sm font-medium text-white/70 mb-2">Due Time</label>
                  <input
                    id="edit-due-time"
                    type="time"
                    value={editDueTime}
                    onChange={(e) => setEditDueTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all [color-scheme:dark]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button type="button" onClick={handleCancelEdit} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/25">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={handleCloseProfileEdit}>
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">Edit Profile</h2>
              <button className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all" onClick={handleCloseProfileEdit}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {profileError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                {profileSuccess}
              </div>
            )}
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div>
                <label htmlFor="profileName" className="block text-sm font-medium text-white/70 mb-2">Full Name</label>
                <input
                  type="text"
                  id="profileName"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                />
              </div>
              <div>
                <label htmlFor="profileEmail" className="block text-sm font-medium text-white/70 mb-2">Email Address</label>
                <input
                  type="email"
                  id="profileEmail"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                />
              </div>
              <div className="relative flex items-center gap-4 py-4">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="text-sm text-white/50">Change Password (optional)</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-white/70 mb-2">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-white/70 mb-2">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button type="button" className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all" onClick={handleCloseProfileEdit}>
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/25" disabled={isSavingProfile}>
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
