import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Redirect, Route, Switch, Router as WouterRouter } from 'wouter';
import { useSession } from '@/hooks/use-session';
import { ToastProvider } from '@/features/reminders/ToastProvider';
import { ReminderInboxWatcher } from '@/features/reminders/use-reminder-inbox';
import Landing from '@/pages/landing';
import SignIn from '@/pages/signin';
import SignUp from '@/pages/signup';
import Contact from '@/pages/contact';
import Dashboard from './pages/dashboard';
import ProjectBoard from '@/pages/project-board';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, isLoading } = useSession();

  if (isLoading) {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }

  return (
    <>
      {user && <ReminderInboxWatcher />}
      <WouterRouter>
        <Switch>
          <Route path="/">
            {user ? <Dashboard /> : <Landing />}
          </Route>
          <Route path="/signin" component={SignIn} />
          <Route path="/signup" component={SignUp} />
          <Route path="/contact" component={Contact} />
          <Route path="/project/:projectId">
            {user ? <ProjectBoard /> : <Redirect to="/signin" />}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </WouterRouter>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </QueryClientProvider>
  );
}