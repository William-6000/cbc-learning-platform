import { useEffect, useState } from 'react';
import { api } from '../utils/api.js';
export function useApi(path, fallback) {
  const [data, setData] = useState(fallback); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { let alive = true; setLoading(true); api(path).then((result) => alive && setData(result)).catch((err) => alive && setError(err.message)).finally(() => alive && setLoading(false)); return () => { alive = false; }; }, [path]);
  return { data, loading, error };
}
