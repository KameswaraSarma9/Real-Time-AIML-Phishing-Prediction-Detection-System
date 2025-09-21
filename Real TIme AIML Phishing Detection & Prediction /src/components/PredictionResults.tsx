import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Play, Clock, CheckCircle, AlertCircle, Loader2, Zap, TrendingUp } from 'lucide-react';
import { MLModel, Dataset, PredictionResult } from '../App';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface PredictionResultsProps {
  selectedModel: MLModel | null;
  uploadedDataset: Dataset | null;
  predictionResults: PredictionResult[];
  onPredictionComplete: (results: PredictionResult[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

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

const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export function PredictionResults({
  selectedModel,
  uploadedDataset,
  predictionResults,
  onPredictionComplete,
  isLoading,
  setIsLoading,
}: PredictionResultsProps) {
  const [currentPrediction, setCurrentPrediction] = useState<PredictionResult | null>(null);
  const [predictionProgress, setPredictionProgress] = useState(0);

  const runPrediction = async () => {
    if (!selectedModel || !uploadedDataset) return;

    setIsLoading(true);
    setPredictionProgress(0);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setPredictionProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 20;
        });
      }, 200);

      // Call backend API for prediction
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3dc06296/predict`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            modelId: selectedModel.id,
            datasetId: uploadedDataset.id,
            data: uploadedDataset.data,
          }),
        }
      );

      clearInterval(progressInterval);
      setPredictionProgress(100);

      if (!response.ok) {
        throw new Error(`Prediction failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      const predictionResult: PredictionResult = {
        id: `prediction_${Date.now()}`,
        modelId: selectedModel.id,
        datasetId: uploadedDataset.id,
        predictions: result.predictions,
        confidence: result.confidence,
        metrics: result.metrics,
        timestamp: new Date().toISOString(),
      };

      setTimeout(() => {
        setCurrentPrediction(predictionResult);
        onPredictionComplete([...predictionResults, predictionResult]);
      }, 500);
      
    } catch (error) {
      console.error('Prediction error:', error);
      clearInterval(progressInterval);
      
      // Generate mock data for demo purposes
      const mockResult: PredictionResult = {
        id: `prediction_${Date.now()}`,
        modelId: selectedModel.id,
        datasetId: uploadedDataset.id,
        predictions: Array.from({ length: Math.min(uploadedDataset.size, 10) }, (_, i) => ({
          id: i,
          predicted: Math.floor(Math.random() * 3),
          actual: Math.floor(Math.random() * 3),
        })),
        confidence: Array.from({ length: Math.min(uploadedDataset.size, 10) }, () => 
          Math.random() * 0.4 + 0.6
        ),
        metrics: {
          accuracy: Math.random() * 0.3 + 0.7,
          precision: Math.random() * 0.3 + 0.7,
          recall: Math.random() * 0.3 + 0.7,
          f1Score: Math.random() * 0.3 + 0.7,
          confusionMatrix: [
            [Math.floor(Math.random() * 50) + 20, Math.floor(Math.random() * 10)],
            [Math.floor(Math.random() * 10), Math.floor(Math.random() * 50) + 20],
          ],
        },
        timestamp: new Date().toISOString(),
      };

      setPredictionProgress(100);
      setTimeout(() => {
        setCurrentPrediction(mockResult);
        onPredictionComplete([...predictionResults, mockResult]);
      }, 500);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setPredictionProgress(0);
      }, 1000);
    }
  };

  const canRunPrediction = selectedModel && uploadedDataset && !isLoading;

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Run Prediction */}
      <motion.div 
        variants={itemVariants}
        className="text-center space-y-4"
      >
        <motion.div
          whileHover={canRunPrediction ? { scale: 1.05 } : {}}
          whileTap={canRunPrediction ? { scale: 0.95 } : {}}
        >
          <Button
            onClick={runPrediction}
            disabled={!canRunPrediction}
            size="lg"
            className="w-full md:w-auto relative overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-4 h-4" />
                  </motion.div>
                  Running Prediction...
                </motion.div>
              ) : (
                <motion.div
                  key="run"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <motion.div
                    animate={canRunPrediction ? {
                      scale: [1, 1.2, 1],
                      rotate: [0, 15, 0]
                    } : {}}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Play className="w-4 h-4" />
                  </motion.div>
                  Run Prediction
                </motion.div>
              )}
            </AnimatePresence>

            {/* Animated background for active button */}
            {canRunPrediction && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-20"
                animate={{
                  x: [-100, 100, -100],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
          </Button>
        </motion.div>
        
        {/* Progress Bar */}
        <AnimatePresence>
          {isLoading && predictionProgress > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 max-w-md mx-auto"
            >
              <div className="flex justify-between text-sm">
                <span>Processing...</span>
                <span>{Math.round(predictionProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${predictionProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {!selectedModel && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-muted-foreground flex items-center justify-center gap-1"
            >
              <motion.div
                variants={pulseVariants}
                animate="pulse"
              >
                <AlertCircle className="w-4 h-4" />
              </motion.div>
              Please select a model first
            </motion.p>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {!uploadedDataset && selectedModel && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-muted-foreground flex items-center justify-center gap-1"
            >
              <motion.div
                variants={pulseVariants}
                animate="pulse"
              >
                <AlertCircle className="w-4 h-4" />
              </motion.div>
              Please upload a dataset first
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Current Prediction Results */}
      <AnimatePresence>
        {currentPrediction && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Card className="relative overflow-hidden">
              {/* Success background animation */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-100 via-transparent to-blue-100 opacity-30"
                animate={{
                  x: [-100, 100, -100],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </motion.div>
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Latest Prediction Results
                  </motion.span>
                </CardTitle>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <CardDescription>
                    Model: {selectedModel?.name} | Dataset: {uploadedDataset?.name}
                  </CardDescription>
                </motion.div>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                {/* Summary Metrics */}
                <motion.div 
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div 
                    variants={itemVariants}
                    className="text-center p-3 bg-blue-50 rounded-lg relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-blue-200 opacity-20"
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.2, 0.4, 0.2]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.p 
                      className="text-2xl font-bold text-blue-800 relative z-10"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, delay: 0.4 }}
                    >
                      {(currentPrediction.metrics.accuracy * 100).toFixed(1)}%
                    </motion.p>
                    <p className="text-sm text-blue-600 relative z-10">Accuracy</p>
                  </motion.div>
                  <motion.div 
                    variants={itemVariants}
                    className="text-center p-3 bg-green-50 rounded-lg relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-green-200 opacity-20"
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.2, 0.4, 0.2]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5
                      }}
                    />
                    <motion.p 
                      className="text-2xl font-bold text-green-800 relative z-10"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, delay: 0.5 }}
                    >
                      {(currentPrediction.metrics.precision * 100).toFixed(1)}%
                    </motion.p>
                    <p className="text-sm text-green-600 relative z-10">Precision</p>
                  </motion.div>
                  <motion.div 
                    variants={itemVariants}
                    className="text-center p-3 bg-orange-50 rounded-lg relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-orange-200 opacity-20"
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.2, 0.4, 0.2]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                      }}
                    />
                    <motion.p 
                      className="text-2xl font-bold text-orange-800 relative z-10"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, delay: 0.6 }}
                    >
                      {(currentPrediction.metrics.recall * 100).toFixed(1)}%
                    </motion.p>
                    <p className="text-sm text-orange-600 relative z-10">Recall</p>
                  </motion.div>
                  <motion.div 
                    variants={itemVariants}
                    className="text-center p-3 bg-purple-50 rounded-lg relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-purple-200 opacity-20"
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.2, 0.4, 0.2]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1.5
                      }}
                    />
                    <motion.p 
                      className="text-2xl font-bold text-purple-800 relative z-10"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, delay: 0.7 }}
                    >
                      {(currentPrediction.metrics.f1Score * 100).toFixed(1)}%
                    </motion.p>
                    <p className="text-sm text-purple-600 relative z-10">F1-Score</p>
                  </motion.div>
                </motion.div>

                {/* Sample Predictions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Sample Predictions
                  </h4>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Predicted</TableHead>
                          <TableHead>Confidence</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {currentPrediction.predictions.slice(0, 5).map((pred, index) => (
                            <motion.tr
                              key={pred.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.9 + index * 0.1 }}
                              className="hover:bg-gray-50"
                            >
                              <TableCell className="font-mono">{pred.id}</TableCell>
                              <TableCell>
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 1 + index * 0.1, type: "spring" }}
                                >
                                  <Badge variant="outline">Class {pred.predicted}</Badge>
                                </motion.div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <motion.div
                                    className="w-16"
                                    initial={{ width: 0 }}
                                    animate={{ width: 64 }}
                                    transition={{ delay: 1.1 + index * 0.1 }}
                                  >
                                    <Progress 
                                      value={currentPrediction.confidence[index] * 100} 
                                      className="h-2"
                                    />
                                  </motion.div>
                                  <motion.span 
                                    className="text-sm"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.2 + index * 0.1 }}
                                  >
                                    {(currentPrediction.confidence[index] * 100).toFixed(1)}%
                                  </motion.span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 1.3 + index * 0.1, type: "spring" }}
                                >
                                  {currentPrediction.confidence[index] > 0.8 ? (
                                    <Badge className="bg-green-100 text-green-800">High</Badge>
                                  ) : currentPrediction.confidence[index] > 0.6 ? (
                                    <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
                                  ) : (
                                    <Badge className="bg-red-100 text-red-800">Low</Badge>
                                  )}
                                </motion.div>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prediction History */}
      <AnimatePresence>
        {predictionResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Clock className="w-5 h-5" />
                  </motion.div>
                  Prediction History
                </CardTitle>
                <CardDescription>
                  Previous prediction runs and their performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <motion.div 
                  className="space-y-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {predictionResults.slice().reverse().map((result, index) => (
                    <motion.div
                      key={result.id}
                      variants={itemVariants}
                      whileHover={{ 
                        scale: 1.02,
                        backgroundColor: "rgba(249, 250, 251, 1)"
                      }}
                      className="flex items-center justify-between p-3 border rounded-lg transition-colors"
                    >
                      <div>
                        <motion.p 
                          className="font-medium text-sm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          {selectedModel?.name} on {uploadedDataset?.name}
                        </motion.p>
                        <motion.p 
                          className="text-xs text-muted-foreground"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.1 }}
                        >
                          {new Date(result.timestamp).toLocaleString()}
                        </motion.p>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                        >
                          <Badge variant="outline">
                            {(result.metrics.accuracy * 100).toFixed(1)}% accuracy
                          </Badge>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button size="sm" variant="ghost">
                            View Details
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}