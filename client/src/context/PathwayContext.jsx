import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../utils/api.js';
const PathwayContext = createContext([]);
export function PathwayProvider({ children }) {
  const [pathways, setPathways] = useState([]);
  useEffect(() => { api('/api/pathways').then(setPathways).catch(() => setPathways([])); }, []);
  return <PathwayContext.Provider value={pathways}>{children}</PathwayContext.Provider>;
}
export const usePathways = () => useContext(PathwayContext);
