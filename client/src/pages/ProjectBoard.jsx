import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Calendar,
  Search,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Circle,
  UserPlus,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../api/apiClient';
import Navbar from '../components/Navbar';
import TaskDetailModal from '../components/TaskDetailModal';

const COLUMNS = [
  {
    id: 'todo',
    title: 'To Do',
    icon: Circle,
    dotColor: 'bg-muted-foreground',
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    icon: Clock,
    dotColor: 'bg-chart-4',
  },
  {
    id: 'done',
    title: 'Done',
    icon: CheckCircle2,
    dotColor: 'bg-chart-3',
  },
];

const ProjectBoard = () => {
  const { id: projectId } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [isAdmin, setIsAdmin] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [createTaskLoading, setCreateTaskLoading] = useState(false);
  const [createTaskError, setCreateTaskError] = useState('');

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  const [draggedOverCol, setDraggedOverCol] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [projectsRes, tasksRes, adminRes] = await Promise.allSettled([
        api.get('/api/projects'),
        api.get(`/api/projects/${projectId}/tasks`),
        api.get(`/api/projects/${projectId}/test-admin`),
      ]);

      if (projectsRes.status === 'fulfilled') {
        const val = projectsRes.value;
        const allProjects = val?.data || (Array.isArray(val) ? val : []);
        const currentProject = allProjects.find((p) => p.id === parseInt(projectId, 10));

        if (currentProject) {
          setProject(currentProject);
        } else {
          setProject({ id: projectId, name: `Project #${projectId}` });
        }
      }

      if (tasksRes.status === 'fulfilled') {
        const val = tasksRes.value;
        if (val && val.data) {
          setTasks(val.data);
        } else if (Array.isArray(val)) {
          setTasks(val);
        }
      } else {
        setError('Failed to load project board.');
      }

      setIsAdmin(adminRes.status === 'fulfilled');
    } catch (err) {
      setError(err.message || 'Failed to load project board.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      setCreateTaskError('Task title is required.');
      return;
    }

    setCreateTaskLoading(true);
    setCreateTaskError('');

    try {
      const res = await api.post(`/api/projects/${projectId}/tasks`, {
        title: taskTitle.trim(),
        description: taskDesc.trim() || null,
        due_date: taskDueDate || null,
      });

      const newTask = res?.data || res;
      if (newTask && newTask.id) {
        setTasks((prev) => [...prev, newTask]);
      } else {
        await fetchData();
      }

      setTaskTitle('');
      setTaskDesc('');
      setTaskDueDate('');
      setIsAddTaskOpen(false);
    } catch (err) {
      setCreateTaskError(err.message || 'Failed to create task. Please try again.');
    } finally {
      setCreateTaskLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId, nextStatus) => {
    const prevTasks = [...tasks];

    setTasks((current) =>
      current.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
    );
    setSelectedTask((prev) =>
      prev && prev.id === taskId ? { ...prev, status: nextStatus } : prev
    );

    try {
      await api.put(`/api/tasks/${taskId}`, { status: nextStatus });
    } catch (err) {
      setTasks(prevTasks);
      setSelectedTask((prev) =>
        prev && prev.id === taskId ? prevTasks.find((t) => t.id === taskId) || prev : prev
      );
      setError(err.message || 'Failed to update task status.');
      throw err;
    }
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      setInviteError('Please enter an email address.');
      return;
    }

    setInviteLoading(true);
    setInviteError('');
    setInviteSuccess('');

    try {
      await api.post(`/api/projects/${projectId}/invite`, {
        email: inviteEmail.trim(),
      });
      setInviteSuccess(`Invitation sent to ${inviteEmail.trim()}!`);
      setInviteEmail('');
      setTimeout(() => {
        setIsInviteOpen(false);
        setInviteSuccess('');
      }, 1500);
    } catch (err) {
      setInviteError(err.message || 'User not found or already a member.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedOverCol !== colId) {
      setDraggedOverCol(colId);
    }
  };

  const handleDragLeave = () => {
    setDraggedOverCol(null);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDraggedOverCol(null);

    const taskIdStr = e.dataTransfer.getData('text/plain');
    if (!taskIdStr) return;

    const taskId = parseInt(taskIdStr, 10);
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== targetStatus) {
      await handleUpdateStatus(taskId, targetStatus);
    }
  };

  const openAddTaskModal = () => {
    setTaskTitle('');
    setTaskDesc('');
    setTaskDueDate('');
    setCreateTaskError('');
    setIsAddTaskOpen(true);
  };

  const openInviteModal = () => {
    setInviteEmail('');
    setInviteError('');
    setInviteSuccess('');
    setIsInviteOpen(true);
  };

  const getDueDateMeta = (dateStr, status) => {
    if (!dateStr) return null;
    const target = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));
    const label = target.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    if (status === 'done') {
      return {
        label,
        isOverdue: false,
        isToday: false,
        badgeClass: 'text-muted-foreground bg-input/40 border-border',
      };
    }

    if (diffDays < 0) {
      return {
        label: `Overdue · ${label}`,
        isOverdue: true,
        isToday: false,
        badgeClass: 'text-destructive font-semibold bg-destructive/10 border-destructive/25',
      };
    }

    if (diffDays === 0) {
      return {
        label: 'Due today',
        isOverdue: false,
        isToday: true,
        badgeClass: 'text-chart-4 font-semibold bg-chart-4/15 border-chart-4/30',
      };
    }

    return {
      label,
      isOverdue: false,
      isToday: false,
      badgeClass: 'text-muted-foreground bg-input/40 border-border',
    };
  };

  const overdueCount = tasks.filter((t) => {
    const meta = getDueDateMeta(t.due_date, t.status);
    return meta?.isOverdue;
  }).length;

  const dueTodayCount = tasks.filter((t) => {
    const meta = getDueDateMeta(t.due_date, t.status);
    return meta?.isToday;
  }).length;

  const filteredTasks = tasks.filter((t) => {
    const term = searchTerm.toLowerCase();
    const titleMatch = t.title?.toLowerCase().includes(term);
    const descMatch = t.description?.toLowerCase().includes(term);
    const textMatch = titleMatch || descMatch;

    if (!textMatch) return false;

    if (activeFilter === 'overdue') {
      const meta = getDueDateMeta(t.due_date, t.status);
      return meta?.isOverdue;
    }
    if (activeFilter === 'today') {
      const meta = getDueDateMeta(t.due_date, t.status);
      return meta?.isToday;
    }

    return true;
  });

  const getTasksByStatus = (status) => {
    return filteredTasks.filter((t) => t.status === status);
  };

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        <div className="pb-6 border-b border-border">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-3">
            <Link to="/dashboard" className="hover:text-foreground inline-flex items-center gap-1 transition">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Projects</span>
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold truncate max-w-xs">
              {project?.name || 'Loading...'}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {project?.name}
                </h1>
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                    isAdmin
                      ? 'bg-primary/15 text-primary border-primary/30'
                      : 'bg-muted text-muted-foreground border-border'
                  }`}
                >
                  {isAdmin ? 'Admin' : 'Member'}
                </span>
              </div>
              {project?.description && (
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                  {project.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {isAdmin && (
                <button
                  onClick={openInviteModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-input/40 hover:bg-input border border-border text-foreground transition cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Invite Member</span>
                </button>
              )}

              <button
                onClick={openAddTaskModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-primary-foreground bg-gradient-to-r from-primary to-accent hover:opacity-95 shadow-md active:scale-[0.99] transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-4 border-t border-border/60">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative w-full sm:w-56">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter tasks..."
                  className="w-full pl-8 pr-3 py-1.5 bg-input/40 border border-border rounded-xl text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary text-xs transition"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-foreground text-background'
                      : 'bg-input/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All ({tasks.length})
                </button>

                {overdueCount > 0 && (
                  <button
                    onClick={() => setActiveFilter(activeFilter === 'overdue' ? 'all' : 'overdue')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      activeFilter === 'overdue'
                        ? 'bg-destructive text-destructive-foreground'
                        : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    <span>{overdueCount} Overdue</span>
                  </button>
                )}

                {dueTodayCount > 0 && (
                  <button
                    onClick={() => setActiveFilter(activeFilter === 'today' ? 'all' : 'today')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      activeFilter === 'today'
                        ? 'bg-chart-4 text-primary-foreground'
                        : 'bg-chart-4/15 text-chart-4 hover:bg-chart-4/25'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{dueTodayCount} Today</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Progress:</span>
                <div className="w-28 h-2 rounded-full bg-input overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <span className="font-bold text-foreground">{completionRate}%</span>
              </div>
              <span className="text-border">|</span>
              <span>
                <strong className="text-foreground">{doneTasks}</strong> of{' '}
                <strong className="text-foreground">{totalTasks}</strong> done
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="my-4 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
            <button onClick={fetchData} className="ml-auto underline font-semibold cursor-pointer">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 flex-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card/50 border border-border/70 rounded-2xl p-4 flex flex-col gap-3 animate-pulse">
                <div className="h-6 w-1/3 bg-muted/60 rounded-md" />
                <div className="h-24 bg-muted/40 rounded-xl" />
                <div className="h-24 bg-muted/40 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 flex-1 items-start">
            {COLUMNS.map((column) => {
              const colTasks = getTasksByStatus(column.id);
              const isOver = draggedOverCol === column.id;

              return (
                <div
                  key={column.id}
                  onDragOver={(e) => handleDragOver(e, column.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.id)}
                  className={`bg-card/60 backdrop-blur-xs border rounded-2xl p-4 flex flex-col min-h-[500px] transition-all duration-150 ${
                    isOver
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/70">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${column.dotColor}`} />
                      <h3 className="text-sm font-bold text-foreground">{column.title}</h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-input/60 border border-border text-muted-foreground">
                        {colTasks.length}
                      </span>
                    </div>

                    <button
                      onClick={openAddTaskModal}
                      className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-input transition cursor-pointer"
                      title={`Add task to ${column.title}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 space-y-3">
                    {colTasks.length === 0 ? (
                      <div className="h-36 border border-dashed border-border/80 rounded-xl flex flex-col items-center justify-center text-center p-4">
                        <p className="text-xs text-muted-foreground">No tasks in {column.title}</p>
                        <p className="text-[11px] text-muted-foreground/70 mt-1">Drag tasks here or click + to add</p>
                      </div>
                    ) : (
                      colTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          column={column}
                          onDragStart={handleDragStart}
                          onStatusChange={handleUpdateStatus}
                          onClick={() => setSelectedTask(task)}
                          getDueDateMeta={getDueDateMeta}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-xs animate-fadeIn">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />

            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Create New Task</h2>
              <button
                onClick={() => setIsAddTaskOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createTaskError && (
              <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createTaskError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Design login screen"
                  className="w-full px-3.5 py-2.5 bg-input/40 border border-border rounded-xl text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary text-sm transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Add details or acceptance criteria..."
                  className="w-full px-3.5 py-2.5 bg-input/40 border border-border rounded-xl text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary text-sm transition resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Due Date
                </label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-input/40 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary text-sm transition"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTaskLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-primary-foreground bg-gradient-to-r from-primary to-accent hover:opacity-95 shadow-md active:scale-[0.99] transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {createTaskLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Add Task</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-xs animate-fadeIn">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />

            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div>
                <h2 className="text-lg font-bold text-foreground">Invite Collaborator</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Project: <span className="font-semibold text-foreground">{project?.name}</span>
                </p>
              </div>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inviteError && (
              <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{inviteError}</span>
              </div>
            )}

            {inviteSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-chart-3/15 border border-chart-3/30 text-chart-3 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{inviteSuccess}</span>
              </div>
            )}

            <form onSubmit={handleInviteUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  User Email Address *
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="w-full px-3.5 py-2.5 bg-input/40 border border-border rounded-xl text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary text-sm transition"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  The user must already have a TaskSync account.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-primary-foreground bg-gradient-to-r from-primary to-accent hover:opacity-95 shadow-md active:scale-[0.99] transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {inviteLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Invite</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onStatusChange={handleUpdateStatus}
        />
      )}
    </div>
  );
};

const TaskCard = ({ task, column, onDragStart, onStatusChange, onClick, getDueDateMeta }) => {
  const dueMeta = getDueDateMeta(task.due_date, task.status);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={onClick}
      className="group bg-card border border-border hover:border-primary/50 hover:shadow-md rounded-xl p-4 shadow-2xs transition-all duration-150 cursor-pointer active:cursor-grabbing relative overflow-hidden"
    >
      <div className={`absolute top-0 left-0 bottom-0 w-1 ${column.dotColor}`} />

      <div className="pl-1">
        <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {task.title}
        </h4>

        {task.description && (
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-3">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-border/50 text-[11px]">
          {dueMeta ? (
            <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] ${dueMeta.badgeClass}`}>
              <Calendar className="w-3 h-3 shrink-0" />
              <span>{dueMeta.label}</span>
            </div>
          ) : (
            <span className="text-muted-foreground/60">No due date</span>
          )}

          <div className="flex items-center gap-1">
            {column.id !== 'todo' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(task.id, 'todo');
                }}
                className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-input/40 hover:bg-input text-muted-foreground hover:text-foreground transition cursor-pointer"
                title="Move to To Do"
              >
                To Do
              </button>
            )}
            {column.id !== 'in_progress' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(task.id, 'in_progress');
                }}
                className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-input/40 hover:bg-input text-chart-4 transition cursor-pointer"
                title="Move to In Progress"
              >
                Progress
              </button>
            )}
            {column.id !== 'done' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(task.id, 'done');
                }}
                className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-chart-3/15 hover:bg-chart-3/25 text-chart-3 transition cursor-pointer"
                title="Mark as Done"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectBoard;
