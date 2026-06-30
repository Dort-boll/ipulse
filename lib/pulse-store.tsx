"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Service, Incident, ActivityLog, Status, IndexHistoryPoint } from "./pulse-types";

interface PulseContextType {
  services: Service[];
  incidents: Incident[];
  activityLogs: ActivityLog[];
  historyPoints: IndexHistoryPoint[];
  ipi: number;
  lastUpdated: string;
  activeView: string; // "dashboard" | "incidents" | "visualizer" | "settings" | "service-openai" etc.
  setActiveView: (view: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  triggerScenario: (scenario: string) => void;
  repairAll: () => void;
  toggleMockFetch: () => void;
  useLiveFetching: boolean;
  manualUpdate: () => void;
}

const INITIAL_SERVICES: Service[] = [
  // --- AI ---
  {
    id: "openai",
    name: "OpenAI",
    category: "AI",
    status: "operational",
    latency: 145,
    uptime: 99.85,
    description: "Generative AI API & ChatGPT Services",
    icon: "Brain",
    dependencies: ["azure", "cloudflare"],
    components: [
      { id: "api", name: "API & Models", status: "operational" },
      { id: "chat", name: "ChatGPT Front-end", status: "operational" },
      { id: "playground", name: "Developer Playground", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "anthropic",
    name: "Anthropic",
    category: "AI",
    status: "operational",
    latency: 180,
    uptime: 99.91,
    description: "Claude models and Developer Console",
    icon: "Cpu",
    dependencies: ["aws"],
    components: [
      { id: "claude-api", name: "Claude API Orchestrator", status: "operational" },
      { id: "chat-web", name: "Claude.ai Client", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "gemini",
    name: "Gemini",
    category: "AI",
    status: "operational",
    latency: 110,
    uptime: 99.99,
    description: "Google's Gemini multimodal AI network",
    icon: "Sparkles",
    dependencies: ["gcp"],
    components: [
      { id: "gemini-api", name: "Developer Endpoint", status: "operational" },
      { id: "gemini-web", name: "Gemini Advanced Web UI", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "grok",
    name: "Grok",
    category: "AI",
    status: "operational",
    latency: 220,
    uptime: 99.64,
    description: "xAI real-time information engine",
    icon: "Atom",
    dependencies: ["gcp", "oracle"],
    components: [
      { id: "grok-api", name: "API Endpoint", status: "operational" },
      { id: "grok-web", name: "X Integration Bridge", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "cohere",
    name: "Cohere",
    category: "AI",
    status: "operational",
    latency: 160,
    uptime: 99.89,
    description: "Enterprise NLP models and Embeddings APIs",
    icon: "Zap",
    dependencies: ["aws", "gcp"],
    components: [
      { id: "co-api", name: "Models API Endpoint", status: "operational" },
      { id: "co-console", name: "Enterprise Portal", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "perplexity",
    name: "Perplexity",
    category: "AI",
    status: "operational",
    latency: 195,
    uptime: 99.78,
    description: "Conversational answer engine and model fine-tunes",
    icon: "SearchCode",
    dependencies: ["openai", "gemini", "cloudflare"],
    components: [
      { id: "perp-search", name: "Realtime Search Integration", status: "operational" },
      { id: "perp-web", name: "Consumer Web Application", status: "operational" }
    ],
    lastChecked: "Just now"
  },

  // --- Cloud ---
  {
    id: "aws",
    name: "AWS",
    category: "Cloud",
    status: "operational",
    latency: 48,
    uptime: 99.99,
    description: "Amazon Web Services Infrastructure",
    icon: "CloudLightning",
    dependencies: [],
    components: [
      { id: "us-east-ec2", name: "EC2 - us-east-1", status: "operational" },
      { id: "us-east-s3", name: "S3 - us-east-1", status: "operational" },
      { id: "eu-west-rds", name: "RDS - eu-west-1", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "azure",
    name: "Azure",
    category: "Cloud",
    status: "operational",
    latency: 55,
    uptime: 99.97,
    description: "Microsoft Azure Enterprise Cloud",
    icon: "CloudOff",
    dependencies: [],
    components: [
      { id: "az-active-dir", name: "Entra ID / Active Directory", status: "operational" },
      { id: "az-sql", name: "CosmosDB & SQL Databases", status: "operational" },
      { id: "az-vms", name: "Compute Instances (VM)", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "gcp",
    name: "Google Cloud",
    category: "Cloud",
    status: "operational",
    latency: 42,
    uptime: 99.99,
    description: "Google Cloud Platform Services",
    icon: "Cloud",
    dependencies: [],
    components: [
      { id: "gcp-gke", name: "Google Kubernetes Engine", status: "operational" },
      { id: "gcp-storage", name: "Cloud Storage Bucket CDN", status: "operational" },
      { id: "gcp-bigquery", name: "BigQuery Analytics Hub", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "oracle",
    name: "Oracle Cloud",
    category: "Cloud",
    status: "operational",
    latency: 68,
    uptime: 99.95,
    description: "Oracle Cloud Infrastructure (OCI)",
    icon: "Database",
    dependencies: [],
    components: [
      { id: "oci-db", name: "Autonomous Database Core", status: "operational" },
      { id: "oci-compute", name: "OCI Glass Compute Rails", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "digitalocean",
    name: "DigitalOcean",
    category: "Cloud",
    status: "operational",
    latency: 52,
    uptime: 99.91,
    description: "Cloud Hosting Simplified for Developers",
    icon: "CloudRain",
    dependencies: [],
    components: [
      { id: "do-droplets", name: "Droplets Compute Layer", status: "operational" },
      { id: "do-spaces", name: "Spaces Object Storage", status: "operational" }
    ],
    lastChecked: "Just now"
  },

  // --- CDN & Edge ---
  {
    id: "cloudflare",
    name: "Cloudflare",
    category: "CDN & Edge",
    status: "operational",
    latency: 18,
    uptime: 99.995,
    description: "Edge Routing, DDoS Protection & Serverless DNS",
    icon: "Globe",
    dependencies: [],
    components: [
      { id: "cf-edge", name: "Anycast High-Speed CDN Edge", status: "operational" },
      { id: "cf-workers", name: "Serverless Workers Runtime", status: "operational" },
      { id: "cf-pages", name: "Pages & Static Analytics", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "fastly",
    name: "Fastly",
    category: "CDN & Edge",
    status: "operational",
    latency: 22,
    uptime: 99.98,
    description: "Highly configurable edge cloud and caching platform",
    icon: "Wind",
    dependencies: [],
    components: [
      { id: "fast-delivery", name: "Edge Realtime Caching Engine", status: "operational" },
      { id: "fast-waf", name: "Next-Gen WAF Guard", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "akamai",
    name: "Akamai",
    category: "CDN & Edge",
    status: "operational",
    latency: 28,
    uptime: 99.992,
    description: "Global enterprise scale Content Delivery Network",
    icon: "ShieldAlert",
    dependencies: [],
    components: [
      { id: "aka-cdn", name: "Enterprise Intelligent Edge CDN", status: "operational" },
      { id: "aka-sec", name: "App & API Protector Security", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "bunny",
    name: "Bunny CDN",
    category: "CDN & Edge",
    status: "operational",
    latency: 34,
    uptime: 99.94,
    description: "Micro-payment highly affordable global caching",
    icon: "Rabbit",
    dependencies: [],
    components: [
      { id: "bunny-routing", name: "Anycast Traffic Director", status: "operational" },
      { id: "bunny-storage", name: "Edge File Storage Node", status: "operational" }
    ],
    lastChecked: "Just now"
  },

  // --- Payments ---
  {
    id: "stripe",
    name: "Stripe",
    category: "Payments",
    status: "operational",
    latency: 88,
    uptime: 99.991,
    description: "Financial Infrastructure for the Internet",
    icon: "CreditCard",
    dependencies: ["aws", "cloudflare"],
    components: [
      { id: "stripe-api", name: "REST API Endpoint Gateway", status: "operational" },
      { id: "stripe-checkout", name: "Hosted Checkout Portal", status: "operational" },
      { id: "stripe-dashboard", name: "Merchant Dashboard Matrix", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "paypal",
    name: "PayPal",
    category: "Payments",
    status: "operational",
    latency: 125,
    uptime: 99.93,
    description: "Global merchant processing and consumer checkout",
    icon: "Wallet",
    dependencies: ["aws"],
    components: [
      { id: "paypal-checkout", name: "Express Smart Checkout Button", status: "operational" },
      { id: "paypal-merchant", name: "Braintree Hub Processing", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "razorpay",
    name: "Razorpay",
    category: "Payments",
    status: "operational",
    latency: 140,
    uptime: 99.88,
    description: "Digital transactions and banking api gateway",
    icon: "Coins",
    dependencies: ["aws"],
    components: [
      { id: "rp-api", name: "Core Payment Engine API", status: "operational" },
      { id: "rp-invoice", name: "Billing & Subscriptions Engine", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "adyen",
    name: "Adyen",
    category: "Payments",
    status: "operational",
    latency: 98,
    uptime: 99.98,
    description: "Unified global payment pipeline platform",
    icon: "Banknote",
    dependencies: [],
    components: [
      { id: "adyen-processing", name: "Acquiring Banking Endpoint", status: "operational" },
      { id: "adyen-token", name: "Edge Tokenization Service", status: "operational" }
    ],
    lastChecked: "Just now"
  },

  // --- Developer ---
  {
    id: "github",
    name: "GitHub",
    category: "Developer",
    status: "operational",
    latency: 64,
    uptime: 99.82,
    description: "Git Collaboration and GitHub Actions CI/CD",
    icon: "Github",
    dependencies: ["azure", "fastly"],
    components: [
      { id: "gh-web", name: "Repositories & Web Hub", status: "operational" },
      { id: "gh-actions", name: "Actions Pipeline Orchestration", status: "operational" },
      { id: "gh-copilot", name: "Copilot Backend Hub", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "gitlab",
    name: "GitLab",
    category: "Developer",
    status: "operational",
    latency: 78,
    uptime: 99.87,
    description: "DevOps lifecycle web workspace and runner engine",
    icon: "Gitlab",
    dependencies: ["gcp"],
    components: [
      { id: "gl-core", name: "GitLab SaaS Code Repository", status: "operational" },
      { id: "gl-ci", name: "GitLab Shared CI Runners", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "vercel",
    name: "Vercel",
    category: "Developer",
    status: "operational",
    latency: 32,
    uptime: 99.99,
    description: "App deployment, Serverless Hosting and Serverless Rails",
    icon: "Triangle",
    dependencies: ["aws", "cloudflare"],
    components: [
      { id: "v-cdn", name: "Edge Caching Router", status: "operational" },
      { id: "v-serverless", name: "Serverless Compute Lambda", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "netlify",
    name: "Netlify",
    category: "Developer",
    status: "operational",
    latency: 35,
    uptime: 99.97,
    description: "Deploy preview static web client platform",
    icon: "Spline",
    dependencies: ["aws", "fastly"],
    components: [
      { id: "net-deploy", name: "Continuous Integration Bot", status: "operational" },
      { id: "net-edge", name: "Netlify Edge Router Network", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "railway",
    name: "Railway",
    category: "Developer",
    status: "operational",
    latency: 58,
    uptime: 99.92,
    description: "Deploy code directly without cloud overhead",
    icon: "Terminal",
    dependencies: ["aws"],
    components: [
      { id: "rail-deploy", name: "Container Deployment Rails", status: "operational" },
      { id: "rail-db", name: "Hosted Postgres/Redis Provisioner", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "render",
    name: "Render",
    category: "Developer",
    status: "operational",
    latency: 60,
    uptime: 99.93,
    description: "Next-gen simple production static & service platform",
    icon: "Layers",
    dependencies: ["aws", "cloudflare"],
    components: [
      { id: "ren-web", name: "Static Web Services", status: "operational" },
      { id: "ren-db", name: "Managed PostgreSQL Node", status: "operational" }
    ],
    lastChecked: "Just now"
  },

  // --- Communication ---
  {
    id: "slack",
    name: "Slack",
    category: "Communication",
    status: "operational",
    latency: 92,
    uptime: 99.96,
    description: "The digital communication matrix for enterprise Teams",
    icon: "SlackSymbol",
    dependencies: ["aws", "cloudflare"],
    components: [
      { id: "slack-messaging", name: "Messaging & Realtime WS Feed", status: "operational" },
      { id: "slack-calls", name: "Huddles WebRTC Channels", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "discord",
    name: "Discord",
    category: "Communication",
    status: "operational",
    latency: 75,
    uptime: 99.85,
    description: "Voice, Text & Video Hub with Edge Voice gateways",
    icon: "MessageSquare",
    dependencies: ["gcp", "cloudflare"],
    components: [
      { id: "disc-gateways", name: "Voice Gateway Orchestrator", status: "operational" },
      { id: "disc-messages", name: "REST API & WS Gateways", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "zoom",
    name: "Zoom",
    category: "Communication",
    status: "operational",
    latency: 110,
    uptime: 99.94,
    description: "Direct video conferencing cloud hub",
    icon: "Video",
    dependencies: ["aws", "oracle"],
    components: [
      { id: "zoom-meetings", name: "High Definition Meeting Audio/Video", status: "operational" },
      { id: "zoom-phone", name: "Enterprise Zoom Phone Core", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "twilio",
    name: "Twilio",
    category: "Communication",
    status: "operational",
    latency: 85,
    uptime: 99.992,
    description: "Telephony, SMS APIs and programmable messaging",
    icon: "Smartphone",
    dependencies: ["aws"],
    components: [
      { id: "tw-sms", name: "Programmable SMS Gateway Node", status: "operational" },
      { id: "tw-voice", name: "IP & Mobile PSTN Voice Route", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    category: "Communication",
    status: "operational",
    latency: 130,
    uptime: 99.91,
    description: "Collaborative teamwork hub inside Microsoft Azure Office suite",
    icon: "Users",
    dependencies: ["azure"],
    components: [
      { id: "teams-calling", name: "Audio Calling Multiplexer", status: "operational" },
      { id: "teams-chats", name: "Enterprise Hub Chat Feed", status: "operational" }
    ],
    lastChecked: "Just now"
  },

  // --- DNS ---
  {
    id: "cloudflare-dns",
    name: "Cloudflare DNS",
    category: "DNS",
    status: "operational",
    latency: 11,
    uptime: 99.999,
    description: "Ultra-high performance Anycast Resolver system (1.1.1.1)",
    icon: "Hash",
    dependencies: [],
    components: [
      { id: "cf-resolver", name: "1.1.1.1 Public Active Resolver", status: "operational" },
      { id: "cf-auth-dns", name: "Edge Authoritative DNS Rails", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "route53",
    name: "Amazon Route53",
    category: "DNS",
    status: "operational",
    latency: 15,
    uptime: 99.999,
    description: "Elastic SLA backed Cloud Authoritative Traffic DNS Router",
    icon: "Route",
    dependencies: ["aws"],
    components: [
      { id: "r53-auth", name: "Worldwide Authoritative Name-servers", status: "operational" },
      { id: "r53-health", name: "Active Endpoint SLA Health Monitors", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "google-dns",
    name: "Google Public DNS",
    category: "DNS",
    status: "operational",
    latency: 13,
    uptime: 99.999,
    description: "Global Public Resolver (8.8.8.8 / 8.8.4.4) Network",
    icon: "Activity",
    dependencies: ["gcp"],
    components: [
      { id: "goog-resolver", name: "8.8.8.8 Active Resolver Hub", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "quad9",
    name: "Quad9 DNS",
    category: "DNS",
    status: "operational",
    latency: 24,
    uptime: 99.98,
    description: "DDoS and malicious threat blocking secure resolver",
    icon: "Eye",
    dependencies: [],
    components: [
      { id: "q9-threat", name: "Secure Threat-Filtered API Node", status: "operational" }
    ],
    lastChecked: "Just now"
  },

  // --- Social ---
  {
    id: "reddit",
    name: "Reddit",
    category: "Social",
    status: "operational",
    latency: 165,
    uptime: 99.52,
    description: "Public discussion forums and voting feed systems",
    icon: "MessageCircle",
    dependencies: ["aws", "fastly"],
    components: [
      { id: "red-front", name: "Consumer Feeds & Comments Rails", status: "operational" },
      { id: "red-media", name: "Image & Video Content Server", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "x",
    name: "X (formerly Twitter)",
    category: "Social",
    status: "operational",
    latency: 125,
    uptime: 99.71,
    description: "Global realtime micro-blogging and media network",
    icon: "TwitterSymbol",
    dependencies: ["gcp", "oracle"],
    components: [
      { id: "x-timeline", name: "Chronological Feed Services", status: "operational" },
      { id: "x-media", name: "Video Streaming Content Distributor", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    category: "Social",
    status: "operational",
    latency: 115,
    uptime: 99.91,
    description: "Professional networking and jobs matrix dashboard",
    icon: "Linkedin",
    dependencies: ["azure"],
    components: [
      { id: "li-jobs", name: "Jobs Directory & Search Index", status: "operational" },
      { id: "li-feed", name: "Main Professional Feed Platform", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "facebook",
    name: "Facebook",
    category: "Social",
    status: "operational",
    latency: 85,
    uptime: 99.96,
    description: "Meta social graph and media infrastructure",
    icon: "Rss",
    dependencies: [],
    components: [
      { id: "fb-graph", name: "Core Graph API Connector", status: "operational" },
      { id: "fb-feed", name: "News Feed Delivery Cloud", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "instagram",
    name: "Instagram",
    category: "Social",
    status: "operational",
    latency: 90,
    uptime: 99.88,
    description: "Photo and media social network infrastructure",
    icon: "Camera",
    dependencies: ["facebook"],
    components: [
      { id: "ig-stories", name: "Reels & Stories CDN server", status: "operational" },
      { id: "ig-activity", name: "Live Feed & Message Routing", status: "operational" }
    ],
    lastChecked: "Just now"
  },
  {
    id: "youtube",
    name: "YouTube",
    category: "Social",
    status: "operational",
    latency: 68,
    uptime: 99.98,
    description: "Global video catalog sharing and streaming network",
    icon: "Youtube",
    dependencies: ["gcp"],
    components: [
      { id: "yt-stream", name: "Realtime Video Players CDN Engine", status: "operational" },
      { id: "yt-upload", name: "Video Encorder & Processing Nodes", status: "operational" }
    ],
    lastChecked: "Just now"
  }
];

const INITIAL_INCIDENTS: Incident[] = [
  {
    id: "inc-1",
    serviceId: "github",
    serviceName: "GitHub",
    severity: "major",
    title: "GitHub Actions degraded performance in US-WEST",
    description: "Engineering is investigating reports of delays in launching GitHub Actions runners in the US-West sub-cluster. API requests are unaffected.",
    status: "identified",
    startedAt: "25 minutes ago",
    updatedAt: "10 minutes ago",
    timeline: [
      {
        time: "10 minutes ago",
        status: "identified",
        message: "We have isolated the runner queues in the US-West-2 cluster. Mitigations are being engineered to balance active runs into European backup nodes."
      },
      {
        time: "25 minutes ago",
        status: "investigating",
        message: "We are investigating elevated times for GitHub Actions workflow startups. Queue latency has climbed past normal tolerances."
      }
    ]
  },
  {
    id: "inc-2",
    serviceId: "reddit",
    serviceName: "Reddit",
    severity: "minor",
    title: "Reddit elevated server error rates and slow image loads",
    description: "Users are receiving 500 server errors when loading secondary comments or posting images into selected forums.",
    status: "investigating",
    startedAt: "40 minutes ago",
    updatedAt: "40 minutes ago",
    timeline: [
      {
        time: "40 minutes ago",
        status: "investigating",
        message: "We are auditing elevated 502/504 errors on media rendering gateways. Engineers are reviewing edge cache configurations."
      }
    ]
  }
];

const INITIAL_LOGS: ActivityLog[] = [
  { id: "log-1", time: "22:31:02", serviceId: "cloudflare-dns", serviceName: "Cloudflare DNS", type: "ping", message: "Ping round-trip resolved successfully (8.5 ms)", status: "success" },
  { id: "log-2", time: "22:31:15", serviceId: "stripe", serviceName: "Stripe", type: "ping", message: "Secure checkout handshake complete (89 ms)", status: "success" },
  { id: "log-3", time: "22:31:40", serviceId: "openai", serviceName: "OpenAI", type: "ping", message: "GPT-4o response pipeline checked (148 ms)", status: "success" },
  { id: "log-4", time: "22:31:55", serviceId: "github", serviceName: "GitHub", type: "incident_start", message: "Actions launcher latency exceeded threshold: US-West-2 queue at +420s", status: "error" },
  { id: "log-5", time: "22:32:10", serviceId: "reddit", serviceName: "Reddit", type: "ping", message: "Subreddit feed fetch reported elevated warnings (502 error on /r/all)", status: "warning" },
  { id: "log-6", time: "22:32:18", serviceId: "gcp", serviceName: "Google Cloud", type: "ping", message: "Health gateway operational: GKE master nodes responsive (41 ms)", status: "success" }
];

const GENERATE_HISTORICAL_POINTS = (): IndexHistoryPoint[] => {
  const points: IndexHistoryPoint[] = [];
  const startHours = 24;
  for (let i = startHours; i >= 0; i--) {
    const d = new Date();
    d.setMinutes(d.getMinutes() - i * 30);
    const hourStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let val = 100;
    if (i === 12) val = 95.5;
    else if (i === 11) val = 94.2;
    else if (i === 10) val = 96.0;
    else if (i === 4) val = 98.2;
    // slightly randomize near 98
    else val = Math.max(97.2, Math.min(100, 97.8 + (Math.sin(i / 2) * 1.5) + (Math.random() * 0.4)));
    points.push({ time: hourStr, ipi: parseFloat(val.toFixed(1)) });
  }
  return points;
};

const STATIC_HISTORICAL_POINTS = (): IndexHistoryPoint[] => {
  const points: IndexHistoryPoint[] = [];
  const startHours = 24;
  for (let i = startHours; i >= 0; i--) {
    // Generate static, 100% deterministic time labels for the initial SSR render
    const hour = (24 - Math.floor(i / 2)) % 24;
    const min = (i % 2 === 0) ? "00" : "30";
    const hourStr = `${hour.toString().padStart(2, '0')}:${min}`;
    
    let val = 100;
    if (i === 12) val = 95.5;
    else if (i === 11) val = 94.2;
    else if (i === 10) val = 96.0;
    else if (i === 4) val = 98.2;
    else val = Math.max(97.2, Math.min(100, 97.8 + (Math.sin(i / 2) * 1.5) + (Math.sin(i * 3) * 0.3)));
    
    points.push({ time: hourStr, ipi: parseFloat(val.toFixed(1)) });
  }
  return points;
};

function sSeverityMultiplier(sev: string): number {
  if (sev === "critical") return 3;
  if (sev === "major") return 2;
  if (sev === "minor") return 1;
  return 0;
}

const getDeterministicValue = (str: string, range: number, min: number = 0): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return min + Math.abs(hash % range);
};

const ENRICH_SERVICE = (s: Service): Service => {
  const isHighTraffic = s.id === "openai" || s.id === "cloudflare" || s.id === "cloudflare-dns" || s.id === "aws" || s.id === "gcp" || s.id === "google-dns";
  const defaultRps = isHighTraffic
    ? getDeterministicValue(s.id, 3800, 1200)
    : getDeterministicValue(s.id, 850, 150);
  const defaultCpu = getDeterministicValue(s.id, 25, 15);
  const defaultErr = s.status === "operational"
    ? parseFloat((getDeterministicValue(s.id, 20) / 1000).toFixed(3))
    : parseFloat((getDeterministicValue(s.id, 15, 5)).toFixed(2));
  return {
    ...s,
    requestRate: s.requestRate ?? defaultRps,
    errorRate: s.errorRate ?? defaultErr,
    cpuLoad: s.cpuLoad ?? defaultCpu
  };
};

const ENRICHED_INITIAL_SERVICES = INITIAL_SERVICES.map(ENRICH_SERVICE);

const PulseContext = createContext<PulseContextType | undefined>(undefined);

export const PulseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>(ENRICHED_INITIAL_SERVICES);
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_LOGS);
  const [historyPoints, setHistoryPoints] = useState<IndexHistoryPoint[]>(STATIC_HISTORICAL_POINTS());

  // Overwrite with timezone-specific dates on mount strictly on the client side asynchronously
  useEffect(() => {
    const timerId = setTimeout(() => {
      setHistoryPoints(GENERATE_HISTORICAL_POINTS());
    }, 0);
    return () => clearTimeout(timerId);
  }, []);
  
  // Derived state calculated dynamically per render to prevent infinite setState cycles in effect
  const majorOutagesCount = services.filter(s => s.status === "outage").length;
  const degradedCount = services.filter(s => s.status === "degraded").length;
  const activeIncidents = incidents.filter(i => sSeverityMultiplier(i.severity) > 0).length;

  let baseVal = 100.0;
  baseVal -= (majorOutagesCount * 18.5);
  baseVal -= (degradedCount * 4.2);
  baseVal -= (activeIncidents * 2.1);
  
  const ipi = Math.max(0, Math.min(100, parseFloat(baseVal.toFixed(1))));

  const [lastUpdated, setLastUpdated] = useState<string>("6 seconds ago");
  const [activeView, setActiveView] = useState<string>("dashboard");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [useLiveFetching, setUseLiveFetching] = useState<boolean>(false);
  
  const tickCounter = useRef<number>(6);

  // Sync historical points inside a safe lifecycle
  useEffect(() => {
    const timerId = setTimeout(() => {
      setHistoryPoints(prev => {
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const currentPoints = [...prev];
        if (currentPoints.length > 30) {
          currentPoints.shift();
        }
        // only push if different from previous to prevent cascading loops
        if (currentPoints.length > 0 && currentPoints[currentPoints.length - 1].ipi === ipi) {
          return prev;
        }
        return [...currentPoints, { time: nowStr, ipi }];
      });
    }, 0);
    return () => clearTimeout(timerId);
  }, [ipi]);


  // Handle live updating text ticks
  useEffect(() => {
    const timer = setInterval(() => {
      tickCounter.current += 1;
      if (tickCounter.current < 60) {
        setLastUpdated(`${tickCounter.current} seconds ago`);
      } else {
        const mins = Math.floor(tickCounter.current / 60);
        setLastUpdated(`${mins} minute${mins > 1 ? "s" : ""} ago`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Live Simulation Heartbeat
  useEffect(() => {
    const simTimer = setInterval(() => {
      // Manual reset update counter
      tickCounter.current = 0;
      setLastUpdated("Just now");

      // Fluctuates latencies and real-time telemetries for all services
      setServices(prev => 
        prev.map(serv => {
          let latChange = Math.floor((Math.random() * 12) - 6); // -6 to +6ms
          let newLat = Math.max(10, serv.latency + latChange);
          
          const rpsDelta = Math.floor((Math.random() * 10) - 5);
          const newRps = Math.max(10, (serv.requestRate ?? 150) + rpsDelta);
          
          let newCpu = (serv.cpuLoad ?? 20) + Math.floor((Math.random() * 6) - 3);
          newCpu = Math.max(5, Math.min(99, newCpu));
          
          let newErr = serv.errorRate ?? 0;
          if (serv.status === "operational") {
            newErr = parseFloat(Math.max(0, Math.min(0.25, (serv.errorRate ?? 0) + (Math.random() * 0.008 - 0.004))).toFixed(3));
          } else {
            newErr = parseFloat(Math.max(1.5, Math.min(98.5, (serv.errorRate ?? 15) + (Math.random() * 4 - 2))).toFixed(2));
          }

          return {
            ...serv,
            latency: newLat,
            requestRate: newRps,
            cpuLoad: newCpu,
            errorRate: newErr
          };
        })
      );

      // Random logs
      const randomService = services[Math.floor(Math.random() * services.length)];
      if (randomService && Math.random() > 0.3) {
        setActivityLogs(prev => {
          const now = new Date();
          const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const isSuccessful = randomService.status === "operational";
          const newLog: ActivityLog = {
            id: `log-${Date.now()}`,
            time: timeStr,
            serviceId: randomService.id,
            serviceName: randomService.name,
            type: "ping",
            message: isSuccessful 
              ? `Dynamic health check ok: latency responsive (${randomService.latency} ms)` 
              : `Dynamic health query degraded: node status reports secondary server failure.`,
            status: isSuccessful ? "success" : "warning"
          };
          const logs = [newLog, ...prev];
          return logs.slice(0, 100); // Max 100
        });
      }
    }, 5000);

    return () => clearInterval(simTimer);
  }, [services]);

  // Handle client-side CORS status-page updates when activated
  const manualUpdate = async () => {
    tickCounter.current = 0;
    setLastUpdated("Just now");
    
    // Push manual system check log
    setActivityLogs(prev => [
      {
        id: `sys-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        serviceId: "system",
        serviceName: "iPulse Platform",
        type: "system",
        message: "Manual system audit dispatched. Running verification queries to all providers",
        status: "info"
      },
      ...prev
    ]);

    if (!useLiveFetching) {
      // Fluctuates everything beautifully
      setServices(prev => prev.map(s => ({
        ...s,
        latency: Math.max(10, s.latency + Math.floor(Math.random() * 20 - 10))
      })));
      return;
    }

    // Try fetching OpenAI and GitHub raw client-side APIs (graceful CORS fallbacks)
    try {
      const gRes = await fetch("https://kcttw9z7x1gx.statuspage.io/api/v2/summary.json");
      if (gRes.ok) {
        const data = await gRes.json();
        const indicator = data.status.indicator; // 'none', 'minor', 'major', 'critical'
        const rawStatus: Status = indicator === "none" ? "operational" : indicator === "minor" ? "degraded" : "outage";
        
        setServices(prev => prev.map(s => {
          if (s.id === "github") {
            return {
              ...s,
              status: rawStatus,
              components: s.components.map(comp => ({
                ...comp,
                status: comp.id === "gh-web" && rawStatus !== "operational" ? rawStatus : "operational"
              }))
            };
          }
          return s;
        }));

        setActivityLogs(prev => [
          {
            id: `live-gh-${Date.now()}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            serviceId: "github",
            serviceName: "GitHub",
            type: "ping",
            message: `Live data fetched successfully. Atlassian Statuspage reports Indicator: "${indicator}"`,
            status: indicator === "none" ? "success" : "warning"
          },
          ...prev
        ]);
      }
    } catch (err) {
      console.log("CORS limits live fetch, falling back securely.");
    }
  };

  const repairAll = () => {
    setServices(ENRICHED_INITIAL_SERVICES);
    setIncidents([]);
    setActivityLogs(prev => [
      {
        id: `rep-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        serviceId: "system",
        serviceName: "iPulse Platform",
        type: "system",
        message: "Sovereign Override: All service anomalies corrected. Global architecture operational.",
        status: "success"
      },
      ...prev
    ]);
  };

  const toggleMockFetch = () => {
    setUseLiveFetching(prev => !prev);
    setActivityLogs(prev => [
      {
        id: `fetch-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        serviceId: "system",
        serviceName: "iPulse Platform",
        type: "system",
        message: `Edge Live-Fetching ${!useLiveFetching ? "ENABLED" : "DISABLED"}. CORS bypass initialized.`,
        status: "info"
      },
      ...prev
    ]);
  };

  const triggerScenario = (scenario: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (scenario === "cloudflare") {
      // Cloudflare Outage -> Cascading effects on DNS, CDN, Discord, Vercel, Netlify, OpenAI
      setServices(prev => prev.map(s => {
        if (s.id === "cloudflare") {
          return {
            ...s,
            status: "outage",
            latency: 999,
            components: s.components.map(c => ({ ...c, status: "outage" }))
          };
        }
        if (s.id === "cloudflare-dns") {
          return {
            ...s,
            status: "outage",
            latency: 820,
            components: s.components.map(c => ({ ...c, status: "outage" }))
          };
        }
        if (["vercel", "netlify", "discord", "openai"].includes(s.id)) {
          return {
            ...s,
            status: "degraded",
            latency: s.latency * 3,
            components: s.components.map(c => ({ ...c, status: "degraded" }))
          };
        }
        return s;
      }));

      // Incident record
      const cfIncident: Incident = {
        id: "cf-disaster",
        serviceId: "cloudflare",
        serviceName: "Cloudflare",
        severity: "critical",
        title: "Global Anycast Node Route Leak Outage",
        description: "A border gateway protocol (BGP) route leak has disrupted traffic across multiple Cloudflare Core Anycast edge nodes, leading to severe DNS resolves drops and routing downtime.",
        status: "investigating",
        startedAt: "Just now",
        updatedAt: "Just now",
        timeline: [
          {
            time: "Just now",
            status: "investigating",
            message: "Our network operations center has detected major packet loss on global routers. Engineers are identifying routing tables and applying filtering options on Tier 1 providers."
          }
        ]
      };

      setIncidents(prev => [cfIncident, ...prev]);

      setActivityLogs(prev => [
        {
          id: `dis-${Date.now()}`,
          time: timeStr,
          serviceId: "cloudflare",
          serviceName: "Cloudflare",
          type: "incident_start",
          message: "CRITICAL OUTAGE ALERT: BGP anomaly detected on AS13335. Anycast DNS failing.",
          status: "error"
        },
        {
          id: `dis-ver-${Date.now()}`,
          time: timeStr,
          serviceId: "vercel",
          serviceName: "Vercel",
          type: "incident_update",
          message: "Cascading Degradation: Vercel serverless functions reporting connection timeouts due to upstream CDN failure.",
          status: "warning"
        },
        ...prev
      ]);

    } else if (scenario === "aws") {
      // AWS US-EAST-1 Storage Degradation
      setServices(prev => prev.map(s => {
        if (s.id === "aws") {
          return {
            ...s,
            status: "degraded",
            latency: 280,
            components: s.components.map(c => c.id === "us-east-s3" ? { ...c, status: "outage" } : c)
          };
        }
        if (["github", "railway", "render", "slack", "stripe"].includes(s.id)) {
          return {
            ...s,
            status: "degraded",
            components: s.components.map(c => c.name.toLowerCase().includes("s3") || c.name.toLowerCase().includes("storage") || c.name.toLowerCase().includes("pipeline") ? { ...c, status: "outage" } : { ...c, status: "degraded" })
          };
        }
        return s;
      }));

      const awsIncident: Incident = {
        id: "aws-disaster",
        serviceId: "aws",
        serviceName: "AWS",
        severity: "major",
        title: "US-EAST-1 S3 Object Allocation Failure",
        description: "Amazon S3 server in North Virginia region is showing elevated API errors and increased error rates for PutObject and GetObject requests, delaying upstream static web deployments.",
        status: "identified",
        startedAt: "Just now",
        updatedAt: "Just now",
        timeline: [
          {
            time: "Just now",
            status: "identified",
            message: "Identified a memory-handling lockout in the S3 sub-cluster responsible for transaction logs in us-east-1. Safe failover protocols are actively syncing."
          }
        ]
      };

      setIncidents(prev => [awsIncident, ...prev]);

      setActivityLogs(prev => [
        {
          id: `dis-aws-${Date.now()}`,
          time: timeStr,
          serviceId: "aws",
          serviceName: "AWS",
          type: "incident_start",
          message: "MAJOR ALERT: AWS S3 storage API errors surging in Northern Virginia location.",
          status: "error"
        },
        {
          id: `dis-gh-aws-${Date.now()}`,
          time: timeStr,
          serviceId: "github",
          serviceName: "GitHub",
          type: "incident_update",
          message: "S3 dependent CI cache writes failing globally.",
          status: "warning"
        },
        ...prev
      ]);

    } else if (scenario === "stripe") {
      // Global Stripe Payments Latency
      setServices(prev => prev.map(s => {
        if (s.id === "stripe") {
          return {
            ...s,
            status: "outage",
            latency: 1800,
            components: s.components.map(c => ({ ...c, status: c.id === "stripe-api" ? "outage" : "degraded" }))
          };
        }
        return s;
      }));

      const stripeIncident: Incident = {
        id: "stripe-disaster",
        serviceId: "stripe",
        serviceName: "Stripe",
        severity: "major",
        title: "Worldwide API Gateway Outage",
        description: "Stripe APIs are reporting global connection failures and timeouts. Webhooks are currently queued.",
        status: "investigating",
        startedAt: "Just now",
        updatedAt: "Just now",
        timeline: [
          {
            time: "Just now",
            status: "investigating",
            message: "Analyzing secondary database deadlocks on the core transaction database. Traffic is being throttled safely."
          }
        ]
      };

      setIncidents(prev => [stripeIncident, ...prev]);

      setActivityLogs(prev => [
        {
          id: `dis-str-${Date.now()}`,
          time: timeStr,
          serviceId: "stripe",
          serviceName: "Stripe",
          type: "incident_start",
          message: "OUTAGE TRACKER: Stripe API returns high density of gateway timeout errors.",
          status: "error"
        },
        ...prev
      ]);
    } else if (scenario === "gemini") {
      // Gemini API load issue
      setServices(prev => prev.map(s => {
        if (s.id === "gemini") {
          return {
            ...s,
            status: "degraded",
            latency: 950,
            components: s.components.map(c => ({ ...c, status: "degraded" }))
          };
        }
        return s;
      }));

      const geminiIncident: Incident = {
        id: "gemini-latency",
        serviceId: "gemini",
        serviceName: "Gemini",
        severity: "minor",
        title: "Gemini API Elevated Response Latency",
        description: "Google Gemini Developer endpoints are serving requests with high latency due to a capacity spike in Asian and European regions.",
        status: "identified",
        startedAt: "Just now",
        updatedAt: "Just now",
        timeline: [
          {
            time: "Just now",
            status: "identified",
            message: "Root cause found in hardware cluster allocation in zone asia-southeast1. Auto-scaling routines are currently warming up additional TPU pods."
          }
        ]
      };

      setIncidents(prev => [geminiIncident, ...prev]);

      setActivityLogs(prev => [
        {
          id: `dis-gem-${Date.now()}`,
          time: timeStr,
          serviceId: "gemini",
          serviceName: "Gemini",
          type: "incident_start",
          message: "ALERT: Gemini model inference cluster latency rose to +800ms.",
          status: "warning"
        },
        ...prev
      ]);
    }
  };

  return (
    <PulseContext.Provider
      value={{
        services,
        incidents,
        activityLogs,
        historyPoints,
        ipi,
        lastUpdated,
        activeView,
        setActiveView,
        searchQuery,
        setSearchQuery,
        triggerScenario,
        repairAll,
        toggleMockFetch,
        useLiveFetching,
        manualUpdate
      }}
    >
      {children}
    </PulseContext.Provider>
  );
};

export const usePulse = () => {
  const context = useContext(PulseContext);
  if (!context) {
    throw new Error("usePulse must be used within a PulseProvider");
  }
  return context;
};
