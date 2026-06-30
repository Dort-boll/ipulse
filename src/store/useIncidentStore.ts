import { create } from 'zustand';

interface Provider {
  id: string;
  name: string;
  status: 'operational' | 'degraded' | 'outage';
}

interface Incident {
  id: string;
  provider: string;
  status: string;
  title: string;
  time: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface IncidentStore {
  providers: Provider[];
  incidents: Incident[];
  setProviderStatus: (id: string, status: Provider['status']) => void;
  addIncident: (incident: Incident) => void;
}

export const useIncidentStore = create<IncidentStore>((set) => ({
  providers: [
    { id: 'aws', name: 'AWS', status: 'operational' },
    { id: 'gcp', name: 'GCP', status: 'operational' },
    { id: 'cloudflare', name: 'Cloudflare', status: 'operational' },
  ],
  incidents: [],
  setProviderStatus: (id, status) =>
    set((state) => ({
      providers: state.providers.map((p) => (p.id === id ? { ...p, status } : p)),
    })),
  addIncident: (incident) =>
    set((state) => ({ incidents: [incident, ...state.incidents].slice(0, 10) })),
}));
