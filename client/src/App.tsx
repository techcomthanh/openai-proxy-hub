import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import Layout from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import ApiManagement from "@/pages/api-management";
import ModelAliases from "@/pages/model-aliases";
import UserManagement from "@/pages/user-management";
import AdminManagement from "@/pages/admin-management";
import Configuration from "@/pages/configuration";
import RequestLogs from "@/pages/request-logs";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

function AuthenticatedApp() {
  const { admin, isLoading, login } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!admin) {
    return <Login onLoginSuccess={login} />;
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/apis" component={ApiManagement} />
        <Route path="/models" component={ModelAliases} />
        <Route path="/users" component={UserManagement} />
        <Route path="/admins" component={AdminManagement} />
        <Route path="/config" component={Configuration} />
        <Route path="/logs" component={RequestLogs} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AuthenticatedApp />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
