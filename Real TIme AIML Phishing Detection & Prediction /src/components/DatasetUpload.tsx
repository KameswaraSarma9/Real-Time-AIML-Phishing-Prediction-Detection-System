import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Upload, FileSpreadsheet, Database, Download, CheckCircle, Loader2 } from 'lucide-react';
import { Dataset } from '../App';

interface DatasetUploadProps {
  uploadedDataset: Dataset | null;
  onDatasetUpload: (dataset: Dataset) => void;
}

const sampleDatasets = [
  // General ML Datasets
  {
    id: 'iris',
    name: 'Iris Classification',
    description: 'Classic flower species classification with 4 features',
    size: 150,
    features: 4,
    targetColumn: 'species',
    category: 'general',
  },
  {
    id: 'wine',
    name: 'Wine Quality',
    description: 'Wine quality prediction based on chemical properties',
    size: 1599,
    features: 11,
    targetColumn: 'quality',
    category: 'general',
  },
  {
    id: 'titanic',
    name: 'Titanic Survival',
    description: 'Passenger survival prediction based on demographics',
    size: 891,
    features: 7,
    targetColumn: 'survived',
    category: 'general',
  },
  // Phishing Detection Datasets
  {
    id: 'phishing_urls',
    name: 'Phishing URLs Dataset',
    description: 'Collection of legitimate and phishing URLs with domain features',
    size: 11055,
    features: 30,
    targetColumn: 'phishing',
    category: 'phishing',
  },
  {
    id: 'email_phishing',
    name: 'Email Phishing Corpus',
    description: 'Labeled emails including phishing attempts and legitimate messages',
    size: 5574,
    features: 15,
    targetColumn: 'is_phishing',
    category: 'phishing',
  },
  {
    id: 'sms_spam_detection',
    name: 'SMS Spam & Phishing',
    description: 'Text messages labeled for spam, phishing, and legitimate content',
    size: 8623,
    features: 8,
    targetColumn: 'threat_type',
    category: 'phishing',
  },
  {
    id: 'cybersecurity_incidents',
    name: 'Cybersecurity Incidents',
    description: 'Real-world security incidents and threat intelligence data',
    size: 3247,
    features: 25,
    targetColumn: 'threat_level',
    category: 'phishing',
  },
];

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

