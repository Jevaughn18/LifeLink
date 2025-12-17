"use client";

import { useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { AIReviewModal } from "./AIReviewModal";
import { Appointment } from "@/types/appwrite.types";

// This interface might need to be defined in a central types file
// if it's used elsewhere, but for now, this is fine.
interface SymptomAnalysisResult {
  symptom_category: string;
  recommended_specialty: string;
  confidence_score: number;
  keywords: string[];
  reasoning: string;
  requires_human_review: boolean;
}

interface AIReviewCellProps {
  appointment: Appointment;
}

export const AIReviewCell = ({ appointment }: AIReviewCellProps) => {
  const [reviewOpen, setReviewOpen] = useState(false);

  // Safely parse the AI analysis data.
  // It might be a string from the database that needs parsing.
  let aiAnalysis: SymptomAnalysisResult | null = null;
  if (typeof appointment.aiSymptomAnalysis === 'string') {
    try {
      // Attempt to parse the string into an object.
      aiAnalysis = JSON.parse(appointment.aiSymptomAnalysis);
    } catch (error) {
      console.error("Failed to parse aiSymptomAnalysis JSON:", error);
    }
  } else if (typeof appointment.aiSymptomAnalysis === 'object' && appointment.aiSymptomAnalysis !== null) {
    // If it's already an object, use it directly.
    aiAnalysis = appointment.aiSymptomAnalysis as SymptomAnalysisResult;
  }

  if (!aiAnalysis) {
    return <p className="text-14-regular text-gray-500">No AI data</p>;
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        <Badge className="bg-blue-600 w-fit">
          {aiAnalysis.symptom_category}
        </Badge>
        {appointment.aiReviewedBy ? (
          // Has been reviewed
          appointment.aiHumanApproved ? (
            <Badge className="bg-green-600 w-fit">✓ Approved</Badge>
          ) : (
            <Badge className="bg-red-600 w-fit">✗ Rejected</Badge>
          )
        ) : (
          // Not reviewed yet
          <Button
            size="sm"
            onClick={() => setReviewOpen(true)}
            className="shad-primary-btn text-xs h-7"
          >
            Review
          </Button>
        )}
      </div>
      <AIReviewModal
        appointment={appointment}
        open={reviewOpen}
        setOpen={setReviewOpen}
      />
    </>
  );
};
