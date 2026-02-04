"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [humanNotes, setHumanNotes] = useState("");

  // The AI analysis data is now expected to be a pre-parsed object.
  const aiAnalysis: SymptomAnalysisResult | null = appointment.aiSymptomAnalysis
    ? (appointment.aiSymptomAnalysis as SymptomAnalysisResult)
    : null;

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
      router.refresh(); // Refresh the page to show updated data
    } catch (error) {
      console.error("Failed to approve AI analysis:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!aiAnalysis) {
    return null;
  }


  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
        <AlertDialogHeader className="pb-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <AlertDialogTitle className="text-2xl font-bold text-white">
                AI Analysis Review
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300 mt-2">
                Review and approve the AI-generated symptom analysis for this appointment.
              </AlertDialogDescription>
            </div>
            {appointment.aiReviewedBy && (
              <Badge 
                className={appointment.aiHumanApproved 
                  ? "bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-semibold" 
                  : "bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-semibold"
                }
              >
                {appointment.aiHumanApproved ? "✓ Approved" : "✗ Rejected"}
              </Badge>
            )}
          </div>
        </AlertDialogHeader>

        <div className="space-y-6 py-6">
          {/* Patient's Original Text */}
          <div className="bg-gray-700/50 p-5 rounded-xl border border-gray-600">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
              Patient's Original Description
            </h3>
            <p className="text-gray-100 text-base leading-relaxed bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              {appointment.reason}
            </p>
          </div>

          {/* AI Analysis Results */}
          <div className="bg-gray-700/50 p-5 rounded-xl border border-gray-600 space-y-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">
              AI-Generated Analysis
            </h3>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800/70 p-4 rounded-lg border border-gray-600">
                <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Symptom Category</p>
                <Badge className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-sm font-semibold">
                  {aiAnalysis.symptom_category}
                </Badge>
              </div>

              <div className="bg-gray-800/70 p-4 rounded-lg border border-gray-600">
                <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Recommended Specialty</p>
                <p className="text-gray-100 text-base font-medium">{aiAnalysis.recommended_specialty}</p>
              </div>

              <div className="bg-gray-800/70 p-4 rounded-lg border border-gray-600">
                <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Confidence Score</p>
                <div className="flex items-center gap-2">
                  <p className="text-gray-100 text-2xl font-bold">
                    {(aiAnalysis.confidence_score * 100).toFixed(0)}%
                  </p>
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${aiAnalysis.confidence_score * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Keywords Section */}
            <div className="bg-gray-800/70 p-4 rounded-lg border border-gray-600">
              <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">Keywords Identified</p>
              <div className="flex flex-wrap gap-2">
                {aiAnalysis.keywords.map((keyword, index) => (
                  <Badge 
                    key={index} 
                    className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1.5 text-xs font-medium"
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>

            {/* AI Reasoning */}
            <div className="bg-gray-800/70 p-4 rounded-lg border border-gray-600">
              <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">AI Reasoning</p>
              <p className="text-gray-200 text-sm leading-relaxed italic bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                {aiAnalysis.reasoning}
              </p>
            </div>

            {/* Human Review Flag */}
            {aiAnalysis.requires_human_review && (
              <div className="bg-yellow-500/10 border-2 border-yellow-500/50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 text-xl">⚠️</span>
                  <p className="text-yellow-200 text-sm font-semibold">
                    AI flagged this for mandatory human review
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Human Review Notes */}
          {!appointment.aiReviewedBy && (
            <div className="bg-gray-700/50 p-5 rounded-xl border border-gray-600">
              <label className="text-sm font-semibold text-gray-300 mb-3 block uppercase tracking-wide">
                Review Notes (Optional)
              </label>
              <Textarea
                placeholder="Add any corrections or additional observations..."
                value={humanNotes}
                onChange={(e) => setHumanNotes(e.target.value)}
                className="min-h-[120px] bg-gray-800 border-gray-600 text-gray-200 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Previous Review Info */}
          {appointment.aiReviewedBy && (
            <div className={appointment.aiHumanApproved
              ? "bg-green-500/10 border-2 border-green-500/50 p-5 rounded-xl"
              : "bg-red-500/10 border-2 border-red-500/50 p-5 rounded-xl"
            }>
              <h3 className={appointment.aiHumanApproved 
                ? "text-green-300 text-sm font-semibold mb-4 uppercase tracking-wide" 
                : "text-red-300 text-sm font-semibold mb-4 uppercase tracking-wide"
              }>
                Review Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className={appointment.aiHumanApproved ? "text-green-400 font-semibold min-w-[120px]" : "text-red-400 font-semibold min-w-[120px]"}>
                    Reviewed by:
                  </span>
                  <span className={appointment.aiHumanApproved ? "text-green-200" : "text-red-200"}>
                    {appointment.aiReviewedBy}
                  </span>
                </div>
                {appointment.aiReviewedAt && (
                  <div className="flex items-start gap-3">
                    <span className={appointment.aiHumanApproved ? "text-green-400 font-semibold min-w-[120px]" : "text-red-400 font-semibold min-w-[120px]"}>
                      Reviewed at:
                    </span>
                    <span className={appointment.aiHumanApproved ? "text-green-200" : "text-red-200"}>
                      {new Date(appointment.aiReviewedAt).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <span className={appointment.aiHumanApproved ? "text-green-400 font-semibold min-w-[120px]" : "text-red-400 font-semibold min-w-[120px]"}>
                    Status:
                  </span>
                  <Badge className={appointment.aiHumanApproved 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "bg-red-600 hover:bg-red-700 text-white"
                  }>
                    {appointment.aiHumanApproved ? "✓ Approved" : "✗ Rejected"}
                  </Badge>
                </div>
                {appointment.aiHumanNotes && (
                  <div className="mt-4 pt-4 border-t border-gray-600">
                    <span className={appointment.aiHumanApproved ? "text-green-400 font-semibold block mb-2" : "text-red-400 font-semibold block mb-2"}>
                      Notes:
                    </span>
                    <p className={appointment.aiHumanApproved 
                      ? "text-green-200 bg-green-500/10 p-3 rounded-lg border border-green-500/30" 
                      : "text-red-200 bg-red-500/10 p-3 rounded-lg border border-red-500/30"
                    }>
                      {appointment.aiHumanNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter className="border-t border-gray-700 pt-4 mt-4">
          {!appointment.aiReviewedBy ? (
            <div className="flex items-center justify-end gap-3 w-full">
              <AlertDialogCancel 
                disabled={isLoading}
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600"
              >
                Cancel
              </AlertDialogCancel>
              <Button
                onClick={() => handleApprove(false)}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6"
              >
                {isLoading ? "Processing..." : "Reject Analysis"}
              </Button>
              <Button
                onClick={() => handleApprove(true)}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6"
              >
                {isLoading ? "Approving..." : "Approve Analysis"}
              </Button>
            </div>
          ) : (
            <AlertDialogAction className="bg-gray-700 hover:bg-gray-600 text-gray-200">
              Close
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
