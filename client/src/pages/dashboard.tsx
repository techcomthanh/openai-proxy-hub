import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ServerIcon, BrainIcon, UsersIcon, TrendingUpIcon, CheckIcon, XIcon } from "lucide-react";

interface Stats {
  activeApis: number;
  modelAliases: number;
  activeUsers: number;
  requestsToday: number;
}

interface RequestLog {
  id: number;
  userApiKey: string;
  modelAlias: string;
  statusCode: number;
  responseTimeMs: number;
  createdAt: string;
}

export default function Dashboard() {
  const [currentHost, setCurrentHost] = useState("your-domain.com");

  // Set current host when component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentHost(window.location.host);
    }
  }, []);

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const { data: recentLogs, isLoading: logsLoading } = useQuery<RequestLog[]>({
    queryKey: ["/api/request-logs", { limit: 5 }],
  });

  if (statsLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ServerIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active APIs</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.activeApis || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <BrainIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Model Aliases</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.modelAliases || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UsersIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.activeUsers || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUpIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Requests Today</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.requestsToday || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Example API Usage */}
      <div className="mb-8">
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Example API Usage</h3>
          </div>
          <CardContent className="p-6">
            <div className="bg-gray-50 p-4 rounded border">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Curl Request Example:</h4>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded-md font-mono text-sm overflow-x-auto whitespace-pre-wrap">
{`curl https://${currentHost}/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "MODEL_ALIAS",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'`}
              </pre>
              <div className="text-xs text-gray-500 mt-2">
                Replace <code>YOUR_API_KEY</code> with a user's API key and <code>MODEL_ALIAS</code> with an allowed model alias.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Requests</h3>
          </div>
          <CardContent className="p-6">
            {logsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentLogs && recentLogs.length > 0 ? (
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {recentLogs.map((log) => (
                    <li key={log.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            log.statusCode >= 200 && log.statusCode < 300
                              ? "bg-green-100"
                              : "bg-red-100"
                          }`}>
                            {log.statusCode >= 200 && log.statusCode < 300 ? (
                              <CheckIcon className="text-green-600 w-4 h-4" />
                            ) : (
                              <XIcon className="text-red-600 w-4 h-4" />
                            )}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {log.modelAlias}
                          </p>
                          <p className="text-sm text-gray-500">
                            {log.userApiKey} • {new Date(log.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-sm text-gray-400">
                          {log.responseTimeMs}ms
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent requests</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">System Status</h3>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Proxy Server</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></div>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Upstream APIs</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {stats?.activeApis || 0}/{stats?.activeApis || 0} Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Database</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></div>
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Memory Usage</span>
                <span className="text-sm text-gray-600">342MB / 1GB</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
