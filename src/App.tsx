import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { 
  Brain, 
  Database, 
  TrendingUp, 
  Shield, 
  Link, 
  CheckCircle, 
  Sparkles,
  BarChart3,
  GitCompare
} from 'lucide-react';
import { ModelSelection } from './components/ModelSelection';
import { DatasetUpload } from './components/DatasetUpload';
import { PredictionResults } from './components/PredictionResults';
import { MetricsVisualization } from './components/MetricsVisualization';
import { ModelComparison } from './components/ModelComparison';
import { PhishingDetection } from './components/PhishingDetection';
import { FraudPrevention } from './components/FraudPrevention';

// Type definitions
export interface Dataset {
  id: string;
  name: string;
  size: number;
  features: number;
  uploadedAt: string;
  data: any[];
}

export interface MLModel {
  id: string;
  name: string;
  type: string;
  description: string;
  isAvailable: boolean;
  category?: 'general' | 'phishing' | 'fraud';
}

export interface PredictionResult {
  id: string;
  modelId: string;
  datasetId: string;
  predictions: Array<{
    id: number;
    predicted: number;
    actual: number;
  }>;
  confidence: number[];
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    confusionMatrix: number[][];
  };
  timestamp: string;
}

export interface PhishingResult {
  id: string;
  type: 'url' | 'email' | 'sms';
  content: string;
  prediction: 'safe' | 'suspicious' | 'malicious';
  confidence: number;
  reasons: string[];
  timestamp: string;
  details?: {
    domain?: string;
    redirectChain?: string[];
    emailHeaders?: Record<string, string>;
    links?: string[];
    attachments?: string[];
  };
}

