// Simulates fetching RSS/StatusPage data
export const fetchProviderStatus = async (providerId: string, type: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 2000));
  
  // Simulate status update
  const statuses = ['operational', 'operational', 'operational', 'degraded', 'outage'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  return {
    providerId,
    status,
    lastChecked: new Date().toISOString(),
    details: status === 'operational' ? 'System nominal' : 'Transient connectivity issues'
  };
};
