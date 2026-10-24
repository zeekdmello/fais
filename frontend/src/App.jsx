import { createBrowserRouter, RouterProvider, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Today from './pages/Today';
import TasksPage from './pages/TasksPage';
import RoutinesPage from './pages/RoutinesPage';
import CalendarPage from './pages/CalendarPage';
import Statistics from './pages/Statistics';
import Activity from './pages/Activity';
import Settings from './pages/Settings';
import { Art } from './components/Art';
function NotFound() {
  return (
    <main className="not-found">
      <Art kind="moon" />
      <span className="eyebrow">404 / A LITTLE DETOUR</span>
      <h1>This page wandered off.</h1>
      <p>Let’s get you back to your little corner.</p>
      <Link className="button yellow" to="/app">
        Back to my day ↗
      </Link>
    </main>
  );
}
const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Auth /> },
  { path: '/register', element: <Auth register /> },
  {
    path: '/app',
    element: <Layout />,
    children: [
      { index: true, element: <Today /> },
      { path: 'tasks', element: <TasksPage /> },
      { path: 'routines', element: <RoutinesPage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'statistics', element: <Statistics /> },
      { path: 'activity', element: <Activity /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
  { path: '*', element: <NotFound /> },
]);
export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
