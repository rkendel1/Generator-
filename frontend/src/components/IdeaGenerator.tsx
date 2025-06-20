import React, { useState } from 'react';
import { Idea, api, Repo } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Target, TrendingUp, Users, ArrowRight, Sparkles } from 'lucide-react';
import { IdeaCard } from '@/components/IdeaCard';

const INDUSTRIES = [
  'Healthcare', 'Finance', 'Education', 'Civic Tech', 'Retail', 'AI/ML', 'Other'
];
const BUSINESS_MODELS = [
  'Marketplace', 'Subscription', 'Freemium', 'Consulting', 'Ad-based', 'Other'
];

export function IdeaGenerator({ onIdeaCreated, repos = [] }: { onIdeaCreated?: (idea: Idea) => void, repos?: Repo[] }) {
  const [industry, setIndustry] = useState('');
  const [businessModel, setBusinessModel] = useState('');
  const [freeform, setFreeform] = useState('');
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);

  const handleGenerate = async () => {
    setLoading(true);
    setIdeas([]);
    try {
      const response = await api.post('/ideas/generate', {
        industry,
        business_model: businessModel,
        context: freeform
      });
      const data = response.data;
      setIdeas(data.ideas || []);
      if (onIdeaCreated && data.ideas) {
        data.ideas.forEach(onIdeaCreated);
      }
    } catch (error) {
      console.error('Error generating ideas:', error);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-600" />
          TailorM8 Generator
        </h2>
        <p className="text-gray-600 mb-6">
          Your personalized idea partner.<br />
          TailorM8 uses AI to craft business, project, and career ideas uniquely suited to your skills, experience, and interests—like a co-founder who already knows your résumé.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
            <select 
              value={industry} 
              onChange={e => setIndustry(e.target.value)} 
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Model</label>
            <select 
              value={businessModel} 
              onChange={e => setBusinessModel(e.target.value)} 
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select business model</option>
              {BUSINESS_MODELS.map(bm => <option key={bm} value={bm}>{bm}</option>)}
            </select>
          </div>
          
          <div className="flex items-end">
            <Button 
              onClick={handleGenerate} 
              disabled={loading} 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? 'Generating...' : 'Generate Ideas'}
            </Button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Context (Optional)
          </label>
          <textarea 
            value={freeform} 
            onChange={e => setFreeform(e.target.value)} 
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            rows={3}
            placeholder="Describe your interests, problems you want to solve, or any specific context..."
          />
        </div>
      </div>

      {ideas.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Generated Ideas ({ideas.length})
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {ideas.map((idea, idx) => (
              <IdeaCard
                key={idx}
                idea={idea}
                onDeepDive={() => {}}
                onStatusChange={() => {}}
                repos={repos}
                compact={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 