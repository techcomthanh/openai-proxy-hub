import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";
import type { Configuration } from "@shared/schema";

interface ConfigState {
  requestTimeout: number;
  maxRetries: number;
  enableLogging: boolean;
  requireAuth: boolean;
  enableRateLimit: boolean;
  rateLimitPerMinute: number;
  logFailedAuth: boolean;
}

export default function Configuration() {
  const { toast } = useToast();
  const [currentDomain, setCurrentDomain] = useState<string>("");
  const [config, setConfig] = useState<ConfigState>({
    requestTimeout: 30,
    maxRetries: 3,
    enableLogging: true,
    requireAuth: true,
    enableRateLimit: false,
    rateLimitPerMinute: 60,
    logFailedAuth: true,
  });

  useEffect(() => {
    // Get current domain
    const domain = window.location.origin;
    setCurrentDomain(`${domain}/v1`);
  }, []);

  const { data: configurations, isLoading } = useQuery<Configuration[]>({
    queryKey: ["/api/configuration"],
  });

  useEffect(() => {
    if (configurations) {
      const configMap = configurations.reduce((acc: Record<string, any>, item: Configuration) => {
        acc[item.key] = item.value;
        return acc;
      }, {} as Record<string, any>);
      
      setConfig(prev => ({
        ...prev,
        ...configMap,
      }));
    }
  }, [configurations]);

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<ConfigState>) => {
      const promises = Object.entries(updates).map(([key, value]) =>
        apiRequest("PUT", `/api/configuration/${key}`, { value })
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/configuration"] });
      toast({
        title: "Success",
        description: "Configuration saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save configuration",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(config);
  };

  const handleInputChange = (key: keyof ConfigState, value: string | number | boolean) => {
    setConfig(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentDomain);
    toast({
      title: "Copied",
      description: "Proxy URL copied to clipboard",
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="p-6 h-64 bg-gray-200"></Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900">Configuration</h3>
        <p className="mt-1 text-sm text-gray-500">Global proxy settings and preferences</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Proxy Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Proxy Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="proxyUrl">Proxy Endpoint</Label>
                <div className="flex mt-1">
                  <Input
                    id="proxyUrl"
                    value={currentDomain}
                    readOnly
                    className="bg-gray-50 text-gray-700"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="ml-2"
                    onClick={copyToClipboard}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This is your OpenAI-compatible API endpoint. Use this URL in your applications.
                </p>
              </div>
              <div>
                <Label htmlFor="requestTimeout">Request Timeout (seconds)</Label>
                <Input
                  id="requestTimeout"
                  type="number"
                  value={config.requestTimeout}
                  onChange={(e) => handleInputChange("requestTimeout", parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="maxRetries">Max Retries</Label>
                <Input
                  id="maxRetries"
                  type="number"
                  value={config.maxRetries}
                  onChange={(e) => handleInputChange("maxRetries", parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableLogging"
                  checked={config.enableLogging}
                  onCheckedChange={(checked) => handleInputChange("enableLogging", checked)}
                />
                <Label htmlFor="enableLogging">Enable request logging</Label>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="requireAuth"
                  checked={config.requireAuth}
                  onCheckedChange={(checked) => handleInputChange("requireAuth", checked)}
                />
                <Label htmlFor="requireAuth">Require API key authentication</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableRateLimit"
                  checked={config.enableRateLimit}
                  onCheckedChange={(checked) => handleInputChange("enableRateLimit", checked)}
                />
                <Label htmlFor="enableRateLimit">Enable rate limiting</Label>
              </div>
              {config.enableRateLimit && (
                <div>
                  <Label htmlFor="rateLimitPerMinute">Rate limit (requests/minute)</Label>
                  <Input
                    id="rateLimitPerMinute"
                    type="number"
                    value={config.rateLimitPerMinute}
                    onChange={(e) => handleInputChange("rateLimitPerMinute", parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Switch
                  id="logFailedAuth"
                  checked={config.logFailedAuth}
                  onCheckedChange={(checked) => handleInputChange("logFailedAuth", checked)}
                />
                <Label htmlFor="logFailedAuth">Log failed authentication attempts</Label>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
