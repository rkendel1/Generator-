
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Target, Zap, DollarSign, Clock, Brain, Star, Lightbulb, CheckCircle } from 'lucide-react';

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

  return (
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
                    <Badge variant="default" className="bg-blue-600">
                      #{index + 1}
                    </Badge>
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
                      <Badge variant="outline" className={idea.score >= 8 ? "bg-green-50 text-green-700" : "text-xs"}>
                        {idea.score}/10
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium">Effort:</span>
                      <Badge variant="outline" className={idea.effort <= 3 ? "bg-green-50 text-green-700" : "text-xs"}>
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
  );
};
