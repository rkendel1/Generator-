import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Star, Lightbulb, Target, TrendingUp, Users, ArrowRight, StickyNote, Save, Edit3, Rocket, Clock, Brain, Briefcase, BarChart } from 'lucide-react';
import { IdeaCard } from "./IdeaCard";
import { getShortlist, addToShortlist, removeFromShortlist, getDeepDiveVersions, createDeepDiveVersion, restoreDeepDiveVersion, fetchIdeas, updateIdeaStatus, getAllIdeas } from "../lib/api";
import type { IdeaStatus } from '../lib/api';

const LIFECYCLE_STAGES: { key: string; label: string }[] = [
  { key: 'suggested', label: 'Suggested' },
  { key: 'deep_dive', label: 'Deep Dive' },
  { key: 'iterating', label: 'Iterating' },
  { key: 'considering', label: 'Considering' },
  { key: 'closed', label: 'Closed' },
];

interface IdeaWorkspaceProps {
  repoId?: string; // Make optional to support showing all ideas
  showAllIdeas?: boolean; // New prop to show all ideas instead of just repo ideas
}

export function IdeaWorkspace({ repoId, showAllIdeas = false }: IdeaWorkspaceProps) {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [activeStage, setActiveStage] = useState<string>('suggested');
  const [loading, setLoading] = useState(false);

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
    if (showAllIdeas) {
      // Fetch all ideas from all repos
      setLoading(true);
      getAllIdeas()
        .then(setIdeas)
        .catch(error => {
          console.error('Error fetching all ideas:', error);
          setIdeas([]);
        })
        .finally(() => setLoading(false));
    } else if (repoId) {
      // Fetch ideas for specific repo
      setLoading(true);
      fetchIdeas(repoId)
        .then(setIdeas)
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

  const handleSaveAndRerun = async (idea: any, rerun: boolean) => {
    setVersionLoading(true);
    const fields = editingDeepDive[idea.id] || idea.deep_dive;
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
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex mb-4">
        {LIFECYCLE_STAGES.map(stage => (
          <button
            key={stage.key}
            className={`px-4 py-2 mr-2 rounded ${activeStage === stage.key ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveStage(stage.key)}
          >
            {stage.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div>Loading ideas...</div>
      ) : (
        <div>
          {!ideas || ideas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No ideas found for {activeStage} stage.
            </div>
          ) : (
            (ideas || [])
              .filter(idea => {
                try {
                  return idea && idea.status === activeStage;
                } catch (error) {
                  console.error('Error filtering idea:', error, idea);
                  return false;
                }
              })
              .map((idea, index) => {
                try {
                  return (
                    <Card key={idea?.id || index} className="transition-all duration-300 hover:shadow-lg mb-4">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between mb-2">
                          <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                              #{index + 1}
                            </span>
                            {idea?.title || 'Untitled Idea'}
                          </CardTitle>
                          <div className="flex gap-2">
                            <Badge className={getScoreColor(idea?.score || 5)}>
                              Score: {idea?.score || 5}/10
                            </Badge>
                            <Badge className="text-slate-600">
                              Effort: {idea?.mvp_effort || 5}/10
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
                                <p className="text-sm text-slate-600 mt-1">{idea?.hook || 'No hook available'}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-medium text-sm text-slate-700">Value:</span>
                                <p className="text-sm text-slate-600 mt-1">{idea?.value || 'No value available'}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-medium text-sm text-slate-700">Evidence:</span>
                                <p className="text-sm text-slate-600 mt-1">{idea?.evidence || 'No evidence available'}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Users className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-medium text-sm text-slate-700">Differentiator:</span>
                                <p className="text-sm text-slate-600 mt-1">{idea?.differentiator || 'No differentiator available'}</p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-start gap-2">
                              <ArrowRight className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-medium text-sm text-slate-700">Call to Action:</span>
                                <p className="text-sm text-slate-600 mt-1">{idea?.call_to_action || 'No call to action available'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Status Management */}
                        <div className="border-t pt-4">
                          <span className="font-medium text-sm text-slate-700">Status:</span>
                          <select
                            value={idea?.status || 'suggested'}
                            onChange={e => handleStatusChange(idea?.id, e.target.value as IdeaStatus)}
                            className="ml-4 border rounded px-2 py-1"
                          >
                            {LIFECYCLE_STAGES.map(opt => (
                              <option key={opt.key} value={opt.key}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      </CardContent>
                    </Card>
                  );
                } catch (error) {
                  console.error('Error rendering idea:', error, idea);
                  return (
                    <Card key={`error-${index}`} className="mb-4 border-red-200 bg-red-50">
                      <CardContent className="p-4">
                        <p className="text-red-600">Error rendering idea: {error.message}</p>
                        <pre className="text-xs mt-2 bg-red-100 p-2 rounded overflow-auto">
                          {JSON.stringify(idea, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                  );
                }
              })
          )}
        </div>
      )}
    </div>
  );
}
