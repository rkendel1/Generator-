import React, { useState, useEffect, type ReactElement } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Star, Lightbulb, Target, TrendingUp, Users, ArrowRight, StickyNote, Save, Edit3, Rocket, Clock, Brain, Briefcase, BarChart } from 'lucide-react';
import { IdeaCard } from "./IdeaCard";
import { getShortlist, addToShortlist, removeFromShortlist, getDeepDiveVersions, createDeepDiveVersion, restoreDeepDiveVersion, fetchIdeas, updateIdeaStatus, getAllIdeas, triggerDeepDive } from "../lib/api";
import type { IdeaStatus, Idea, DeepDiveVersion, Repo } from '../lib/api';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import type { AxiosError } from 'axios';
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useNavigate, Link } from "react-router-dom";

export const LIFECYCLE_STAGES: { key: IdeaStatus; label: string }[] = [
  { key: 'suggested', label: 'Suggested' },
  { key: 'deep_dive', label: 'Deep Dive' },
  { key: 'iterating', label: 'Iterating' },
  { key: 'considering', label: 'Considering' },
  { key: 'closed', label: 'Closed' },
];

interface IdeaWorkspaceProps {
  repoId?: string; // Make optional to support showing all ideas
  showAllIdeas?: boolean; // New prop to show all ideas instead of just repo ideas
  repos?: Repo[];
}

