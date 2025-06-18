
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Star, Lightbulb, Target, TrendingUp, Users, ArrowRight, StickyNote, Save, Edit3 } from 'lucide-react';
import { IdeaCard } from "./IdeaCard";

interface IdeaWorkspaceProps {
  ideas: any[];
  selectedRepo: any;
  onDeepDive: (idea: any) => void;
}

export const IdeaWorkspace = ({ ideas, selectedRepo, onDeepDive }: IdeaWorkspaceProps) => {
  const [ideaNotes, setIdeaNotes] = useState<{[key: number]: string}>({});
  const [editingNotes, setEditingNotes] = useState<{[key: number]: boolean}>({});

  const handleNoteSave = (ideaIndex: number, note: string) => {
    setIdeaNotes(prev => ({ ...prev, [ideaIndex]: note }));
    setEditingNotes(prev => ({ ...prev, [ideaIndex]: false }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!selectedRepo) {
    return (
      <Card className="p-12 text-center">
        <Lightbulb className="w-16 h-16 mx-auto mb-4 text-slate-400" />
        <h3 className="text-xl font-semibold mb-2">Select a Repository</h3>
        <p className="text-slate-600">Choose a trending repository to explore business ideas</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Business Ideas Workspace: {selectedRepo.name}
          </CardTitle>
          <CardDescription>{selectedRepo.description}</CardDescription>
          <div className="flex items-center gap-2 pt-2">
            <Badge variant="outline">{ideas.length} Ideas Generated</Badge>
            <Badge variant="outline">Workspace Active</Badge>
          </div>
        </CardHeader>
      </Card>
      
      <div className="grid gap-6">
        {ideas.map((idea, index) => (
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
                  <Badge variant="outline" className={getScoreColor(idea.score)}>
                    Score: {idea.score}/10
                  </Badge>
                  <Badge variant="outline" className="text-slate-600">
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
                      <span className="font-medium text-sm text-slate-700">Personal Notes:</span>
                      <Button 
                        size="sm" 
                        variant="ghost"
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
                            size="sm"
                            onClick={() => handleNoteSave(index, ideaNotes[index] || '')}
                          >
                            <Save className="w-3 h-3 mr-1" />
                            Save
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
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
              
              <div className="pt-4 border-t">
                <Button 
                  onClick={() => onDeepDive(idea)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={!idea.deepDiveGenerated}
                >
                  {idea.deepDiveGenerated ? 'View Deep Dive Analysis' : 'Deep Dive Not Available - Request from Repository'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
