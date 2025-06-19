import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, GitFork, Eye, TrendingUp, Lightbulb, Target, Clock, DollarSign } from 'lucide-react';
import { RepoCard } from "@/components/RepoCard";
import { IdeaWorkspace } from "@/components/IdeaWorkspace";
import { Dashboard } from "@/components/Dashboard";
import { DateNavigation } from "@/components/DateNavigation";
import { getRepos, getIdeas, triggerDeepDive, transformRepo, transformIdea } from "@/lib/api";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

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
  const [pollingTimeout, setPollingTimeout] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('repos');

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
      for (const repo of currentRepos) {
        try {
          const ideas = await getIdeas(repo.id);
          ideasMap[repo.id] = ideas.map(transformIdea);
        } catch (err) {
          console.error(`Error fetching ideas for repo ${repo.id}:`, err);
          ideasMap[repo.id] = [];
        }
      }
      setAllRepoIdeas(ideasMap);
    };

    fetchAllIdeas();
  }, [currentRepos]);

  const handleRepoSelect = (repo) => {
    setSelectedRepo(repo);
    const ideas = allRepoIdeas[repo.id] || [];
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
      setAllRepoIdeas(prev => ({ ...prev, [repoId]: ideas.map(transformIdea) }));
      // If the selected repo is the one being refetched, update repoIdeas too
      if (selectedRepo && selectedRepo.id === repoId) {
        setRepoIdeas(ideas.map(transformIdea));
      }
    } catch (err) {
      // Optionally handle error
    }
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            GitHub Trending Ideas Generator
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover trending repositories and unlock their business potential with AI-powered insights
          </p>
        </div>

        <DateNavigation 
          currentDate={currentDate}
          onDateChange={setCurrentDate}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="repos" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Trending Repos
            </TabsTrigger>
            <TabsTrigger value="workspace" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Ideas Workspace
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Analytics Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="repos" className="space-y-6">
            {currentRepos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-slate-600">No repositories found.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {currentRepos.map((repo) => (
                  <RepoCard 
                    key={repo.id} 
                    repo={repo} 
                    ideas={allRepoIdeas[repo.id] || []}
                    onSelect={handleRepoSelect}
                    isSelected={selectedRepo?.id === repo.id}
                    pollingDeepDiveId={pollingDeepDiveId}
                    onSwitchToWorkspace={() => setActiveTab('workspace')}
                    onIdeasRefetch={() => refetchIdeasForRepo(repo.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="workspace" className="space-y-6">
            <IdeaWorkspace 
              ideas={repoIdeas}
              selectedRepo={selectedRepo}
              pollingDeepDiveId={pollingDeepDiveId}
              onIdeasRefetch={() => {
                if (selectedRepo) refetchIdeasForRepo(selectedRepo.id);
              }}
            />
          </TabsContent>

          <TabsContent value="dashboard">
            <Dashboard ideas={repoIdeas} selectedRepo={selectedRepo} />
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  );
};

export default Index;