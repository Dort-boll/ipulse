// iPulse - Core Type Definitions

export type Status = "operational" | "degraded" | "outage" | "maintenance";

export interface ServiceComponent {
  id: string;
  name: string;
  status: Status;
}

export interface Service {
  id: string;
  name: string;
  category: string; // AI, Cloud, CDN, Payments, Developer, Communication, DNS, Social
  status: Status;
  latency: number; // in ms
  uptime: number; // percentage (e.g. 99.98)
  description: string;
  icon: string; // Lucide icon name
  components: ServiceComponent[];
  dependencies: string[]; // List of service ids it links to or depends on
  lastChecked: string;
  requestRate?: number; // requests/sec
  errorRate?: number;   // % error rate
  cpuLoad?: number;     // % system CPU usage
}

export interface Incident {
  id: string;
  serviceId: string;
  serviceName: string;
  severity: "critical" | "major" | "minor" | "maintenance";
  title: string;
  description: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  startedAt: string;
  updatedAt: string;
  timeline: {
    time: string;
    status: string;
    message: string;
  }[];
}

export interface ActivityLog {
  id: string;
  time: string;
  serviceId: string;
  serviceName: string;
  type: "ping" | "incident_start" | "incident_update" | "incident_resolve" | "system";
  message: string;
  status: "success" | "warning" | "error" | "info";
}

export interface IndexHistoryPoint {
  time: string;
  ipi: number;
}
