import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Brain, GitBranch, Zap, TrendingUp, CheckCircle, Sparkles, Shield } from 'lucide-react';
import { MLModel } from '../App';

interface ModelSelectionProps {
  selectedModel: MLModel | null;
  onModelSelect: (model: MLModel) => void;
}

const availableModels: MLModel[] = [
  // General ML Models
  {
    id: 'random_forest',
    name: 'Random Forest',
    type: 'Tree-based',
    description: 'Ensemble method using multiple decision trees. Great for tabular data with mixed feature types.',
    isAvailable: true,
    category: 'general',
  },
  {
    id: 'logistic_regression',
    name: 'Logistic Regression',
    type: 'Linear',
    description: 'Linear classifier perfect for binary and multiclass classification with interpretable results.',
    isAvailable: true,
    category: 'general',
  },
  {
    id: 'svm',
    name: 'Support Vector Machine',
    type: 'Kernel-based',
    description: 'Powerful classifier that works well with high-dimensional data and small datasets.',
    isAvailable: true,
    category: 'general',
  },
  {
    id: 'neural_network',
    name: 'Neural Network',
    type: 'Deep Learning',
    description: 'Multi-layer perceptron for complex pattern recognition and non-linear relationships.',
    isAvailable: true,
    category: 'general',
  },
  // Phishing Detection Models
  {
    id: 'url_phishing_detector',
    name: 'URL Phishing Detector',
    type: 'Cybersecurity',
    description: 'Specialized model for detecting malicious URLs and phishing websites using domain analysis and content features.',
    isAvailable: true,
    category: 'phishing',
  },
  {
    id: 'email_phishing_classifier',
    name: 'Email Phishing Classifier',
    type: 'NLP-Security',
    description: 'Advanced NLP model trained to identify phishing emails, suspicious headers, and social engineering tactics.',
    isAvailable: true,
    category: 'phishing',
  },
  {
    id: 'sms_threat_detector',
    name: 'SMS Threat Detector',
    type: 'Text-Security',
    description: 'Lightweight model for detecting SMS phishing, smishing attacks, and malicious text messages.',
    isAvailable: true,
    category: 'phishing',
  },
  {
    id: 'multi_modal_phishing',
    name: 'Multi-Modal Phishing AI',
    type: 'Ensemble-Security',
    description: 'Advanced ensemble model combining URL, email, and SMS analysis for comprehensive threat detection.',
    isAvailable: true,
    category: 'phishing',
  },
  {
    id: 'transformer_nlp',
    name: 'Transformer (NLP)',
    type: 'Transformer',
    description: 'Pre-trained BERT-based model for text classification and sentiment analysis.',
    isAvailable: false,
    category: 'general',
  },
];

const getModelIcon = (type: string) => {
  switch (type) {
    case 'Tree-based':
      return <GitBranch className="w-5 h-5" />;
    case 'Linear':
      return <TrendingUp className="w-5 h-5" />;
    case 'Deep Learning':
      return <Brain className="w-5 h-5" />;
    case 'Transformer':
      return <Zap className="w-5 h-5" />;
    case 'Cybersecurity':
    case 'NLP-Security':
    case 'Text-Security':
    case 'Ensemble-Security':
      return <Shield className="w-5 h-5" />;
    default:
      return <Brain className="w-5 h-5" />;
  }
};

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

const modelCardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20, 
    scale: 0.95 
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.02,
    y: -2,
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

const selectedCardVariants = {
  selected: {
    scale: 1.02,
    boxShadow: "0 0 0 2px #3B82F6, 0 10px 25px rgba(59, 130, 246, 0.25)",
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

export function ModelSelection({ selectedModel, onModelSelect }: ModelSelectionProps) {
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {availableModels.map((model, index) => (
          <motion.div
            key={model.id}
            variants={modelCardVariants}
            whileHover="hover"
            whileTap="tap"
            onHoverStart={() => setHoveredModel(model.id)}
            onHoverEnd={() => setHoveredModel(null)}
            animate={selectedModel?.id === model.id ? "selected" : "visible"}
          >
            <Card
              className={`cursor-pointer transition-all relative overflow-hidden ${
                selectedModel?.id === model.id
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              } ${!model.isAvailable ? 'opacity-50' : ''}`}
              onClick={() => model.isAvailable && onModelSelect(model)}
            >
              {/* Animated background glow for selected model */}
              <AnimatePresence>
                {selectedModel?.id === model.id && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 opacity-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </AnimatePresence>

              {/* Sparkle effect for hovered available models */}
              <AnimatePresence>
                {hoveredModel === model.id && model.isAvailable && (
                  <motion.div
                    className="absolute top-2 right-2"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      rotate: [0, 15, -15, 0]
                    }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                  </motion.div>
                )}
              </AnimatePresence>

              <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={selectedModel?.id === model.id ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, 360, 0]
                      } : {}}
                      transition={{ duration: 0.6 }}
                    >
                      {getModelIcon(model.type)}
                    </motion.div>
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                    >
                      <Badge variant={model.isAvailable ? 'default' : 'secondary'}>
                        {model.type}
                      </Badge>
                    </motion.div>
                    <AnimatePresence>
                      {!model.isAvailable && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                        >
                          <Badge variant="outline">Coming Soon</Badge>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                >
                  <CardDescription className="text-sm">
                    {model.description}
                  </CardDescription>
                </motion.div>
                <AnimatePresence>
                  {selectedModel?.id === model.id && (
                    <motion.div 
                      className="mt-3 p-2 bg-blue-100 rounded-md flex items-center gap-2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 500 }}
                      >
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      </motion.div>
                      <p className="text-sm text-blue-800 font-medium">
                        ✓ Selected for predictions
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {selectedModel && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 relative overflow-hidden">
              {/* Animated background gradient */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-100 via-transparent to-purple-100 opacity-30"
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
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {getModelIcon(selectedModel.type)}
                  </motion.div>
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {selectedModel.name} - Ready
                  </motion.span>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                  >
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </motion.div>
                </CardTitle>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <CardDescription className="text-blue-700">
                    Model is selected and ready for predictions. Upload a dataset to begin.
                  </CardDescription>
                </motion.div>
              </CardHeader>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}