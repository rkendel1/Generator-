import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, GitFork, Eye, TrendingUp, Lightbulb, Target, Clock, DollarSign, Rocket, Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { RepoCard } from "@/components/RepoCard";
import { IdeaWorkspace } from "@/components/IdeaWorkspace";
import { Dashboard } from "@/components/Dashboard";
import { DateNavigation } from "@/components/DateNavigation";
import { getRepos, getIdeas, triggerDeepDive, transformRepo, transformIdea, updateIdeaStatus, IdeaStatus, Idea } from "@/lib/api";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { IdeaGenerator } from '@/components/IdeaGenerator';
import { IdeaCard } from "@/components/IdeaCard";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Link } from 'react-router-dom';
import { LIFECYCLE_STAGES } from '@/components/IdeaWorkspace';

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

  // Fetch repositories from API
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

  // Fetch ideas for all repos when repos change
  useEffect(() => {
    const fetchAllIdeas = async () => {
      if (currentRepos.length === 0) return;
      const ideasMap = {};
      const statusMap = {};
      for (const repo of currentRepos) {
        statusMap[repo.id] = { status: 'loading' };
        setRepoStatus(prev => ({ ...prev, [repo.id]: { status: 'loading' } }));
        try {
          const ideas = await getIdeas(repo.id);
          ideasMap[repo.id] = ideas.filter(idea => idea && idea.id).map(transformIdea);
          statusMap[repo.id] = { status: 'success' };
          setRepoStatus(prev => ({ ...prev, [repo.id]: { status: 'success' } }));
        } catch (err) {
          console.error(`Error fetching ideas for repo ${repo.id}:`, err);
          ideasMap[repo.id] = [];
          statusMap[repo.id] = { status: 'error', error: err?.message || 'Failed to fetch ideas' };
          setRepoStatus(prev => ({ ...prev, [repo.id]: { status: 'error', error: err?.message || 'Failed to fetch ideas' } }));
        }
      }
      setAllRepoIdeas(ideasMap);
    };

    fetchAllIdeas();
  }, [currentRepos]);

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
                                    await updateIdeaStatus(id, newStatus);
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
                {selectedRepo ? `Ideas for ${selectedRepo.name}` : 'All Ideas Workspace'}
              </h2>
              {selectedRepo ? (
                <Button 
                  onClick={() => setSelectedRepo(null)}
                  className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50"
                >
                  <Lightbulb className="w-4 h-4" />
                  Show All Ideas
                </Button>
              ) : (
                <div className="text-sm text-slate-600">
                  Showing all ideas from all repos and manual generation
                </div>
              )}
            </div>
            <IdeaWorkspace 
              repoId={selectedRepo?.id} 
              showAllIdeas={!selectedRepo}
              repos={currentRepos}
            />
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
    </div>
  );
};

export default Index;