import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Rocket, Clock, TrendingUp, Brain, Briefcase, BarChart3, CheckCircle, XCircle } from 'lucide-react';

interface DeepDiveModalProps {
  idea: any;
  isOpen: boolean;
  onClose: () => void;
}

export const DeepDiveModal = ({ idea, isOpen, onClose }: DeepDiveModalProps) => {
  if (!idea) return null;

  const investorScores = [
    { label: "Product-Market Fit Potential", score: 8 },
    { label: "Market Size & Timing", score: 7 },
    { label: "Founder's Ability to Execute", score: 6 },
    { label: "Technical Feasibility", score: 9 },
    { label: "Competitive Moat", score: 7 },
    { label: "Profitability Potential", score: 8 },
    { label: "Strategic Exit Potential", score: 7 },
    { label: "Overall Investor Attractiveness", score: 7 }
  ];

  const averageScore = investorScores.reduce((sum, item) => sum + item.score, 0) / investorScores.length;
  const goNoGo = averageScore >= 7;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800">
            Deep Dive Analysis: {idea.title}
          </DialogTitle>
          <DialogDescription>
            Comprehensive business analysis and investor evaluation
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Product Clarity & MVP */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-blue-500" />
                Product Clarity & MVP
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-2">Product Clarity & MVP</h4>
                <p className="text-sm text-slate-600">{idea.deep_dive?.product_clarity || "No data available."}</p>
              </div>
            </CardContent>
          </Card>

          {/* Timing / Why Now */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                Timing / Why Now
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-2">Timing / Why Now</h4>
                <p className="text-sm text-slate-600">{idea.deep_dive?.timing || "No data available."}</p>
              </div>
            </CardContent>
          </Card>

          {/* Market Opportunity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Market Opportunity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-2">Market Opportunity</h4>
                <p className="text-sm text-slate-600">{idea.deep_dive?.market_opportunity || "No data available."}</p>
              </div>
            </CardContent>
          </Card>

          {/* Strategic Moat / IP / Differentiator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                Strategic Moat / IP / Differentiator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-2">Strategic Moat / IP / Differentiator</h4>
                <p className="text-sm text-slate-600">{idea.deep_dive?.strategic_moat || "No data available."}</p>
              </div>
            </CardContent>
          </Card>

          {/* Business + Funding Snapshot */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Business + Funding Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-2">Business + Funding Snapshot</h4>
                <p className="text-sm text-slate-600">{idea.deep_dive?.business_funding || "No data available."}</p>
              </div>
            </CardContent>
          </Card>

          {/* Investor Scoring Model */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                Investor Scoring Model
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Investor Scoring Model</h4>
                  <p className="text-sm text-slate-600">{idea.deep_dive?.investor_scoring || "No data available."}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Executive Summary */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">
                {idea.deep_dive?.summary || "No summary available."}
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
