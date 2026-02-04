"use client";

import { Sparkles, ArrowRight, Target, TrendingUp, AlertTriangle, Calendar, Pill, Activity } from "lucide-react";
import { useEffect, useState } from "react";

interface Insight {
  id: string;
  title: string;
  description: string;
  type: "tip" | "goal" | "achievement" | "urgent" | "reminder" | "preventive";
  priority: "high" | "medium" | "low";
  icon?: any;
}

interface InsightsCardProps {
  patient?: any;
  userId: string;
  appointments?: any[];
}

export function InsightsCard({ patient, userId, appointments }: InsightsCardProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateSmartInsights = () => {
      const smartInsights: Insight[] = [];

      // 1. Medication Reminders
      if (patient?.currentMedication && patient.currentMedication.trim() !== '') {
        const meds = patient.currentMedication.split(',').map((m: string) => m.trim());
        if (meds.length > 0) {
          smartInsights.push({
            id: "med-reminder",
            title: "Daily Medication Reminder",
            description: `Don't forget to take your ${meds[0]}. Set up reminders in your phone for consistent timing.`,
            type: "reminder",
            priority: "high",
            icon: Pill
          });
        }
      }

      // 2. Preventive Care - Annual Checkup
      const hasRecentAppointment = appointments?.some((apt: any) => {
        const aptDate = new Date(apt.schedule);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        return aptDate >= threeMonthsAgo && apt.status === 'scheduled';
      });

      if (!hasRecentAppointment) {
        smartInsights.push({
          id: "annual-checkup",
          title: "Annual Checkup Due",
          description: "It's been a while since your last visit. Schedule your annual physical exam to stay on top of your health.",
          type: "preventive",
          priority: "medium",
          icon: Calendar
        });
      }

      // 3. Condition-Specific Tips
      if (patient?.pastMedicalHistory) {
        const history = patient.pastMedicalHistory.toLowerCase();

        if (history.includes('hypertension') || history.includes('blood pressure')) {
          smartInsights.push({
            id: "bp-tip",
            title: "Blood Pressure Management",
            description: "Reduce salt intake to less than 1 teaspoon per day. Monitor your BP weekly and track trends.",
            type: "tip",
            priority: "high",
            icon: Activity
          });
        }

        if (history.includes('diabetes')) {
          smartInsights.push({
            id: "diabetes-tip",
            title: "Blood Sugar Control",
            description: "Check your glucose before meals and 2 hours after. Aim for 80-130 mg/dL before meals.",
            type: "tip",
            priority: "high",
            icon: Activity
          });
        }

        if (history.includes('asthma')) {
          smartInsights.push({
            id: "asthma-tip",
            title: "Asthma Management",
            description: "Keep your rescue inhaler accessible. Avoid triggers like dust, smoke, and cold air.",
            type: "tip",
            priority: "medium",
            icon: Activity
          });
        }
      }

      // 4. Family History Preventive Care
      if (patient?.familyMedicalHistory) {
        const famHistory = patient.familyMedicalHistory.toLowerCase();

        if (famHistory.includes('cancer')) {
          smartInsights.push({
            id: "cancer-screening",
            title: "Cancer Screening Recommended",
            description: "Given your family history, discuss cancer screening options with your doctor at your next visit.",
            type: "preventive",
            priority: "high",
            icon: AlertTriangle
          });
        }

        if (famHistory.includes('heart') || famHistory.includes('cardiac')) {
          smartInsights.push({
            id: "heart-health",
            title: "Heart Health Focus",
            description: "Family history detected. Maintain healthy weight, exercise 30min daily, and monitor cholesterol levels.",
            type: "preventive",
            priority: "medium",
            icon: Activity
          });
        }
      }

      // 5. Allergy Awareness
      if (patient?.allergies && patient.allergies.trim() !== '') {
        smartInsights.push({
          id: "allergy-alert",
          title: "Allergy Alert Active",
          description: `You have documented allergies to ${patient.allergies}. Always inform healthcare providers before treatment.`,
          type: "urgent",
          priority: "high",
          icon: AlertTriangle
        });
      }

      // 6. Upcoming Appointment Prep
      const upcomingApt = appointments?.find((apt: any) => {
        const aptDate = new Date(apt.schedule);
        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        return aptDate >= now && aptDate <= threeDaysFromNow && apt.status === 'scheduled';
      });

      if (upcomingApt) {
        smartInsights.push({
          id: "apt-prep",
          title: "Upcoming Appointment Prep",
          description: `Prepare questions for Dr. ${upcomingApt.primaryPhysician}. Bring your medication list and recent symptoms log.`,
          type: "reminder",
          priority: "medium",
          icon: Calendar
        });
      }

      // 7. General Health Tips (if no specific conditions)
      if (smartInsights.length < 2) {
        smartInsights.push(
          {
            id: "hydration",
            title: "Stay Hydrated",
            description: "Drink at least 8 glasses of water daily. Proper hydration improves energy and supports organ function.",
            type: "tip",
            priority: "low",
            icon: TrendingUp
          },
          {
            id: "exercise",
            title: "Daily Movement Goal",
            description: "Aim for 30 minutes of moderate activity daily. Even a brisk walk makes a difference!",
            type: "goal",
            priority: "medium",
            icon: Target
          },
          {
            id: "sleep",
            title: "Quality Sleep Matters",
            description: "Get 7-9 hours of sleep nightly. Good sleep strengthens immunity and mental health.",
            type: "tip",
            priority: "low",
            icon: Sparkles
          }
        );
      }

      // Sort by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      smartInsights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

      setInsights(smartInsights);
      setLoading(false);
    };

    generateSmartInsights();
  }, [patient, userId, appointments]);

  const getIcon = (insight: Insight) => {
    if (insight.icon) {
      const Icon = insight.icon;
      return <Icon className="h-4 w-4" />;
    }

    switch (insight.type) {
      case "achievement":
        return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case "goal":
        return <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case "reminder":
        return <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case "preventive":
        return <Activity className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
      default:
        return <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "urgent":
        return "bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20";
      case "reminder":
        return "bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20";
      case "preventive":
        return "bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20";
      case "achievement":
        return "bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20";
      default:
        return "bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white dark:bg-black p-6 shadow-sm border border-gray-200 dark:border-gray-800 transition-colors">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Health Insights</h3>
          <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Analyzing your health data...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-black p-6 shadow-sm border border-gray-200 dark:border-gray-800 transition-all hover:shadow-md">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Health Insights</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered recommendations</p>
        </div>
        <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>

      <div className="space-y-3">
        {insights.slice(0, 3).map((insight) => (
          <div
            key={insight.id}
            className={`rounded-xl p-4 transition-colors ${getBadgeColor(insight.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {getIcon(insight)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                  {insight.title}
                </h4>
                <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  {insight.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 transition-all hover:bg-blue-100 dark:hover:bg-blue-500/20">
        View all insights
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
