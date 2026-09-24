import React, { useEffect, useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Loader2, 
  AlertCircle,
  Tag
} from 'lucide-react';

const STATUS_CONFIG = {
  todo: {
    label: 'To Do',
    icon: Circle,
    activeClass: 'bg-muted text-foreground border-border ring-2 ring-primary/40',
    idleClass: 'bg-input/30 hover:bg-input/60 text-muted-foreground border-border',
    badgeClass: 'bg-muted/70 text-foreground border-border',
    dotClass: 'bg-muted-foreground',
  },
  in_progress: {
    label: 'In Progress',
    icon: Clock,
    activeClass: 'bg-chart-4/20 text-chart-4 border-chart-4/40 ring-2 ring-chart-4/40 font-semibold',
    idleClass: 'bg-input/30 hover:bg-chart-4/10 text-muted-foreground hover:text-chart-4 border-border',
    badgeClass: 'bg-chart-4/15 text-chart-4 border-chart-4/30',
    dotClass: 'bg-chart-4',
  },
  done: {
    label: 'Done',
    icon: CheckCircle2,
    activeClass: 'bg-chart-3/20 text-chart-3 border-chart-3/40 ring-2 ring-chart-3/40 font-semibold',
    idleClass: 'bg-input/30 hover:bg-chart-3/10 text-muted-foreground hover:text-chart-3 border-border',
    badgeClass: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
    dotClass: 'bg-chart-3',
  },
};

export const TaskDetailModal = ({ task, onClose, onStatusChange }) => {
  const [currentStatus, setCurrentStatus] = useState(task?.status || 'todo');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    if (task?.status) {
      setCurrentStatus(task.status);
    }
  }, [task]);

  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!task) return null;

  const handleStatusSelect = async (nextStatus) => {
    if (nextStatus === currentStatus || updating) return;

    setUpdating(true);
    setUpdateError('');
    try {
      await onStatusChange(task.id, nextStatus);
      setCurrentStatus(nextStatus);
    } catch (err) {
      setUpdateError(err.message || 'Failed to update task status.');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not set';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const activeConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.todo;
  const ActiveIcon = activeConfig.icon;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-detail-title"
    >
      <div 
        className="bg-card border border-border rounded-2xl shadow-2xl max-w-xl w-full p-6 sm:p-7 relative overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary" />

        
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-border/80">
          <div className="flex flex-col gap-1.5 flex-1 pr-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-input/60 border border-border text-muted-foreground">
                <Tag className="w-3 h-3 text-muted-foreground" />
                TASK-{task.id}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${activeConfig.badgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${activeConfig.dotClass}`} />
                {activeConfig.label}
              </span>
            </div>

            <h2 
              id="task-detail-title"
              className="text-xl sm:text-2xl font-bold text-foreground tracking-tight break-words mt-1"
            >
              {task.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-input border border-transparent hover:border-border transition cursor-pointer shrink-0"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        
        <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1">
          {updateError && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{updateError}</span>
            </div>
          )}

          
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Description
            </h3>
            {task.description ? (
              <div className="p-4 rounded-xl bg-input/20 border border-border text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {task.description}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-input/10 border border-dashed border-border/80 text-xs text-muted-foreground italic">
                No description provided for this task.
              </div>
            )}
          </div>

          {/* Status Quick Switcher */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Status
              </h3>
              {updating && (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                  Saving...
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                const IconComponent = config.icon;
                const isSelected = currentStatus === key;

                return (
                  <button
                    key={key}
                    type="button"
                    disabled={updating}
                    onClick={() => handleStatusSelect(key)}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-medium border transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                      isSelected ? config.activeClass : config.idleClass
                    }`}
                  >
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <span>{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="p-3.5 rounded-xl bg-card border border-border/70 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-input/40 flex items-center justify-center text-muted-foreground shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Due Date
                </span>
                <span className="text-xs font-medium text-foreground truncate mt-0.5">
                  {formatDate(task.due_date)}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-card border border-border/70 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-input/40 flex items-center justify-center text-muted-foreground shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Created
                </span>
                <span className="text-xs font-medium text-foreground truncate mt-0.5">
                  {formatTimestamp(task.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        
        <div className="pt-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ActiveIcon className="w-3.5 h-3.5 text-foreground" />
            <span>Currently: <strong>{activeConfig.label}</strong></span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-input/60 hover:bg-input border border-border text-foreground transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
