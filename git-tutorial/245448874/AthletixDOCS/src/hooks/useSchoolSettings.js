import { useAuth } from '@/lib/AuthContext';

export function useSchoolSettings() {
  const { systemSettings } = useAuth();
  return { school: null, systemSettings, loading: false, maxAthletes: 10000 };
}