export function IdeaWorkspace({ repoId, showAllIdeas = false, repos = [] }: IdeaWorkspaceProps) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [activeStage, setActiveStage] = useState<string>('suggested');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  // Filter state
  const [showManual, setShowManual] = useState(true);
  const [showGenerated, setShowGenerated] = useState(true);

  const [ideaNotes, setIdeaNotes] = useState<Record<number, string>>({});
  const [editingNotes, setEditingNotes] = useState<Record<number, boolean>>({});

  // Shortlist state from backend
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [shortlistLoading, setShortlistLoading] = useState(false);

  const [editingDeepDive, setEditingDeepDive] = useState<Record<string, Record<string, string>>>({});
  const [versionHistory, setVersionHistory] = useState<Record<string, DeepDiveVersion[]>>({});
  const [showVersionHistory, setShowVersionHistory] = useState<string | null>(null);
  const [versionLoading, setVersionLoading] = useState<boolean>(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (showAllIdeas) {
      // Fetch all ideas from all repos
      setLoading(true);
      getAllIdeas()
        .then(fetchedIdeas => {
          // Only keep ideas with a valid id
          setIdeas(fetchedIdeas.filter(idea => idea && idea.id));
        })
        .catch(error => {
          console.error('Error fetching all ideas:', error);
          setIdeas([]);
        })
        .finally(() => setLoading(false));
    } else if (repoId) {
      // Fetch ideas for specific repo
      setLoading(true);
      fetchIdeas(repoId)
        .then(fetchedIdeas => {
          setIdeas(fetchedIdeas.filter(idea => idea && idea.id));
        })
        .catch(error => {
          console.error('Error fetching repo ideas:', error);
          setIdeas([]);
        })
        .finally(() => setLoading(false));
    }
  }, [repoId, showAllIdeas]);

  useEffect(() => {
    const fetchShortlist = async () => {
      setShortlistLoading(true);
      try {
        const shortlistIdeas = await getShortlist();
        setShortlist(shortlistIdeas);
      } catch (err) {
        setShortlist([]);
      } finally {
        setShortlistLoading(false);
      }
    };
    fetchShortlist();
  }, []);

  const handleAddToShortlist = async (ideaId: string) => {
    await addToShortlist(ideaId);
    const shortlistIdeas = await getShortlist();
    setShortlist(shortlistIdeas);
  };
  const handleRemoveFromShortlist = async (ideaId: string) => {
    await removeFromShortlist(ideaId);
    const shortlistIdeas = await getShortlist();
    setShortlist(shortlistIdeas);
  };

  const handleNoteSave = (ideaIndex: number, note: string) => {
    setIdeaNotes(prev => ({ ...prev, [ideaIndex]: note }));
    setEditingNotes(prev => ({ ...prev, [ideaIndex]: false }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Editable deep dive fields
  const handleDeepDiveFieldChange = (ideaId: string, field: string, value: string) => {
    setEditingDeepDive(prev => ({
      ...prev,
      [ideaId]: {
        ...prev[ideaId],
        [field]: value
      }
    }));
  };

  const handleSaveAndRerun = async (idea: Idea, rerun: boolean) => {
    setVersionLoading(true);
    const fields: Record<string, string> = editingDeepDive[idea.id] || (idea.deep_dive as Record<string, string>);
    await createDeepDiveVersion(idea.id, fields, idea.deep_dive_raw_response || '');
    setEditingDeepDive(prev => ({ ...prev, [idea.id]: undefined }));
    setVersionLoading(false);
    const versions = await getDeepDiveVersions(idea.id);
    setVersionHistory(prev => ({ ...prev, [idea.id]: versions }));
    // Refresh ideas after saving
    if (showAllIdeas) {
      const allIdeas = await getAllIdeas();
      setIdeas(allIdeas);
    } else if (repoId) {
      const repoIdeas = await fetchIdeas(repoId);
      setIdeas(repoIdeas);
    }
    if (rerun) {
      window.location.reload();
    }
  };

  const handleShowVersionHistory = async (ideaId: string) => {
    setVersionLoading(true);
    const versions = await getDeepDiveVersions(ideaId);
    setVersionHistory(prev => ({ ...prev, [ideaId]: versions }));
    setShowVersionHistory(ideaId);
    setVersionLoading(false);
  };

  const handleRestoreVersion = async (ideaId: string, versionNumber: number) => {
    setVersionLoading(true);
    await restoreDeepDiveVersion(ideaId, versionNumber);
    setVersionLoading(false);
    setShowVersionHistory(null);
    // Refresh ideas after restoring
    if (showAllIdeas) {
      const allIdeas = await getAllIdeas();
      setIdeas(allIdeas);
    } else if (repoId) {
      const repoIdeas = await fetchIdeas(repoId);
      setIdeas(repoIdeas);
    }
    window.location.reload();
  };

  const handleDeleteVersion = (ideaId: string, versionNumber: number) => {
    // TODO: Implement delete version logic
    alert(`Delete version ${versionNumber} for idea ${ideaId} (not yet implemented)`);
  };

  const handleStatusChange = async (id: string, newStatus: IdeaStatus) => {
    try {
      const updated = await updateIdeaStatus(id, newStatus);
      setIdeas(prev =>
        prev.map(idea => (idea.id === id ? { ...idea, status: updated.status } : idea))
      );
    } catch (err: unknown) {
      if (isAxios404Error(err)) {
        alert('This idea no longer exists in the backend. It will be removed from the board.');
        setIdeas(prev => prev.filter(idea => idea.id !== id));
      } else {
        alert('Failed to update status');
      }
    }
  };

  // Group ideas by status for kanban columns
  const ideasByStatus: Record<IdeaStatus, Idea[]> = {
    suggested: [],
    deep_dive: [],
    iterating: [],
    considering: [],
    closed: [],
  };
  (ideas || []).forEach(idea => {
    if (showManual && !idea.repo_id) ideasByStatus[idea.status].push(idea);
    else if (showGenerated && idea.repo_id) ideasByStatus[idea.status].push(idea);
    else if (!idea.repo_id && !showManual) return;
    else if (idea.repo_id && !showGenerated) return;
  });
  // Sort each column by best ideas (highest score, lowest effort)
  Object.keys(ideasByStatus).forEach(status => {
    ideasByStatus[status as IdeaStatus].sort((a, b) => {
      const scoreA = a.score ?? 0;
      const scoreB = b.score ?? 0;
      const effortA = a.mvp_effort ?? 10;
      const effortB = b.mvp_effort ?? 10;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return effortA - effortB;
    });
  });

  // Drag and drop handler
  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    const sourceStatus = source.droppableId as IdeaStatus;
    const destStatus = destination.droppableId as IdeaStatus;
    if (sourceStatus === destStatus && source.index === destination.index) return;
    // Find the idea
    const idea = ideasByStatus[sourceStatus].find(i => i.id === draggableId);
    if (!idea) return;
    // Debug log
    console.log('Kanban move:', { id: idea.id, from: sourceStatus, to: destStatus });
    // Optimistically update UI
    setIdeas(prev => prev.map(i => i.id === idea.id ? { ...i, status: destStatus } : i));
    try {
      // Update status in backend
      await updateIdeaStatus(idea.id, destStatus);
      // If moved from suggested to deep_dive, trigger deep dive
      if (sourceStatus === 'suggested' && destStatus === 'deep_dive') {
        // Business logic: deep dive request is generated
        toast({
          title: 'Deep Dive Requested',
          description: `Generating deep dive for "${idea.title}"...`,
        });
        await triggerDeepDive(idea.id);
        setIdeas(prev => prev.map(i => i.id === idea.id ? { ...i, deep_dive_requested: true } : i));
        // Show toast when deep dive is completed
        toast({
          title: 'Deep Dive Ready',
          description: `Deep dive for "${idea.title}" is complete!`,
          action: (
            <ToastAction altText="View Details" onClick={() => navigate(`/idea/${idea.id}`)}>
              View Details
            </ToastAction>
          ),
        });
      } else if (destStatus === 'deep_dive') {
        // If moved to deep_dive from another status, just trigger deep dive (no toast)
        await triggerDeepDive(idea.id);
        setIdeas(prev => prev.map(i => i.id === idea.id ? { ...i, deep_dive_requested: true } : i));
      }
    } catch (err) {
      // Revert on error
      setIdeas(prev => prev.map(i => i.id === idea.id ? { ...i, status: sourceStatus } : i));
      toast({
        title: 'Failed to update status or trigger deep dive.',
        description: err instanceof Error ? err.message : undefined,
        variant: 'destructive',
      });
    }
  };

  function isAxios404Error(err: unknown): err is AxiosError {
    return (
      typeof err === 'object' &&
      err !== null &&
      'response' in err &&
      (err as AxiosError).response !== undefined &&
      (err as AxiosError).response?.status === 404
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter controls */}
      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showManual} onChange={e => setShowManual(e.target.checked)} />
          Manual Ideas
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showGenerated} onChange={e => setShowGenerated(e.target.checked)} />
          Generated Ideas
        </label>
        {/* Add more filters here as needed */}
      </div>
      {loading ? (
        <div>Loading ideas...</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="overflow-x-auto">
            <div className="flex gap-2 w-full">
              {LIFECYCLE_STAGES.map(stage => (
                <Droppable droppableId={stage.key} key={stage.key}>
                  {(provided, snapshot): ReactElement => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 flex-shrink flex-grow min-w-0 bg-slate-100 rounded-xl border border-slate-200 shadow-sm p-2 flex flex-col max-h-[80vh] ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                      style={{ flexBasis: 0 }}
                    >
                      <div className="flex items-center justify-between mb-2 text-xs font-semibold text-slate-700">
                        <span>{stage.label}</span>
                        <span className="bg-slate-300 text-xs rounded px-2 py-0.5">{ideasByStatus[stage.key].length}</span>
                        <button className="ml-2 text-blue-500 hover:text-blue-700 text-base font-bold">+</button>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-2">
                        {ideasByStatus[stage.key].length === 0 ? (
                          <div className="text-slate-400 text-xs text-center py-2">No ideas</div>
                        ) : (
                          ideasByStatus[stage.key].map((idea, idx) => (
                            <Draggable
                              key={idea.id}
                              draggableId={idea.id}
                              index={idx}
                              isDragDisabled={idea.status === 'closed'}
                            >
                              {(provided, snapshot): ReactElement => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-white rounded-lg shadow border border-slate-200 p-2 flex flex-col gap-2 ${snapshot.isDragging ? 'ring-2 ring-blue-400' : ''}`}
                                  style={{ marginBottom: '0.25rem' }}
                                >
                                  <IdeaCard
                                    idea={idea}
                                    onDeepDive={() => {}}
                                    onStatusChange={handleStatusChange}
                                    repos={repos}
                                    showStatusBadge={true}
                                    showStatusDropdown={true}
                                    showDetails={true}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </div>
        </DragDropContext>
      )}
    </div>
  );
}
