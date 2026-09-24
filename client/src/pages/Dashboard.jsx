import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  FolderKanban,
  Calendar,
  UserPlus,
  ArrowRight,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/apiClient';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const [inviteModalProject, setInviteModalProject] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/projects');
      if (response && response.data) {
        setProjects(response.data);
      } else if (Array.isArray(response)) {
        setProjects(response);
      }
    } catch (err) {
      setError(err.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      setCreateError('Project name is required.');
      return;
    }

    setCreateLoading(true);
    setCreateError('');

    try {
      const created = await api.post('/api/projects', {
        name: newProjectName.trim(),
        description: newProjectDesc.trim(),
      });

      if (created && created.id) {
        setProjects((prev) => [created, ...prev]);
      } else {
        await fetchProjects();
      }

      setNewProjectName('');
      setNewProjectDesc('');
      setIsCreateOpen(false);
    } catch (err) {
      setCreateError(err.message || 'Failed to create project. Please try again.');
    } finally {
      setCreateLoading(false);
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
      await api.post(`/api/projects/${inviteModalProject.id}/invite`, {
        email: inviteEmail.trim(),
      });
      setInviteSuccess(`Successfully invited ${inviteEmail.trim()}!`);
      setInviteEmail('');
      setTimeout(() => {
        setInviteModalProject(null);
        setInviteSuccess('');
      }, 1500);
    } catch (err) {
      setInviteError(err.message || 'Failed to invite user. Make sure the email is registered.');
    } finally {
      setInviteLoading(false);
    }
  };

  const openCreateModal = () => {
    setCreateError('');
    setNewProjectName('');
    setNewProjectDesc('');
    setIsCreateOpen(true);
  };

  const openInviteModal = (e, project) => {
    e.stopPropagation();
    setInviteEmail('');
    setInviteError('');
    setInviteSuccess('');
    setInviteModalProject(project);
  };

  const filteredProjects = projects.filter((project) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = project.name?.toLowerCase().includes(term);
    const descMatch = project.description?.toLowerCase().includes(term);
    return nameMatch || descMatch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-8 border-b border-border">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {user?.username}
              </span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Select a workspace or create a new project to get started.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-primary-foreground bg-gradient-to-r from-primary to-accent hover:opacity-95 shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 my-6">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-4 py-2 bg-input/40 border border-border rounded-xl text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary text-sm transition"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground px-3 py-1.5 rounded-lg bg-card border border-border self-start sm:self-auto">
            <span>Total Projects:</span>
            <span className="text-foreground font-bold">{projects.length}</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
            <button
              onClick={fetchProjects}
              className="ml-auto underline font-semibold hover:opacity-80 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 shadow-sm animate-pulse space-y-4">
                <div className="w-10 h-10 rounded-xl bg-muted/60" />
                <div className="h-5 w-2/3 bg-muted/60 rounded-md" />
                <div className="h-4 w-full bg-muted/40 rounded-md" />
                <div className="h-4 w-4/5 bg-muted/40 rounded-md" />
                <div className="pt-4 border-t border-border flex justify-between">
                  <div className="h-4 w-1/3 bg-muted/40 rounded-md" />
                  <div className="h-4 w-1/4 bg-muted/40 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm max-w-lg mx-auto mt-6">
            <div className="w-14 h-14 rounded-2xl bg-secondary/50 text-primary flex items-center justify-center mx-auto mb-4">
              <FolderKanban className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No projects found</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-6">
              {searchTerm
                ? 'No projects matched your search.'
                : "You don't have any projects yet. Create your first project to get started."}
            </p>
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-muted text-foreground hover:bg-muted/80 transition cursor-pointer"
              >
                Clear Search
              </button>
            ) : (
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground bg-gradient-to-r from-primary to-accent hover:opacity-95 shadow-md transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Project</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group bg-card border border-border hover:border-primary/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-accent/50 to-transparent group-hover:from-primary group-hover:to-accent transition-all duration-300" />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-gradient-to-tr group-hover:from-primary group-hover:to-accent group-hover:text-primary-foreground transition-all duration-300">
                      <FolderKanban className="w-5 h-5" />
                    </div>

                    <button
                      onClick={(e) => openInviteModal(e, project)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground bg-input/40 hover:bg-input border border-border transition cursor-pointer"
                      title="Invite team member"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Invite</span>
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {project.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2 min-h-[2.5rem]">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(project.created_at)}</span>
                  </div>

                  <button
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-accent group-hover:translate-x-0.5 transition-all cursor-pointer"
                  >
                    <span>View Board</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-xs animate-fadeIn">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />

            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Create New Project</h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Website Redesign"
                  className="w-full px-3.5 py-2.5 bg-input/40 border border-border rounded-xl text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary text-sm transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="What's this project about?"
                  className="w-full px-3.5 py-2.5 bg-input/40 border border-border rounded-xl text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary text-sm transition resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-primary-foreground bg-gradient-to-r from-primary to-accent hover:opacity-95 shadow-md active:scale-[0.99] transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {createLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Project</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {inviteModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-xs animate-fadeIn">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />

            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div>
                <h2 className="text-lg font-bold text-foreground">Invite Collaborator</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Project: <span className="font-semibold text-foreground">{inviteModalProject.name}</span>
                </p>
              </div>
              <button
                onClick={() => setInviteModalProject(null)}
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
                  placeholder="collaborator@example.com"
                  className="w-full px-3.5 py-2.5 bg-input/40 border border-border rounded-xl text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary text-sm transition"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  The user must already have a TaskSync account.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setInviteModalProject(null)}
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
                      <span>Inviting...</span>
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
    </div>
  );
};

export default Dashboard;
