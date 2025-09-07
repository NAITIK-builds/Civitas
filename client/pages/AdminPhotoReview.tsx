import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubmissionStore } from "@/lib/submissionStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  MapPin,
  Calendar,
  Eye,
  TreePine
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCivitasStore } from "@/lib/store";
import { getSupabase } from "@/lib/supabase";
import { toast } from "sonner";

interface PhotoSubmission {
  id: string;
  userId: string;
  taskId: string;
  taskType: string;
  photos: string[];
  verificationResults: any[];
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  formData: {
    description: string;
    additionalNotes: string;
  };
  aiVerificationScore: number;
  adminReview?: {
    reviewedBy: string;
    reviewedAt: string;
    comments: string;
  };
}

export default function AdminPhotoReview() {
  const { updateSubmissionStatus, getSubmissionsByStatus } = useSubmissionStore();
  const { allUsers, updateUser } = useCivitasStore();
  const [loading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<PhotoSubmission | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const pendingSubmissions = getSubmissionsByStatus("pending");
  const approvedSubmissions = getSubmissionsByStatus("approved");
  const rejectedSubmissions = getSubmissionsByStatus("rejected");

  const handleApprove = async (submissionId: string) => {
    updateSubmissionStatus(submissionId, "approved", {
      comments: "Approved - Photos show clear tree planting activity"
    });

    const sub = pendingSubmissions.find(s => s.id === submissionId) || approvedSubmissions.find(s => s.id === submissionId) || null;
    if (sub) {
      try {
        const award = sub.taskType === "tree_planting" ? 50 : 25;
        const supabase = getSupabase();
        const { data: profile, error: fetchErr } = await supabase
          .from('profiles')
          .select('points, tasks_completed')
          .eq('citizen_id', sub.userId)
          .single();
        if (fetchErr) throw fetchErr;
        const { error: updateErr } = await supabase
          .from('profiles')
          .update({
            points: (profile?.points || 0) + award,
            tasks_completed: (profile?.tasks_completed || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('citizen_id', sub.userId);
        if (updateErr) throw updateErr;
        updateUser(sub.userId, { points: (profile?.points || 0) + award, tasksCompleted: (profile?.tasks_completed || 0) + 1 });
        toast.success(`Approved. Awarded ${award} points to ${sub.userId}`);
      } catch (e: any) {
        console.error('Point award error', e);
        toast.error('Failed to award points: ' + e.message);
      }
    }
  };

  const handleReject = (submissionId: string) => {
    updateSubmissionStatus(submissionId, "rejected", {
      comments: "Rejected - Photos do not show adequate tree planting evidence"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading submissions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Photo Submission Review</h1>
          <p className="text-gray-600">Review and approve tree planting photo submissions</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending ({pendingSubmissions.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedSubmissions.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedSubmissions.length})</TabsTrigger>
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
                <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <TreePine className="w-5 h-5 text-green-600" />
                          Tree Planting Submission
                        </CardTitle>
                        <CardDescription>
                          User: {submission.userId} • Task: {submission.taskId}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(submission.status)}
                        <Badge className={getScoreColor(submission.aiVerificationScore)}>
                          AI Score: {submission.aiVerificationScore}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Submitted Photos</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {submission.photos.map((photo, index) => (
                          <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img src={`/api/photos/${photo}`} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">AI Verification Results</h4>
                      <div className="space-y-2">
                        {submission.verificationResults.map((result, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{result.filename}</span>
                              <Badge variant={result.is_valid ? "default" : "destructive"}>
                                {result.is_valid ? "Valid" : "Invalid"}
                              </Badge>
                            </div>

                            {result.issues.length > 0 && (
                              <div className="mb-2">
                                <h5 className="text-sm font-medium text-red-600 mb-1">Issues:</h5>
                                <ul className="text-sm text-red-600 space-y-1">
                                  {result.issues.map((issue: string, i: number) => (
                                    <li key={i}>• {issue}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {result.recommendations.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-blue-600 mb-1">Recommendations:</h5>
                                <ul className="text-sm text-blue-600 space-y-1">
                                  {result.recommendations.map((rec: string, i: number) => (
                                    <li key={i}>• {rec}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Submission Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Description:</p>
                          <p className="text-sm">{submission.formData.description}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Additional Notes:</p>
                          <p className="text-sm">{submission.formData.additionalNotes}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{submission.location.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{new Date(submission.submittedAt).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                      <Button onClick={() => handleApprove(submission.id)} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve (+{submission.taskType === "tree_planting" ? "50" : "25"} points)
                      </Button>
                      <Button onClick={() => handleReject(submission.id)} variant="destructive">
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button variant="outline" onClick={() => { setSelectedSubmission(submission); setDetailsOpen(true); }}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
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
                          Approved Submission
                        </CardTitle>
                        <CardDescription>
                          User: {submission.userId} • Approved by: {submission.adminReview?.reviewedBy}
                        </CardDescription>
                      </div>
                      {getStatusBadge(submission.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Approved on: {new Date(submission.adminReview?.reviewedAt || "").toLocaleString()}</p>
                    <p className="text-sm mt-2">
                      <strong>Admin Comments:</strong> {submission.adminReview?.comments}
                    </p>
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
                          Rejected Submission
                        </CardTitle>
                        <CardDescription>
                          User: {submission.userId} • Rejected by: {submission.adminReview?.reviewedBy}
                        </CardDescription>
                      </div>
                      {getStatusBadge(submission.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Rejected on: {new Date(submission.adminReview?.reviewedAt || "").toLocaleString()}</p>
                    <p className="text-sm mt-2">
                      <strong>Admin Comments:</strong> {submission.adminReview?.comments}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Submission Details</DialogTitle>
            </DialogHeader>
            {selectedSubmission && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">User ID</p>
                    <p className="font-medium">{selectedSubmission.userId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Task</p>
                    <p className="font-medium">{selectedSubmission.taskType} ({selectedSubmission.taskId})</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Photos</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {selectedSubmission.photos.map((p, i) => (
                      <img key={i} src={`/api/photos/${p}`} alt={`Photo ${i + 1}`} className="w-full h-32 object-cover rounded" />
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">AI Summary</h4>
                  <div className="space-y-2">
                    {selectedSubmission.verificationResults.map((r, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded border">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{r.filename}</span>
                          <Badge variant={r.is_valid ? "default" : "destructive"}>{r.is_valid ? "Valid" : "Invalid"}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
