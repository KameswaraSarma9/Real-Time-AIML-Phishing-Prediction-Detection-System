import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, Target, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { PredictionResult } from '../App';

interface MetricsVisualizationProps {
  predictionResults: PredictionResult[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function MetricsVisualization({ predictionResults }: MetricsVisualizationProps) {
  if (predictionResults.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Run predictions to see performance metrics</p>
      </div>
    );
  }

  const latestResult = predictionResults[predictionResults.length - 1];

  // Prepare data for charts
  const metricsData = [
    { name: 'Accuracy', value: latestResult.metrics.accuracy * 100, color: '#3B82F6' },
    { name: 'Precision', value: latestResult.metrics.precision * 100, color: '#10B981' },
    { name: 'Recall', value: latestResult.metrics.recall * 100, color: '#F59E0B' },
    { name: 'F1-Score', value: latestResult.metrics.f1Score * 100, color: '#8B5CF6' },
  ];

  const performanceOverTime = predictionResults.map((result, index) => ({
    run: `Run ${index + 1}`,
    accuracy: result.metrics.accuracy * 100,
    precision: result.metrics.precision * 100,
    recall: result.metrics.recall * 100,
    f1Score: result.metrics.f1Score * 100,
  }));

  const confusionMatrixData = latestResult.metrics.confusionMatrix.flatMap((row, i) =>
    row.map((value, j) => ({
      predicted: `Class ${j}`,
      actual: `Class ${i}`,
      value,
    }))
  );

  const confidenceDistribution = latestResult.confidence.map((conf, index) => ({
    prediction: index + 1,
    confidence: conf * 100,
  }));

  return (
    <div className="space-y-6">
      {/* Current Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5" />
              Performance Metrics
            </CardTitle>
            <CardDescription>Latest model performance scores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={metricsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Score']} />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChartIcon className="w-5 h-5" />
              Metrics Distribution
            </CardTitle>
            <CardDescription>Relative performance comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={metricsData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  labelLine={false}
                >
                  {metricsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Score']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Over Time */}
      {predictionResults.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Over Time
            </CardTitle>
            <CardDescription>
              Track how model performance changes across prediction runs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="run" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Score']} />
                <Legend />
                <Line type="monotone" dataKey="accuracy" stroke="#3B82F6" strokeWidth={2} name="Accuracy" />
                <Line type="monotone" dataKey="precision" stroke="#10B981" strokeWidth={2} name="Precision" />
                <Line type="monotone" dataKey="recall" stroke="#F59E0B" strokeWidth={2} name="Recall" />
                <Line type="monotone" dataKey="f1Score" stroke="#8B5CF6" strokeWidth={2} name="F1-Score" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Confidence Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Prediction Confidence</CardTitle>
            <CardDescription>
              Distribution of confidence scores for predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={confidenceDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="prediction" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Confidence']} />
                <Bar dataKey="confidence" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Confusion Matrix</CardTitle>
            <CardDescription>
              Model prediction accuracy breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
              {latestResult.metrics.confusionMatrix.map((row, i) =>
                row.map((value, j) => (
                  <div
                    key={`${i}-${j}`}
                    className={`p-4 text-center rounded-lg border-2 ${
                      i === j 
                        ? 'bg-green-100 border-green-300 text-green-800' 
                        : 'bg-red-100 border-red-300 text-red-800'
                    }`}
                  >
                    <div className="text-2xl font-bold">{value}</div>
                    <div className="text-xs">
                      Actual {i} → Pred {j}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>Green: Correct predictions | Red: Incorrect predictions</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}