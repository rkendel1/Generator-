import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Star, Lightbulb, Target, TrendingUp, Users, ArrowRight, StickyNote, Save, Edit3, Rocket, Clock, Brain, Briefcase, BarChart } from 'lucide-react';
import { IdeaCard } from "./IdeaCard";
import { getShortlist, addToShortlist, removeFromShortlist, getDeepDiveVersions, createDeepDiveVersion, restoreDeepDiveVersion } from "../lib/api";

interface IdeaWorkspaceProps {
  ideas: any[];
  selectedRepo: any;
  pollingDeepDiveId?: string | null;
  onIdeasRefetch?: () => void;
}

export const IdeaWorkspace = ({ ideas, selectedRepo, pollingDeepDiveId, onIdeasRefetch }: IdeaWorkspaceProps) => {
  const [ideaNotes, setIdeaNotes] = useState<{[key: number]: string}>({});
  const [editingNotes, setEditingNotes] = useState<{[key: number]: boolean}>({});

  // Shortlist state from backend
  const [shortlist, setShortlist] = useState<any[]>([]);
  const [shortlistLoading, setShortlistLoading] = useState(false);

  const [editingDeepDive, setEditingDeepDive] = useState<{[ideaId: string]: any}>({});
  const [versionHistory, setVersionHistory] = useState<{[ideaId: string]: any[]}>({});
  const [showVersionHistory, setShowVersionHistory] = useState<string | null>(null);
  const [versionLoading, setVersionLoading] = useState(false);

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

  const handleSaveAndRerun = async (idea: any, rerun: boolean) => {
    setVersionLoading(true);
    const fields = editingDeepDive[idea.id] || idea.deep_dive;
    await createDeepDiveVersion(idea.id, fields, idea.deep_dive_raw_response || '');
    setEditingDeepDive(prev => ({ ...prev, [idea.id]: undefined }));
    setVersionLoading(false);
    const versions = await getDeepDiveVersions(idea.id);
    setVersionHistory(prev => ({ ...prev, [idea.id]: versions }));
    if (onIdeasRefetch) onIdeasRefetch();
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
    if (onIdeasRefetch) onIdeasRefetch();
    window.location.reload();
  };

  const handleDeleteVersion = (ideaId: string, versionNumber: number) => {
    // TODO: Implement delete version logic
    alert(`Delete version ${versionNumber} for idea ${ideaId} (not yet implemented)`);
  };

  // Remove shortlist section and filter ideas to only those with a requested deep dive or a deep dive exists
  const filteredIdeas = ideas.filter(
    (idea) => idea.deep_dive_requested || (idea.deep_dive && Object.keys(idea.deep_dive).length > 0) || idea.deep_dive_raw_response
  );

  if (!selectedRepo) {
    return (
      <Card className="p-12 text-center">
        <Lightbulb className="w-16 h-16 mx-auto mb-4 text-slate-400" />
        <h3 className="text-xl font-semibold mb-2">Select a Repository</h3>
        <p className="text-slate-600">Choose a trending repository to explore business ideas</p>
      </Card>
    );
  }

  if (!filteredIdeas || filteredIdeas.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Lightbulb className="w-16 h-16 mx-auto mb-4 text-slate-400" />
        <h3 className="text-xl font-semibold mb-2">No Deep Dives Yet</h3>
        <p className="text-slate-600">No deep dives yet. Request one from the repos page.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Ideas List - only those with requested deep dives */}
      <div className="grid gap-6">
        {filteredIdeas.map((idea, index) => (
          <Card key={index} className="transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-2">
                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    #{index + 1}
                  </span>
                  {idea.title}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge className={getScoreColor(idea.score)}>
                    Score: {idea.score}/10
                  </Badge>
                  <Badge className="text-slate-600">
                    Effort: {idea.effort}/10
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
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
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-sm text-slate-700">Call to Action:</span>
                      <p className="text-sm text-slate-600 mt-1">{idea.callToAction}</p>
                    </div>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <StickyNote className="w-4 h-4 text-yellow-500" />
                      <Button 
                        onClick={() => setEditingNotes(prev => ({ ...prev, [index]: !prev[index] }))}
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                    </div>
                    {editingNotes[index] ? (
                      <div className="space-y-2">
                        <Textarea 
                          placeholder="Add your notes, thoughts, or action items for this idea..."
                          value={ideaNotes[index] || ''}
                          onChange={(e) => setIdeaNotes(prev => ({ ...prev, [index]: e.target.value }))}
                          className="min-h-[100px]"
                        />
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleNoteSave(index, ideaNotes[index] || '')}
                          >
                            <Save className="w-3 h-3 mr-1" />
                            Save
                          </Button>
                          <Button 
                            onClick={() => setEditingNotes(prev => ({ ...prev, [index]: false }))}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 min-h-[60px]">
                        {ideaNotes[index] ? (
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{ideaNotes[index]}</p>
                        ) : (
                          <p className="text-sm text-slate-500 italic">Click edit to add your notes...</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Compact Deep Dive Section */}
              {(!idea.deep_dive && !idea.deep_dive_raw_response) ? (
                <div className="mt-4 text-sm text-slate-500 italic">
                  No deep dive yet. Request it from the repos page.
                </div>
              ) : (
                <div className="mt-4 border rounded bg-slate-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-purple-500" />
                    <span className="font-semibold text-base">Deep Dive</span>
                    <button
                      className="ml-2 px-2 py-1 rounded bg-gray-200 text-xs font-semibold hover:bg-gray-300"
                      onClick={() => showVersionHistory === idea.id ? setShowVersionHistory(null) : handleShowVersionHistory(idea.id)}
                    >
                      {showVersionHistory === idea.id ? 'Hide History' : 'History ▼'}
                    </button>
                  </div>
                  {/* Inline Version History Dropdown */}
                  {showVersionHistory === idea.id && (
                    <div className="mb-2">
                      {versionLoading ? <div>Loading...</div> : (
                        <ul className="space-y-1">
                          {(versionHistory[idea.id] || []).map((v: any) => (
                            <li key={v.version_number} className="border rounded p-2 flex items-center justify-between">
                              <span>V{v.version_number} ({new Date(v.created_at).toLocaleString()})</span>
                              <div className="flex gap-2">
                                <button
                                  className="px-2 py-1 rounded bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600"
                                  onClick={() => handleRestoreVersion(idea.id, v.version_number)}
                                >
                                  Restore
                                </button>
                                <button
                                  className="px-2 py-1 rounded bg-red-500 text-white text-xs font-semibold hover:bg-red-600"
                                  onClick={() => handleDeleteVersion(idea.id, v.version_number)}
                                >
                                  Delete
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                  {/* Deep Dive Fields Grid */}
                  {(!idea.deep_dive || Object.keys(idea.deep_dive).length === 0) ? (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 rounded mb-2">
                      <strong>LLM Parsing Error:</strong> The LLM response could not be parsed into a deep dive.
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs underline">Show Raw LLM Response</summary>
                        <pre className="bg-slate-100 text-xs p-2 rounded overflow-x-auto max-h-40 whitespace-pre-wrap mt-2">{idea.deep_dive_raw_response || 'No raw response available.'}</pre>
                      </details>
                    </div>
                  ) : (
                    <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold text-sm mb-1 flex items-center gap-2"><Rocket className="w-4 h-4 text-blue-500" /> Product Clarity & MVP</h5>
                        <p className="text-sm text-slate-600 whitespace-pre-line">{idea.deep_dive.product_clarity || 'No data available.'}</p>
                      </div>
                      <div>
                        <h5 className="font-semibold text-sm mb-1 flex items-center gap-2"><Clock className="w-4 h-4 text-orange-500" /> Timing / Why Now</h5>
                        <p className="text-sm text-slate-600 whitespace-pre-line">{idea.deep_dive.timing || 'No data available.'}</p>
                      </div>
                      <div>
                        <h5 className="font-semibold text-sm mb-1 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-500" /> Market Opportunity</h5>
                        <p className="text-sm text-slate-600 whitespace-pre-line">{idea.deep_dive.market_opportunity || 'No data available.'}</p>
                      </div>
                      <div>
                        <h5 className="font-semibold text-sm mb-1 flex items-center gap-2"><Brain className="w-4 h-4 text-purple-500" /> Strategic Moat / IP / Differentiator</h5>
                        <p className="text-sm text-slate-600 whitespace-pre-line">{idea.deep_dive.strategic_moat || 'No data available.'}</p>
                      </div>
                      <div>
                        <h5 className="font-semibold text-sm mb-1 flex items-center gap-2"><Briefcase className="w-4 h-4 text-blue-600" /> Business + Funding Snapshot</h5>
                        <p className="text-sm text-slate-600 whitespace-pre-line">{idea.deep_dive.business_funding || 'No data available.'}</p>
                      </div>
                      <div>
                        <h5 className="font-semibold text-sm mb-1 flex items-center gap-2"><BarChart className="w-4 h-4 text-indigo-500" /> Investor Scoring Model</h5>
                        <p className="text-sm text-slate-600 whitespace-pre-line">{idea.deep_dive.investor_scoring || 'No data available.'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <h5 className="font-semibold text-sm mb-1 flex items-center gap-2">Executive Summary</h5>
                        <p className="text-sm leading-relaxed whitespace-pre-line">{idea.deep_dive.summary || 'No summary available.'}</p>
                      </div>
                    </div>
                  )}
                  {/* Save Buttons */}
                  <div className="flex gap-2 mt-4 justify-end">
                    <Button
                      className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700"
                      onClick={() => handleSaveAndRerun(idea, false)}
                      disabled={versionLoading}
                    >
                      {versionLoading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
                      onClick={() => handleSaveAndRerun(idea, true)}
                      disabled={versionLoading}
                    >
                      {versionLoading ? 'Saving...' : 'Save & Rerun'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
