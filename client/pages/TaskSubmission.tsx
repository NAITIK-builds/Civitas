import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import Navigation from "@/components/Navigation";
import PhotoCapture from "@/components/PhotoCapture";
import StepIndicator from "@/components/tasks/StepIndicator";
import SubmissionSummary from "@/components/tasks/SubmissionSummary";
import { useToast } from "@/hooks/use-toast";
import { useCivitasStore, Task } from "@/lib/store";
import { useSubmissionStore } from "@/lib/submissionStore";
import {
  TreePine, Eye, AlertTriangle, Upload, MapPin, Clock,
  CheckCircle, Award, ArrowLeft, Loader2, AlertCircle
} from "lucide-react";

export default function TaskSubmission() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, tasks, submitReport } = useCivitasStore();
  const { addSubmission } = useSubmissionStore();
  
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  
  const [formData, setFormData] = useState({
    description: "",
    additionalNotes: "",
    location: "",
    coordinates: { lat: 0, lng: 0 }
  });
  
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [verificationResults, setVerificationResults] = useState<any[]>([]);

  // Load task data from store
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const foundTask = tasks.find(t => t.id === taskId);
    if (foundTask) setTask(foundTask);
    setIsLoading(false);
  }, [taskId, isAuthenticated, navigate, tasks]);

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "tree_planting": return TreePine;
      case "pollution_report": return Eye;
      case "corruption_report": return AlertTriangle;
      default: return CheckCircle;
    }
  };

  const getTaskColor = (type: string) => {
    switch (type) {
      case "tree_planting": return "bg-gov-green";
      case "pollution_report": return "bg-gov-navy";
      case "corruption_report": return "bg-gov-maroon";
      default: return "bg-gray-500";
    }
  };

  const handlePhotosVerified = (photos: File[], results: any[]) => {
    setUploadedFiles(photos);
    setVerificationResults(results);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            location: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({ title: "Location error", description: "Could not get your location. Please enter manually.", variant: "destructive" });
        }
      );
    }
  };

  const photosVerified = useMemo(() => (
    verificationResults.length > 0 && verificationResults.every((r: any) => r.is_valid)
  ), [verificationResults]);

  const locationSet = useMemo(() => formData.location.trim().length > 0, [formData.location]);
  const descriptionFilled = useMemo(() => formData.description.trim().length >= 20, [formData.description]);

  const currentStep = useMemo(() => {
    if (!descriptionFilled) return 1;
    if (!photosVerified) return 2;
    return 3;
  }, [descriptionFilled, photosVerified]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !user) return;

    if (!descriptionFilled || !photosVerified || !locationSet || !consentChecked) {
      toast({ title: "Missing information", description: "Please complete all required sections and consent before submitting.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    setSubmissionStep(2);

    toast({ title: "Uploading", description: "Uploading photos and submitting your report..." });

    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      // eslint-disable-next-line no-await-in-loop
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setSubmissionStep(3);

    // Add submission to store for admin review
    addSubmission({
      userId: user.citizenId,
      taskId: task.id,
      taskType: task.type,
      photos: uploadedFiles.map(f => f.name),
      verificationResults: verificationResults,
      location: {
        address: formData.location,
        coordinates: formData.coordinates
      },
      formData: {
        description: formData.description,
        additionalNotes: formData.additionalNotes
      },
      aiVerificationScore: verificationResults.length > 0 
        ? verificationResults.reduce((sum, result) => sum + result.score, 0) / verificationResults.length
        : 0
    });

    // Also submit to the original report system
    submitReport({
      citizenId: user.citizenId,
      taskId: task.id,
      title: task.title,
      description: formData.description,
      photos: uploadedFiles.map(f => f.name),
      location: {
        address: formData.location,
        coordinates: formData.coordinates
      }
    });

    await new Promise(resolve => setTimeout(resolve, 800));

    setSubmissionComplete(true);
    setIsSubmitting(false);
    toast({ 
      title: "Submitted Successfully", 
      description: "Your task report was submitted for admin review. You will be notified when it's approved." 
    });
  };

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-gov-navy" />
            <p className="text-gray-600">Loading task details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Task Not Found</h1>
            <p className="text-gray-600 mb-6">The requested task could not be found or may have expired.</p>
            <Link to="/dashboard">
              <Button className="bg-gov-navy hover:bg-gov-navy/90">Return to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (submissionComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-gov-green shadow-xl">
              <CardHeader className="text-center bg-gov-green text-white">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-gov-green" />
                </div>
                <CardTitle className="text-2xl">Submission Successful!</CardTitle>
                <CardDescription className="text-green-100">Your task report has been submitted for verification</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-gov-navy mb-4">What Happens Next?</h3>
                  <div className="space-y-4 text-left">
                    <div className="flex items-center gap-3"><div className="w-8 h-8 bg-gov-navy rounded-full flex items-center justify-center text-white text-sm font-bold">1</div><span>AI verification of your photos and location data</span></div>
                    <div className="flex items-center gap-3"><div className="w-8 h-8 bg-gov-navy rounded-full flex items-center justify-center text-white text-sm font-bold">2</div><span>Government official review (if needed)</span></div>
                    <div className="flex items-center gap-3"><div className="w-8 h-8 bg-gov-navy rounded-full flex items-center justify-center text-white text-sm font-bold">3</div><span>Points awarded upon approval</span></div>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-800 mb-2">Expected Timeline:</h4>
                  <p className="text-blue-700 text-sm">• AI verification: Within 2 hours<br />• Manual review (if required): 24-48 hours<br />• You'll be notified of the result in your dashboard</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/dashboard" className="flex-1"><Button className="w-full bg-gov-navy hover:bg-gov-navy/90">View Dashboard</Button></Link>
                  <Link to="/leaderboard" className="flex-1"><Button variant="outline" className="w-full border-gov-navy text-gov-navy hover:bg-gov-navy hover:text-white">Check Leaderboard</Button></Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const IconComponent = getTaskIcon(task.type);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="main-content">
        <div className="py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <Link to="/dashboard"><Button variant="outline" className="mb-4 text-sm"><ArrowLeft className="w-4 h-4 mr-2" />Back to Dashboard</Button></Link>

              <Card className="shadow-lg">
                <CardHeader className={`${getTaskColor(task.type)} text-white`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-6 h-6 sm:w-8 sm:h-8" />
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg sm:text-xl lg:text-2xl">{task.title}</CardTitle>
                        <CardDescription className="text-gray-100 text-sm">{task.location}</CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col sm:text-right gap-2">
                      <Badge className="bg-gov-gold text-gov-navy text-xs sm:text-sm"><Award className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />{task.points} Points</Badge>
                      <div className="text-xs sm:text-sm text-gray-200"><Clock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />Due: {new Date(task.deadline).toLocaleDateString()}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">{task.description}</p>
                  <h4 className="font-semibold text-gov-navy mb-3 text-sm sm:text-base">Task Requirements:</h4>
                  <ul className="grid gap-2 mb-2 sm:mb-4">
                    {task.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs sm:text-sm"><CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gov-green flex-shrink-0 mt-0.5" /><span>{req}</span></li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="mb-4">
              <StepIndicator steps={["Details", "Photos", "Review & Submit"]} current={currentStep} />
            </div>

            {isSubmitting ? (
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <div className="text-center">
                    {submissionStep === 1 && (<><Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-gov-navy" /><h3 className="text-xl font-semibold mb-2">Preparing Submission...</h3><p className="text-gray-600">Validating your data and preparing for upload</p></>)}
                    {submissionStep === 2 && (<><Upload className="w-12 h-12 mx-auto mb-4 text-gov-navy" /><h3 className="text-xl font-semibold mb-4">Uploading Files...</h3><Progress value={uploadProgress} className="w-full max-w-md mx-auto mb-2" /><p className="text-sm text-gray-600">{uploadProgress}% complete</p></>)}
                    {submissionStep === 3 && (<><CheckCircle className="w-12 h-12 mx-auto mb-4 text-gov-green" /><h3 className="text-xl font-semibold mb-2">Processing Submission...</h3><p className="text-gray-600">Running initial AI verification checks</p></>)}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl"><Upload className="w-4 h-4 sm:w-5 sm:h-5" />Submit Task Report</CardTitle>
                    <CardDescription className="text-sm">Provide detailed information about your completed task</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                      <div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="description" className="text-sm sm:text-base">Task Description *</Label>
                          <span className="text-xs text-gray-500">{formData.description.length}/1000</span>
                        </div>
                        <Textarea
                          id="description"
                          placeholder="Describe what you did, how many trees you planted, any challenges faced, etc..."
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value.slice(0, 1000)})}
                          className="min-h-[120px] text-sm sm:text-base"
                          required
                        />
                        {!descriptionFilled && (
                          <p className="mt-1 text-xs text-red-600">Please add at least 20 characters.</p>
                        )}
                      </div>

                      <div>
                        <Label className="text-sm sm:text-base">Photo Capture & Verification *</Label>
                        <PhotoCapture
                          onPhotosVerified={handlePhotosVerified}
                          taskType={task.type}
                          taskLocation={formData.coordinates}
                          taskDeadline={{ start: new Date(task.deadline).toISOString(), end: new Date(task.deadline).toISOString() }}
                          userId={user!.citizenId}
                          maxPhotos={5}
                        />
                        {!photosVerified && (
                          <p className="mt-2 text-xs text-red-600">Verify at least one valid photo to continue.</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="location" className="text-sm sm:text-base">Location Details *</Label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Input
                            id="location"
                            placeholder="Enter location or use GPS coordinates"
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                            className="flex-1 text-sm sm:text-base"
                            required
                          />
                          <Button type="button" onClick={getCurrentLocation} variant="outline" className="w-full sm:w-auto text-sm"><MapPin className="w-4 h-4 mr-2" />Get GPS</Button>
                        </div>
                        {!locationSet && (
                          <p className="mt-1 text-xs text-red-600">Location is required.</p>
                        )}
                      </div>

                      <div className="flex items-start gap-3">
                        <Checkbox id="consent" checked={consentChecked} onCheckedChange={(v) => setConsentChecked(Boolean(v))} />
                        <Label htmlFor="consent" className="text-sm text-gray-700">I confirm the information provided is accurate and the photos are taken by me at the reported location and time.</Label>
                      </div>

                      <div>
                        <Label htmlFor="notes" className="text-sm sm:text-base">Additional Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          placeholder="Any additional information, observations, or suggestions..."
                          value={formData.additionalNotes}
                          onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
                          className="text-sm sm:text-base"
                        />
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                        <h4 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">AI Verification Process</h4>
                        <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
                          <li>• Photos will be analyzed for authenticity and task completion</li>
                          <li>• GPS coordinates will be verified against task location</li>
                          <li>• Processing typically takes 2-4 hours</li>
                          <li>• You'll receive notification of approval status</li>
                        </ul>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gov-maroon hover:bg-gov-maroon/90 text-white py-3 text-base sm:text-lg font-semibold"
                        disabled={uploadedFiles.length === 0 || !descriptionFilled || !locationSet || !photosVerified || !consentChecked}
                      >
                        Submit Task Report (+{task.points} points)
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <SubmissionSummary
                  className="h-fit"
                  task={task}
                  descriptionFilled={descriptionFilled}
                  photosVerified={photosVerified}
                  locationSet={locationSet}
                  uploadedCount={uploadedFiles.length}
                  consentChecked={consentChecked}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
