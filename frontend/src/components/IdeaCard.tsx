import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Target, TrendingUp, Users, ArrowRight } from 'lucide-react';
import React from 'react';
import type { Idea, IdeaStatus } from '@/lib/api';

const statusOptions: { value: IdeaStatus; label: string }[] = [
  { value: 'suggested', label: 'Suggested' },
  { value: 'deep_dive', label: 'Deep Dive' },
  { value: 'iterating', label: 'Iterating' },
  { value: 'considering', label: 'Considering' },
  { value: 'closed', label: 'Closed' },
];

interface IdeaCardProps {
  idea: Idea;
  onDeepDive: (idea: Idea) => void;
  onStatusChange: (id: string, newStatus: IdeaStatus) => void;
}

export function IdeaCard({ idea, onDeepDive, onStatusChange }: IdeaCardProps) {
  const getEffortColor = (effort: number) => {
    if (effort <= 3) return 'bg-green-500';
    if (effort <= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-lg group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
            {idea.title}
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className={getScoreColor(idea.score)}>
              Score: {idea.score}/10
            </Badge>
            <Badge variant="outline" className="text-slate-600">
              Effort: {idea.effort}/10
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Effort Level:</span>
            <div className="flex-1">
              <Progress 
                value={idea.effort * 10} 
                className="h-2"
                // @ts-ignore
                style={{'--progress-background': getEffortColor(idea.effort)}}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {idea.isError && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 rounded mb-4">
            <strong>LLM Parsing Error:</strong> The LLM response could not be parsed into ideas. See raw response below.<br />
            <pre className="bg-slate-100 text-xs p-2 rounded overflow-x-auto max-h-40 whitespace-pre-wrap mt-2">{idea.llm_raw_response || 'No raw response available.'}</pre>
          </div>
        )}
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium text-sm text-slate-700">Hook:</span>
              <p className="text-sm text-slate-600 mt-1">{idea.hook}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium text-sm text-slate-700">Value:</span>
              <p className="text-sm text-slate-600 mt-1">{idea.value}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium text-sm text-slate-700">Evidence:</span>
              <p className="text-sm text-slate-600 mt-1">{idea.evidence}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium text-sm text-slate-700">Differentiator:</span>
              <p className="text-sm text-slate-600 mt-1">{idea.differentiator}</p>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 mb-3">
            <ArrowRight className="w-4 h-4 text-slate-500" />
            <span className="font-medium text-sm text-slate-700">Call to Action:</span>
          </div>
          <p className="text-sm text-slate-600 mb-4">{idea.callToAction}</p>
          
          <Button 
            onClick={() => onDeepDive(idea)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Request Deep Dive
          </Button>
        </div>
      </CardContent>
      <div className="mt-4 border-t pt-4">
        <span className="font-medium text-sm text-slate-700">Status:</span>
        <select
          value={idea.status}
          onChange={e => onStatusChange(idea.id, e.target.value as IdeaStatus)}
          className="ml-4 border rounded px-2 py-1"
        >
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </Card>
  );
}