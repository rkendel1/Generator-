import React from 'react';
import { Idea, Repo, DeepDiveVersion } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import ReactMarkdown from 'react-markdown';
import { Star, TrendingUp, Zap, History, Lightbulb, Briefcase, Info, Rocket, Clock, Target, BarChart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface IdeaDetailModalProps {
  idea: Idea & { deep_dive_versions?: DeepDiveVersion[] };
  repos: Repo[];
}

export const IdeaDetailModal: React.FC<IdeaDetailModalProps> = ({ idea, repos }) => {
  if (!idea) return null;
  
  try {
    const repo = repos.find(r => r.id === idea.repo_id);
    const deepDive = idea.deep_dive;
    const deepDiveContent = deepDive?.raw || idea.deep_dive_raw_response;
    const createdAt = idea.created_at ? new Date(idea.created_at).toLocaleString() : '';

    const type = idea.type || '';
    const typeLabel = type === 'side_hustle' ? 'Side Hustle' : type === 'full_scale' ? 'Full Scale' : '';
    const typeIcon = type === 'side_hustle' ? <Lightbulb className="w-4 h-4 text-orange-500 inline-block mr-1" /> : type === 'full_scale' ? <Briefcase className="w-4 h-4 text-blue-600 inline-block mr-1" /> : null;
    const typeColor = type === 'side_hustle' ? 'bg-orange-100 text-orange-800' : type === 'full_scale' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600';

    // Safely get investor scoring data with error handling
    const getInvestorScoring = () => {
      try {
        if (!deepDive?.investor_scoring) return null;
        
        // If it's already an object with parsed scores
        if (typeof deepDive.investor_scoring === 'object' && deepDive.investor_scoring !== null) {
          return deepDive.investor_scoring;
        }
        
        // If it's a string, try to parse it
        if (typeof deepDive.investor_scoring === 'string') {
          try {
            // Simple parsing for common patterns
            const scores: Record<string, number> = {};
            const lines = deepDive.investor_scoring.split('\n');
            
            for (const line of lines) {
              const match = line.match(/([^:]+):\s*(\d+)/);
              if (match) {
                const category = match[1].trim();
                const score = parseInt(match[2], 10);
                if (score >= 1 && score <= 10) {
                  scores[category] = score;
                }
              }
            }
            
            return Object.keys(scores).length > 0 ? scores : null;
          } catch (error) {
            console.error('Error parsing investor scoring:', error);
            return null;
          }
        }
        
        return null;
      } catch (error) {
        console.error('Error in getInvestorScoring:', error);
        return null;
      }
    };

    const investorScoring = getInvestorScoring();

    // Prepare deep dive fields for visual indicators with error handling
    const deepDiveFields = [
      { key: 'product_clarity', label: 'Product Clarity', value: deepDive?.product_clarity, isScore: false },
      { key: 'timing', label: 'Timing', value: deepDive?.timing, isScore: false },
      { key: 'market_opportunity', label: 'Market Opportunity', value: deepDive?.market_opportunity, isScore: false },
      { key: 'strategic_moat', label: 'Strategic Moat', value: deepDive?.strategic_moat, isScore: false },
      { key: 'business_funding', label: 'Business Funding', value: deepDive?.business_funding, isScore: false },
      { key: 'investor_scoring', label: 'Investor Scoring', value: deepDive?.investor_scoring, isScore: true },
    ];

    return (
      <div className="w-full max-w-5xl px-4 py-2">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 border-b pb-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              {idea.title}
              {repo ? <a href={repo.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 underline text-base">{repo.name}</a> : null}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{idea.status.toUpperCase()}</Badge>
              {repo && repo.language && <Badge variant="secondary">{repo.language}</Badge>}
              <span className="text-xs text-slate-500">Created: {createdAt}</span>
            </div>
          </div>
          <div className="flex gap-4 mt-2 md:mt-0">
            <div className="flex flex-col items-center">
              <span className="text-xs text-slate-500 mb-1">Score</span>
              <span className="w-10 h-10 flex items-center justify-center rounded-lg text-xl font-bold bg-green-500 text-white">{idea.score ?? 5}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-slate-500 mb-1">Effort</span>
              <span className="w-10 h-10 flex items-center justify-center rounded-lg text-xl font-bold bg-yellow-400 text-white">{idea.mvp_effort ?? 5}</span>
            </div>
            {type && (
              <div className="flex flex-col items-center">
                <span className="text-xs text-slate-500 mb-1">Type</span>
                <span className={`w-24 h-10 flex items-center justify-center rounded-lg text-sm font-bold ${typeColor}`}>{typeIcon}{typeLabel}
                  {type === 'side_hustle' && (idea.score ?? 5) < 8 && (idea.mvp_effort ?? 5) <= 3 && (
                    <span className="ml-1" title="Low score, but very low effort makes this a quick win."><Info className="w-3 h-3 text-orange-400 inline-block" /></span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Elevator Pitch & Details */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Elevator Pitch</h3>
            {idea.hook && <div className="mb-2"><span className="font-semibold">Hook:</span> {idea.hook}</div>}
            {idea.value && <div className="mb-2"><span className="font-semibold">Value:</span> {idea.value}</div>}
            {idea.evidence && <div className="mb-2"><span className="font-semibold">Evidence:</span> {idea.evidence}</div>}
            {idea.differentiator && <div className="mb-2"><span className="font-semibold">Differentiator:</span> {idea.differentiator}</div>}
            {idea.call_to_action && <div className="mb-2"><span className="font-semibold">Call to Action:</span> {idea.call_to_action}</div>}
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Repository</h3>
            {repo ? (
              <>
                <div className="mb-1"><span className="font-semibold">Name:</span> {repo.name}</div>
                <div className="mb-1"><span className="font-semibold">Language:</span> {repo.language}</div>
                <div className="mb-1"><span className="font-semibold">Stars:</span> {repo.stargazers_count}</div>
                <div className="mb-1"><span className="font-semibold">Forks:</span> {repo.forks_count}</div>
                <div className="mb-1"><span className="font-semibold">Watchers:</span> {repo.watchers_count}</div>
                <div className="mb-1"><span className="font-semibold">Summary:</span> {repo.summary}</div>
                <div className="mb-1"><span className="font-semibold">URL:</span> <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{repo.url}</a></div>
              </>
            ) : <div className="text-slate-500 italic">No repository info</div>}
          </div>
        </div>

        {/* Deep Dive Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-purple-500" /> Deep Dive Analysis</h3>
          
          {/* Investor Scoring Indicators */}
          {investorScoring && typeof investorScoring === 'object' && Object.keys(investorScoring).length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-semibold mb-3 text-purple-800">📊 Investor Scoring</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(investorScoring).map(([key, value]) => {
                  // Skip raw_text and non-numeric values
                  if (key === 'raw_text' || typeof value !== 'number') return null;
                  
                  const getScoreColor = (score: number) => {
                    if (score >= 8) return 'bg-green-500';
                    if (score >= 6) return 'bg-yellow-500';
                    return 'bg-red-500';
                  };
                  
                  const getScoreTextColor = (score: number) => {
                    if (score >= 8) return 'text-green-700';
                    if (score >= 6) return 'text-yellow-700';
                    return 'text-red-700';
                  };
                  
                  return (
                    <div key={key} className="bg-white rounded-lg border border-purple-200 p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">{key}</span>
                        <span className={`text-sm font-bold ${getScoreTextColor(value)}`}>{value}/10</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getScoreColor(value)}`}
                          style={{ width: `${(value / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Structured Deep Dive Sections */}
          {deepDive && (
            <div className="space-y-4">
              {/* Product Clarity & MVP */}
              {deepDive.product_clarity && (
                <div className="bg-white rounded-lg border border-purple-100 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b border-blue-200">
                    <h4 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                      <Rocket className="w-5 h-5" />
                      Product Clarity & MVP
                    </h4>
                  </div>
                  <div className="p-4">
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown 
                        components={{
                          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 text-slate-700">{children}</ul>,
                          li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-slate-800">{children}</strong>,
                          p: ({ children }) => <p className="text-sm leading-relaxed text-slate-700 mb-2">{children}</p>
                        }}
                      >
                        {deepDive.product_clarity}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}

              {/* Timing / Why Now */}
              {deepDive.timing && (
                <div className="bg-white rounded-lg border border-purple-100 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-green-50 to-green-100 px-4 py-3 border-b border-green-200">
                    <h4 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Timing / Why Now
                    </h4>
                  </div>
                  <div className="p-4">
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown 
                        components={{
                          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 text-slate-700">{children}</ul>,
                          li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-slate-800">{children}</strong>,
                          p: ({ children }) => <p className="text-sm leading-relaxed text-slate-700 mb-2">{children}</p>
                        }}
                      >
                        {deepDive.timing}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}

              {/* Market Opportunity */}
              {deepDive.market_opportunity && (
                <div className="bg-white rounded-lg border border-purple-100 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-3 border-b border-purple-200">
                    <h4 className="text-lg font-semibold text-purple-800 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Market Opportunity
                    </h4>
                  </div>
                  <div className="p-4">
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown 
                        components={{
                          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 text-slate-700">{children}</ul>,
                          li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-slate-800">{children}</strong>,
                          p: ({ children }) => <p className="text-sm leading-relaxed text-slate-700 mb-2">{children}</p>
                        }}
                      >
                        {deepDive.market_opportunity}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}

              {/* Strategic Moat */}
              {deepDive.strategic_moat && (
                <div className="bg-white rounded-lg border border-purple-100 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-4 py-3 border-b border-orange-200">
                    <h4 className="text-lg font-semibold text-orange-800 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Strategic Moat / IP / Differentiator
                    </h4>
                  </div>
                  <div className="p-4">
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown 
                        components={{
                          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 text-slate-700">{children}</ul>,
                          li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-slate-800">{children}</strong>,
                          p: ({ children }) => <p className="text-sm leading-relaxed text-slate-700 mb-2">{children}</p>
                        }}
                      >
                        {deepDive.strategic_moat}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}

              {/* Business + Funding */}
              {deepDive.business_funding && (
                <div className="bg-white rounded-lg border border-purple-100 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-4 py-3 border-b border-indigo-200">
                    <h4 className="text-lg font-semibold text-indigo-800 flex items-center gap-2">
                      <BarChart className="w-5 h-5" />
                      Business + Funding Snapshot
                    </h4>
                  </div>
                  <div className="p-4">
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown 
                        components={{
                          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 text-slate-700">{children}</ul>,
                          li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-slate-800">{children}</strong>,
                          p: ({ children }) => <p className="text-sm leading-relaxed text-slate-700 mb-2">{children}</p>
                        }}
                      >
                        {deepDive.business_funding}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}

              {/* Summary */}
              {deepDive.summary && (
                <div className="bg-white rounded-lg border border-purple-100 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-4 py-3 border-b border-emerald-200">
                    <h4 className="text-lg font-semibold text-emerald-800 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Summary Slide
                    </h4>
                  </div>
                  <div className="p-4">
                    <div className="text-sm leading-relaxed text-slate-700 italic">
                      {deepDive.summary}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fallback to raw content if structured data not available */}
          {!deepDive && deepDiveContent && (
            <div className="bg-white rounded-lg border border-purple-100 shadow-sm p-4">
              <h4 className="text-lg font-semibold text-purple-800 mb-3">Raw Deep Dive Analysis</h4>
              <div className="prose prose-sm max-w-none bg-purple-50 rounded p-4">
                <ReactMarkdown>{deepDiveContent}</ReactMarkdown>
              </div>
            </div>
          )}

          {!deepDive && !deepDiveContent && (
            <div className="text-slate-500 italic text-center py-8">No deep dive analysis available.</div>
          )}
        </div>

        {/* Raw LLM/Deep Dive Responses */}
        <Accordion type="single" collapsible>
          {idea.llm_raw_response && (
            <AccordionItem value="llmraw">
              <AccordionTrigger>Raw LLM Response</AccordionTrigger>
              <AccordionContent>
                <pre className="bg-slate-100 p-2 rounded text-xs overflow-x-auto whitespace-pre-wrap">{idea.llm_raw_response}</pre>
              </AccordionContent>
            </AccordionItem>
          )}
          {idea.deep_dive_raw_response && (
            <AccordionItem value="deepdiveraw">
              <AccordionTrigger>Raw Deep Dive Response</AccordionTrigger>
              <AccordionContent>
                <pre className="bg-slate-100 p-2 rounded text-xs overflow-x-auto whitespace-pre-wrap">{idea.deep_dive_raw_response}</pre>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>

        {/* Deep Dive Version History */}
        {idea.deep_dive_versions && idea.deep_dive_versions.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><History className="w-5 h-5 text-slate-500" /> Deep Dive Version History</h3>
            <ul className="space-y-2">
              {idea.deep_dive_versions.map(version => (
                <li key={version.version_number} className="bg-slate-50 rounded p-2 text-xs">
                  <div className="font-semibold">Version {version.version_number} - {version.created_at ? new Date(version.created_at).toLocaleString() : 'Unknown date'}</div>
                  <div className="truncate">{version.llm_raw_response?.slice(0, 120) || 'No raw response'}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error in IdeaDetailModal:', error);
    return null;
  }
}; 