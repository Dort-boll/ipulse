export type Status = "operational" | "degraded" | "outage" | "maintenance";

export interface Component {
  id: string;
  name: string;
  status: Status;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  status: Status;
  icon: string;
  latency: number;
  uptime: number;
  cpuLoad?: number;
  errorRate?: number;
  requestRate?: number;
  components: Component[];
  dependencies: string[];
}

export interface IncidentTimelineStep {
  time: string;
  status: string;
  message: string;
}

export interface Incident {
  id: string;
  serviceId: string;
  serviceName: string;
  title: string;
  description: string;
  severity: "critical" | "major" | "minor";
  status: string;
  startedAt: string;
  updatedAt: string;
  timeline: IncidentTimelineStep[];
}

export interface ActivityLog {
  id: string;
  time: string;
  serviceName: string;
  message: string;
  status: "success" | "warning" | "error" | "info";
}

export interface HistoryPoint {
  time: string;
  ipi: number;
}
