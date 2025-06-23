import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  Globe, 
  Key, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  FileText, 
  X, 
  Eye, 
  EyeOff,
  Rocket,
  Loader2
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface SetupWizardProps {
  onSessionCreated: (sessionId: string) => void;
}

export default function SetupWizard({ onSessionCreated }: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const { toast } = useToast();

  const totalSteps = 3;

  const createSessionMutation = useMutation({
    mutationFn: async (data: { sessionId: string; apiKey: string; websiteUrl?: string }) => {
      const response = await apiRequest("POST", "/api/chat/session", data);
      return response.json();
    },
    onSuccess: (data) => {
      onSessionCreated(data.sessionId);
      toast({
        title: "Success!",
        description: "Your AI chatbot is ready to use.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create chat session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const uploadDocumentsMutation = useMutation({
    mutationFn: async (data: { sessionId: string; files: File[] }) => {
      const formData = new FormData();
      formData.append('sessionId', data.sessionId);
      data.files.forEach(file => {
        formData.append('documents', file);
      });
      
      const response = await fetch('/api/chat/documents', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload documents');
      }
      
      return response.json();
    },
  });

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const validFiles = Array.from(files).filter(file => {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type. Only PDF, DOCX, and TXT files are allowed.`,
          variant: "destructive",
        });
        return false;
      }
      
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} is too large. Maximum file size is 10MB.`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });

    if (uploadedFiles.length + validFiles.length > 5) {
      toast({
        title: "Too many files",
        description: "You can upload a maximum of 5 files.",
        variant: "destructive",
      });
      return;
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLaunchDemo = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Gemini API key to continue.",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep(4); // Processing step
    
    // Simulate processing with progress updates
    const steps = [
      'Initializing AI model...',
      'Processing uploaded documents..', 
      'Analyzing website content...',
      'Training RAG model...',
      'Optimizing responses...',
      'Finalizing chatbot setup...'
    ];

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    let progress = 0;
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      progress += 100 / steps.length;
      setProcessingProgress(Math.min(progress, 100));
    }

    try {
      // Create session
      await createSessionMutation.mutateAsync({
        sessionId,
        apiKey,
        websiteUrl: websiteUrl || undefined,
      });

      // Upload documents if any
      if (uploadedFiles.length > 0) {
        await uploadDocumentsMutation.mutateAsync({
          sessionId,
          files: uploadedFiles,
        });
      }

      // Show success step
      setCurrentStep(5);
    } catch (error) {
      setCurrentStep(3); // Go back to API key step
    }
  };

  const stepIndicators = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <Card className="glass rounded-2xl p-8 bg-white/90 backdrop-blur-md">
      {/* Step Progress Indicator */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          {stepIndicators.map((step, index) => (
            <div key={step} className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                step <= currentStep 
                  ? 'bg-gradient-to-r from-primary-blue to-bright-blue text-white' 
                  : 'bg-slate-300 text-slate-600'
              }`}>
                {step}
              </div>
              <span className={`text-sm font-medium transition-colors duration-300 ${
                step <= currentStep ? 'text-slate-700' : 'text-slate-500'
              }`}>
                {step === 1 ? 'Documents' : step === 2 ? 'Website' : 'API Key'}
              </span>
              {index < stepIndicators.length - 1 && (
                <div className="w-8 h-0.5 bg-slate-300 mx-2"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Document Upload */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Upload Your Business Documents</h3>
            <p className="text-slate-600 mb-6">Upload PDFs, Word documents, or text files containing your business information, FAQs, and policies.</p>
            
            <div 
              className={`file-upload-zone glass-blue rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 bg-white/80 ${
                dragOver ? 'dragover' : ''
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFileUpload(e.dataTransfer.files);
              }}
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              <motion.div
                animate={{ y: dragOver ? -5 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Upload className="text-primary-blue mb-4 mx-auto animate-bounce-gentle" size={48} />
              </motion.div>
              <h4 className="text-lg font-medium text-slate-700 mb-2">Drag & drop files here</h4>
              <p className="text-slate-500 mb-4">or click to browse</p>
              <p className="text-sm text-slate-400">Supports PDF, DOCX, TXT (Max 10MB each)</p>
              <input
                type="file"
                id="fileInput"
                multiple
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
            </div>
            
            {uploadedFiles.length > 0 && (
              <motion.div 
                className="mt-4 space-y-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-white/50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <FileText className="text-primary-blue" size={16} />
                      <span className="text-sm text-slate-700">{file.name}</span>
                      <span className="text-xs text-slate-500">({(file.size/1024/1024).toFixed(1)}MB)</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </motion.div>
            )}
            
            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-slate-500">
                {uploadedFiles.length === 0 ? "Upload at least one document to continue" : `${uploadedFiles.length} file(s) ready`}
              </p>
              <Button 
                onClick={nextStep}
                className="bg-gradient-to-r from-primary-blue to-bright-blue text-blue-600 hover:shadow-lg transition-all duration-300"
              >
                {uploadedFiles.length === 0 ? "Skip for now" : "Next Step"} <ArrowRight className="ml-2 text-primary-blue" size={16} />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Website URL */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Add Your Website URL</h3>
            <p className="text-slate-600 mb-6">Enter your website URL so the AI can learn from your online content and provide comprehensive answers.</p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="websiteUrl" className="text-sm font-medium text-slate-700 mb-2">Website URL</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <Input
                    id="websiteUrl"
                    type="url"
                    placeholder="https://your-business-website.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Card className="glass-blue border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="text-primary-blue mt-0.5" size={16} />
                    <div className="text-sm text-slate-600">
                      <p className="font-medium mb-1">Optional but recommended</p>
                      <p>Adding your website helps the AI understand your business context and provide more accurate responses.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="ghost" onClick={prevStep} className="text-slate-600 hover:text-slate-800">
                <ArrowLeft className="mr-2 text-primary-blue" size={16} /> Back
              </Button>
              <Button onClick={nextStep} className="bg-gradient-to-r from-primary-blue to-bright-blue text-blue-600 hover:shadow-lg transition-all duration-300">
                Next Step <ArrowRight className="ml-2 text-primary-blue" size={16} />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: API Key */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Configure Gemini API Key</h3>
            <p className="text-slate-600 mb-6">Enter your Google Gemini API key to power the AI responses. Your key is processed securely and never stored.</p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="apiKey" className="text-sm font-medium text-slate-700 mb-2">Gemini API Key</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <Input
                    id="apiKey"
                    type={showApiKey ? "text" : "password"}
                    placeholder="Enter your Gemini API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="pl-10 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showApiKey ? <EyeOff className="text-primary-blue" size={16} /> : <Eye className="text-primary-blue" size={16} />}
                  </Button>
                </div>
              </div>
              
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Key className="text-yellow-600 mt-0.5" size={16} />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Security Notice</p>
                      <p>Your API key is used only for this demo session and is never stored on our servers. <a href="#" className="underline">Learn more about our security practices.</a></p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="text-sm text-slate-500">
                <p>Don't have a Gemini API key? <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary-blue hover:underline">Get one free from Google AI Studio</a></p>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="ghost" onClick={prevStep} className="text-slate-600 hover:text-slate-800">
                <ArrowLeft className="mr-2 text-primary-blue" size={16} /> Back
              </Button>
              <Button 
                onClick={handleLaunchDemo}
                disabled={createSessionMutation.isPending}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg transition-all duration-300"
              >
                {createSessionMutation.isPending ? (
                  <Loader2 className="mr-2 animate-spin" size={16} />
                ) : (
                  <Rocket className="mr-2 text-primary-blue" size={16} />
                )}
                Launch Demo
              </Button>
            </div>
          </motion.div>
        )}

        {/* Processing State */}
        {currentStep === 4 && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className="animate-spin w-16 h-16 border-4 border-blue-200 border-t-primary-blue rounded-full mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Processing Your Data...</h3>
            <p className="text-slate-600 mb-6">Our AI is analyzing your documents and website to create your personalized chatbot.</p>
            
            <div className="max-w-md mx-auto">
              <Progress value={processingProgress} className="mb-4 bg-blue-100" />
              <div className="text-sm text-slate-500">
                {processingProgress < 100 ? 'Processing...' : 'Almost ready!'}
              </div>
            </div>
          </motion.div>
        )}

        {/* Success State */}
        {currentStep === 5 && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="text-white" size={32} />
            </motion.div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Your ChatBot is Ready!</h3>
            <p className="text-slate-700 mb-6">Your AI assistant has been trained on your documents and website. You can now test it using the chat widget in the bottom-right corner.</p>
            <Button 
              onClick={() => document.getElementById('chat-widget')?.click()}
              className="bg-gradient-to-r from-primary-blue to-bright-blue text-blue-600 hover:shadow-lg transition-all duration-300"
            >
              Start Chatting <ArrowRight className="ml-2 text-primary-blue" size={16} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
