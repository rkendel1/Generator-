import React, { useState, useEffect, type ReactElement } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Star, Lightbulb, Target, TrendingUp, Users, ArrowRight, StickyNote, Save, Edit3, Rocket, Clock, Brain, Briefcase, BarChart, GripVertical } from 'lucide-react';
import { IdeaCard } from "./IdeaCard";
import { getShortlist, addToShortlist, removeFromShortlist, getDeepDiveVersions, createDeepDiveVersion, restoreDeepDiveVersion, fetchIdeas, updateIdeaStatus, getAllIdeas, triggerDeepDive, getIdeaById } from "../lib/api";
import type { IdeaStatus, Idea, DeepDiveVersion, Repo } from '../lib/api';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import type { AxiosError } from 'axios';
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useNavigate, Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { IdeaDetailModal } from './IdeaDetailModal';

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

  const [modalIdea, setModalIdea] = useState<Idea | null>(null);
  const [deepDiveInProgress, setDeepDiveInProgress] = useState<string | null>(null);

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
  
  console.log('🔍 DEBUG: Processing ideas for filtering:', { 
    totalIdeas: ideas?.length || 0, 
    showManual, 
    showGenerated,
    ideas: ideas?.map(i => ({ id: i.id, title: i.title, status: i.status, repo_id: i.repo_id, hasDeepDive: !!(i.deep_dive || i.deep_dive_raw_response) }))
  });
  
  (ideas || []).forEach(idea => {
    if (showManual && !idea.repo_id) {
      console.log('🔍 DEBUG: Adding manual idea to', idea.status, ':', idea.title);
      ideasByStatus[idea.status].push(idea);
    }
    else if (showGenerated && idea.repo_id) {
      console.log('🔍 DEBUG: Adding generated idea to', idea.status, ':', idea.title);
      ideasByStatus[idea.status].push(idea);
    }
    else if (!idea.repo_id && !showManual) {
      console.log('🔍 DEBUG: Skipping manual idea (showManual=false):', idea.title);
      return;
    }
    else if (idea.repo_id && !showGenerated) {
      console.log('🔍 DEBUG: Skipping generated idea (showGenerated=false):', idea.title);
      return;
    }
  });
  
  console.log('🔍 DEBUG: Ideas by status after filtering:', {
    suggested: ideasByStatus.suggested.length,
    deep_dive: ideasByStatus.deep_dive.length,
    iterating: ideasByStatus.iterating.length,
    considering: ideasByStatus.considering.length,
    closed: ideasByStatus.closed.length,
    deepDiveIdeas: ideasByStatus.deep_dive.map(i => ({ id: i.id, title: i.title, hasDeepDive: !!(i.deep_dive || i.deep_dive_raw_response) }))
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
    console.log('🔍 DEBUG: Kanban move:', { id: idea.id, from: sourceStatus, to: destStatus });
    // Optimistically update UI
    setIdeas(prev => prev.map(i => i.id === idea.id ? { ...i, status: destStatus } : i));
    try {
      // Update status in backend
      await updateIdeaStatus(idea.id, destStatus);
      // If moved from suggested to deep_dive, trigger deep dive
      if (sourceStatus === 'suggested' && destStatus === 'deep_dive') {
        console.log('🔍 DEBUG: Triggering deep dive for dragged idea:', idea.id);
        toast({
          title: 'Deep Dive Requested',
          description: `Generating deep dive for "${idea.title}"...`,
        });
        try {
          await triggerDeepDive(idea.id);
          setIdeas(prev => prev.map(i => i.id === idea.id ? { ...i, deep_dive_requested: true } : i));
          toast({
            title: 'Deep Dive Started',
            description: `Deep dive for "${idea.title}" is being generated. This may take a few minutes.`,
          });
          
          // Poll for completion and refresh ideas
          const pollDeepDive = async (retries = 30) => {
            console.log('🔍 DEBUG: Starting deep dive polling for dragged idea:', idea.id);
            for (let i = 0; i < retries; i++) {
              try {
                console.log(`🔍 DEBUG: Polling attempt ${i + 1}/${retries}`);
                const updated = await getIdeaById(idea.id);
                console.log('🔍 DEBUG: Polling response:', updated);
                
                if ((updated.deep_dive_raw_response && updated.deep_dive_raw_response.length > 0) || (updated.deep_dive && Object.keys(updated.deep_dive).length > 0)) {
                  console.log('🔍 DEBUG: Deep dive completed, refreshing ideas list');
                  // Refresh the entire ideas list to show the updated data
                  if (showAllIdeas) {
                    const allIdeas = await getAllIdeas();
                    setIdeas(allIdeas);
                  } else if (repoId) {
                    const repoIdeas = await fetchIdeas(repoId);
                    setIdeas(repoIdeas);
                  }
                  toast({
                    title: 'Deep Dive Complete',
                    description: `Analysis for "${idea.title}" is ready!`,
                  });
                  return;
                }
                console.log('🔍 DEBUG: Deep dive not ready yet, waiting...');
                await new Promise(res => setTimeout(res, 2000));
              } catch (error) {
                console.error('❌ ERROR: Error polling for deep dive:', error);
                break;
              }
            }
            console.log('🔍 DEBUG: Polling timeout reached');
            toast({
              title: 'Deep Dive Timeout',
              description: 'The deep dive is taking longer than expected. Please check the idea details.',
              variant: 'destructive',
            });
          };
          pollDeepDive();
        } catch (deepDiveError) {
          console.error('❌ ERROR: Deep dive failed:', deepDiveError);
          toast({
            title: 'Deep Dive Failed',
            description: 'Failed to start deep dive. You can try again from the idea details.',
            variant: 'destructive',
          });
        }
      } else if (destStatus === 'deep_dive') {
        // If moved to deep_dive from another status, just trigger deep dive (no toast)
        console.log('🔍 DEBUG: Triggering deep dive for idea moved to deep_dive:', idea.id);
        try {
          await triggerDeepDive(idea.id);
          setIdeas(prev => prev.map(i => i.id === idea.id ? { ...i, deep_dive_requested: true } : i));
          
          // Poll for completion and refresh ideas
          const pollDeepDive = async (retries = 30) => {
            console.log('🔍 DEBUG: Starting deep dive polling for moved idea:', idea.id);
            for (let i = 0; i < retries; i++) {
              try {
                const updated = await getIdeaById(idea.id);
                if ((updated.deep_dive_raw_response && updated.deep_dive_raw_response.length > 0) || (updated.deep_dive && Object.keys(updated.deep_dive).length > 0)) {
                  console.log('🔍 DEBUG: Deep dive completed, refreshing ideas list');
                  // Refresh the entire ideas list to show the updated data
                  if (showAllIdeas) {
                    const allIdeas = await getAllIdeas();
                    setIdeas(allIdeas);
                  } else if (repoId) {
                    const repoIdeas = await fetchIdeas(repoId);
                    setIdeas(repoIdeas);
                  }
                  return;
                }
                await new Promise(res => setTimeout(res, 2000));
              } catch (error) {
                console.error('❌ ERROR: Error polling for deep dive:', error);
                break;
              }
            }
          };
          pollDeepDive();
        } catch (deepDiveError) {
          console.error('❌ ERROR: Deep dive failed:', deepDiveError);
          toast({
            title: 'Deep Dive Failed',
            description: 'Failed to start deep dive. You can try again from the idea details.',
            variant: 'destructive',
          });
        }
      }
    } catch (err) {
      console.error('❌ ERROR: Status update failed:', err);
      // Revert on error
      setIdeas(prev => prev.map(i => i.id === idea.id ? { ...i, status: sourceStatus } : i));
      toast({
        title: 'Failed to update status.',
        description: err instanceof Error ? err.message : 'Unknown error occurred',
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
                      className={`flex-1 flex-shrink flex-grow min-w-0 bg-slate-100 rounded-xl border border-slate-200 shadow-sm p-2 flex flex-col max-h-[80vh] transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-blue-100 border-blue-400' : ''}`}
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
                                  className={`bg-white rounded-lg shadow border border-slate-200 p-0 flex flex-col transition-all duration-200 ease-in-out
                                    ${snapshot.isDragging ? 'ring-4 ring-blue-400 scale-105 opacity-90 z-50 shadow-2xl' : ''}
                                  `}
                                  style={{ marginBottom: '0.25rem', transition: 'box-shadow 0.2s, transform 0.2s, opacity 0.2s' }}
                                  aria-label={snapshot.isDragging ? 'Dragging idea card' : 'Idea card'}
                                  tabIndex={0}
                                >
                                  {/* Drag handle area (top horizontal bar, full width) */}
                                  <div
                                    {...provided.dragHandleProps}
                                    className="flex items-center cursor-grab px-3 py-2 bg-gradient-to-r from-blue-200 to-blue-100 rounded-t-lg border-b-2 border-blue-400 select-none"
                                    style={{ minHeight: 32 }}
                                    aria-label="Drag handle"
                                  >
                                    <GripVertical className="w-5 h-5 text-blue-500 mr-2" />
                                    <span className="text-sm text-blue-700 font-semibold">Drag</span>
                                  </div>
                                  <div className="flex-1 p-2">
                                    <IdeaCard
                                      idea={idea}
                                      onDeepDive={() => {}}
                                      onStatusChange={handleStatusChange}
                                      repos={repos}
                                      showStatusBadge={true}
                                      showStatusDropdown={true}
                                      onOpenModal={setModalIdea}
                                    />
                                  </div>
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
      
      {/* Idea Detail Modal */}
      <Dialog open={!!modalIdea} onOpenChange={open => {
        if (!open) {
          setModalIdea(null);
        }
      }}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Idea Details</DialogTitle>
          </DialogHeader>
          {modalIdea && (
            <IdeaDetailModal
              idea={modalIdea}
              repos={repos}
            />
          )}
          <DialogFooter className="flex flex-row gap-2 justify-end">
            {modalIdea?.status === 'suggested' && (
              <Button variant="default" onClick={async () => {
                if (!modalIdea) return;
                setDeepDiveInProgress(modalIdea.id);
                try {
                  await triggerDeepDive(modalIdea.id);
                  // Poll for completion and update modal state
                  const pollDeepDive = async (retries = 30) => {
                    console.log('🔍 DEBUG: Starting deep dive polling for idea:', modalIdea.id);
                    for (let i = 0; i < retries; i++) {
                      try {
                        console.log(`🔍 DEBUG: Polling attempt ${i + 1}/${retries}`);
                        const updated = await getIdeaById(modalIdea.id);
                        console.log('🔍 DEBUG: Polling response:', updated);
                        
                        if ((updated.deep_dive_raw_response && updated.deep_dive_raw_response.length > 0) || (updated.deep_dive && Object.keys(updated.deep_dive).length > 0)) {
                          console.log('🔍 DEBUG: Deep dive completed, updating modal');
                          setModalIdea(updated);
                          setDeepDiveInProgress(null);
                          toast({
                            title: 'Deep Dive Complete',
                            description: `Analysis for "${modalIdea.title}" is ready!`,
                          });
                          return;
                        }
                        console.log('🔍 DEBUG: Deep dive not ready yet, waiting...');
                        await new Promise(res => setTimeout(res, 2000));
                      } catch (error) {
                        console.error('❌ ERROR: Error polling for deep dive:', error);
                        break;
                      }
                    }
                    console.log('🔍 DEBUG: Polling timeout reached');
                    setDeepDiveInProgress(null);
                    toast({
                      title: 'Deep Dive Timeout',
                      description: 'The deep dive is taking longer than expected. Please try again.',
                      variant: 'destructive',
                    });
                  };
                  pollDeepDive();
                } catch (error) {
                  console.error('Error triggering deep dive:', error);
                  setDeepDiveInProgress(null);
                  toast({
                    title: 'Deep Dive Failed',
                    description: 'Failed to generate deep dive. Please try again.',
                    variant: 'destructive',
                  });
                }
              }}
              disabled={!!deepDiveInProgress}
            >
              {deepDiveInProgress ? 'Generating...' : 'Get Deep Dive'}
            </Button>
            )}
            {modalIdea?.status === 'deep_dive' && (
              <Button variant="secondary" onClick={() => {
                window.location.href = `/idea/${modalIdea.id}`;
              }}>
                Iterate
              </Button>
            )}
            {modalIdea && modalIdea.status !== 'suggested' && modalIdea.status !== 'deep_dive' && (
              <Button variant="secondary" onClick={() => {
                window.location.href = `/idea/${modalIdea.id}`;
              }}>
                Edit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
