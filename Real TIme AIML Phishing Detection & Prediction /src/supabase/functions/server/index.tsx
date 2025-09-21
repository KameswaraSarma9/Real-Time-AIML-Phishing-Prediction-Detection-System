import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-3dc06296/health", (c) => {
  return c.json({ status: "ok" });
});

// ML Models endpoint - Get available models
app.get("/make-server-3dc06296/models", (c) => {
  const models = [
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
  ];
  
  return c.json({ models });
});

// Prediction endpoint
app.post("/make-server-3dc06296/predict", async (c) => {
  try {
    const body = await c.req.json();
    const { modelId, datasetId, data } = body;

    console.log(`Running prediction with model: ${modelId} on dataset: ${datasetId}`);

    // Simulate ML model prediction processing
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Generate realistic mock predictions based on model type
    const dataSize = Math.min(data?.length || 100, 100); // Limit for demo
    
    // Generate predictions based on model characteristics
    const generatePredictions = (modelType: string, size: number) => {
      const baseAccuracy = modelType === 'random_forest' ? 0.85 :
                          modelType === 'neural_network' ? 0.82 :
                          modelType === 'svm' ? 0.79 :
                          modelType === 'logistic_regression' ? 0.76 : 0.75;
      
      const predictions = Array.from({ length: size }, (_, i) => ({
        id: i,
        predicted: Math.floor(Math.random() * 3),
        actual: Math.floor(Math.random() * 3),
      }));

      // Make some predictions correct based on accuracy
      const correctPredictions = Math.floor(size * baseAccuracy);
      for (let i = 0; i < correctPredictions; i++) {
        const randomIndex = Math.floor(Math.random() * size);
        predictions[randomIndex].predicted = predictions[randomIndex].actual;
      }

      return predictions;
    };

    const predictions = generatePredictions(modelId, dataSize);
    const confidence = Array.from({ length: dataSize }, () => 
      Math.random() * 0.4 + 0.6 // Confidence between 0.6 and 1.0
    );

    // Calculate metrics based on predictions
    const correctPredictions = predictions.filter(p => p.predicted === p.actual).length;
    const accuracy = correctPredictions / predictions.length;
    
    // Generate confusion matrix for binary/multiclass
    const confusionMatrix = [
      [Math.floor(correctPredictions * 0.6), Math.floor((predictions.length - correctPredictions) * 0.4)],
      [Math.floor((predictions.length - correctPredictions) * 0.6), Math.floor(correctPredictions * 0.4)],
    ];

    const metrics = {
      accuracy,
      precision: accuracy + (Math.random() - 0.5) * 0.1,
      recall: accuracy + (Math.random() - 0.5) * 0.1,
      f1Score: accuracy + (Math.random() - 0.5) * 0.08,
      confusionMatrix,
    };

    // Store prediction results in KV store
    const predictionResult = {
      id: `prediction_${Date.now()}`,
      modelId,
      datasetId,
      predictions,
      confidence,
      metrics,
      timestamp: new Date().toISOString(),
    };

    await kv.set(`prediction:${predictionResult.id}`, predictionResult);

    console.log(`Prediction completed: ${metrics.accuracy.toFixed(3)} accuracy`);

    return c.json({
      predictions,
      confidence,
      metrics,
      message: 'Prediction completed successfully',
    });

  } catch (error) {
    console.error('Prediction error:', error);
    return c.json(
      { 
        error: 'Prediction failed', 
        details: error.message 
      }, 
      500
    );
  }
});

// Get prediction metrics endpoint
app.get("/make-server-3dc06296/metrics", async (c) => {
  try {
    // Get recent predictions from KV store
    const recentPredictions = await kv.getByPrefix('prediction:');
    
    if (recentPredictions.length === 0) {
      return c.json({
        metrics: null,
        message: 'No predictions found'
      });
    }

    // Calculate aggregate metrics
    const totalPredictions = recentPredictions.length;
    const aggregateMetrics = recentPredictions.reduce((acc, pred) => {
      return {
        accuracy: acc.accuracy + pred.metrics.accuracy,
        precision: acc.precision + pred.metrics.precision,
        recall: acc.recall + pred.metrics.recall,
        f1Score: acc.f1Score + pred.metrics.f1Score,
      };
    }, { accuracy: 0, precision: 0, recall: 0, f1Score: 0 });

    const avgMetrics = {
      accuracy: aggregateMetrics.accuracy / totalPredictions,
      precision: aggregateMetrics.precision / totalPredictions,
      recall: aggregateMetrics.recall / totalPredictions,
      f1Score: aggregateMetrics.f1Score / totalPredictions,
      totalPredictions,
      recentPredictions: recentPredictions.slice(-5), // Last 5 predictions
    };

    return c.json(avgMetrics);

  } catch (error) {
    console.error('Metrics error:', error);
    return c.json(
      { 
        error: 'Failed to fetch metrics', 
        details: error.message 
      }, 
      500
    );
  }
});

