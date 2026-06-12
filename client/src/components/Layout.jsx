import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
export default function Layout({ children }) {
  const { user, logout, language, setLanguage } = useAuth();
  const home = user?.role === 'TEACHER' ? '/teacher/dashboard' : user?.role === 'PARENT' ? '/parent/dashboard' : user?.role === 'ADMIN' ? '/admin' : '/student/dashboard';
  return <div><div className="kenya-ribbon h-2"/><header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b"><div className="mx-auto flex max-w-7xl items-center justify-between p-4"><Link to={home} className="font-display text-xl font-black">CBC Senior School</Link><nav className="hidden gap-4 md:flex"><NavLink to="/pathways">Pathways</NavLink><NavLink to="/student/dashboard">Student</NavLink><NavLink to="/teacher/dashboard">Teacher</NavLink><NavLink to="/parent/dashboard">Parent</NavLink><NavLink to="/admin">Admin</NavLink></nav><div className="flex items-center gap-2"><button className="btn bg-global-grey" onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')}>{language === 'en' ? 'Kiswahili' : 'English'}</button>{user ? <button className="btn bg-black text-white" onClick={logout}>Logout</button> : <Link className="btn bg-stem-navy text-white" to="/login">Login</Link>}</div></div></header><main className="mx-auto max-w-7xl p-4 md:p-8">{children}</main></div>;
}
