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
import './Dashboard.css';

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card priority-${task.priority || 'medium'}`}
    >
      <div className="task-main">
        <button
          type="button"
          className="drag-handle"
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
          className={`task-checkbox ${task.completed ? 'completed' : ''}`}
          aria-label="Toggle task"
        >
          {task.completed && (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <div className="task-content">
          <div className="task-header-row">
            <p className={`task-title ${task.completed ? 'completed' : ''}`}>
              {task.title}
            </p>
            {task.priority && (
              <span className={`priority-badge priority-${task.priority}`}>
                {task.priority === 'high' && '🔴'}
                {task.priority === 'medium' && '🟡'}
                {task.priority === 'low' && '🟢'}
              </span>
            )}
          </div>
          
          {task.description && (
            <p className={`task-description ${isExpanded ? 'expanded' : ''}`}>
              {task.description}
            </p>
          )}
          
          {task.description && task.description.length > 100 && (
            <button
              type="button"
              onClick={() => setExpandedTask(isExpanded ? null : task._id)}
              className="expand-btn"
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}

          <div className="task-meta">
            {task.category && (
              <span className="category-tag">
                📁 {task.category}
              </span>
            )}
            {dueDateObj && (
              <span className={`due-date ${isOverdue ? 'overdue' : ''}`}>
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
              <span className="completed-time">
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

          <span className={`task-badge ${task.completed ? 'completed' : 'active'}`}>
            <div className={`badge-dot ${task.completed ? 'completed' : 'active'}`}></div>
            {task.completed ? 'Completed' : 'In Progress'}
          </span>
        </div>
      </div>
      
      <div className="task-footer">
        <div className="task-date">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
        <div className="task-actions">
          <button
            type="button"
            onClick={() => handleEdit(task)}
            className="edit-btn"
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleDelete(task._id)}
            className="delete-btn"
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      
      // Update local user state and localStorage
      const updatedUser = response.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setProfileSuccess('Profile updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      
      // Close modal after short delay
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
      // If profile fetch fails (e.g., invalid token), redirect to login
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
                <div className="input-wrapper">
                  <input
                    type="time"
                    value={newDueTime}
                    onChange={(e) => setNewDueTime(e.target.value)}
                    className="task-input"
                    placeholder="Due time"
                  />
                </div>
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

    // Previous month padding
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false });
    }

    // Current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }

    // Next month padding
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
    <div className="dashboard-container">
      {/* Animated Background */}
      <div className="bg-animation">
        <div className="bg-orb"></div>
        <div className="bg-orb"></div>
        <div className="bg-orb"></div>
      </div>

      <div className="dashboard-content">
        {/* User Info Header */}
        <div className="user-header">
          <div className="user-info">
            <span className="welcome-text">
              Welcome back, {user?.fullName || 'User'} 👋
            </span>
            {user?.email && (
              <span className="user-email">{user.email}</span>
            )}
          </div>
          <div className="user-actions">
            <button onClick={handleOpenProfileEdit} className="edit-profile-btn">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Edit Profile
            </button>
            <button onClick={handleLogout} className="logout-btn">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="live-badge">
              <div className="live-dot"></div>
              <span>Live Dashboard</span>
            </div>
            <h1 className="dashboard-title">Your Focus Board</h1>
            <p className="dashboard-subtitle">
              Capture your most important tasks and keep momentum. Every action syncs instantly with your account.
            </p>
          </div>
          
          {/* Stats */}
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-label">Active</div>
              <div className="stat-value">{activeCount}</div>
            </div>
            <div className="stat-card completed">
              <div className="stat-label">Done</div>
              <div className="stat-value">{completedCount}</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-header">
            <div className="progress-info">
              <span className="progress-label">Overall Progress</span>
              <span className="progress-stats">
                {totalCompletedCount} of {totalTasks} tasks completed
              </span>
            </div>
            <span className="progress-percentage">{progressPercentage}%</span>
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="progress-bar-glow"></div>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="main-card">
          {/* Add Task Form */}
          <form onSubmit={handleAddTask} className="task-form">
            <div className="form-grid">
              <div className="input-wrapper">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="task-input"
                  required
                />
              </div>
              
              <div className="input-wrapper">
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Add description (optional)"
                  className="task-textarea"
                  rows="2"
                />
              </div>

              <div className="input-row">
                <div className="input-wrapper">
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="task-select"
                  >
                    <option value="low">🟢 Low Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="high">🔴 High Priority</option>
                  </select>
                </div>

                <div className="input-wrapper">
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="task-input"
                    placeholder="Due date"
                  />
                </div>

                <div className="input-wrapper">
                  <input
                    type="time"
                    value={newDueTime}
                    onChange={(e) => setNewDueTime(e.target.value)}
                    className="task-input"
                    placeholder="Due time"
                  />
                </div>

                <div className="input-wrapper">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Category (e.g., Work)"
                    className="task-input"
                  />
                </div>
              </div>
            </div>

            <button type="submit" disabled={isSaving} className="add-btn">
              {isSaving ? 'Saving...' : '+ Add Task'}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          {/* Search, Filter, and Sort Controls */}
          <div className="controls-panel">
            <div className="search-wrapper">
              <svg className="search-icon" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="search-input"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Priorities</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="order">Custom Order</option>
              <option value="date-new">Newest First</option>
              <option value="date-old">Oldest First</option>
              <option value="priority">Priority</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="due-date">Due Date</option>
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
              <div className="tasks-grid">
                {isLoading ? (
                  <div className="loading-container">
                    <div className="spinner"></div>
                    <p className="loading-text">Loading your tasks...</p>
                  </div>
                ) : filteredAndSortedTasks.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="empty-title">
                      {tasks.length === 0 ? 'All clear! No tasks yet.' : 'No matching tasks found.'}
                    </p>
                    <p className="empty-subtitle">
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
        <div className="calendar-section">
          <div className="calendar-header">
            <h2 className="calendar-title">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Task Calendar
            </h2>
            <div className="calendar-nav">
              <button type="button" onClick={prevMonth} className="calendar-nav-btn">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="calendar-month">
                {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button type="button" onClick={nextMonth} className="calendar-nav-btn">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button type="button" onClick={goToToday} className="today-btn">
                Today
              </button>
            </div>
          </div>

          <div className="calendar-grid">
            <div className="calendar-weekdays">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="weekday">{day}</div>
              ))}
            </div>
            <div className="calendar-days">
              {getCalendarDays.map(({ date, isCurrentMonth }, index) => {
                const dayTasks = getTasksForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const dateKey = date.toISOString();

                return (
                  <div
                    key={index}
                    className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${dayTasks.length > 0 ? 'has-tasks' : ''}`}
                    onMouseEnter={() => setHoveredDate(dateKey)}
                    onMouseLeave={() => setHoveredDate(null)}
                  >
                    <span className="day-number">{date.getDate()}</span>
                    {dayTasks.length > 0 && (
                      <div className="task-indicators">
                        {dayTasks.slice(0, 3).map((task) => (
                          <div
                            key={task._id}
                            className={`task-dot priority-${task.priority || 'medium'} ${task.completed ? 'completed' : ''}`}
                          />
                        ))}
                        {dayTasks.length > 3 && (
                          <span className="more-tasks">+{dayTasks.length - 3}</span>
                        )}
                      </div>
                    )}
                    {hoveredDate === dateKey && dayTasks.length > 0 && (
                      <div className="task-tooltip">
                        <div className="tooltip-header">
                          {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="tooltip-tasks">
                          {dayTasks.map((task) => (
                            <div key={task._id} className={`tooltip-task ${task.completed ? 'completed' : ''}`}>
                              <span className={`tooltip-priority priority-${task.priority || 'medium'}`}>
                                {task.priority === 'high' ? '🔴' : task.priority === 'low' ? '🟢' : '🟡'}
                              </span>
                              <span className="tooltip-title">{task.title}</span>
                              {task.completed && <span className="tooltip-done">✓</span>}
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

          <div className="calendar-legend">
            <div className="legend-item">
              <div className="task-dot priority-high"></div>
              <span>High Priority</span>
            </div>
            <div className="legend-item">
              <div className="task-dot priority-medium"></div>
              <span>Medium Priority</span>
            </div>
            <div className="legend-item">
              <div className="task-dot priority-low"></div>
              <span>Low Priority</span>
            </div>
            <div className="legend-item">
              <div className="task-dot completed"></div>
              <span>Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingTask && (
        <div className="edit-modal-overlay" onClick={handleCancelEdit}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h2>Edit Task</h2>
              <button type="button" onClick={handleCancelEdit} className="close-modal-btn">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="edit-modal-form">
              <div className="edit-form-group">
                <label htmlFor="edit-title">Title</label>
                <input
                  id="edit-title"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="edit-input"
                  required
                />
              </div>
              <div className="edit-form-group">
                <label htmlFor="edit-description">Description</label>
                <textarea
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="edit-textarea"
                  rows={3}
                />
              </div>
              <div className="edit-form-row">
                <div className="edit-form-group">
                  <label htmlFor="edit-priority">Priority</label>
                  <select
                    id="edit-priority"
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="edit-select"
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
                <div className="edit-form-group">
                  <label htmlFor="edit-category">Category</label>
                  <input
                    id="edit-category"
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="edit-input"
                    placeholder="e.g., Work, Personal"
                  />
                </div>
              </div>
              <div className="edit-form-row">
                <div className="edit-form-group">
                  <label htmlFor="edit-due-date">Due Date</label>
                  <input
                    id="edit-due-date"
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="edit-input"
                  />
                </div>
                <div className="edit-form-group">
                  <label htmlFor="edit-due-time">Due Time</label>
                  <input
                    id="edit-due-time"
                    type="time"
                    value={editDueTime}
                    onChange={(e) => setEditDueTime(e.target.value)}
                    className="edit-input"
                  />
                </div>
              </div>
              <div className="edit-modal-actions">
                <button type="button" onClick={handleCancelEdit} className="cancel-edit-btn">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="save-edit-btn">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {isEditingProfile && (
        <div className="edit-modal-overlay" onClick={handleCloseProfileEdit}>
          <div className="edit-modal profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h2>Edit Profile</h2>
              <button className="close-modal-btn" onClick={handleCloseProfileEdit}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {profileError && <div className="profile-error">{profileError}</div>}
            {profileSuccess && <div className="profile-success">{profileSuccess}</div>}
            <form onSubmit={handleSaveProfile} className="edit-modal-form">
              <div className="edit-form-group">
                <label htmlFor="profileName">Full Name</label>
                <input
                  type="text"
                  id="profileName"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Enter your full name"
                  className="edit-input"
                />
              </div>
              <div className="edit-form-group">
                <label htmlFor="profileEmail">Email Address</label>
                <input
                  type="email"
                  id="profileEmail"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="edit-input"
                />
              </div>
              <div className="profile-divider">
                <span>Change Password (optional)</span>
              </div>
              <div className="edit-form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="edit-input"
                />
              </div>
              <div className="edit-form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="edit-input"
                />
              </div>
              <div className="edit-modal-actions">
                <button type="button" className="cancel-edit-btn" onClick={handleCloseProfileEdit}>
                  Cancel
                </button>
                <button type="submit" className="save-edit-btn" disabled={isSavingProfile}>
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
