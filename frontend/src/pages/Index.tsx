import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, GitFork, Eye, TrendingUp, Lightbulb, Target, Clock, DollarSign, Rocket, Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { RepoCard } from "@/components/RepoCard";
import { IdeaWorkspace } from "@/components/IdeaWorkspace";
import { Dashboard } from "@/components/Dashboard";
import { DateNavigation } from "@/components/DateNavigation";
import { getRepos, getIdeas, triggerDeepDive, getIdeaById, updateIdeaStatus, Idea, Repo, transformRepo, IdeaStatus } from "@/lib/api";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { IdeaGenerator } from '@/components/IdeaGenerator';
import { IdeaCard } from "@/components/IdeaCard";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Link } from 'react-router-dom';
import { LIFECYCLE_STAGES } from '@/components/IdeaWorkspace';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { IdeaDetailModal } from '@/components/IdeaDetailModal';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { DragOverlay } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Droppable } from '@/components/Droppable';
import { Draggable } from '@/components/Draggable';

const VALID_STATUSES = LIFECYCLE_STAGES.map(stage => stage.key);

const Index = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [repoIdeas, setRepoIdeas] = useState([]);
  const [allRepoIdeas, setAllRepoIdeas] = useState({});
  const [currentRepos, setCurrentRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const [pollingDeepDiveId, setPollingDeepDiveId] = useState<string | null>(null);
  const [pollingTimeout, setPollingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [activeTab, setActiveTab] = useState('new');
  const [repoStatus, setRepoStatus] = useState({}); // { [repoId]: { status: 'idle'|'loading'|'success'|'error', error?: string } }
  const [deepDiveInProgress, setDeepDiveInProgress] = useState<string | null>(null);
  const [modalIdea, setModalIdea] = useState<Idea | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );
  const [activeIdeaId, setActiveIdeaId] = useState<string | null>(null);

  const transformIdea = (idea: Idea): Idea => {
    // This function can be used to add any client-side transformations if needed.
    // For now, it just ensures the type.
    return idea;
  };

  const fetchAllIdeas = useCallback(async (repos: Repo[]) => {
    if (!repos || repos.length === 0) return;
    try {
      const ideasMap = {};
      await Promise.all(repos.map(async (repo) => {
        const ideas = await getIdeas(repo.id);
        if (ideas && Array.isArray(ideas)) {
          ideasMap[repo.id] = ideas.filter(idea => idea && idea.id).map(transformIdea);
        } else {
          ideasMap[repo.id] = [];
        }
      }));
      setAllRepoIdeas(ideasMap);
    } catch (error) {
      console.error("Failed to fetch all ideas:", error);
      toast({
        title: 'Error',
        description: 'Could not fetch ideas. Please try again later.',
        variant: 'destructive'
      });
    }
  }, [setAllRepoIdeas, currentRepos]);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        setLoading(true);
        setError(null);
        const repos = await getRepos();
        const transformedRepos = repos.map(transformRepo);
        setCurrentRepos(transformedRepos);
      } catch (err) {
        console.error('Error fetching repos:', err);
        setError('Failed to load repositories');
        toast({
          title: "Error",
          description: "Failed to load repositories. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, []);

  useEffect(() => {
    if (currentRepos.length > 0) {
      fetchAllIdeas(currentRepos);
    }
  }, [currentRepos, fetchAllIdeas]);

  const handleRepoSelect = (repo) => {
    setSelectedRepo(repo);
    // Only keep ideas with a valid id
    const ideas = (allRepoIdeas[repo.id] || []).filter(idea => idea && idea.id);
    setRepoIdeas(ideas);
  };

  // Clean up polling on unmount or repo/idea change
  useEffect(() => {
    return () => {
      if (pollingTimeout) clearTimeout(pollingTimeout);
      setPollingDeepDiveId(null);
    };
  }, [selectedRepo]);

  // Refetch ideas for a repo and update state
  const refetchIdeasForRepo = async (repoId) => {
    try {
      const ideas = await getIdeas(repoId);
      // Only keep ideas with a valid id
      setAllRepoIdeas(prev => ({ ...prev, [repoId]: ideas.filter(idea => idea && idea.id).map(transformIdea) }));
      // If the selected repo is the one being refetched, update repoIdeas too
      if (selectedRepo && selectedRepo.id === repoId) {
        setRepoIdeas(ideas.filter(idea => idea && idea.id).map(transformIdea));
      }
    } catch (err) {
      // Optionally handle error
    }
  };

  const isToday = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  };

  // Add a function to refresh all ideas and switch to workspace
  const handleIdeasGenerated = () => {
    // Refetch all ideas for all repos (and manual ideas)
    setTimeout(() => {
      setActiveTab('workspace');
    }, 100); // Switch to workspace after a short delay
  };

  // Helper to determine if an idea is new (created within last 24 hours)
  const isNewIdea = (idea: Idea) => {
    if (!idea.created_at) return false;
    const created = new Date(idea.created_at).getTime();
    const now = Date.now();
    return now - created < 24 * 60 * 60 * 1000;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-slate-600">Loading trending repositories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            TailorM8
          </h1>
        </div>

        <DateNavigation 
          currentDate={currentDate}
          onDateChange={setCurrentDate}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 mt-2">
            <TabsTrigger value="new" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              New Ideas
            </TabsTrigger>
            <TabsTrigger value="workspace" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Ideas Workspace
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Analytics Dashboard
            </TabsTrigger>
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <Rocket className="w-4 h-4" />
              TailorM8 Generator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="space-y-6">
            <div className="overflow-x-auto">
              <div className="flex gap-2 w-full">
                {(() => {
                  // Gather all ideas, sort by created_at desc, take 20
                  const allIdeas = Object.values(allRepoIdeas).flat() as Idea[];
                  const sortedIdeas = allIdeas
                    .filter(idea => idea && idea.created_at)
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 20);
                  if (sortedIdeas.length === 0) {
                    return <div className="text-slate-400 text-sm text-center py-4">No new ideas</div>;
                  }
                  // Group by repo_id (with null/undefined as 'manual')
                  const groups: Record<string, Idea[]> = {};
                  sortedIdeas.forEach(idea => {
                    const key = idea.repo_id || 'manual';
                    if (!groups[key]) groups[key] = [];
                    groups[key].push(idea);
                  });
                  // Helper to get repo name by id
                  const getRepoName = (repoId: string) => {
                    if (repoId === 'manual') return 'Manual/Generated Ideas';
                    const repo = currentRepos.find(r => r.id === repoId);
                    return repo ? repo.name : 'Unknown Repo';
                  };
                  // Take up to 5 groups/columns
                  return Object.entries(groups).slice(0, 5).map(([repoId, ideas]) => {
                    const repo = currentRepos.find(r => r.id === repoId);
                    const status = repoStatus[repoId]?.status || 'idle';
                    const errorMsg = repoStatus[repoId]?.error;
                    return (
                      <div key={repoId} className="flex-1 flex-shrink flex-grow min-w-0 bg-slate-100 rounded-xl border border-slate-200 shadow-sm p-2 flex flex-col max-h-[80vh] transition-colors duration-200">
                        {/* Repo group header */}
                        <div className="mb-2 flex flex-col gap-1">
                          <div className="flex items-center justify-between min-w-0 w-full">
                            {repo ? (
                              <>
                                <a
                                  href={repo.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-700 hover:text-blue-900 font-semibold text-base truncate max-w-[120px]"
                                  title={repo.name}
                                >
                                  {repo.name}
                                </a>
                                {repo.language && (
                                  <span className="px-2 py-0.5 rounded bg-blue-200 text-blue-900 text-xs font-semibold whitespace-nowrap ml-2">{repo.language}</span>
                                )}
                              </>
                            ) : (
                              <span className="text-slate-700 font-semibold text-base">Manual/Generated Ideas</span>
                            )}
                          </div>
                          {repo && repo.summary && (
                            <div className="text-slate-700 text-sm leading-snug mt-1" title={repo.summary}>{repo.summary}</div>
                          )}
                          {(!repo || !repo.summary) && repoId === 'manual' && (
                            <div className="text-slate-500 text-sm italic">Ideas generated manually or by AI</div>
                          )}
                        </div>
                        {/* End repo group header */}
                        <div className="flex-1 overflow-y-auto space-y-2">
                          {ideas.map(idea => (
                            <div key={idea.id} className="mb-2">
                              <IdeaCard
                                idea={idea}
                                onDeepDive={() => triggerDeepDive(idea.id)}
                                onStatusChange={async (id, newStatus) => {
                                  if (newStatus === idea.status) return;
                                  try {
                                    await updateIdeaStatus(id, newStatus as IdeaStatus);
                                    if (idea.status === 'suggested' && newStatus === 'deep_dive') {
                                      await triggerDeepDive(id);
                                    }
                                    await refetchIdeasForRepo((idea as Idea).repo_id);
                                  } catch (err) {
                                    alert('Failed to update status');
                                  }
                                }}
                                repos={currentRepos}
                                showRepoSummary={false}
                                showStatusDropdown={false}
                                showStatusBadge={false}
                                forceNewBadge={isNewIdea(idea)}
                                onOpenModal={setModalIdea}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="workspace" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                All Ideas Workspace
              </h2>
              <div className="text-sm text-slate-600">
                Showing all ideas from all repos and manual generation
              </div>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={({ active }) => {
                setActiveIdeaId(active.id as string);
              }}
              onDragEnd={async ({ active, over }) => {
                setActiveIdeaId(null);
                if (!over || active.id === over.id) return;

                const ideaId = active.id as string;
                const newStatus = over.id as IdeaStatus;

                // Validate newStatus is a valid status string
                if (!VALID_STATUSES.includes(newStatus)) {
                  toast({
                    title: 'Invalid Status',
                    description: 'Could not move idea: invalid status column.',
                    variant: 'destructive',
                  });
                  return;
                }

                // Use all ideas
                const allIdeas = Object.values(allRepoIdeas).flat() as Idea[];
                const idea = allIdeas.find(i => i.id === ideaId);
                if (!idea || idea.status === newStatus) return;

                // Optimistically update UI
                setAllRepoIdeas(prev => {
                  const newIdeas = { ...prev };
                  for (const repoId in newIdeas) {
                    newIdeas[repoId] = newIdeas[repoId].map(i =>
                      i.id === ideaId ? { ...i, status: newStatus } : i
                    );
                  }
                  return newIdeas;
                });

                try {
                  await updateIdeaStatus(ideaId, newStatus as IdeaStatus);
                  setDeepDiveInProgress(ideaId);
                  // Start polling for deep dive completion
                  const pollDeepDive = async (retries = 30) => {
                    for (let i = 0; i < retries; i++) {
                      const updated = await getIdeaById(ideaId);
                      if ((updated.deep_dive_raw_response && updated.deep_dive_raw_response.length > 0) || (updated.deep_dive && Object.keys(updated.deep_dive).length > 0)) {
                        setModalIdea(updated);
                        setDeepDiveInProgress(null);
                        return;
                      }
                      await new Promise(res => setTimeout(res, 2000));
                    }
                    setDeepDiveInProgress(null);
                  };
                  pollDeepDive();
                } catch (err) {
                  setDeepDiveInProgress(null);
                  toast({
                    title: 'Error',
                    description: 'Failed to update idea status',
                    variant: 'destructive',
                  });
                }
              }}
            >
              <div className="flex gap-4 overflow-x-auto pb-2">
                {LIFECYCLE_STAGES.map(stage => {
                  // Gather all ideas for this status
                  const allIdeas = Object.values(allRepoIdeas).flat() as Idea[];
                  const ideasForStage = allIdeas.filter(idea => idea.status === stage.key);
                  return (
                    <Droppable key={stage.key} id={stage.key}>
                      {({ isOver, setNodeRef }) => (
                        <div
                          ref={setNodeRef}
                          className={`transition-all rounded p-2 w-80 min-w-[20rem] h-[70vh] flex flex-col ${
                            isOver ? 'bg-blue-100 border-blue-500 border-2' : 'bg-slate-100 border border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-semibold">{stage.label}</div>
                            <span className="bg-slate-300 text-xs rounded px-2 py-0.5 ml-2">{ideasForStage.length}</span>
                          </div>
                          <SortableContext
                            items={ideasForStage.map(i => i.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                              {ideasForStage.length === 0 ? (
                                <div className="text-slate-400 text-xs text-center py-2">No ideas</div>
                              ) : (
                                ideasForStage.map(idea => (
                                  <Draggable key={idea.id} id={idea.id}>
                                    <IdeaCard
                                      idea={idea}
                                      onDeepDive={() => triggerDeepDive(idea.id)}
                                      onStatusChange={() => {}}
                                      repos={currentRepos}
                                      showRepoSummary={false}
                                      showStatusDropdown={false}
                                      showStatusBadge={false}
                                      forceNewBadge={isNewIdea(idea)}
                                      deepDiveInProgress={deepDiveInProgress === idea.id}
                                      onOpenModal={setModalIdea}
                                    />
                                  </Draggable>
                                ))
                              )}
                            </div>
                          </SortableContext>
                        </div>
                      )}
                    </Droppable>
                  );
                })}
              </div>
              <DragOverlay>
                {activeIdeaId && (() => {
                  const allIdeas = Object.values(allRepoIdeas).flat() as Idea[];
                  const activeIdea = allIdeas.find(i => i.id === activeIdeaId);
                  if (!activeIdea) return null;
                  return (
                    <div className="z-50 pointer-events-none">
                      <IdeaCard
                        idea={activeIdea}
                        onDeepDive={() => {}}
                        onStatusChange={() => {}}
                        repos={currentRepos}
                        showRepoSummary={false}
                        showStatusDropdown={false}
                        showStatusBadge={false}
                      />
                    </div>
                  );
                })()}
              </DragOverlay>
            </DndContext>
          </TabsContent>

          <TabsContent value="dashboard">
            <Dashboard ideas={repoIdeas} selectedRepo={selectedRepo} />
          </TabsContent>

          <TabsContent value="generator" className="space-y-6">
            <IdeaGenerator onIdeaCreated={handleIdeasGenerated} />
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
      {/* Idea Detail Modal */}
      <Dialog open={!!modalIdea} onOpenChange={open => {
        if (!open) {
          setModalIdea(null);
          // Refetch all ideas to update Kanban
          fetchAllIdeas(currentRepos);
        }
      }}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Idea Details</DialogTitle>
          </DialogHeader>
          {modalIdea && (
            <IdeaDetailModal
              idea={modalIdea}
              repos={currentRepos}
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
                window.location.href = `/ideas/${modalIdea.id}`;
              }}>
                Iterate
              </Button>
            )}
            {modalIdea && modalIdea.status !== 'suggested' && modalIdea.status !== 'deep_dive' && (
              <Button variant="secondary" onClick={() => {
                window.location.href = `/ideas/${modalIdea.id}`;
              }}>
                Edit
              </Button>
            )}
            {/* Save button can be implemented here if editing is enabled */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;