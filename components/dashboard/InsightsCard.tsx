"use client";

import { Sparkles, ArrowRight, Target, TrendingUp, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

interface Insight {
  id: string;
  title: string;
  description: string;
  type: "tip" | "goal" | "achievement" | "urgent";
  priority: "high" | "medium" | "low";
}

interface InsightsCardProps {
  patient?: any;
  userId: string;
}

export function InsightsCard({ patient, userId }: InsightsCardProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch(`/api/health-insights?userId=${userId}`);
        const data = await response.json();

        if (data.success && data.insights) {
          setInsights(data.insights);
        }
      } catch (error) {
        console.error("Failed to fetch health insights:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [userId]);

  const getIcon = (type: string) => {
    switch (type) {
      case "achievement":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "goal":
        return <Target className="h-4 w-4 text-blue-600" />;
      default:
        return <Sparkles className="h-4 w-4 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm border border-gray-100 overflow-hidden">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Health Insights</h3>
            <p className="text-sm text-gray-500">AI-powered recommendations</p>
          </div>
        </div>
        <p className="text-gray-500">Loading insights...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm border border-gray-100 overflow-hidden">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
          <Sparkles className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Health Insights</h3>
          <p className="text-sm text-gray-500">AI-powered recommendations</p>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="rounded-xl bg-white p-4 shadow-sm"
          >
            <div className="mb-2 flex items-center gap-2">
              {getIcon(insight.type)}
              <h4 className="font-medium text-gray-900">{insight.title}</h4>
            </div>
            <p className="text-sm leading-relaxed text-gray-600">
              {insight.description}
            </p>
          </div>
        ))}
      </div>

      <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 py-3 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100">
        View all insights
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
