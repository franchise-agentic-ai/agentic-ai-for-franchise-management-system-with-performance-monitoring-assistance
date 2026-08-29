import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { CheckCircle, XCircle } from 'lucide-react';
import { getRecommendations } from '../services/dataService';
import { Recommendation } from '../types';

export function Recommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    getRecommendations().then(setRecommendations);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Recommendations</h1>
        <p className="text-slate-500 mt-1">Review and approve high-impact actions suggested by operational agents.</p>
      </div>

      <div className="space-y-4">
        {recommendations.map(rec => (
          <Card key={rec.id} className="overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-slate-900">{rec.title}</h3>
                  <Badge variant={rec.status === 'Approved' ? 'success' : 'info'}>{rec.status}</Badge>
                  <Badge variant={rec.priority === 'Critical' ? 'danger' : 'warning'}>{rec.priority}</Badge>
                </div>
                <p className="text-slate-700 mb-3">{rec.description}</p>
                <div className="bg-slate-50 p-3 rounded border border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Why?</span>
                  <p className="text-sm text-slate-600 font-medium">{rec.reason}</p>
                </div>
              </div>
              
              <div className="flex sm:flex-col gap-2 shrink-0 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6">
                {rec.status === 'New' && (
                  <>
                    <Button variant="primary" className="w-full justify-center bg-emerald-600 hover:bg-emerald-700">
                      <CheckCircle className="w-4 h-4 mr-2" /> Approve
                    </Button>
                    <Button variant="outline" className="w-full justify-center">
                      <XCircle className="w-4 h-4 mr-2" /> Reject
                    </Button>
                  </>
                )}
                {rec.status === 'Approved' && (
                  <Button variant="secondary" className="w-full justify-center">
                    Mark Completed
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
