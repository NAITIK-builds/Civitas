import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Calendar,
  TreePine,
  Eye
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { useSubmissionStore } from "@/lib/submissionStore";
import { useCivitasStore } from "@/lib/store";

export default function MySubmissions() {
  const { user } = useCivitasStore();
  const { getSubmissionsByUser, getSubmissionsByStatus } = useSubmissionStore();
  
  // Get user's submissions
  const userSubmissions = user ? getSubmissionsByUser(user.citizenId) : [];
  const pendingSubmissions = userSubmissions.filter(s => s.status === "pending");
  const approvedSubmissions = userSubmissions.filter(s => s.status === "approved");
  const rejectedSubmissions = userSubmissions.filter(s => s.status === "rejected");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending Review</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-500">Please log in to view your submissions</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Submissions</h1>
          <p className="text-gray-600">Track the status of your photo submissions</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              Pending ({pendingSubmissions.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedSubmissions.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedSubmissions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingSubmissions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No pending submissions</p>
                </CardContent>
              </Card>
            ) : (
              pendingSubmissions.map((submission) => (
                <Card key={submission.id} className="border-yellow-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-yellow-700">
                          <Clock className="w-5 h-5" />
                          Pending Review
                        </CardTitle>
                        <CardDescription>
                          Task: {submission.taskType} • Submitted: {new Date(submission.submittedAt).toLocaleString()}
                        </CardDescription>
                      </div>
                      {getStatusBadge(submission.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Description:</h4>
                        <p className="text-sm text-gray-600">{submission.formData.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{submission.location.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          <strong>Status:</strong> Your submission is under review. You will be notified when it's approved or rejected.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedSubmissions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No approved submissions</p>
                </CardContent>
              </Card>
            ) : (
              approvedSubmissions.map((submission) => (
                <Card key={submission.id} className="border-green-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-5 h-5" />
                          Approved
                        </CardTitle>
                        <CardDescription>
                          Task: {submission.taskType} • Approved: {new Date(submission.adminReview?.reviewedAt || "").toLocaleString()}
                        </CardDescription>
                      </div>
                      {getStatusBadge(submission.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Description:</h4>
                        <p className="text-sm text-gray-600">{submission.formData.description}</p>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800">
                          <strong>Congratulations!</strong> Your submission has been approved. You have earned points for this task.
                        </p>
                        {submission.adminReview?.comments && (
                          <p className="text-sm text-green-700 mt-2">
                            <strong>Admin Comments:</strong> {submission.adminReview.comments}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedSubmissions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No rejected submissions</p>
                </CardContent>
              </Card>
            ) : (
              rejectedSubmissions.map((submission) => (
                <Card key={submission.id} className="border-red-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-red-700">
                          <XCircle className="w-5 h-5" />
                          Rejected
                        </CardTitle>
                        <CardDescription>
                          Task: {submission.taskType} • Rejected: {new Date(submission.adminReview?.reviewedAt || "").toLocaleString()}
                        </CardDescription>
                      </div>
                      {getStatusBadge(submission.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Description:</h4>
                        <p className="text-sm text-gray-600">{submission.formData.description}</p>
                      </div>
                      
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800">
                          <strong>Rejected:</strong> Your submission did not meet the requirements.
                        </p>
                        {submission.adminReview?.comments && (
                          <p className="text-sm text-red-700 mt-2">
                            <strong>Admin Comments:</strong> {submission.adminReview.comments}
                          </p>
                        )}
                        <p className="text-sm text-red-700 mt-2">
                          You can submit a new task with better photos.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