const uploadAreaVariants = {
  idle: {
    borderColor: "rgba(209, 213, 219, 1)",
    backgroundColor: "transparent",
    scale: 1
  },
  hover: {
    borderColor: "rgba(59, 130, 246, 0.8)",
    backgroundColor: "rgba(59, 130, 246, 0.05)",
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  dragOver: {
    borderColor: "rgba(59, 130, 246, 1)",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    scale: 1.05,
    transition: { duration: 0.2 }
  }
};

export function DatasetUpload({ uploadedDataset, onDatasetUpload }: DatasetUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedSample, setSelectedSample] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate file processing with progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + Math.random() * 15;
        });
      }, 100);

      await new Promise(resolve => setTimeout(resolve, 1500));
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Create mock dataset (in real app, would parse CSV)
      const mockDataset: Dataset = {
        id: `uploaded_${Date.now()}`,
        name: file.name.replace('.csv', ''),
        size: Math.floor(Math.random() * 1000) + 100,
        features: Math.floor(Math.random() * 10) + 3,
        uploadedAt: new Date().toISOString(),
        data: [], // Would contain parsed CSV data
      };

      setTimeout(() => {
        onDatasetUpload(mockDataset);
      }, 500);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 800);
    }
  };

  const loadSampleDataset = async (sampleId: string) => {
    setSelectedSample(sampleId);
    setIsUploading(true);
    
    try {
      // Simulate loading sample data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const sample = sampleDatasets.find(s => s.id === sampleId);
      if (!sample) return;

      // Generate mock data based on sample
      const mockData = Array.from({ length: sample.size }, (_, i) => ({
        id: i,
        // Add mock features based on dataset type
        ...Object.fromEntries(
          Array.from({ length: sample.features }, (_, j) => [
            `feature_${j + 1}`,
            Math.random() * 10
          ])
        ),
        target: Math.floor(Math.random() * 3),
      }));

      const dataset: Dataset = {
        id: sample.id,
        name: sample.name,
        size: sample.size,
        features: sample.features,
        uploadedAt: new Date().toISOString(),
        data: mockData,
      };

      onDatasetUpload(dataset);
    } catch (error) {
      console.error('Failed to load sample dataset:', error);
    } finally {
      setIsUploading(false);
      setSelectedSample(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Upload className="w-5 h-5" />
                </motion.div>
                Upload Your Dataset
              </CardTitle>
              <CardDescription>
                Upload a CSV file with your data for model training and prediction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div
                variants={uploadAreaVariants}
                initial="idle"
                whileHover="hover"
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                </motion.div>
                <p className="text-sm text-muted-foreground mb-2">
                  Click to upload CSV file
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports CSV files up to 10MB
                </p>
              </motion.div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full"
                >
                  <AnimatePresence mode="wait">
                    {isUploading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </motion.div>
                    ) : (
                      <motion.span
                        key="choose"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        Choose File
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
              
              {/* Upload Progress */}
              <AnimatePresence>
                {isUploading && uploadProgress > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="bg-blue-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Database className="w-5 h-5" />
                </motion.div>
                Sample Datasets
              </CardTitle>
              <CardDescription>
                Use pre-loaded datasets to quickly test models
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {sampleDatasets.map((sample, index) => (
                  <motion.div
                    key={sample.id}
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-3 border rounded-lg cursor-pointer transition-all relative overflow-hidden ${
                      selectedSample === sample.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => loadSampleDataset(sample.id)}
                  >
                    {/* Loading overlay */}
                    <AnimatePresence>
                      {selectedSample === sample.id && isUploading && (
                        <motion.div
                          className="absolute inset-0 bg-blue-100 bg-opacity-80 flex items-center justify-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex items-center justify-between mb-1">
                      <motion.h4 
                        className="font-medium text-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {sample.name}
                      </motion.h4>
                      <motion.div 
                        className="flex gap-1"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 0.1 }}
                      >
                        <Badge variant="outline" className="text-xs">
                          {sample.size} rows
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {sample.features} features
                        </Badge>
                      </motion.div>
                    </div>
                    <motion.p 
                      className="text-xs text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      {sample.description}
                    </motion.p>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Dataset Info */}
      <AnimatePresence>
        {uploadedDataset && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 relative overflow-hidden">
              {/* Success animation background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-100 via-transparent to-emerald-100 opacity-30"
                animate={{
                  x: [-100, 100, -100],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
                  >
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </motion.div>
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Dataset Loaded: {uploadedDataset.name}
                  </motion.span>
                </CardTitle>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <CardDescription className="text-green-700">
                    Dataset is ready for model training and prediction
                  </CardDescription>
                </motion.div>
              </CardHeader>
              <CardContent className="relative z-10">
                <motion.div 
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div 
                    variants={itemVariants}
                    className="text-center p-3 bg-white rounded-lg"
                  >
                    <motion.p 
                      className="text-2xl font-bold text-green-800"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, delay: 0.5 }}
                    >
                      {uploadedDataset.size.toLocaleString()}
                    </motion.p>
                    <p className="text-sm text-green-600">Rows</p>
                  </motion.div>
                  <motion.div 
                    variants={itemVariants}
                    className="text-center p-3 bg-white rounded-lg"
                  >
                    <motion.p 
                      className="text-2xl font-bold text-green-800"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, delay: 0.6 }}
                    >
                      {uploadedDataset.features}
                    </motion.p>
                    <p className="text-sm text-green-600">Features</p>
                  </motion.div>
                  <motion.div 
                    variants={itemVariants}
                    className="text-center p-3 bg-white rounded-lg"
                  >
                    <motion.p 
                      className="text-2xl font-bold text-green-800"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, delay: 0.7 }}
                    >
                      {new Date(uploadedDataset.uploadedAt).toLocaleDateString()}
                    </motion.p>
                    <p className="text-sm text-green-600">Uploaded</p>
                  </motion.div>
                  <motion.div 
                    variants={itemVariants}
                    className="text-center p-3 bg-white rounded-lg"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button size="sm" variant="outline" className="w-full">
                        <Download className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}