export interface FraudResult {
  id: string;
  type: 'url' | 'email' | 'sms' | 'transaction' | 'account' | 'payment';
  content: string;
  prediction: 'safe' | 'suspicious' | 'malicious';
  confidence: number;
  reasons: string[];
  timestamp: string;
  details?: {
    transactionId?: string;
    accountId?: string;
    paymentId?: string;
  };
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const cardVariants = {
  idle: { scale: 1, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  hover: { 
    scale: 1.02, 
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    transition: { duration: 0.2 }
  }
};

const statusCardVariants = {
  inactive: { 
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
    scale: 1
  },
  active: { 
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
    scale: 1.02,
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const tabContentVariants = {
  hidden: { 
    opacity: 0, 
    x: -20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    x: 20,
    scale: 0.95,
    transition: {
      duration: 0.3
    }
  }
};

const progressVariants = {
  hidden: { width: 0 },
  visible: { 
    width: "100%",
    transition: { 
      duration: 2,
      ease: "easeInOut"
    }
  }
};

export default function App() {
  const [selectedModel, setSelectedModel] = useState<MLModel | null>(null);
  const [uploadedDataset, setUploadedDataset] = useState<Dataset | null>(null);
  const [predictionResults, setPredictionResults] = useState<PredictionResult[]>([]);
  const [phishingResults, setPhishingResults] = useState<PhishingResult[]>([]);
  const [fraudResults, setFraudResults] = useState<FraudResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('setup');
  const [celebrateSuccess, setCelebrateSuccess] = useState(false);
  const [fraudPreventionEnabled, setFraudPreventionEnabled] = useState(true);

  const handleDatasetUpload = (dataset: Dataset) => {
    setUploadedDataset(dataset);
    // Auto-switch to predictions tab when both model and dataset are ready
    if (selectedModel) {
      setTimeout(() => setActiveTab('predictions'), 800);
    }
  };

  const handleModelSelect = (model: MLModel) => {
    setSelectedModel(model);
    // Auto-switch to predictions tab when both model and dataset are ready
    if (uploadedDataset) {
      setTimeout(() => setActiveTab('predictions'), 800);
    }
  };

  const handlePredictionComplete = (results: PredictionResult[]) => {
    setPredictionResults(results);
    setCelebrateSuccess(true);
    setTimeout(() => setCelebrateSuccess(false), 3000);
    // Auto-switch to metrics tab after prediction
    setTimeout(() => setActiveTab('metrics'), 1200);
  };

  const handlePhishingComplete = (result: PhishingResult) => {
    setPhishingResults(prev => [result, ...prev]);
    setCelebrateSuccess(true);
    setTimeout(() => setCelebrateSuccess(false), 3000);
  };

  const handleFraudComplete = (result: FraudResult) => {
    setFraudResults(prev => [result, ...prev]);
    setCelebrateSuccess(true);
    setTimeout(() => setCelebrateSuccess(false), 3000);
  };

  const isSetupComplete = selectedModel && uploadedDataset;
  const hasResults = predictionResults.length > 0;
  const hasPhishingResults = phishingResults.length > 0;
  const hasFraudResults = fraudResults.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 2 }}
      >
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-200 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-200 rounded-full blur-xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </motion.div>

      {/* Success Celebration */}
      <AnimatePresence>
        {celebrateSuccess && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-6xl"
              initial={{ scale: 0 }}
              animate={{ 
                scale: [0, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 0.6 }}
            >
              🎉
            </motion.div>
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    y: [-50, 0, 50],
                  }}
                  transition={{
                    duration: 2,
                    delay: Math.random() * 0.5,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto p-6 max-w-7xl relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1 
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <motion.span
              className="absolute -top-2 -right-8 text-2xl"
              animate={{ 
                rotate: [0, 15, -15, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="text-yellow-500" />
            </motion.span>
            ML Security & Phishing Detection Platform
          </motion.h1>
          <motion.p 
            className="text-xl text-muted-foreground mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Advanced machine learning models for cybersecurity threat detection and prevention
          </motion.p>
          
          {/* Status Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <motion.div
                variants={statusCardVariants}
                initial="inactive"
                animate={selectedModel ? "active" : "inactive"}
                whileHover="hover"
              >
                <Card className="transition-all duration-300">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={selectedModel ? { 
                          scale: [1, 1.2, 1],
                          rotate: [0, 360, 0]
                        } : {}}
                        transition={{ duration: 0.6 }}
                      >
                        <Brain className={`w-5 h-5 transition-colors duration-300 ${selectedModel ? 'text-green-600' : 'text-gray-400'}`} />
                      </motion.div>
                      <div className="text-left">
                        <p className="font-medium text-sm">
                          {selectedModel ? selectedModel.name : 'No Model Selected'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {selectedModel ? selectedModel.type : 'Choose a model to begin'}
                        </p>
                      </div>
                      <AnimatePresence>
                        {selectedModel && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.div
                variants={statusCardVariants}
                initial="inactive"
                animate={uploadedDataset ? "active" : "inactive"}
                whileHover="hover"
              >
                <Card className="transition-all duration-300">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={uploadedDataset ? { 
                          scale: [1, 1.2, 1],
                          rotate: [0, 360, 0]
                        } : {}}
                        transition={{ duration: 0.6 }}
                      >
                        <Database className={`w-5 h-5 transition-colors duration-300 ${uploadedDataset ? 'text-green-600' : 'text-gray-400'}`} />
                      </motion.div>
                      <div className="text-left">
                        <p className="font-medium text-sm">
                          {uploadedDataset ? uploadedDataset.name : 'No Dataset Loaded'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {uploadedDataset 
                            ? `${uploadedDataset.size} rows, ${uploadedDataset.features} features`
                            : 'Upload or select a dataset'
                          }
                        </p>
                      </div>
                      <AnimatePresence>
                        {uploadedDataset && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.div
                variants={statusCardVariants}
                initial="inactive"
                animate={hasResults ? "active" : "inactive"}
                whileHover="hover"
              >
                <Card className="transition-all duration-300">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={hasResults ? { 
                          scale: [1, 1.2, 1],
                          rotate: [0, 360, 0]
                        } : {}}
                        transition={{ duration: 0.6 }}
                      >
                        <TrendingUp className={`w-5 h-5 transition-colors duration-300 ${hasResults ? 'text-green-600' : 'text-gray-400'}`} />
                      </motion.div>
                      <div className="text-left">
                        <p className="font-medium text-sm">
                          {hasResults ? `${predictionResults.length} Predictions` : 'No Predictions'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {hasResults 
                            ? `Latest: ${(predictionResults[predictionResults.length - 1].metrics.accuracy * 100).toFixed(1)}% accuracy`
                            : 'Run predictions to see results'
                          }
                        </p>
                      </div>
                      <AnimatePresence>
                        {hasResults && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.div
                variants={statusCardVariants}
                initial="inactive"
                animate={hasPhishingResults ? "active" : "inactive"}
                whileHover="hover"
              >
                <Card className="transition-all duration-300">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={hasPhishingResults ? { 
                          scale: [1, 1.2, 1],
                          rotate: [0, 360, 0]
                        } : {}}
                        transition={{ duration: 0.6 }}
                      >
                        <Shield className={`w-5 h-5 transition-colors duration-300 ${hasPhishingResults ? 'text-green-600' : 'text-gray-400'}`} />
                      </motion.div>
                      <div className="text-left">
                        <p className="font-medium text-sm">
                          {hasPhishingResults ? `${phishingResults.length} Threats Analyzed` : 'No Threats Analyzed'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {hasPhishingResults 
                            ? `Latest: ${phishingResults[0].prediction} (${(phishingResults[0].confidence * 100).toFixed(1)}%)`
                            : 'Analyze URLs, emails, or SMS'
                          }
                        </p>
                      </div>
                      <AnimatePresence>
                        {hasPhishingResults && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.div
                variants={statusCardVariants}
                initial="inactive"
                animate={hasFraudResults ? "active" : "inactive"}
                whileHover="hover"
              >
                <Card className="transition-all duration-300">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={hasFraudResults ? { 
                          scale: [1, 1.2, 1],
                          rotate: [0, 360, 0]
                        } : {}}
                        transition={{ duration: 0.6 }}
                      >
                        <Link className={`w-5 h-5 transition-colors duration-300 ${hasFraudResults ? 'text-green-600' : 'text-gray-400'}`} />
                      </motion.div>
                      <div className="text-left">
                        <p className="font-medium text-sm">
                          {hasFraudResults ? `${fraudResults.length} Fraud Detected` : 'No Fraud Detected'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {hasFraudResults 
                            ? `Latest: ${fraudResults[0].prediction} (${(fraudResults[0].confidence * 100).toFixed(1)}%)`
                            : 'Detect fraud in transactions, accounts, or payments'
                          }
                        </p>
                      </div>
                      <AnimatePresence>
                        {hasFraudResults && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Progress Bar */}
          <motion.div 
            className="w-full bg-gray-200 rounded-full h-2 mb-6 overflow-hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              initial={{ width: "0%" }}
              animate={{ 
                width: selectedModel && uploadedDataset && hasResults && hasPhishingResults && hasFraudResults ? "100%" :
                       selectedModel && uploadedDataset && (hasResults || hasPhishingResults || hasFraudResults) ? "75%" :
                       selectedModel && uploadedDataset ? "50%" :
                       selectedModel || uploadedDataset ? "25%" : "0%"
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.4 }}
            >
              <TabsList className="grid w-full grid-cols-6 mb-6">
                <TabsTrigger value="setup" className="flex items-center gap-2 transition-all duration-200">
                  <Brain className="w-4 h-4" />
                  Setup
                </TabsTrigger>
                <TabsTrigger value="phishing" className="flex items-center gap-2 transition-all duration-200">
                  <Shield className="w-4 h-4" />
                  Phishing Detection
                </TabsTrigger>
                <TabsTrigger value="fraud" className="flex items-center gap-2 transition-all duration-200">
                  <Link className="w-4 h-4" />
                  Fraud Prevention
                </TabsTrigger>
                <TabsTrigger 
                  value="predictions" 
                  disabled={!isSetupComplete}
                  className="flex items-center gap-2 transition-all duration-200"
                >
                  <Database className="w-4 h-4" />
                  Predictions
                  <AnimatePresence>
                    {!isSetupComplete && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge variant="secondary" className="ml-1 text-xs">Locked</Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </TabsTrigger>
                <TabsTrigger 
                  value="metrics" 
                  disabled={!hasResults}
                  className="flex items-center gap-2 transition-all duration-200"
                >
                  <BarChart3 className="w-4 h-4" />
                  Metrics
                  <AnimatePresence>
                    {!hasResults && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge variant="secondary" className="ml-1 text-xs">Locked</Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </TabsTrigger>
                <TabsTrigger 
                  value="comparison" 
                  disabled={!hasResults}
                  className="flex items-center gap-2 transition-all duration-200"
                >
                  <GitCompare className="w-4 h-4" />
                  Compare
                  <AnimatePresence>
                    {!hasResults && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge variant="secondary" className="ml-1 text-xs">Locked</Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </TabsTrigger>
              </TabsList>
            </motion.div>

            <TabsContent value="setup" className="space-y-6">
              <motion.div
                key="setup"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <motion.div
                  variants={cardVariants}
                  initial="idle"
                  whileHover="hover"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Step 1: Choose Model</CardTitle>
                      <CardDescription>
                        Select a machine learning model for your predictions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ModelSelection
                        selectedModel={selectedModel}
                        onModelSelect={handleModelSelect}
                      />
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  variants={cardVariants}
                  initial="idle"
                  whileHover="hover"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Step 2: Upload Dataset</CardTitle>
                      <CardDescription>
                        Upload your data or use a sample dataset
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DatasetUpload
                        uploadedDataset={uploadedDataset}
                        onDatasetUpload={handleDatasetUpload}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>

            <TabsContent value="phishing" className="space-y-6">
              <motion.div
                key="phishing"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
              >
                <PhishingDetection
                  phishingResults={phishingResults}
                  onPhishingComplete={handlePhishingComplete}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="predictions" className="space-y-6">
              <motion.div
                key="predictions"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
              >
                <PredictionResults
                  selectedModel={selectedModel}
                  uploadedDataset={uploadedDataset}
                  predictionResults={predictionResults}
                  onPredictionComplete={handlePredictionComplete}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-6">
              <motion.div
                key="metrics"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
              >
                <MetricsVisualization predictionResults={predictionResults} />
              </motion.div>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-6">
              <motion.div
                key="comparison"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
              >
                <ModelComparison predictionResults={predictionResults} />
              </motion.div>
            </TabsContent>

            <TabsContent value="fraud" className="space-y-6">
              <motion.div
                key="fraud"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
              >
                <FraudPrevention
                  isEnabled={fraudPreventionEnabled}
                  onToggle={setFraudPreventionEnabled}
                  onFraudComplete={handleFraudComplete}
                />
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}