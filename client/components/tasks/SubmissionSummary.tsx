import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Award, Clock, Image as ImageIcon, MapPin } from "lucide-react";
import { Task } from "@/lib/store";

interface SubmissionSummaryProps {
  task: Task;
  descriptionFilled: boolean;
  photosVerified: boolean;
  locationSet: boolean;
  uploadedCount: number;
  consentChecked: boolean;
  className?: string;
}

export default function SubmissionSummary({
  task,
  descriptionFilled,
  photosVerified,
  locationSet,
  uploadedCount,
  consentChecked,
  className,
}: SubmissionSummaryProps) {
  const checklist = [
    { label: "Description added", ok: descriptionFilled },
    { label: `Photos verified (${uploadedCount})`, ok: photosVerified },
    { label: "Location set", ok: locationSet },
    { label: "Consent given", ok: consentChecked },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base sm:text-lg">
          Submission Summary
          <Badge className="bg-gov-gold text-gov-navy">
            <Award className="w-4 h-4 mr-1" />
            {task.points} pts
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="w-4 h-4" />
            Due
          </div>
          <div className="font-medium text-gov-navy">{new Date(task.deadline).toLocaleDateString()}</div>
        </div>

        <div className="space-y-2">
          {checklist.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                {item.label.includes("Photos") ? (
                  <ImageIcon className="w-4 h-4" />
                ) : item.label.includes("Location") ? (
                  <MapPin className="w-4 h-4" />
                ) : item.ok ? (
                  <CheckCircle className="w-4 h-4 text-gov-green" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <span>{item.label}</span>
              </div>
              <Badge variant={item.ok ? "default" : "secondary"} className={item.ok ? "bg-gov-green" : "bg-gray-200 text-gray-700"}>
                {item.ok ? "Ready" : "Missing"}
              </Badge>
            </div>
          ))}
        </div>

        <div className="text-xs text-gray-500">
          Make sure each item is marked Ready before submitting.
        </div>
      </CardContent>
    </Card>
  );
}
