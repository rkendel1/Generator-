import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Target, TrendingUp, Users, ArrowRight, History, RefreshCw, Edit3, Star, Lightbulb, Briefcase, Info } from 'lucide-react';
import React from 'react';
import type { Idea, IdeaStatus, DeepDiveVersion, Repo, DeepDive } from '@/lib/api';
import { Link } from 'react-router-dom';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import ReactMarkdown from 'react-markdown';

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
  deepDiveInProgress?: boolean;
  onOpenModal?: (idea: Idea) => void;
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
  deepDiveInProgress = false,
  onOpenModal,
}: IdeaCardProps) {
  const [expanded, setExpanded] = React.useState(false);

  if (!idea) {
    return null;
  }

  const formatDeepDiveMarkdown = (markdown) => {
    if (!markdown) return '';
    // Replace standalone bolded lines with H3 markdown headings
    return markdown.replace(/^\*\*(.*)\*\*$/gm, '### $1');
  };

  const deepDiveContent = idea.deep_dive?.raw || idea.deep_dive_raw_response;

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

  const shouldShowScores = (idea.deep_dive || idea.deep_dive_raw_response) && ['iterating', 'considering', 'closed'].includes(idea.status);

  const type = idea.type || '';
  const typeLabel = type === 'side_hustle' ? 'Side Hustle' : type === 'full_scale' ? 'Full Scale' : '';
  const typeIcon = type === 'side_hustle' ? <Lightbulb className="w-4 h-4 text-orange-500 inline-block mr-1" /> : type === 'full_scale' ? <Briefcase className="w-4 h-4 text-blue-600 inline-block mr-1" /> : null;
  const typeColor = type === 'side_hustle' ? 'bg-orange-100 text-orange-800' : type === 'full_scale' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow p-4 mb-4 max-w-md relative">
      {deepDiveInProgress && (
        <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
          <svg className="animate-spin w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <span className="text-xs text-blue-600 font-semibold">Deep Dive in progress...</span>
        </div>
      )}
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
        {onOpenModal ? (
          <button
            className="text-blue-600 hover:underline font-semibold text-lg bg-transparent border-none p-0 m-0 cursor-pointer"
            style={{ appearance: 'none' }}
            onClick={e => {
              e.stopPropagation();
              onOpenModal(idea);
            }}
          >
            {idea.title}
          </button>
        ) : (
          <Link to={`/ideas/${idea.id}`} className="text-blue-600 hover:underline font-semibold text-lg">
            {idea.title}
          </Link>
        )}
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
          <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-lg font-bold text-white ${
            mvpEffort <= 3 ? 'bg-green-500' : 
            mvpEffort <= 6 ? 'bg-yellow-400' : 
            'bg-red-500'
          }`}>{mvpEffort}</span>
        </div>
        {type && (
          <div className="flex flex-col items-center justify-center">
            <span className="text-xs text-slate-500 mb-1">Type</span>
            <span className={`w-24 h-8 flex items-center justify-center rounded-lg text-sm font-bold ${typeColor}`}>{typeIcon}{typeLabel}
              {type === 'side_hustle' && score < 8 && mvpEffort <= 3 && (
                <span className="ml-1" title="Low score, but very low effort makes this a quick win."><Info className="w-3 h-3 text-orange-400 inline-block" /></span>
              )}
            </span>
          </div>
        )}
      </div>
      
      {/* Investor Scoring Indicators */}
      {idea.deep_dive?.investor_scoring && typeof idea.deep_dive.investor_scoring === 'object' && Object.keys(idea.deep_dive.investor_scoring).length > 0 && (
        <div className="mb-2">
          <div className="text-xs text-slate-500 mb-1 font-medium">Investor Scoring</div>
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(idea.deep_dive.investor_scoring).map(([key, value]) => {
              // Skip raw_text and non-numeric values
              if (key === 'raw_text' || typeof value !== 'number') return null;
              
              const getScoreColor = (score: number) => {
                if (score >= 8) return 'bg-green-500';
                if (score >= 6) return 'bg-yellow-500';
                return 'bg-red-500';
              };
              
              return (
                <div key={key} className="flex items-center gap-1">
                  <span className="text-xs text-slate-600 truncate" title={key}>
                    {key.length > 12 ? key.substring(0, 12) + '...' : key}
                  </span>
                  <div className="flex-1 bg-slate-200 rounded-full h-1.5 min-w-[20px]">
                    <div 
                      className={`h-1.5 rounded-full ${getScoreColor(value)}`}
                      style={{ width: `${(value / 10) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-slate-700 w-4 text-right">{value}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="border-t border-slate-100 pt-2 mt-2">
        <button
          className="w-full text-left text-slate-700 text-sm font-medium flex items-center gap-2 py-1 hover:underline"
          onClick={e => {
            e.stopPropagation();
            setExpanded(exp => !exp);
          }}
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
      {/* Deep Dive Section */}
      {(idea.deep_dive?.raw || idea.deep_dive_raw_response) && (
        <div className="border-t border-slate-100 pt-2 mt-2">
          <Accordion type="single" collapsible defaultValue="">
            <AccordionItem value="deepdive">
              <button
                className="w-full text-left text-purple-700 text-sm font-bold flex items-center gap-2 py-1 hover:underline"
                onClick={e => e.stopPropagation()}
                type="button"
              >
                <span className="mr-1"><Star className="w-4 h-4 text-purple-500" /></span> Deep Dive Analysis
              </button>
              <AccordionContent>
                <div className="space-y-4 mt-2 text-slate-700 text-sm">
                  <ReactMarkdown
                    components={{
                      h3: ({node, ...props}) => <h3 className="text-base font-bold text-purple-800 mt-4 mb-1 border-b pb-1" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-6 space-y-1" {...props} />,
                      li: ({node, ...props}) => <li className="text-slate-600" {...props} />,
                      p: ({node, ...props}) => <p className="text-slate-600 leading-relaxed" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
                    }}
                  >
                    {formatDeepDiveMarkdown(deepDiveContent)}
                  </ReactMarkdown>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  );
}