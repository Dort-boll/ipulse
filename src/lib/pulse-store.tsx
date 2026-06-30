import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Service, Incident, ActivityLog, HistoryPoint, Status } from "./pulse-types";
import { fetchProviderStatus } from "../engine/ingestion";
import { discoverProviders } from "../engine/discovery";

interface PulseContextType {
  services: Service[];
  incidents: Incident[];
  activityLogs: ActivityLog[];
  historyPoints: HistoryPoint[];
  ipi: number;
  lastUpdated: string;
  activeView: string;
  setActiveView: (view: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  triggerScenario: (scenario: string) => void;
  repairAll: () => void;
  toggleMockFetch: () => void;
  useLiveFetching: boolean;
  manualUpdate: () => void;
}

const PulseContext = createContext<PulseContextType | undefined>(undefined);

const INITIAL_SERVICES: Service[] = [
  {
    id: "gcp",
    name: "Google Cloud Platform",
    category: "Cloud",
    description: "Multi-region compute, Spanner database networks, and global VPC routing.",
    status: "operational",
    icon: "Cloud",
    latency: 14,
    uptime: 99.99,
    cpuLoad: 24,
    errorRate: 0.0,
    requestRate: 840,
    dependencies: [],
    components: [
      { id: "gcp-spanner", name: "Cloud Spanner Engine", status: "operational" },
      { id: "gcp-gke", name: "GKE Kubernetes Control Plane", status: "operational" },
      { id: "gcp-iam", name: "Cloud IAM Identity Services", status: "operational" }
    ]
  },
  {
    id: "aws",
    name: "Amazon Web Services",
    category: "Cloud",
    description: "US-East, US-West core S3 allocators and EC2 compute hypervisors.",
    status: "operational",
    icon: "CloudRain",
    latency: 28,
    uptime: 99.95,
    cpuLoad: 31,
    errorRate: 0.01,
    requestRate: 1240,
    dependencies: [],
    components: [
      { id: "aws-s3", name: "S3 Object Storage Gateways", status: "operational" },
      { id: "aws-ec2", name: "EC2 Hypervisor Clusters", status: "operational" },
      { id: "aws-iam", name: "AWS IAM Policy Validators", status: "operational" }
    ]
  },
  {
    id: "azure",
    name: "Microsoft Azure",
    category: "Cloud",
    description: "Enterprise directory structures and global cloud database sync layers.",
    status: "operational",
    icon: "Database",
    latency: 32,
    uptime: 99.92,
    cpuLoad: 28,
    errorRate: 0.02,
    requestRate: 980,
    dependencies: [],
    components: [
      { id: "azure-ad", name: "Entra ID Identity Services", status: "operational" },
      { id: "azure-sql", name: "Azure SQL Sync Instances", status: "operational" }
    ]
  },
  {
    id: "cloudflare",
    name: "Cloudflare Edge",
    category: "CDN & Edge",
    description: "Global Anycast server mesh, CDN caching, and DDoS mitigation barriers.",
    status: "operational",
    icon: "Globe",
    latency: 6,
    uptime: 99.98,
    cpuLoad: 12,
    errorRate: 0.0,
    requestRate: 3450,
    dependencies: ["aws", "gcp"],
    components: [
      { id: "cf-dns", name: "1.1.1.1 DNS Nameservers", status: "operational" },
      { id: "cf-waf", name: "DDoS Mitigation Firewall", status: "operational" },
      { id: "cf-workers", name: "Cloudflare Workers Runtime", status: "operational" }
    ]
  },
  {
    id: "fastly",
    name: "Fastly CDN",
    category: "CDN & Edge",
    description: "Varnish cache integration and low-latency edge computing corridors.",
    status: "operational",
    icon: "Wind",
    latency: 9,
    uptime: 99.91,
    cpuLoad: 15,
    errorRate: 0.01,
    requestRate: 1820,
    dependencies: ["aws"],
    components: [
      { id: "fastly-pop", name: "Edge Varnish Shield Points", status: "operational" },
      { id: "fastly-purge", name: "Instant Purge Pipelines", status: "operational" }
    ]
  },
  {
    id: "openai",
    name: "OpenAI API",
    category: "AI",
    description: "GPT model endpoints, deep embedding spaces, and semantic AI nodes.",
    status: "operational",
    icon: "Atom",
    latency: 184,
    uptime: 99.64,
    cpuLoad: 68,
    errorRate: 0.04,
    requestRate: 420,
    dependencies: ["azure", "cloudflare"],
    components: [
      { id: "openai-gpt4", name: "GPT-4 Inference Cluster", status: "operational" },
      { id: "openai-embed", name: "Semantic Embedding Spaces", status: "operational" }
    ]
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    category: "AI",
    description: "Claude models routing on AWS Bedrock and private TPU clusters.",
    status: "operational",
    icon: "Brain",
    latency: 210,
    uptime: 99.71,
    cpuLoad: 55,
    errorRate: 0.05,
    requestRate: 280,
    dependencies: ["aws"],
    components: [
      { id: "anthropic-claude", name: "Claude API Inference System", status: "operational" }
    ]
  },
  {
    id: "gemini",
    name: "Google Gemini AI",
    category: "AI",
    description: "Gemini models execution on Google TPU pods and AI Studio backplanes.",
    status: "operational",
    icon: "Sparkles",
    latency: 95,
    uptime: 99.88,
    cpuLoad: 42,
    errorRate: 0.02,
    requestRate: 510,
    dependencies: ["gcp"],
    components: [
      { id: "gemini-flash", name: "Gemini 2.5 Flash Clusters", status: "operational" },
      { id: "gemini-pro", name: "Gemini 2.5 Pro High-Cap Pods", status: "operational" }
    ]
  },
  {
    id: "stripe",
    name: "Stripe Merchant Grid",
    category: "Payments",
    description: "Global checkout corridors, financial settlement, and fraud protection.",
    status: "operational",
    icon: "CreditCard",
    latency: 45,
    uptime: 99.99,
    cpuLoad: 21,
    errorRate: 0.0,
    requestRate: 890,
    dependencies: ["aws", "cloudflare"],
    components: [
      { id: "stripe-checkout", name: "Checkout API Endpoints", status: "operational" },
      { id: "stripe-radar", name: "Radar Fraud Classifier", status: "operational" }
    ]
  },
  {
    id: "github",
    name: "GitHub Infrastructure",
    category: "Developer",
    description: "Git repositories hosting, Pages publishing, and Actions runner pools.",
    status: "operational",
    icon: "Github",
    latency: 21,
    uptime: 99.85,
    cpuLoad: 18,
    errorRate: 0.03,
    requestRate: 640,
    dependencies: ["aws", "azure", "fastly"],
    components: [
      { id: "gh-repos", name: "Git Core Server Backends", status: "operational" },
      { id: "gh-actions", name: "Actions Cloud Runner Pools", status: "operational" }
    ]
  },
  {
    id: "vercel",
    name: "Vercel Platform",
    category: "Developer",
    description: "Serverless web hosting routing and global edge SSR gateways.",
    status: "operational",
    icon: "Triangle",
    latency: 12,
    uptime: 99.97,
    cpuLoad: 14,
    errorRate: 0.0,
    requestRate: 2450,
    dependencies: ["aws", "cloudflare", "github"],
    components: [
      { id: "vercel-ssr", name: "Serverless Edge SSR Functions", status: "operational" },
      { id: "vercel-cdn", name: "Vercel Edge Cache Rails", status: "operational" }
    ]
  },
  {
    id: "discord",
    name: "Discord Gateway",
    category: "Communication",
    description: "Real-time WebSockets gateways, voice servers, and community chat channels.",
    status: "operational",
    icon: "Slack",
    latency: 18,
    uptime: 99.89,
    cpuLoad: 45,
    errorRate: 0.03,
    requestRate: 1120,
    dependencies: ["gcp", "cloudflare"],
    components: [
      { id: "discord-websockets", name: "Realtime WebSocket Hubs", status: "operational" },
      { id: "discord-voice", name: "RTC Voice Relay Channels", status: "operational" }
    ]
  },
  {
    id: "cloudflare-dns",
    name: "Anycast DNS Hubs",
    category: "DNS",
    description: "1.1.1.1 recursive nameservers and global domain directory root propagation.",
    status: "operational",
    icon: "Hash",
    latency: 4,
    uptime: 100.0,
    cpuLoad: 8,
    errorRate: 0.0,
    requestRate: 4800,
    dependencies: ["cloudflare"],
    components: [
      { id: "dns-recursive", name: "Recursive Resolver Pool", status: "operational" },
      { id: "dns-authoritative", name: "Authoritative Root Sync", status: "operational" }
    ]
  },
  {
    id: "linkedin",
    name: "LinkedIn Pro-Grid",
    category: "Social",
    description: "Corporate directory feed algorithms and profile cache synchronization engines.",
    status: "operational",
    icon: "Users",
    latency: 48,
    uptime: 99.91,
    cpuLoad: 22,
    errorRate: 0.01,
    requestRate: 350,
    dependencies: ["azure"],
    components: [
      { id: "li-feed", name: "Pulse Feed Delivery Graph", status: "operational" }
    ]
  }
];

const INITIAL_HISTORY: HistoryPoint[] = [
  { time: "22:00", ipi: 99.8 },
  { time: "23:00", ipi: 99.7 },
  { time: "00:00", ipi: 99.6 },
  { time: "01:00", ipi: 99.9 },
  { time: "02:00", ipi: 99.8 },
  { time: "03:00", ipi: 99.9 },
  { time: "04:00", ipi: 99.8 },
  { time: "05:00", ipi: 99.9 },
  { time: "Live", ipi: 99.9 }
];

const INITIAL_LOGS: ActivityLog[] = [
  { id: "l-1", time: "06:12:04", serviceName: "Cloudflare", message: "Anycast query propagation successful across 310 PoPs. Edge caches nominal.", status: "success" },
  { id: "l-2", time: "06:12:15", serviceName: "Google Cloud", message: "Spanner multi-write latency benchmark: 11ms. Database clusters in complete sync.", status: "success" },
  { id: "l-3", time: "06:12:30", serviceName: "OpenAI API", message: "GPT-4 inference server load spikes slightly (+15ms). Scaling TPU pod nodes...", status: "warning" },
  { id: "l-4", time: "06:12:45", serviceName: "Stripe", message: "Merchant Checkout handshake success: 200 OK. Auth token verified.", status: "success" }
];

export const PulseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_LOGS);
  const [historyPoints, setHistoryPoints] = useState<HistoryPoint[]>(INITIAL_HISTORY);
  const [ipi, setIpi] = useState<number>(100);
  const [lastUpdated, setLastUpdated] = useState<string>("Just now");
  const [activeView, setActiveView] = useState<string>("intro");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [useLiveFetching, setUseLiveFetching] = useState<boolean>(true);

  // Calculate global Internet Pulse Index
  const calculateIpi = useCallback((serviceList: Service[]) => {
    let totalScore = 0;
    serviceList.forEach(s => {
      if (s.status === "operational") totalScore += 100;
      else if (s.status === "maintenance") totalScore += 90;
      else if (s.status === "degraded") totalScore += 70;
      else if (s.status === "outage") totalScore += 15;
    });
    return Math.min(100, parseFloat((totalScore / serviceList.length).toFixed(1)));
  }, []);

  // Update overall IPI on service status shifts
  useEffect(() => {
    const nextIpi = calculateIpi(services);
    setIpi(nextIpi);
    
    // Update live ticker in index list
    setHistoryPoints(prev => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1] = { ...updated[updated.length - 1], ipi: nextIpi };
      }
      return updated;
    });
  }, [services, calculateIpi]);

  // Real-time background simulation sweep
  useEffect(() => {
    if (!useLiveFetching) return;

    const interval = setInterval(() => {
      (async () => {
        // 1. Discovery Simulation
        if (Math.random() > 0.9) {
            const newProviders = await discoverProviders();
            console.log("Discovered:", newProviders);
        }

        // 2. Ingestion Simulation
        if (Math.random() > 0.5) {
            const status = await fetchProviderStatus(services[Math.floor(Math.random() * services.length)].id, 'statuspage');
            setServices(prev => prev.map(s => s.id === status.providerId ? { ...s, status: status.status as Status } : s));
        }
      })();

      // 3. Randomly update service performance statistics slightly (within acceptable margin)
      setServices(prev => {
        return prev.map(s => {
          if (s.status === "outage" || s.status === "degraded") {
            return {
              ...s,
              latency: Math.max(120, s.latency + Math.floor(Math.sin(Date.now() / 1000) * 8)),
              cpuLoad: Math.min(99, Math.max(80, (s.cpuLoad ?? 80) + Math.floor(Math.random() * 4) - 2)),
              errorRate: parseFloat(Math.min(18.5, Math.max(5.2, (s.errorRate ?? 5.0) + Math.random() * 0.5)).toFixed(2))
            };
          }

          // Standard fluctuations
          const baselineLatency = s.id === "openai" || s.id === "anthropic" ? 180 : s.id === "stripe" ? 40 : s.id === "cloudflare" || s.id === "cloudflare-dns" ? 5 : 20;
          const latencyDelta = Math.floor(Math.sin(Date.now() / 2000) * 4) + Math.floor(Math.random() * 3) - 1;
          const cpuDelta = Math.floor(Math.random() * 6) - 3;
          const currentLoad = Math.max(5, Math.min(95, (s.cpuLoad ?? 20) + cpuDelta));

          return {
            ...s,
            latency: Math.max(2, baselineLatency + latencyDelta),
            cpuLoad: currentLoad,
            errorRate: currentLoad > 85 ? parseFloat((Math.random() * 1.5).toFixed(2)) : 0.0,
            requestRate: Math.max(50, (s.requestRate ?? 100) + Math.floor(Math.random() * 20) - 10)
          };
        });
      });

      // 2. Append generic real-time logs occasionally to ledger
      const randomLogTriggers = [
        { service: "gcp", message: "Cloud Spanner API handshake successfully verified: 200 OK.", status: "success" },
        { service: "cloudflare", message: "Anycast edge cache sweep complete. TTL rules propagated.", status: "success" },
        { service: "github", message: "Actions runner orchestrator successfully processed 140 integration triggers.", status: "success" },
        { service: "stripe", message: "Encrypted credit ledger verified. Webhooks active.", status: "success" },
        { service: "aws", message: "S3 payload buckets reports nominal data parity.", status: "success" },
        { service: "discord", message: "Heartbeat check complete on gateway-94-wss. discordapp.com is operational.", status: "success" }
      ];

      const triggerLog = randomLogTriggers[Math.floor(Math.random() * randomLogTriggers.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];

      setActivityLogs(prev => [
        {
          id: `log-${Date.now()}`,
          time: timeStr,
          serviceName: triggerLog.service,
          message: triggerLog.message,
          status: triggerLog.status as any
        },
        ...prev.slice(0, 39) // keep newest 40
      ]);

      const updatedTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastUpdated(updatedTimeStr);

    }, 2000);

    return () => clearInterval(interval);
  }, [useLiveFetching]);

  // Simulate catastrophic scenarios
  const triggerScenario = useCallback((scenario: string) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];

    if (scenario === "cloudflare") {
      // Impact: cloudflare outage, vercel outage, discord degraded, openai degraded, stripe degraded
      setServices(prev => {
        return prev.map(s => {
          if (s.id === "cloudflare" || s.id === "cloudflare-dns") {
            return { 
              ...s, 
              status: "outage", 
              latency: 450, 
              cpuLoad: 99, 
              errorRate: 15.4,
              components: s.components.map(c => ({ ...c, status: "outage" }))
            };
          }
          if (s.id === "vercel") {
            return { 
              ...s, 
              status: "outage", 
              latency: 580, 
              cpuLoad: 95, 
              errorRate: 12.1,
              components: s.components.map(c => ({ ...c, status: "outage" }))
            };
          }
          if (s.id === "discord" || s.id === "openai" || s.id === "stripe") {
            return { 
              ...s, 
              status: "degraded", 
              latency: s.latency * 3, 
              cpuLoad: 85, 
              errorRate: 4.8,
              components: s.components.map((c, i) => ({ ...c, status: i === 0 ? "degraded" : "operational" }))
            };
          }
          return s;
        });
      });

      const newIncident: Incident = {
        id: "inc-cf",
        serviceId: "cloudflare",
        serviceName: "Cloudflare Edge",
        title: "BGP Routing Anycast Route Leak",
        description: "A major upstream Tier-1 ISP route leak caused Cloudflare Anycast nameservers to broadcast incorrect routes. Edge traffic is looping, cascading into 502 Bad Gateway timeouts on downstream Vercel, Discord and GPT-4 APIs.",
        severity: "critical",
        status: "active",
        startedAt: timeStr,
        updatedAt: timeStr,
        timeline: [
          { time: timeStr, status: "investigating", message: "BGP leak detected. High traffic spikes on edge routing layers. Core engineering teams routed." },
          { time: timeStr, status: "identified", message: "Identified incorrect autonomous system (AS) path advertisements. Isolating problematic network peering points." }
        ]
      };

      setIncidents(prev => [newIncident, ...prev.filter(i => i.id !== "inc-cf")]);

      setActivityLogs(prev => [
        {
          id: `log-sc-${Date.now()}`,
          time: timeStr,
          serviceName: "cloudflare",
          message: "CRITICAL: BGP Anycast routes disrupted. Cascade failure on Vercel Edge SSR Functions.",
          status: "error"
        },
        {
          id: `log-sc2-${Date.now()}`,
          time: timeStr,
          serviceName: "vercel",
          message: "WARNING: High origin timeout rate. Downstream connection dropped to GitHub Repository servers.",
          status: "warning"
        },
        ...prev
      ]);
    }

    else if (scenario === "aws") {
      // Impact: aws degraded, github degraded, stripe degraded
      setServices(prev => {
        return prev.map(s => {
          if (s.id === "aws") {
            return { 
              ...s, 
              status: "outage", 
              latency: 280, 
              cpuLoad: 92, 
              errorRate: 9.8,
              components: s.components.map(c => ({ ...c, status: c.id === "aws-s3" ? "outage" : "operational" }))
            };
          }
          if (s.id === "github" || s.id === "stripe") {
            return { 
              ...s, 
              status: "degraded", 
              latency: s.latency * 2.5, 
              cpuLoad: 80, 
              errorRate: 3.5,
              components: s.components.map(c => ({ ...c, status: "degraded" }))
            };
          }
          return s;
        });
      });

      const newIncident: Incident = {
        id: "inc-aws",
        serviceId: "aws",
        serviceName: "Amazon Web Services",
        title: "S3 Object Store Allocator Dropout",
        description: "An internal database lockup on US-East S3 metadata directory indexes caused payload storage reads and writes to hang. This causes GitHub Actions to fail runner file cache syncs and Stripe transactions to timeout.",
        severity: "critical",
        status: "active",
        startedAt: timeStr,
        updatedAt: timeStr,
        timeline: [
          { time: timeStr, status: "investigating", message: "US-East bucket allocations experiencing slow handshakes. AWS storage team investigating storage index clusters." }
        ]
      };

      setIncidents(prev => [newIncident, ...prev.filter(i => i.id !== "inc-aws")]);

      setActivityLogs(prev => [
        {
          id: `log-sc3-${Date.now()}`,
          time: timeStr,
          serviceName: "aws",
          message: "CRITICAL: S3 API Allocation dropout. US-East-1 metadata locks failing.",
          status: "error"
        },
        ...prev
      ]);
    }

    else if (scenario === "stripe") {
      // Impact: stripe outage
      setServices(prev => {
        return prev.map(s => {
          if (s.id === "stripe") {
            return { 
              ...s, 
              status: "outage", 
              latency: 950, 
              cpuLoad: 98, 
              errorRate: 24.5,
              components: s.components.map(c => ({ ...c, status: "outage" }))
            };
          }
          return s;
        });
      });

      const newIncident: Incident = {
        id: "inc-stripe",
        serviceId: "stripe",
        serviceName: "Stripe Checkout",
        title: "API Timeout and Gateway Latency Loop",
        description: "Secure gateway settlement services are timing out during merchant transaction handshakes. Global payment pipelines are stalled.",
        severity: "critical",
        status: "active",
        startedAt: timeStr,
        updatedAt: timeStr,
        timeline: [
          { time: timeStr, status: "investigating", message: "Stripe fraud detection API nodes timing out on high-frequency database read sweeps." }
        ]
      };

      setIncidents(prev => [newIncident, ...prev.filter(i => i.id !== "inc-stripe")]);
    }

    else if (scenario === "gemini") {
      // Impact: gemini degraded
      setServices(prev => {
        return prev.map(s => {
          if (s.id === "gemini") {
            return { 
              ...s, 
              status: "degraded", 
              latency: 580, 
              cpuLoad: 94, 
              errorRate: 5.2,
              components: s.components.map(c => ({ ...c, status: "degraded" }))
            };
          }
          return s;
        });
      });

      const newIncident: Incident = {
        id: "inc-gemini",
        serviceId: "gemini",
        serviceName: "Google Gemini AI",
        title: "TPU Pod Compute Capacity Overflow",
        description: "A sudden high-frequency parallel inference surge on Gemini model channels causes response latency spikes on downstream developer client endpoints.",
        severity: "major",
        status: "active",
        startedAt: timeStr,
        updatedAt: timeStr,
        timeline: [
          { time: timeStr, status: "identified", message: "TPU v5 pod allocation exceeding 95% target memory loads. Distributing inferences on backup clusters..." }
        ]
      };

      setIncidents(prev => [newIncident, ...prev.filter(i => i.id !== "inc-gemini")]);
    }
  }, []);

  // Restore everything to operational state
  const repairAll = useCallback(() => {
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];

    setServices(prev => {
      return prev.map(s => {
        // Reset to initial operational metrics
        const base = INITIAL_SERVICES.find(initial => initial.id === s.id) || s;
        return {
          ...base,
          status: "operational",
          components: base.components.map(c => ({ ...c, status: "operational" }))
        };
      });
    });

    setIncidents([]);

    setActivityLogs(prev => [
      {
        id: `log-rep-${Date.now()}`,
        time: timeStr,
        serviceName: "Global Grid",
        message: "SUCCESS: Sovereign system repair completed. Active incidents resolved. Core telemetry restored to nominal.",
        status: "success"
      },
      ...prev
    ]);
  }, []);

  // Toggle simulation mode
  const toggleMockFetch = useCallback(() => {
    setUseLiveFetching(prev => !prev);
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];

    setActivityLogs(prev => [
      {
        id: `log-tf-${Date.now()}`,
        time: timeStr,
        serviceName: "Control Console",
        message: `INFO: Active simulation background daemon is now ${!useLiveFetching ? 'RUNNING' : 'STOPPED'}.`,
        status: "info"
      },
      ...prev
    ]);
  }, [useLiveFetching]);

  // Manually update status and pings
  const manualUpdate = useCallback(() => {
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];

    setServices(prev => {
      return prev.map(s => {
        if (s.status === "outage" || s.status === "degraded") return s;
        const baseline = INITIAL_SERVICES.find(init => init.id === s.id) || s;
        return {
          ...s,
          latency: Math.max(1, baseline.latency + Math.floor(Math.random() * 5) - 2),
          cpuLoad: Math.max(5, Math.min(95, (baseline.cpuLoad ?? 20) + Math.floor(Math.random() * 6) - 3))
        };
      });
    });

    setActivityLogs(prev => [
      {
        id: `log-mu-${Date.now()}`,
        time: timeStr,
        serviceName: "Global Grid",
        message: "ACTION: Sweep ping diagnostic executed. Routing pathways verified operational.",
        status: "success"
      },
      ...prev
    ]);

    setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, []);

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
  if (context === undefined) {
    throw new Error("usePulse must be used within a PulseProvider");
  }
  return context;
};
