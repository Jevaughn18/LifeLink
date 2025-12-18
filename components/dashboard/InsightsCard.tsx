"use client";

import { Sparkles, ArrowRight, Target, TrendingUp } from "lucide-react";

interface Insight {
  id: string;
  title: string;
  description: string;
  type: "tip" | "goal" | "achievement";
}

interface InsightsCardProps {
  patient?: any;
}

export function InsightsCard({ patient }: InsightsCardProps) {
  const insights: Insight[] = [
    {
      id: "1",
      title: "Great sleep pattern!",
      description: "You've averaged 7+ hours this week. Keep it up for optimal heart health.",
      type: "achievement",
    },
    {
      id: "2",
      title: "Hydration goal",
      description: "Try to drink 2 more glasses today to reach your daily target.",
      type: "goal",
    },
  ];

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
              {insight.type === "achievement" ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <Target className="h-4 w-4 text-blue-600" />
              )}
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
