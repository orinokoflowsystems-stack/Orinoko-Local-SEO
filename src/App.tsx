import { CalendarClock, Wrench } from 'lucide-react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';

const routeCards = [
  {
    title: 'Dispatch-ready workflows',
    description: 'Plan estimates, jobs, and invoices with a responsive service dashboard foundation.',
    icon: CalendarClock,
  },
  {
    title: 'Field operations visibility',
    description: 'Prepare technician, customer, and lead modules for ORINOKO multi-tenant operations.',
    icon: Wrench,
  },
];

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell routeCards={routeCards} />}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<Navigate replace to="/" />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
