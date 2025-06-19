import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Target, Zap, DollarSign, Clock, Brain, Star, Lightbulb, CheckCircle, Rocket, Briefcase } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from "@/components/ui/drawer";
import { useState, useEffect } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

interface DashboardProps {
  ideas: any[];
  selectedRepo: any;
}

export const Dashboard = ({ ideas, selectedRepo }: DashboardProps) => {
  if (!selectedRepo || ideas.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Target className="w-16 h-16 mx-auto mb-4 text-slate-400" />
        <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
        <p className="text-slate-600">Select a repository and generate ideas to view the dashboard</p>
      </Card>
    );
  }

  const effortDistribution = [
    { name: 'Low (1-3)', value: ideas.filter(i => i.effort <= 3).length, color: '#10b981' },
    { name: 'Medium (4-6)', value: ideas.filter(i => i.effort > 3 && i.effort <= 6).length, color: '#f59e0b' },
    { name: 'High (7-10)', value: ideas.filter(i => i.effort > 6).length, color: '#ef4444' }
  ];

  const scoreEffortMatrix = ideas.map((idea, index) => ({
    name: `Idea ${index + 1}`,
    score: idea.score,
    effort: idea.effort,
    title: idea.title.substring(0, 25) + '...',
    potential: idea.score - idea.effort // Higher is better
  }));

  const avgScore = ideas.reduce((sum, idea) => sum + idea.score, 0) / ideas.length;
  const avgEffort = ideas.reduce((sum, idea) => sum + idea.effort, 0) / ideas.length;
  const highPotentialIdeas = ideas.filter(i => i.score >= 8 && i.effort <= 4).length;
  const quickWins = ideas.filter(i => i.score >= 6 && i.effort <= 3).length;
  const deepDivesGenerated = ideas.filter(i => i.deepDiveGenerated).length;

  // Top performing ideas by potential (score - effort)
  const topIdeas = ideas
    .map((idea, index) => ({ ...idea, index, potential: idea.score - idea.effort }))
    .sort((a, b) => b.potential - a.potential)
    .slice(0, 5);

  const [debugOpen, setDebugOpen] = useState(false);
  const isDebug = process.env.NODE_ENV === 'development' || (typeof window !== 'undefined' && window.location.search.includes('debug=1'));

  // Shortlist state (persisted in localStorage)
  const [shortlist, setShortlist] = useState<string[]>([]);
  useEffect(() => {
    const stored = localStorage.getItem('deepDiveShortlist');
    if (stored) setShortlist(JSON.parse(stored));
  }, []);
  useEffect(() => {
    localStorage.setItem('deepDiveShortlist', JSON.stringify(shortlist));
  }, [shortlist]);

  const addToShortlist = (id: string) => {
    setShortlist(prev => prev.includes(id) ? prev : [...prev, id]);
  };
  const removeFromShortlist = (id: string) => {
    setShortlist(prev => prev.filter(i => i !== id));
  };

  return (
    <div className="space-y-6 relative">
      {/* Debug Floating Button */}
      {isDebug && (
        <button
          className="fixed right-6 top-1/3 z-50 bg-slate-900 text-white rounded-full shadow-lg px-4 py-2 hover:bg-slate-700 transition-all"
          onClick={() => setDebugOpen(true)}
        >
          Admin Debug
        </button>
      )}
      {/* Debug Drawer */}
      {isDebug && (
        <Drawer open={debugOpen} onOpenChange={setDebugOpen}>
          <DrawerContent className="max-w-lg ml-auto">
            <DrawerHeader>
              <DrawerTitle>Admin Debug Panel</DrawerTitle>
              <DrawerDescription>Raw LLM responses for all ideas in this repo</DrawerDescription>
            </DrawerHeader>
            <div className="p-4 overflow-y-auto max-h-[70vh]">
              {ideas.length === 0 ? (
                <div className="text-slate-500">No ideas to debug.</div>
              ) : (
                <Accordion type="multiple" className="w-full">
                  {ideas.map((idea, idx) => (
                    <AccordionItem value={idea.id} key={idea.id}>
                      <AccordionTrigger>
                        <span className="font-mono text-xs text-slate-700">{idx + 1}. {idea.title}</span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="mb-2">
                          <span className="font-semibold text-xs text-slate-600">Idea LLM Raw Response:</span>
                          <pre className="bg-slate-100 text-xs p-2 rounded overflow-x-auto max-h-40 whitespace-pre-wrap">{idea.llm_raw_response || 'No data.'}</pre>
                        </div>
                        {idea.deep_dive_raw_response && (
                          <div>
                            <span className="font-semibold text-xs text-slate-600">Deep Dive LLM Raw Response:</span>
                            <pre className="bg-slate-100 text-xs p-2 rounded overflow-x-auto max-h-40 whitespace-pre-wrap">{idea.deep_dive_raw_response}</pre>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
            <DrawerClose asChild>
              <button className="absolute top-2 right-2 text-slate-500 hover:text-slate-900">Close</button>
            </DrawerClose>
          </DrawerContent>
        </Drawer>
      )}
      <div className="space-y-6">
        {/* Enhanced Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ideas</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ideas.length}</div>
              <p className="text-xs text-muted-foreground">
                Generated for {selectedRepo.name}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgScore.toFixed(1)}/10</div>
              <div className="flex items-center gap-1 mt-1">
                <Badge variant={avgScore >= 7 ? "default" : avgScore >= 5 ? "secondary" : "destructive"} className="text-xs">
                  {avgScore >= 7 ? "High" : avgScore >= 5 ? "Medium" : "Low"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Wins</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quickWins}</div>
              <p className="text-xs text-muted-foreground">
                Score ≥6, Effort ≤3
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Potential</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{highPotentialIdeas}</div>
              <p className="text-xs text-muted-foreground">
                Score ≥8, Effort ≤4
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deep Dives</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deepDivesGenerated}</div>
              <p className="text-xs text-muted-foreground">
                Analysis completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Score vs Effort Matrix</CardTitle>
              <CardDescription>
                Ideas positioned by business potential and implementation difficulty
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scoreEffortMatrix}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border rounded-lg shadow-lg">
                            <p className="font-semibold">{data.title}</p>
                            <p className="text-sm text-blue-600">Score: {data.score}/10</p>
                            <p className="text-sm text-orange-600">Effort: {data.effort}/10</p>
                            <p className="text-sm text-green-600">Potential: {data.potential.toFixed(1)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="score" fill="#3b82f6" name="Score" />
                  <Bar dataKey="effort" fill="#f59e0b" name="Effort" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Implementation Effort Distribution</CardTitle>
              <CardDescription>
                Breakdown of ideas by implementation complexity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={effortDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {effortDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Ideas Ranking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              Top 5 Ideas by Potential
            </CardTitle>
            <CardDescription>
              Ranked by score minus effort (higher score, lower effort = better potential)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topIdeas.map((idea, index) => (
                <div key={idea.index} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="default">{index + 1}</Badge>
                      <h4 className="font-semibold text-sm">{idea.title}</h4>
                      {idea.deepDiveGenerated && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Deep Dive Ready
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mb-2">{idea.hook}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium">Score:</span>
                        <Badge variant={idea.score >= 8 ? "default" : "secondary"}>
                          {idea.score}/10
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium">Effort:</span>
                        <Badge variant={idea.effort <= 3 ? "default" : "secondary"}>
                          {idea.effort}/10
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium">Potential:</span>
                        <Badge variant="default" className="bg-purple-100 text-purple-800">
                          {idea.potential.toFixed(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Deep Dive Details */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              Deep Dive Analyses
            </CardTitle>
            <CardDescription>
              Detailed business/investor analysis for each idea with a completed deep dive
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {ideas.filter(idea => idea.deepDiveGenerated && idea.deep_dive && Object.keys(idea.deep_dive).length > 0).length === 0 ? (
                <div className="text-slate-500">No deep dives available yet. Request a deep dive from the workspace or repo view.</div>
              ) : (
                ideas.filter(idea => idea.deepDiveGenerated).map((idea, idx) => (
                  <div key={idea.id} className="border rounded-lg p-4 bg-gradient-to-r from-slate-50 to-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="default">{idx + 1}</Badge>
                      <h4 className="font-semibold text-base">{idea.title}</h4>
                      {(!idea.deep_dive || Object.keys(idea.deep_dive).length === 0) && (
                        <Badge variant="destructive">Parsing Error</Badge>
                      )}
                      {idea.deep_dive && Object.keys(idea.deep_dive).length > 0 && (
                        <button
                          className={`ml-auto px-3 py-1 rounded bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 transition ${shortlist.includes(idea.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => addToShortlist(idea.id)}
                          disabled={shortlist.includes(idea.id)}
                        >
                          {shortlist.includes(idea.id) ? 'Shortlisted' : 'Add to Shortlist'}
                        </button>
                      )}
                    </div>
                    {(!idea.deep_dive || Object.keys(idea.deep_dive).length === 0) ? (
                      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 rounded mb-4">
                        <strong>LLM Parsing Error:</strong> The LLM response could not be parsed into a deep dive. See raw response below.<br />
                        <pre className="bg-slate-100 text-xs p-2 rounded overflow-x-auto max-h-40 whitespace-pre-wrap mt-2">{idea.deep_dive_raw_response || 'No raw response available.'}</pre>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-semibold text-sm mb-1 flex items-center gap-2"><Rocket className="w-4 h-4 text-blue-500" /> Product Clarity & MVP</h5>
                          <p className="text-sm text-slate-600">{idea.deep_dive.product_clarity || 'No data available.'}</p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-sm mb-1 flex items-center gap-2"><Clock className="w-4 h-4 text-orange-500" /> Timing / Why Now</h5>
                          <p className="text-sm text-slate-600">{idea.deep_dive.timing || 'No data available.'}</p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-sm mb-1 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-500" /> Market Opportunity</h5>
                          <p className="text-sm text-slate-600">{idea.deep_dive.market_opportunity || 'No data available.'}</p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-sm mb-1 flex items-center gap-2"><Brain className="w-4 h-4 text-purple-500" /> Strategic Moat / IP / Differentiator</h5>
                          <p className="text-sm text-slate-600">{idea.deep_dive.strategic_moat || 'No data available.'}</p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-sm mb-1 flex items-center gap-2"><Briefcase className="w-4 h-4 text-blue-600" /> Business + Funding Snapshot</h5>
                          <p className="text-sm text-slate-600">{idea.deep_dive.business_funding || 'No data available.'}</p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-sm mb-1 flex items-center gap-2"><BarChart className="w-4 h-4 text-indigo-500" /> Investor Scoring Model</h5>
                          <p className="text-sm text-slate-600">{idea.deep_dive.investor_scoring || 'No data available.'}</p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-sm mb-1 flex items-center gap-2">Executive Summary</h5>
                          <p className="text-sm leading-relaxed">{idea.deep_dive.summary || 'No summary available.'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Shortlist Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Shortlisted Deep Dives
            </CardTitle>
            <CardDescription>
              Your handpicked shortlist of the most promising deep dives
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {shortlist.length === 0 ? (
                <div className="text-slate-500">No ideas in your shortlist yet. Add some from the deep dive section above.</div>
              ) : (
                shortlist.map((id, idx) => {
                  const idea = ideas.find(i => i.id === id);
                  if (!idea) return null;
                  return (
                    <div key={idea.id} className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-yellow-100">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="default">{idx + 1}</Badge>
                        <h4 className="font-semibold text-base">{idea.title}</h4>
                        <button
                          className="ml-auto px-3 py-1 rounded bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition"
                          onClick={() => removeFromShortlist(idea.id)}
                        >
                          Remove
                        </button>
                      </div>
                      {(!idea.deep_dive || Object.keys(idea.deep_dive).length === 0) ? (
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 rounded mb-4">
                          <strong>LLM Parsing Error:</strong> The LLM response could not be parsed into a deep dive. See raw response below.<br />
                          <pre className="bg-slate-100 text-xs p-2 rounded overflow-x-auto max-h-40 whitespace-pre-wrap mt-2">{idea.deep_dive_raw_response || 'No raw response available.'}</pre>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-semibold text-sm mb-1 flex items-center gap-2"><Rocket className="w-4 h-4 text-blue-500" /> Product Clarity & MVP</h5>
                            <p className="text-sm text-slate-600">{idea.deep_dive.product_clarity || 'No data available.'}</p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-sm mb-1 flex items-center gap-2"><Clock className="w-4 h-4 text-orange-500" /> Timing / Why Now</h5>
                            <p className="text-sm text-slate-600">{idea.deep_dive.timing || 'No data available.'}</p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-sm mb-1 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-500" /> Market Opportunity</h5>
                            <p className="text-sm text-slate-600">{idea.deep_dive.market_opportunity || 'No data available.'}</p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-sm mb-1 flex items-center gap-2"><Brain className="w-4 h-4 text-purple-500" /> Strategic Moat / IP / Differentiator</h5>
                            <p className="text-sm text-slate-600">{idea.deep_dive.strategic_moat || 'No data available.'}</p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-sm mb-1 flex items-center gap-2"><Briefcase className="w-4 h-4 text-blue-600" /> Business + Funding Snapshot</h5>
                            <p className="text-sm text-slate-600">{idea.deep_dive.business_funding || 'No data available.'}</p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-sm mb-1 flex items-center gap-2"><BarChart className="w-4 h-4 text-indigo-500" /> Investor Scoring Model</h5>
                            <p className="text-sm text-slate-600">{idea.deep_dive.investor_scoring || 'No data available.'}</p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-sm mb-1 flex items-center gap-2">Executive Summary</h5>
                            <p className="text-sm leading-relaxed">{idea.deep_dive.summary || 'No summary available.'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-slate-800">Immediate Focus:</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Start with {quickWins} quick win{quickWins !== 1 ? 's' : ''} (high score, low effort)</li>
                  <li>• Request deep dives for top {Math.min(3, highPotentialIdeas)} high-potential ideas</li>
                  <li>• Review and add notes to promising concepts</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-slate-800">Portfolio Strategy:</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• {effortDistribution[0].value} low-effort ideas for rapid testing</li>
                  <li>• {highPotentialIdeas} ideas ready for deeper validation</li>
                  <li>• Consider exploring {ideas.filter(i => i.score >= 7).length} high-score opportunities</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
