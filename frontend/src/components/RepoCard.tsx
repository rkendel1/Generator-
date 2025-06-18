import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronRight, Star, GitFork, Eye, TrendingUp, Lightbulb, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { triggerDeepDive } from "@/lib/api";

interface RepoCardProps {
  repo: any;
  ideas: any[];
  onSelect: (repo: any) => void;
  onDeepDive: (idea: any) => void;
  isSelected: boolean;
}

export const RepoCard = ({ repo, ideas, onSelect, onDeepDive, isSelected }: RepoCardProps) => {
  const [expandedIdeas, setExpandedIdeas] = useState<number[]>([]);
  const [requestingDeepDive, setRequestingDeepDive] = useState<number | null>(null);
  const { toast } = useToast();

  const toggleIdea = (index: number) => {
    setExpandedIdeas(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleDeepDiveRequest = async (idea: any, index: number) => {
    if (!idea.id) {
      toast({
        title: "Error",
        description: "Idea ID not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setRequestingDeepDive(index);
    
    try {
      const result = await triggerDeepDive(idea.id);
      
      if (result.status === 'completed' && result.deep_dive) {
        // Generate enhanced deep dive data
        const enhancedIdea = {
          ...idea,
          deep_dive: result.deep_dive,
          deepDiveGenerated: true,
          generatedAt: new Date().toISOString()
        };
        
        toast({
          title: "Deep Dive Complete!",
          description: `Comprehensive analysis for "${idea.title}" is ready.`,
        });
        
        onDeepDive(enhancedIdea);
      } else {
        throw new Error(result.message || 'Deep dive generation failed');
      }
    } catch (error) {
      console.error('Error generating deep dive:', error);
      toast({
        title: "Deep Dive Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setRequestingDeepDive(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 6) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getEffortColor = (effort: number) => {
    if (effort <= 3) return 'bg-green-100 text-green-800 border-green-200';
    if (effort <= 6) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <Card className={`transition-all duration-300 hover:shadow-lg ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-slate-800 mb-2">
              {repo.name}
            </CardTitle>
            <p className="text-sm text-slate-600 mb-3">{repo.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                {repo.stargazers_count?.toLocaleString() || '0'}
              </div>
              <div className="flex items-center gap-1">
                <GitFork className="w-4 h-4" />
                {repo.forks_count?.toLocaleString() || '0'}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {repo.watchers_count?.toLocaleString() || '0'}
              </div>
            </div>
          </div>
          <Badge variant="outline" className="ml-4">
            {repo.language}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <span className="font-medium text-sm">Business Ideas ({ideas.length})</span>
          </div>
          
          <div className="space-y-2">
            {ideas.slice(0, 10).map((idea, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <div 
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50"
                  onClick={() => toggleIdea(index)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm text-slate-700">
                      {index + 1}.
                    </span>
                    <span className="text-sm font-medium text-slate-800">
                      {idea.title}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${getScoreColor(idea.score)}`}>
                      {idea.score}/10
                    </Badge>
                    <Badge className={`text-xs ${getEffortColor(idea.effort)}`}>
                      Effort: {idea.effort}/10
                    </Badge>
                    {expandedIdeas.includes(index) ? 
                      <ChevronDown className="w-4 h-4" /> : 
                      <ChevronRight className="w-4 h-4" />
                    }
                  </div>
                </div>
                
                {expandedIdeas.includes(index) && (
                  <div className="px-4 pb-4 bg-slate-50 border-t">
                    <div className="space-y-3 pt-3">
                      <div>
                        <span className="font-medium text-xs text-slate-700">Hook:</span>
                        <p className="text-xs text-slate-600 mt-1">{idea.hook}</p>
                      </div>
                      
                      <div>
                        <span className="font-medium text-xs text-slate-700">Value:</span>
                        <p className="text-xs text-slate-600 mt-1">{idea.value}</p>
                      </div>
                      
                      <div>
                        <span className="font-medium text-xs text-slate-700">Evidence:</span>
                        <p className="text-xs text-slate-600 mt-1">{idea.evidence}</p>
                      </div>
                      
                      <div>
                        <span className="font-medium text-xs text-slate-700">Differentiator:</span>
                        <p className="text-xs text-slate-600 mt-1">{idea.differentiator}</p>
                      </div>
                      
                      <div>
                        <span className="font-medium text-xs text-slate-700">Call to Action:</span>
                        <p className="text-xs text-slate-600 mt-1">{idea.callToAction}</p>
                      </div>
                      
                      <Button 
                        size="sm" 
                        className="w-full mt-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeepDiveRequest(idea, index);
                        }}
                        disabled={requestingDeepDive === index || idea.deepDiveGenerated}
                      >
                        {requestingDeepDive === index ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating Deep Dive...
                          </>
                        ) : idea.deepDiveGenerated ? (
                          'Deep Dive Available'
                        ) : (
                          'Request Deep Dive'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => onSelect(repo)}
        >
          View All Ideas
        </Button>
      </CardContent>
    </Card>
  );
};
