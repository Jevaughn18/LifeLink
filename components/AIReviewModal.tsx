"use client";

import { useState } from "react";
import { Appointment } from "@/types/appwrite.types";
import { approveAIAnalysis } from "@/lib/actions/appointment.actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface AIReviewModalProps {
  appointment: Appointment;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const AIReviewModal = ({
  appointment,
  open,
  setOpen,
}: AIReviewModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [humanNotes, setHumanNotes] = useState("");

  // Parse AI analysis if it exists
  let aiAnalysis: SymptomAnalysisResult | null = null;
  if (appointment.aiSymptomAnalysis) {
    try {
      aiAnalysis = JSON.parse(appointment.aiSymptomAnalysis);
    } catch (e) {
      console.error("Failed to parse AI analysis", e);
    }
  }

  const handleApprove = async (approved: boolean) => {
    setIsLoading(true);
    try {
      await approveAIAnalysis({
        appointmentId: appointment.$id,
        reviewedBy: "Admin", // In production, get from authenticated user
        approved,
        notes: humanNotes || undefined,
      });
      setOpen(false);
    } catch (error) {
      console.error("Failed to approve AI analysis:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!aiAnalysis) {
    return null;
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "Critical":
        return "bg-red-600 text-white";
      case "High":
        return "bg-orange-500 text-white";
      case "Medium":
        return "bg-yellow-500 text-black";
      case "Low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl">
            AI Analysis Review
            {appointment.aiHumanApproved && (
              <Badge className="ml-2 bg-green-600">Approved</Badge>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Review and approve the AI-generated symptom analysis for this
            appointment.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-6 py-4">
          {/* Patient's Original Text */}
          <div className="bg-dark-400 p-4 rounded-lg border border-dark-500">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">
              Patient's Original Description
            </h3>
            <p className="text-white">{appointment.reason}</p>
          </div>

          {/* AI Analysis Results */}
          <div className="bg-dark-300 p-4 rounded-lg border border-dark-500 space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">
              AI-Generated Analysis
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Symptom Category</p>
                <Badge className="bg-blue-600">{aiAnalysis.symptom_category}</Badge>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Urgency Level</p>
                <Badge className={getUrgencyColor(aiAnalysis.urgency_level)}>
                  {aiAnalysis.urgency_level}
                </Badge>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Recommended Specialty</p>
                <p className="text-white text-sm">{aiAnalysis.recommended_specialty}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Confidence Score</p>
                <p className="text-white text-sm">
                  {(aiAnalysis.confidence_score * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1">Keywords Identified</p>
              <div className="flex flex-wrap gap-2">
                {aiAnalysis.keywords.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-white">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1">AI Reasoning</p>
              <p className="text-white text-sm italic">{aiAnalysis.reasoning}</p>
            </div>

            {aiAnalysis.requires_human_review && (
              <div className="bg-yellow-900/30 border border-yellow-600 p-3 rounded">
                <p className="text-yellow-200 text-sm">
                  ⚠️ AI flagged this for mandatory human review
                </p>
              </div>
            )}
          </div>

          {/* Human Review Notes */}
          {!appointment.aiHumanApproved && (
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Review Notes (Optional)
              </label>
              <Textarea
                placeholder="Add any corrections or additional observations..."
                value={humanNotes}
                onChange={(e) => setHumanNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          )}

          {/* Previous Review Info */}
          {appointment.aiHumanApproved && (
            <div className="bg-green-900/20 border border-green-600 p-4 rounded">
              <p className="text-green-200 text-sm">
                <strong>Reviewed by:</strong> {appointment.aiReviewedBy}
              </p>
              {appointment.aiReviewedAt && (
                <p className="text-green-200 text-sm">
                  <strong>Reviewed at:</strong>{" "}
                  {new Date(appointment.aiReviewedAt).toLocaleString()}
                </p>
              )}
              {appointment.aiHumanNotes && (
                <p className="text-green-200 text-sm mt-2">
                  <strong>Notes:</strong> {appointment.aiHumanNotes}
                </p>
              )}
            </div>
          )}
        </div>

        <AlertDialogFooter>
          {!appointment.aiHumanApproved ? (
            <>
              <AlertDialogCancel disabled={isLoading}>
                Close
              </AlertDialogCancel>
              <Button
                onClick={() => handleApprove(false)}
                disabled={isLoading}
                variant="outline"
                className="bg-red-600 hover:bg-red-700"
              >
                Reject Analysis
              </Button>
              <Button
                onClick={() => handleApprove(true)}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? "Approving..." : "Approve Analysis"}
              </Button>
            </>
          ) : (
            <AlertDialogAction>Close</AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
