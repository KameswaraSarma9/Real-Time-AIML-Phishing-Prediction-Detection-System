import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  ExternalLink,
  Mail,
  MessageSquare,
  Eye,
  Clock,
  Globe,
  Lock,
  Unlock,
  Settings,
  AlertCircle,
  TestTube,
  Send,
  FileText
} from 'lucide-react';

interface FraudAlert {
  id: string;
  type: 'url' | 'email' | 'sms';
  content: string;
  threat: 'low' | 'medium' | 'high';
  confidence: number;
  reasons: string[];
  timestamp: string;
  blocked: boolean;
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

interface FraudPreventionProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  onFraudComplete?: (result: FraudResult) => void;
}

const threatLevels = {
  low: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: 'text-yellow-600',
    title: 'Suspicious Activity Detected'
  },
  medium: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
    icon: 'text-orange-600',
    title: 'Potential Fraud Detected'
  },
  high: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: 'text-red-600',
    title: 'High Risk Fraud Detected'
  }
};

export function FraudPrevention({ isEnabled, onToggle, onFraudComplete }: FraudPreventionProps) {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [showWarningPopup, setShowWarningPopup] = useState<FraudAlert | null>(null);
  const [blockedCount, setBlockedCount] = useState(0);
  const [interceptedAttempts, setInterceptedAttempts] = useState(0);
  
  // Manual testing states
  const [testContent, setTestContent] = useState('');
  const [testType, setTestType] = useState<'url' | 'email' | 'sms'>('email');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Enhanced fraud detection patterns with more sophisticated analysis
  const fraudPatterns = {
    url: [
      // URL shorteners (higher risk)
      { pattern: /bit\.ly|tinyurl|t\.co|goo\.gl|short\.link|is\.gd|ow\.ly|buff\.ly/i, reason: 'Shortened URL detected', weight: 0.7 },
      
      // Urgency and social engineering
      { pattern: /urgent|verify|suspended|expires?|immediate|asap|now|today|24.*hours?/i, reason: 'Creates false urgency', weight: 0.8 },
      
      // Prize and lottery scams
      { pattern: /winner|congratulations|lottery|prize|selected|won|claim|reward/i, reason: 'Prize/lottery scam indicators', weight: 0.9 },
      
      // Credential harvesting
      { pattern: /login|signin|account|bank|paypal|amazon|apple|microsoft|google|verify|update|confirm/i, reason: 'Credential harvesting attempt', weight: 0.6 },
      
      // Suspicious domains and patterns
      { pattern: /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/, reason: 'IP address instead of domain', weight: 0.95 },
      { pattern: /secure-.*\.(tk|ml|ga|cf)|.*-secure\.(tk|ml|ga|cf)|verify.*\.(tk|ml|ga|cf)/i, reason: 'Suspicious domain pattern with free TLD', weight: 0.9 },
      
      // Typosquatting and brand impersonation
      { pattern: /payp[a4]l|g[o0][o0]gle|micr[o0]s[o0]ft|[a4]m[a4]z[o0]n|[a4]pple|f[a4]ceb[o0][o0]k|tw[i1]tter|netfl[i1]x/i, reason: 'Possible brand impersonation/typosquatting', weight: 0.85 },
      
      // Suspicious parameters
      { pattern: /[?&](account|login|verify|update|confirm|suspend|lock|expire|urgent)=/i, reason: 'Suspicious URL parameters', weight: 0.7 },
      
      // Homograph and IDN attacks
      { pattern: /xn--|[а-я]|[αβγδεζηθικλμνξοπρστυφχψω]|[аеорсукх]/i, reason: 'Possible homograph/character substitution attack', weight: 0.95 },
      
      // Suspicious file extensions in URLs
      { pattern: /\.(exe|bat|scr|cmd|pif|com|jar|zip|rar|dmg|apk|deb|rpm)([?#]|$)/i, reason: 'Suspicious executable file type', weight: 0.8 }
    ],
    
    email: [
      // Urgency and pressure tactics
      { pattern: /urgent|immediate|expires?|suspend|asap|act.*now|respond.*within|final.*notice|last.*chance/i, reason: 'Creates false urgency', weight: 0.8 },
      
      // Generic calls to action
      { pattern: /click.*here|download.*now|verify.*now|update.*now|confirm.*now|access.*now/i, reason: 'Generic call-to-action', weight: 0.7 },
      
      // Prize and lottery scams
      { pattern: /congratulations|winner|selected|lottery|prize|won|claim|reward|contest|drawing/i, reason: 'Prize/lottery scam indicators', weight: 0.95 },
      
      // Advance fee fraud (419 scams)
      { pattern: /prince|inheritance|million|billion|dollars?|deceased|beneficiary|estate|diplomat|barrister|solicitor/i, reason: 'Advance fee fraud (419 scam) indicators', weight: 0.95 },
      
      // Account threat tactics
      { pattern: /suspended|terminated|blocked|locked|deactivated|compromised|hacked|unauthorized/i, reason: 'Account threat tactics', weight: 0.85 },
      
      // Government/authority impersonation
      { pattern: /tax.*refund|irs|fbi|homeland.*security|customs|immigration|social.*security|medicare|stimulus/i, reason: 'Government authority impersonation', weight: 0.9 },
      
      // Generic greetings (common in mass scams)
      { pattern: /dear\s+(sir|madam|friend|customer|valued|esteemed|recipient)/i, reason: 'Generic greeting typical of mass scams', weight: 0.6 },
      
      // Financial fraud language
      { pattern: /beneficiary|transfer.*funds|claim.*money|wire.*transfer|bank.*details|routing.*number|account.*number/i, reason: 'Financial fraud language', weight: 0.85 },
      
      // Pressure and time-sensitive tactics
      { pattern: /contact.*immediately|respond.*within|act.*now|time.*sensitive|expire.*soon|final.*warning/i, reason: 'High-pressure tactics', weight: 0.8 },
      
      // Suspicious payment methods
      { pattern: /western.*union|money.*gram|bitcoin|cryptocurrency|gift.*card|itunes.*card|steam.*card|prepaid.*card/i, reason: 'Suspicious payment methods', weight: 0.9 },
      
      // Secrecy and confidentiality tactics
      { pattern: /confidential|secret|private.*matter|classified|discreet|between.*us|do.*not.*tell/i, reason: 'Secrecy tactics to avoid scrutiny', weight: 0.7 },
      
      // Spelling and grammar issues (common in scams)
      { pattern: /\b(recieve|occured|seperate|definately|alot|loose|there|their|your|you're)\b/i, reason: 'Common spelling errors in scam emails', weight: 0.4 },
      
      // Suspicious sender patterns
      { pattern: /noreply|no-reply|donotreply|notification|alert|security|admin|support.*@(gmail|yahoo|hotmail|outlook)/i, reason: 'Suspicious sender using free email service', weight: 0.6 },
      
      // Romance/relationship scams
      { pattern: /love|romance|relationship|dating|meet|attractive|photos|lonely|widow|military|overseas/i, reason: 'Romance scam indicators', weight: 0.7 },
      
      // Tech support scams
      { pattern: /computer.*infected|virus.*detected|malware|windows.*license|microsoft.*support|apple.*support/i, reason: 'Tech support scam indicators', weight: 0.8 }
    ],
    
    sms: [
      // Prize and contest scams
      { pattern: /congratulations|winner|selected|won|prize|reward|contest|drawing|lottery/i, reason: 'Prize scam indicators', weight: 0.95 },
      
      // Suspicious link requests
      { pattern: /click|link|http|bit\.ly|tinyurl|download|install|app/i, reason: 'Suspicious link request', weight: 0.8 },
      
      // Urgency and time pressure
      { pattern: /urgent|expire|suspend|immediate|asap|now|today|24.*hours?|final/i, reason: 'Creates false urgency', weight: 0.8 },
      
      // Too-good-to-be-true offers
      { pattern: /free|offer|deal|discount|save|50%|75%|90%|cash|money|gift/i, reason: 'Too-good-to-be-true offers', weight: 0.6 },
      
      // Information harvesting
      { pattern: /verify|confirm|update|validate|authenticate|secure|login|password/i, reason: 'Information harvesting attempt', weight: 0.7 },
      
      // Subscription and premium scams
      { pattern: /subscription|premium|charged|billing|cancel|unsubscribe|stop.*reply/i, reason: 'Subscription scam pattern', weight: 0.7 },
      
      // Bank and financial impersonation
      { pattern: /bank|card|account|payment|transaction|fraud|security.*alert|suspended/i, reason: 'Financial institution impersonation', weight: 0.8 },
      
      // Delivery and package scams
      { pattern: /package|delivery|shipment|fedex|ups|dhl|postal|redelivery|failed.*delivery/i, reason: 'Package delivery scam', weight: 0.7 },
      
      // Tax and government scams
      { pattern: /tax|irs|refund|stimulus|government|social.*security|medicare|benefits/i, reason: 'Government impersonation', weight: 0.9 },
      
      // Tech support and virus scams
      { pattern: /virus|malware|infected|security.*breach|microsoft|apple|google|tech.*support/i, reason: 'Tech support scam', weight: 0.8 },
      
      // Romance and social engineering
      { pattern: /dating|lonely|photos|meet|relationship|love|attractive|military|overseas/i, reason: 'Romance/social engineering scam', weight: 0.7 },
      
      // Cryptocurrency and investment scams
      { pattern: /bitcoin|crypto|investment|trading|profit|roi|guaranteed.*returns|make.*money/i, reason: 'Cryptocurrency/investment scam', weight: 0.8 }
    ]
  };

  // Enhanced analysis function with better scoring and safe content detection
  const analyzeContent = useCallback((type: 'url' | 'email' | 'sms', content: string): FraudAlert | null => {
    if (!isEnabled || !content.trim()) return null;

    const patterns = fraudPatterns[type];
    let totalWeight = 0;
    const matchedReasons: string[] = [];
    
    // Check for safe content indicators first
    const safeIndicators = {
      url: [
        /^https:\/\/(www\.)?(google|microsoft|apple|amazon|github|stackoverflow|wikipedia|mozilla|linkedin|youtube|twitter|facebook|instagram)\.com/i,
        /^https:\/\/[a-z0-9-]+\.(edu|gov|org)($|\/)/i, // Educational, government, non-profit domains
        /^https:\/\/[a-z0-9-]+\.(com|net|org)\/[a-z0-9-\/]*\.(pdf|doc|docx|jpg|jpeg|png|gif)$/i // Direct file links
      ],
      email: [
        /from:.*@(gmail|yahoo|hotmail|outlook)\.com.*subject:\s*(meeting|project|reminder|invoice|receipt|newsletter)/i,
        /unsubscribe|privacy.*policy|terms.*of.*service|customer.*service/i,
        /thank.*you.*for.*your.*order|your.*order.*has.*been.*shipped|delivery.*confirmation/i
      ],
      sms: [
        /your.*appointment|meeting.*reminder|delivery.*notification|order.*confirmation/i,
        /verification.*code.*\d{4,6}.*expires.*in.*\d+.*minutes/i,
        /reply.*stop.*to.*unsubscribe|text.*stop.*to.*opt.*out/i
      ]
    };

    // Check if content matches safe patterns
    const contentSafeIndicators = safeIndicators[type] || [];
    const isSafeContent = contentSafeIndicators.some(pattern => pattern.test(content.toLowerCase()));
    
    // If content appears safe, reduce sensitivity
    const safeContentMultiplier = isSafeContent ? 0.6 : 1.0;

    // Check fraud patterns
    patterns.forEach(({ pattern, reason, weight }) => {
      if (pattern.test(content)) {
        totalWeight += weight * safeContentMultiplier;
        matchedReasons.push(reason);
      }
    });

    // Enhanced URL-specific checks
    if (type === 'url') {
      try {
        const url = new URL(content.startsWith('http') ? content : `https://${content}`);
        
        // Check for suspicious TLDs with higher granularity
        const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.pw', '.top', '.work', '.click', '.download', '.review'];
        const highRiskTlds = ['.tk', '.ml', '.ga', '.cf'];
        
        if (highRiskTlds.some(tld => url.hostname.endsWith(tld))) {
          totalWeight += 0.9;
          matchedReasons.push('High-risk top-level domain');
        } else if (suspiciousTlds.some(tld => url.hostname.endsWith(tld))) {
          totalWeight += 0.7;
          matchedReasons.push('Suspicious top-level domain');
        }

        // Check for excessive subdomain nesting
        const subdomainCount = url.hostname.split('.').length;
        if (subdomainCount > 4) {
          totalWeight += 0.7;
          matchedReasons.push('Excessive subdomain nesting');
        } else if (subdomainCount > 3) {
          totalWeight += 0.4;
          matchedReasons.push('Multiple subdomains detected');
        }

        // Enhanced homograph attack detection
        const suspiciousChars = /[а-я]|[αβγδεζηθικλμνξοπρστυφχψω]|[аеорсукх]|[àáâãäåæçèéêëìíîïðñòóôõö]/i;
        if (suspiciousChars.test(url.hostname)) {
          totalWeight += 0.95;
          matchedReasons.push('Possible homograph/character substitution attack');
        }

        // Check for port numbers (often suspicious)
        if (url.port && url.port !== '80' && url.port !== '443') {
          totalWeight += 0.6;
          matchedReasons.push('Non-standard port number detected');
        }

        // Check for HTTP instead of HTTPS for sensitive keywords
        if (url.protocol === 'http:' && /login|bank|secure|account|payment/i.test(url.href)) {
          totalWeight += 0.8;
          matchedReasons.push('Insecure HTTP protocol for sensitive content');
        }

        // Check for URL length (very long URLs are often suspicious)
        if (url.href.length > 200) {
          totalWeight += 0.5;
          matchedReasons.push('Unusually long URL');
        }

        // Check for suspicious path patterns
        if (/\/(admin|wp-admin|login|signin|secure|verify|update|confirm)\.php/i.test(url.pathname)) {
          totalWeight += 0.7;
          matchedReasons.push('Suspicious file path detected');
        }

      } catch (e) {
        totalWeight += 0.8;
        matchedReasons.push('Malformed URL structure');
      }
    }

    // Enhanced email-specific checks
    if (type === 'email') {
      // Check for suspicious formatting
      if (/[A-Z]{10,}/.test(content)) {
        totalWeight += 0.4;
        matchedReasons.push('Excessive use of capital letters');
      }

      // Check for multiple exclamation marks
      if (/!{3,}/.test(content)) {
        totalWeight += 0.3;
        matchedReasons.push('Excessive punctuation usage');
      }

      // Check for suspicious email patterns in content
      if (/@[a-z0-9-]+\.(tk|ml|ga|cf|ru|cn)/i.test(content)) {
        totalWeight += 0.7;
        matchedReasons.push('Suspicious email domain in content');
      }

      // Check for money amounts
      if (/\$[\d,]+|£[\d,]+|€[\d,]+|\d+\s*(million|billion|thousand)/i.test(content)) {
        totalWeight += 0.6;
        matchedReasons.push('Large monetary amounts mentioned');
      }
    }

    // Enhanced SMS-specific checks
    if (type === 'sms') {
      // Check message length (scam SMS are often short and urgent)
      if (content.length < 50 && matchedReasons.length > 0) {
        totalWeight += 0.3;
        matchedReasons.push('Short message with suspicious content');
      }

      // Check for number spoofing patterns
      if (/from:\s*\d{5,6}[^0-9]/i.test(content) || /reply.*\d{5}/.test(content)) {
        totalWeight += 0.6;
        matchedReasons.push('Suspicious sender number pattern');
      }
    }

    // Return null if no suspicious patterns found
    if (matchedReasons.length === 0) return null;

    // Enhanced threat level determination with more nuanced scoring
    let threat: 'low' | 'medium' | 'high' = 'low';
    if (totalWeight >= 2.0) threat = 'high';
    else if (totalWeight >= 1.2) threat = 'medium';
    else if (totalWeight >= 0.6) threat = 'low';
    else return null; // Too low to be considered a threat

    // Enhanced confidence calculation
    const baseConfidence = Math.min(totalWeight / 3, 0.98);
    const patternBonus = Math.min(matchedReasons.length * 0.05, 0.15);
    const confidence = Math.min(baseConfidence + patternBonus, 0.99);

    return {
      id: `${type}_${Date.now()}_${Math.random()}`,
      type,
      content: content.slice(0, 300), // Increased content preview
      threat,
      confidence,
      reasons: matchedReasons.slice(0, 10), // Limit to top 10 reasons
      timestamp: new Date().toISOString(),
      blocked: threat === 'high' || (threat === 'medium' && confidence > 0.75)
    };
  }, [isEnabled]);

  // URL click interception
  useEffect(() => {
    if (!isEnabled) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href) {
        const alert = analyzeContent('url', link.href);
        
        if (alert) {
          e.preventDefault();
          e.stopPropagation();
          
          setInterceptedAttempts(prev => prev + 1);
          setAlerts(prev => [alert, ...prev.slice(0, 9)]);
          
          if (alert.blocked) {
            setBlockedCount(prev => prev + 1);
          }
          
          setShowWarningPopup(alert);

          // Call the completion handler with standardized format
          if (onFraudComplete) {
            const fraudResult: FraudResult = {
              id: alert.id,
              type: alert.type,
              content: alert.content,
              prediction: alert.threat === 'high' ? 'malicious' : alert.threat === 'medium' ? 'suspicious' : 'safe',
              confidence: alert.confidence,
              reasons: alert.reasons,
              timestamp: alert.timestamp
            };
            onFraudComplete(fraudResult);
          }
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [isEnabled, analyzeContent, onFraudComplete]);

  // Email content monitoring (when emails are displayed)
  useEffect(() => {
    if (!isEnabled) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            
            // Look for email-like content
            const emailContent = element.textContent || '';
            if (emailContent.length > 50 && /@.*\.(com|org|net)/.test(emailContent)) {
              const alert = analyzeContent('email', emailContent);
              
              if (alert) {
                setAlerts(prev => [alert, ...prev.slice(0, 9)]);
                
                if (alert.threat === 'high') {
                  setShowWarningPopup(alert);
                }
              }
            }
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [isEnabled, analyzeContent]);

  const handleDismissPopup = () => {
    setShowWarningPopup(null);
  };

  const handleProceedAnyway = () => {
    if (showWarningPopup && showWarningPopup.type === 'url') {
      // Extract the URL and open it
      const urlMatch = showWarningPopup.content.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        window.open(urlMatch[0], '_blank');
      }
    }
    setShowWarningPopup(null);
  };

  const clearAlerts = () => {
    setAlerts([]);
    setBlockedCount(0);
    setInterceptedAttempts(0);
  };

  // Manual testing function
  const handleManualTest = () => {
    if (!testContent.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    setTimeout(() => {
      const alert = analyzeContent(testType, testContent);
      
      if (alert) {
        setInterceptedAttempts(prev => prev + 1);
        setAlerts(prev => [alert, ...prev.slice(0, 9)]);
        
        if (alert.blocked) {
          setBlockedCount(prev => prev + 1);
        }
        
        setShowWarningPopup(alert);

        // Call the completion handler with standardized format
        if (onFraudComplete) {
          const fraudResult: FraudResult = {
            id: alert.id,
            type: alert.type,
            content: alert.content,
            prediction: alert.threat === 'high' ? 'malicious' : alert.threat === 'medium' ? 'suspicious' : 'safe',
            confidence: alert.confidence,
            reasons: alert.reasons,
            timestamp: alert.timestamp
          };
          onFraudComplete(fraudResult);
        }
      }
      
      setIsAnalyzing(false);
    }, 1500);
  };

  // Pre-filled fraud email examples
  const fraudExamples = {
    email: `Subject: URGENT: Your Account Will Be Suspended

Dear Sir/Madam,

Congratulations! You have been selected as the beneficiary of $2.5 million dollars from the estate of a late businessman. 

This is a confidential matter that requires your immediate attention. Your account will be suspended if you don't respond within 24 hours.

To claim your money, please contact us immediately and provide your banking details. We accept Western Union transfers for processing fees.

Act now before this offer expires!

Best regards,
Dr. John Smith
International Finance Department`,
    
    sms: "CONGRATULATIONS! You've won $10,000! Click this link now to claim your prize before it expires: http://bit.ly/claim-now. Reply STOP to unsubscribe.",
    
    url: "https://secure-bankoamerica.tk/login?verify=suspended&urgent=true"
  };

  const loadFraudExample = () => {
    setTestContent(fraudExamples[testType]);
  };

  // Random content generators
  const randomContentGenerators = {
    email: {
      fraudulent: [
        {
          subject: "URGENT: Account Verification Required",
          content: `Dear Customer,

Your account has been suspended due to suspicious activity. You have 24 hours to verify your information before permanent closure.

Click here to verify now: http://bit.ly/verify-account-urgent

Failure to respond will result in account termination and loss of funds.

Regards,
Security Team`
        },
        {
          subject: "Congratulations! You've Won $50,000",
          content: `Dear Friend,

Congratulations! You have been selected as winner of our monthly lottery drawing. You've won $50,000!

To claim your prize, please contact us immediately with:
- Full Name
- Phone Number  
- Banking Details

This is a confidential matter. Contact immediately before offer expires.

Dr. Michael Johnson
Prize Distribution Department`
        },
        {
          subject: "Government Tax Refund - Action Required",
          content: `Dear Taxpayer,

The IRS owes you a tax refund of $3,247. Your refund is ready for processing.

Click here to claim immediately: http://irs-refund.tk/claim

You must respond within 48 hours or forfeit your refund.

IRS Tax Department`
        },
        {
          subject: "Inheritance Fund Transfer",
          content: `Dear Beneficiary,

I am contacting you regarding an inheritance fund of $2.8 million left by a late client. You are listed as the beneficiary.

This is a private and confidential matter. We need to transfer these funds via Western Union for security.

Contact immediately to claim your inheritance.

Best regards,
Prince Abdullah Al-Rashid
International Finance`
        }
      ],
      legitimate: [
        {
          subject: "Your Monthly Statement is Ready",
          content: `Hello,

Your monthly account statement for October 2024 is now available in your secure account portal.

To view your statement, please log in to your account at our official website.

If you have any questions, please contact our customer service team during business hours.

Best regards,
Customer Service Team`
        },
        {
          subject: "Meeting Reminder - Tomorrow at 2 PM",
          content: `Hi Team,

This is a reminder about our project review meeting scheduled for tomorrow at 2:00 PM in Conference Room B.

Agenda:
- Project status updates
- Budget review
- Next quarter planning

Please bring your progress reports.

Thanks,
Sarah`
        },
        {
          subject: "Welcome to Our Newsletter",
          content: `Thank you for subscribing to our weekly newsletter!

You'll receive updates about:
- Industry news and trends
- Product updates
- Special offers for subscribers

You can unsubscribe at any time by clicking the link at the bottom of our emails.

Welcome aboard!
Marketing Team`
        }
      ]
    },
    sms: {
      fraudulent: [
        "WINNER! You've won $25,000! Claim now: http://bit.ly/win25k before it expires. Text STOP to opt out.",
        "URGENT: Your bank account will be closed. Verify immediately: http://t.co/bankverify or lose access forever.",
        "Congratulations! Apple selected you for iPhone 15 Pro. Click link to claim: http://apple-winner.ml/claim",
        "ALERT: Suspicious activity detected. Confirm identity now: http://tinyurl.com/secure-login to prevent account freeze.",
        "You have 1 missed call. Listen to voicemail: http://voicemail-secure.ga/listen - expires in 2 hours.",
        "Prize notification: You won $10,000 gift card! Click here: http://giftcard-claim.tk urgent action required."
      ],
      legitimate: [
        "Your appointment with Dr. Smith is confirmed for tomorrow at 3:00 PM. Reply CANCEL if you need to reschedule.",
        "Your package has been delivered to your front door. Tracking #: 1Z999E123456789. Thank you for your order!",
        "Reminder: Your library books are due tomorrow. Renew online or visit the library to avoid late fees.",
        "Your verification code is 123456. Do not share this code with anyone. It expires in 10 minutes.",
        "Meeting moved to 4 PM in Room 301. See you there! - Team Lead",
        "Your ride will arrive in 5 minutes. Driver: John, License: ABC123. White Toyota Prius."
      ]
    },
    url: {
      fraudulent: [
        "https://secure-paypal-verification.tk/login?account=suspended&verify=true",
        "http://amazon-security.ml/verify/login.php?urgent=true&suspend=24hrs",
        "https://bankofamerica-verify.ga/secure/login?account=locked",
        "http://microsoft-security.cf/account/verify?expires=today",
        "https://apple-id-secure.tk/verify/account?urgent=immediate",
        "http://192.168.1.100/phishing/login.html",
        "https://google-security.ml/verify?account=suspended&urgent=true",
        "http://facebook-verify.ga/security/login?expires=now",
        "https://netflix-billing.tk/update/payment?urgent=true",
        "http://government-refund.ml/claim?tax=refund&urgent=24hrs"
      ],
      legitimate: [
        "https://www.google.com/search?q=weather+forecast",
        "https://github.com/microsoft/typescript",
        "https://stackoverflow.com/questions/tagged/javascript",
        "https://www.wikipedia.org/wiki/Machine_learning",
        "https://docs.microsoft.com/en-us/azure/",
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "https://www.linkedin.com/in/profile",
        "https://news.ycombinator.com/",
        "https://www.reddit.com/r/programming"
      ]
    }
  };

  const generateRandomContent = (type: 'email' | 'sms' | 'url', isFraudulent: boolean = Math.random() > 0.5) => {
    const contentArray = randomContentGenerators[type][isFraudulent ? 'fraudulent' : 'legitimate'];
    const randomIndex = Math.floor(Math.random() * contentArray.length);
    
    if (type === 'email' && typeof contentArray[randomIndex] === 'object') {
      const emailObj = contentArray[randomIndex] as { subject: string; content: string };
      return `Subject: ${emailObj.subject}\n\n${emailObj.content}`;
    }
    
    return contentArray[randomIndex] as string;
  };

  const handleGenerateRandom = (isFraudulent?: boolean) => {
    const content = generateRandomContent(testType, isFraudulent);
    setTestContent(content);
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Real-Time Fraud Prevention
          </CardTitle>
          <CardDescription>
            Proactive protection against malicious URLs, phishing emails, and SMS scams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${isEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                {isEnabled ? (
                  <Lock className="w-5 h-5 text-green-600" />
                ) : (
                  <Unlock className="w-5 h-5 text-gray-500" />
                )}
              </div>
              <div>
                <p className="font-medium">
                  Protection Status: {isEnabled ? 'Active' : 'Disabled'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isEnabled ? 'Monitoring for threats in real-time' : 'Enable to start monitoring'}
                </p>
              </div>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={onToggle}
            />
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{interceptedAttempts}</div>
              <div className="text-sm text-green-700">Threats Detected</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{blockedCount}</div>
              <div className="text-sm text-red-700">Blocked Attempts</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{alerts.length}</div>
              <div className="text-sm text-blue-700">Recent Alerts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning Popup */}
      <AnimatePresence>
        {showWarningPopup && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`max-w-md w-full rounded-lg border-2 p-6 bg-white ${threatLevels[showWarningPopup.threat].border} shadow-2xl`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className={`p-2 rounded-full ${threatLevels[showWarningPopup.threat].bg}`}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <AlertTriangle className={`w-6 h-6 ${threatLevels[showWarningPopup.threat].icon}`} />
                </motion.div>
                <div>
                  <h3 className="font-bold text-lg">
                    {threatLevels[showWarningPopup.threat].title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {(showWarningPopup.confidence * 100).toFixed(0)}% confidence
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismissPopup}
                  className="ml-auto"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <Alert className={`mb-4 ${threatLevels[showWarningPopup.threat].bg} ${threatLevels[showWarningPopup.threat].border}`}>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  We detected potentially fraudulent content. Review the details below before proceeding.
                </AlertDescription>
              </Alert>

              <div className="space-y-3 mb-6">
                <div>
                  <p className="font-medium text-sm mb-1">Content:</p>
                  <p className="text-sm bg-gray-50 p-2 rounded border break-all">
                    {showWarningPopup.content}
                  </p>
                </div>

                <div>
                  <p className="font-medium text-sm mb-2">Why this might be fraudulent:</p>
                  <div className="space-y-1">
                    {showWarningPopup.reasons.map((reason, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          showWarningPopup.threat === 'high' ? 'bg-red-500' :
                          showWarningPopup.threat === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                        }`} />
                        {reason}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="default"
                  onClick={handleDismissPopup}
                  className="flex-1"
                >
                  Stay Safe
                </Button>
                {showWarningPopup.type === 'url' && (
                  <Button
                    variant="outline"
                    onClick={handleProceedAnyway}
                    className="flex-1"
                  >
                    Proceed Anyway
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Recent Fraud Alerts
                </CardTitle>
                <CardDescription>
                  Latest threats detected and blocked by the system
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={clearAlerts}>
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, index) => {
                const colors = threatLevels[alert.threat];
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={colors.icon}>
                          {alert.type === 'url' && <Globe className="w-4 h-4" />}
                          {alert.type === 'email' && <Mail className="w-4 h-4" />}
                          {alert.type === 'sms' && <MessageSquare className="w-4 h-4" />}
                        </div>
                        <Badge variant="outline" className={`${colors.text} border-current`}>
                          {alert.type.toUpperCase()}
                        </Badge>
                        <Badge className={`${alert.threat === 'high' ? 'bg-red-500' : alert.threat === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'} text-white`}>
                          {alert.threat.toUpperCase()} RISK
                        </Badge>
                        {alert.blocked && (
                          <Badge variant="destructive">
                            BLOCKED
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </div>
                    </div>

                    <p className="text-sm mb-2 bg-white/50 p-2 rounded border break-all">
                      {alert.content}
                    </p>

                    <div className="text-xs">
                      <span className="font-medium">Threats detected:</span>
                      <div className="mt-1 space-y-1">
                        {alert.reasons.slice(0, 3).map((reason, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <div className={`w-1 h-1 rounded-full ${
                              alert.threat === 'high' ? 'bg-red-500' :
                              alert.threat === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                            }`} />
                            {reason}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {alerts.length === 0 && isEnabled && (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              No threats detected. Your browsing and communication are being actively protected.
            </p>
          </CardContent>
        </Card>
      )}

      {!isEnabled && (
        <Card>
          <CardContent className="text-center py-12">
            <Unlock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Protection Disabled</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-4">
              Enable fraud prevention to start monitoring for malicious URLs, phishing emails, and SMS scams.
            </p>
            <Button onClick={() => onToggle(true)}>
              Enable Protection
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Manual Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-6 h-6" />
            Manual Testing
          </CardTitle>
          <CardDescription>
            Test content for potential fraud detection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="test" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="test">Test Content</TabsTrigger>
              <TabsTrigger value="examples">Fraud Examples</TabsTrigger>
            </TabsList>

            <TabsContent value="test" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  <Label className="block mb-2">Content Type</Label>
                  <Tabs value={testType} onValueChange={(value) => setTestType(value as 'url' | 'email' | 'sms')}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="email">
                        <Mail className="w-4 h-4 mr-1" />
                        Email
                      </TabsTrigger>
                      <TabsTrigger value="sms">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        SMS
                      </TabsTrigger>
                      <TabsTrigger value="url">
                        <Globe className="w-4 h-4 mr-1" />
                        URL
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="lg:col-span-2">
                  <Label className="block mb-2">Content to Analyze</Label>
                  <Textarea
                    placeholder={`Enter ${testType} content to test for fraud...`}
                    value={testContent}
                    onChange={(e) => setTestContent(e.target.value)}
                    className="min-h-[120px]"
                    disabled={isAnalyzing}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleManualTest}
                  disabled={!testContent.trim() || isAnalyzing || !isEnabled}
                  className="flex-1"
                >
                  {isAnalyzing ? (
                    <>
                      <Settings className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Analyze for Fraud
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleGenerateRandom(true)}
                  disabled={isAnalyzing}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Random Fraud
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleGenerateRandom(false)}
                  disabled={isAnalyzing}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Random Safe
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleGenerateRandom()}
                  disabled={isAnalyzing}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Random Mix
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setTestContent('')}
                  disabled={isAnalyzing}
                >
                  Clear
                </Button>
              </div>

              {!isEnabled && (
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    Please enable fraud prevention above to test content.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="examples" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Mail className="w-4 h-4" />
                      Fraudulent Email Example
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto whitespace-pre-wrap">
                      {fraudExamples.email}
                    </pre>
                    <Button 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        setTestType('email');
                        setTestContent(fraudExamples.email);
                      }}
                    >
                      Test This Email
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MessageSquare className="w-4 h-4" />
                      Fraudulent SMS Example
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto whitespace-pre-wrap">
                      {fraudExamples.sms}
                    </pre>
                    <Button 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        setTestType('sms');
                        setTestContent(fraudExamples.sms);
                      }}
                    >
                      Test This SMS
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Globe className="w-4 h-4" />
                      Fraudulent URL Example
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto whitespace-pre-wrap">
                      {fraudExamples.url}
                    </pre>
                    <Button 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        setTestType('url');
                        setTestContent(fraudExamples.url);
                      }}
                    >
                      Test This URL
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Random Content Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Random Content Generation
          </CardTitle>
          <CardDescription>
            Generate random content for testing fraud detection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate">Generate Content</TabsTrigger>
              <TabsTrigger value="examples">Fraud Examples</TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  <Label className="block mb-2">Content Type</Label>
                  <Tabs value={testType} onValueChange={(value) => setTestType(value as 'url' | 'email' | 'sms')}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="email">
                        <Mail className="w-4 h-4 mr-1" />
                        Email
                      </TabsTrigger>
                      <TabsTrigger value="sms">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        SMS
                      </TabsTrigger>
                      <TabsTrigger value="url">
                        <Globe className="w-4 h-4 mr-1" />
                        URL
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="lg:col-span-2">
                  <Label className="block mb-2">Content to Analyze</Label>
                  <Textarea
                    placeholder={`Enter ${testType} content to test for fraud...`}
                    value={testContent}
                    onChange={(e) => setTestContent(e.target.value)}
                    className="min-h-[120px]"
                    disabled={isAnalyzing}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleGenerateRandom}
                  disabled={isAnalyzing || !isEnabled}
                  className="flex-1"
                >
                  {isAnalyzing ? (
                    <>
                      <Settings className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Generate Random Content
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={loadFraudExample}
                  disabled={isAnalyzing}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Load Example
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setTestContent('')}
                  disabled={isAnalyzing}
                >
                  Clear
                </Button>
              </div>

              {!isEnabled && (
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    Please enable fraud prevention above to test content.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="examples" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Mail className="w-4 h-4" />
                      Fraudulent Email Example
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto whitespace-pre-wrap">
                      {fraudExamples.email}
                    </pre>
                    <Button 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        setTestType('email');
                        setTestContent(fraudExamples.email);
                      }}
                    >
                      Test This Email
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MessageSquare className="w-4 h-4" />
                      Fraudulent SMS Example
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto whitespace-pre-wrap">
                      {fraudExamples.sms}
                    </pre>
                    <Button 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        setTestType('sms');
                        setTestContent(fraudExamples.sms);
                      }}
                    >
                      Test This SMS
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Globe className="w-4 h-4" />
                      Fraudulent URL Example
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto whitespace-pre-wrap">
                      {fraudExamples.url}
                    </pre>
                    <Button 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        setTestType('url');
                        setTestContent(fraudExamples.url);
                      }}
                    >
                      Test This URL
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}