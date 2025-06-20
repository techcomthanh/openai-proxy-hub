import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import ApiManagement from "@/pages/api-management";
import ModelAliases from "@/pages/model-aliases";
import UserManagement from "@/pages/user-management";
import Configuration from "@/pages/configuration";
import RequestLogs from "@/pages/request-logs";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/apis" component={ApiManagement} />
        <Route path="/models" component={ModelAliases} />
        <Route path="/users" component={UserManagement} />
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
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