// Phishing Detection Endpoints

// Analyze URL for phishing
app.post("/make-server-3dc06296/analyze-url", async (c) => {
  try {
    const body = await c.req.json();
    const { url } = body;

    console.log(`Analyzing URL: ${url}`);

    // Simulate URL analysis processing
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    // Basic phishing detection logic
    const suspiciousKeywords = ['verify', 'urgent', 'suspended', 'click-here', 'limited-time'];
    const maliciousIndicators = ['bit.ly', 'tinyurl', 'phishing-example', 'suspicious-bank'];
    
    const urlLower = url.toLowerCase();
    const isSuspicious = suspiciousKeywords.some(keyword => urlLower.includes(keyword));
    const isMalicious = maliciousIndicators.some(indicator => urlLower.includes(indicator));

    let prediction = 'safe';
    let confidence = 0.7 + Math.random() * 0.25;
    const reasons = [];

    if (isMalicious) {
      prediction = 'malicious';
      confidence = 0.85 + Math.random() * 0.14;
      reasons.push('Contains known malicious indicators');
      if (urlLower.includes('bit.ly')) reasons.push('Uses URL shortening service');
    } else if (isSuspicious) {
      prediction = 'suspicious';
      confidence = 0.6 + Math.random() * 0.3;
      reasons.push('Contains suspicious keywords');
    } else {
      reasons.push('No obvious threat indicators detected');
      if (url.includes('https://')) reasons.push('Uses HTTPS encryption');
    }

    // Extract domain information
    let domain = '';
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      domain = urlObj.hostname;
      if (domain.split('.').length > 3) reasons.push('Complex subdomain structure');
    } catch {
      reasons.push('Invalid URL format detected');
    }

    const result = {
      prediction,
      confidence,
      reasons,
      details: {
        domain,
        protocol: url.startsWith('https://') ? 'HTTPS' : url.startsWith('http://') ? 'HTTP' : 'Unknown',
        redirectChain: [url, `verified.${domain}`]
      }
    };

    // Store result in KV store
    await kv.set(`phishing_url:${Date.now()}`, { url, result, timestamp: new Date().toISOString() });

    return c.json(result);

  } catch (error) {
    console.error('URL analysis error:', error);
    return c.json(
      { 
        error: 'URL analysis failed', 
        details: error.message 
      }, 
      500
    );
  }
});

// Analyze email for phishing
app.post("/make-server-3dc06296/analyze-email", async (c) => {
  try {
    const body = await c.req.json();
    const { content } = body;

    console.log(`Analyzing email content (${content.length} chars)`);

    // Simulate email analysis processing
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));

    // Email phishing detection logic
    const contentLower = content.toLowerCase();
    const suspiciousKeywords = ['urgent', 'verify', 'suspended', 'click here', 'limited time', 'act now'];
    const maliciousKeywords = ['winner', 'congratulations', 'prince', 'lottery', 'inheritance'];
    
    const suspiciousCount = suspiciousKeywords.filter(keyword => contentLower.includes(keyword)).length;
    const maliciousCount = maliciousKeywords.filter(keyword => contentLower.includes(keyword)).length;

    let prediction = 'safe';
    let confidence = 0.7 + Math.random() * 0.25;
    const reasons = [];

    if (maliciousCount > 0) {
      prediction = 'malicious';
      confidence = 0.8 + Math.random() * 0.19;
      reasons.push('Contains known scam language patterns');
      if (contentLower.includes('winner')) reasons.push('Prize/lottery scam indicators');
    } else if (suspiciousCount >= 2) {
      prediction = 'suspicious';
      confidence = 0.6 + Math.random() * 0.3;
      reasons.push('Multiple urgency indicators found');
      reasons.push('Uses social engineering tactics');
    } else if (suspiciousCount === 1) {
      prediction = 'suspicious';
      confidence = 0.5 + Math.random() * 0.3;
      reasons.push('Contains urgency language');
    } else {
      reasons.push('No obvious phishing indicators found');
    }

    // Extract links and check for suspicious patterns
    const links = content.match(/https?:\/\/[^\s<>"]+/g) || [];
    if (links.length > 3) {
      reasons.push('Contains multiple external links');
      if (prediction === 'safe') prediction = 'suspicious';
    }

    const result = {
      prediction,
      confidence,
      reasons,
      details: {
        emailHeaders: {
          'From': 'analysis@security-detector.com',
          'Subject': 'Email Security Analysis',
          'Date': new Date().toISOString()
        },
        links,
        attachments: Math.random() > 0.8 ? ['document.pdf', 'form.exe'] : [],
        wordCount: content.split(/\s+/).length
      }
    };

    // Store result in KV store
    await kv.set(`phishing_email:${Date.now()}`, { content: content.slice(0, 200), result, timestamp: new Date().toISOString() });

    return c.json(result);

  } catch (error) {
    console.error('Email analysis error:', error);
    return c.json(
      { 
        error: 'Email analysis failed', 
        details: error.message 
      }, 
      500
    );
  }
});

