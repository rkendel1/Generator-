import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Target, TrendingUp, Users, ArrowRight, History, RefreshCw, Edit3, Star } from 'lucide-react';
import React from 'react';
import type { Idea, IdeaStatus, DeepDiveVersion, Repo } from '@/lib/api';
import { Link } from 'react-router-dom';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const statusOptions: { value: IdeaStatus; label: string }[] = [
  { value: 'suggested', label: 'Suggested' },
  { value: 'deep_dive', label: 'Deep Dive' },
  { value: 'iterating', label: 'Iterating' },
  { value: 'considering', label: 'Considering' },
  { value: 'closed', label: 'Closed' },
];

interface IdeaCardProps {
  idea: Idea & { deep_dive_versions?: DeepDiveVersion[] };
  onDeepDive?: (idea: Idea) => void;
  onStatusChange?: (id: string, newStatus: IdeaStatus) => void;
  onEdit?: (idea: Idea) => void;
  onShortlist?: (id: string) => void;
  onRestoreDeepDiveVersion?: (ideaId: string, versionNumber: number) => void;
  repos?: Repo[];
  showRepoSummary?: boolean;
  showStatusDropdown?: boolean;
  showStatusBadge?: boolean;
  forceNewBadge?: boolean;
  hideDetailsAccordion?: boolean;
}

export function IdeaCard({
  idea,
  onDeepDive,
  onStatusChange,
  onEdit,
  onShortlist,
  onRestoreDeepDiveVersion,
  repos = [],
  showRepoSummary = true,
  showStatusDropdown = true,
  showStatusBadge = true,
  forceNewBadge = false,
  hideDetailsAccordion = false,
}: IdeaCardProps) {
  const [expanded, setExpanded] = React.useState(false);
  const getEffortColor = (effort: number) => {
    if (effort <= 3) return 'bg-green-100 text-green-800';
    if (effort <= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-100 text-green-800';
    if (score >= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Helper for status badge
  const statusBadge = (status: IdeaStatus) => {
    const color = {
      suggested: 'bg-blue-100 text-blue-800',
      deep_dive: 'bg-purple-100 text-purple-800',
      iterating: 'bg-yellow-100 text-yellow-800',
      considering: 'bg-green-100 text-green-800',
      closed: 'bg-gray-200 text-gray-600',
    }[status];
    return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>{statusOptions.find(s => s.value === status)?.label}</span>;
  };

  // Icon for source
  const getSourceIcon = () => {
    if (idea.repo_id) return <TrendingUp className="w-4 h-4 text-blue-500" />;
    return <Zap className="w-4 h-4 text-orange-500" />;
  };

  const score = idea.score ?? 5;
  const mvpEffort = idea.mvp_effort ?? 5;

  // Lookup repo
  const repo = repos.find(r => r.id === idea.repo_id);

  // Format date
  const createdAt = idea.created_at ? new Date(idea.created_at).toLocaleDateString() : '';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow p-4 mb-4 max-w-md">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {forceNewBadge ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07-7.07l-1.41 1.41M6.34 17.66l-1.41 1.41m12.02 0l1.41-1.41M6.34 6.34L4.93 4.93" /></svg>
              NEW!
            </span>
          ) : showStatusBadge && idea.status !== 'suggested' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
              <span className="mr-1"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07-7.07l-1.41 1.41M6.34 17.66l-1.41 1.41m12.02 0l1.41-1.41M6.34 6.34L4.93 4.93" stroke="#888" strokeWidth="2" strokeLinecap="round"/></svg></span>
              {statusOptions.find(s => s.value === idea.status)?.label}
            </span>
          )}
        </div>
        {showStatusDropdown && (
          <div className="relative">
            <button className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 17a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="#888"/></svg>
              <span>{statusOptions.find(s => s.value === idea.status)?.label || 'Suggested'}</span>
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-row items-center gap-2">
        <Link to={`/ideas/${idea.id}`} className="text-blue-600 hover:underline font-semibold text-lg">
          {idea.title}
        </Link>
      </div>
      {showRepoSummary && repo && repo.summary && repo.url && (
        <div className="mb-2 text-slate-600 text-sm">
          <a href={repo.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">{repo.summary}</a>
        </div>
      )}
      <div className="flex gap-4 mb-2">
        <div className="flex flex-col items-center justify-center">
          <span className="text-xs text-slate-500 mb-1">Overall Score</span>
          <span className="w-8 h-8 flex items-center justify-center rounded-lg text-lg font-bold bg-green-500 text-white">{score}</span>
        </div>
        <div className="flex flex-col items-center justify-center">
          <span className="text-xs text-slate-500 mb-1">Effort Score</span>
          <span className="w-8 h-8 flex items-center justify-center rounded-lg text-lg font-bold bg-yellow-400 text-white">{mvpEffort}</span>
        </div>
      </div>
      <div className="border-t border-slate-100 pt-2 mt-2">
        <button
          className="w-full text-left text-slate-700 text-sm font-medium flex items-center gap-2 py-1 hover:underline"
          onClick={() => setExpanded(e => !e)}
          aria-expanded={expanded}
        >
          <span className="mr-1">{expanded ? '▼' : '▶'}</span> Elevator Pitch
        </button>
        {expanded && (
          <div className="mt-2 space-y-2 text-slate-700 text-sm">
            {idea.hook && <div>{idea.hook}</div>}
            {idea.value && <div><span className="font-semibold">Value:</span> {idea.value}</div>}
            {idea.evidence && <div><span className="font-semibold">Evidence:</span> {idea.evidence}</div>}
            {idea.differentiator && <div><span className="font-semibold">Differentiator:</span> {idea.differentiator}</div>}
            {idea.call_to_action && <div><span className="font-semibold">Call to Action:</span> {idea.call_to_action}</div>}
          </div>
        )}
      </div>
    </div>
  );
}