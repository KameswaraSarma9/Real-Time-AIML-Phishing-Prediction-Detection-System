import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Trophy, TrendingUp, GitCompare, Star } from 'lucide-react';
import { PredictionResult } from '../App';

interface ModelComparisonProps {
  predictionResults: PredictionResult[];
}

const modelNames = {
  'random_forest': 'Random Forest',
  'logistic_regression': 'Logistic Regression',
  'svm': 'Support Vector Machine',
  'neural_network': 'Neural Network',
  'transformer_nlp': 'Transformer (NLP)',
};

export function ModelComparison({ predictionResults }: ModelComparisonProps) {
  const [selectedMetric, setSelectedMetric] = useState<'accuracy' | 'precision' | 'recall' | 'f1Score'>('accuracy');

  if (predictionResults.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <GitCompare className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Run predictions with different models to compare performance</p>
      </div>
    );
  }

  // Group results by model
  const modelResults = predictionResults.reduce((acc, result) => {
    const modelName = modelNames[result.modelId] || result.modelId;
    if (!acc[modelName]) {
      acc[modelName] = [];
    }
    acc[modelName].push(result);
    return acc;
  }, {} as Record<string, PredictionResult[]>);

  // Calculate average metrics for each model
  const modelAverages = Object.entries(modelResults).map(([modelName, results]) => {
    const avgMetrics = results.reduce(
      (sum, result) => ({
        accuracy: sum.accuracy + result.metrics.accuracy,
        precision: sum.precision + result.metrics.precision,
        recall: sum.recall + result.metrics.recall,
        f1Score: sum.f1Score + result.metrics.f1Score,
      }),
      { accuracy: 0, precision: 0, recall: 0, f1Score: 0 }
    );

    const count = results.length;
    return {
      model: modelName,
      accuracy: (avgMetrics.accuracy / count) * 100,
      precision: (avgMetrics.precision / count) * 100,
      recall: (avgMetrics.recall / count) * 100,
      f1Score: (avgMetrics.f1Score / count) * 100,
      runs: count,
      bestAccuracy: Math.max(...results.map(r => r.metrics.accuracy)) * 100,
    };
  });

  // Sort by selected metric
  const sortedModels = [...modelAverages].sort((a, b) => b[selectedMetric] - a[selectedMetric]);

  // Prepare radar chart data
  const radarData = modelAverages.map(model => ({
    model: model.model,
    Accuracy: model.accuracy,
    Precision: model.precision,
    Recall: model.recall,
    'F1-Score': model.f1Score,
  }));

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Model Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Model Rankings
          </CardTitle>
          <CardDescription>
            Models ranked by performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="accuracy">Accuracy</TabsTrigger>
              <TabsTrigger value="precision">Precision</TabsTrigger>
              <TabsTrigger value="recall">Recall</TabsTrigger>
              <TabsTrigger value="f1Score">F1-Score</TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-3">
              {sortedModels.map((model, index) => (
                <div
                  key={model.model}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    index === 0 
                      ? 'bg-yellow-50 border-yellow-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-gray-500 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{model.model}</h4>
                      <p className="text-sm text-muted-foreground">
                        {model.runs} prediction run{model.runs !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {index === 0 && (
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">
                      {model[selectedMetric].toFixed(1)}%
                    </p>
                    <Badge variant="outline" className="text-xs">
                      Best: {model.bestAccuracy.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Performance Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Comparison
            </CardTitle>
            <CardDescription>
              Side-by-side comparison of all metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={modelAverages} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="model" type="category" width={100} />
                <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Score']} />
                <Bar dataKey="accuracy" fill="#3B82F6" name="Accuracy" />
                <Bar dataKey="precision" fill="#10B981" name="Precision" />
                <Bar dataKey="recall" fill="#F59E0B" name="Recall" />
                <Bar dataKey="f1Score" fill="#8B5CF6" name="F1-Score" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Radar Chart Comparison</CardTitle>
            <CardDescription>
              Multi-dimensional performance view
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="model" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} />
                {modelAverages.map((model, index) => (
                  <Radar
                    key={model.model}
                    name={model.model}
                    dataKey={model.model}
                    stroke={colors[index % colors.length]}
                    fill={colors[index % colors.length]}
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                ))}
                <Legend />
                <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Score']} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Performance Metrics</CardTitle>
          <CardDescription>
            Complete breakdown of model performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Model</th>
                  <th className="text-center p-3">Runs</th>
                  <th className="text-center p-3">Avg Accuracy</th>
                  <th className="text-center p-3">Avg Precision</th>
                  <th className="text-center p-3">Avg Recall</th>
                  <th className="text-center p-3">Avg F1-Score</th>
                  <th className="text-center p-3">Best Run</th>
                </tr>
              </thead>
              <tbody>
                {sortedModels.map((model, index) => (
                  <tr key={model.model} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-yellow-500' : 'bg-gray-400'
                        }`} />
                        <span className="font-medium">{model.model}</span>
                      </div>
                    </td>
                    <td className="text-center p-3">
                      <Badge variant="outline">{model.runs}</Badge>
                    </td>
                    <td className="text-center p-3">{model.accuracy.toFixed(1)}%</td>
                    <td className="text-center p-3">{model.precision.toFixed(1)}%</td>
                    <td className="text-center p-3">{model.recall.toFixed(1)}%</td>
                    <td className="text-center p-3">{model.f1Score.toFixed(1)}%</td>
                    <td className="text-center p-3">{model.bestAccuracy.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}