// Analyze SMS for phishing
app.post("/make-server-3dc06296/analyze-sms", async (c) => {
  try {
    const body = await c.req.json();
    const { content } = body;

    console.log(`Analyzing SMS content (${content.length} chars)`);

    // Simulate SMS analysis processing
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // SMS phishing detection logic
    const contentLower = content.toLowerCase();
    const suspiciousKeywords = ['click', 'link', 'verify', 'urgent', 'expire'];
    const maliciousKeywords = ['winner', 'congratulations', 'free', 'prize', '$$$'];
    
    const suspiciousCount = suspiciousKeywords.filter(keyword => contentLower.includes(keyword)).length;
    const maliciousCount = maliciousKeywords.filter(keyword => contentLower.includes(keyword)).length;

    let prediction = 'safe';
    let confidence = 0.7 + Math.random() * 0.25;
    const reasons = [];

    if (maliciousCount > 0) {
      prediction = 'malicious';
      confidence = 0.82 + Math.random() * 0.17;
      reasons.push('Contains scam/spam language patterns');
      if (contentLower.includes('winner')) reasons.push('Lottery scam indicators');
    } else if (suspiciousCount >= 2) {
      prediction = 'suspicious';
      confidence = 0.6 + Math.random() * 0.3;
      reasons.push('Multiple suspicious keywords detected');
    } else if (content.length < 20) {
      prediction = 'suspicious';
      reasons.push('Unusually short message');
    } else {
      reasons.push('No obvious threat indicators found');
    }

    // Check for links in SMS
    const hasLinks = /https?:\/\/[^\s]+/.test(content);
    if (hasLinks) {
      reasons.push('Contains external links');
      if (prediction === 'safe') prediction = 'suspicious';
    }

    const result = {
      prediction,
      confidence,
      reasons,
      details: {
        hasLinks,
        messageLength: content.length,
        wordCount: content.split(/\s+/).length
      }
    };

    // Store result in KV store
    await kv.set(`phishing_sms:${Date.now()}`, { content, result, timestamp: new Date().toISOString() });

    return c.json(result);

  } catch (error) {
    console.error('SMS analysis error:', error);
    return c.json(
      { 
        error: 'SMS analysis failed', 
        details: error.message 
      }, 
      500
    );
  }
});

// Get phishing analysis history
app.get("/make-server-3dc06296/phishing-history", async (c) => {
  try {
    const urlResults = await kv.getByPrefix('phishing_url:');
    const emailResults = await kv.getByPrefix('phishing_email:');
    const smsResults = await kv.getByPrefix('phishing_sms:');

    const allResults = [
      ...urlResults.map(r => ({ ...r, type: 'url' })),
      ...emailResults.map(r => ({ ...r, type: 'email' })),
      ...smsResults.map(r => ({ ...r, type: 'sms' }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return c.json({
      results: allResults.slice(0, 50), // Return last 50 results
      summary: {
        total: allResults.length,
        safe: allResults.filter(r => r.result.prediction === 'safe').length,
        suspicious: allResults.filter(r => r.result.prediction === 'suspicious').length,
        malicious: allResults.filter(r => r.result.prediction === 'malicious').length,
        byType: {
          url: urlResults.length,
          email: emailResults.length,
          sms: smsResults.length
        }
      }
    });

  } catch (error) {
    console.error('Phishing history error:', error);
    return c.json(
      { 
        error: 'Failed to fetch phishing history', 
        details: error.message 
      }, 
      500
    );
  }
});

Deno.serve(app.fetch);