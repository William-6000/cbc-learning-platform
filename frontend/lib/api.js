import { fallbackDashboardData } from './mockData';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function getDashboardData() {
  try {
    const response = await fetch(`${apiBaseUrl}/api/dashboard`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();

    return {
      ...data,
      apiStatus: `Connected to backend at ${apiBaseUrl}`,
      isBackendConnected: true,
    };
  } catch (error) {
    return {
      ...fallbackDashboardData,
      apiStatus: `Using sample data until the backend is available at ${apiBaseUrl}.`,
      isBackendConnected: false,
    };
  }
}
