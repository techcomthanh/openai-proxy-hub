import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DownloadIcon, FileTextIcon, ClockIcon, KeyIcon, BrainIcon, TimerIcon, HashIcon } from "lucide-react";
import type { RequestLog } from "@shared/schema";

export default function RequestLogs() {
  const { data: logs, isLoading } = useQuery<RequestLog[]>({
    queryKey: ["/api/request-logs"],
  });

  const getStatusBadge = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return <Badge className="bg-green-100 text-green-800">{statusCode}</Badge>;
    } else if (statusCode >= 400) {
      return <Badge className="bg-red-100 text-red-800">{statusCode}</Badge>;
    }
    return <Badge variant="secondary">{statusCode}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const exportLogs = () => {
    if (!logs) return;
    
    const csv = [
      ["Timestamp", "API Key", "Model", "Status", "Response Time", "Request Tokens", "Response Tokens", "Error"].join(","),
      ...logs.map(log => [
        formatDate(log.createdAt),
        log.userApiKey,
        log.modelAlias,
        log.statusCode.toString(),
        `${log.responseTimeMs}ms`,
        log.requestTokens?.toString() || "",
        log.responseTokens?.toString() || "",
        log.errorMessage || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `request-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="bg-white rounded-lg shadow p-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded mb-4"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Request Logs</h3>
          <p className="mt-1 text-sm text-gray-500">Monitor and analyze proxy requests</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select defaultValue="24h">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportLogs}>
            <DownloadIcon className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Logs Cards */}
      <div className="space-y-4">
        {logs && logs.length > 0 ? (
          logs.map((log) => (
            <Card key={log.id} className="w-full overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div>
                        <h4 className="text-md font-medium text-gray-900">{log.modelAlias}</h4>
                        <div className="flex items-center mt-1">
                          <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-500">{formatDate(log.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(log.statusCode)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <KeyIcon className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">API Key</p>
                        <code className="text-sm text-gray-700 font-mono">{log.userApiKey}</code>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <TimerIcon className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Response Time</p>
                        <p className="text-sm text-gray-700">{log.responseTimeMs}ms</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <HashIcon className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Tokens (Request / Response)</p>
                        <p className="text-sm text-gray-700">
                          {log.requestTokens && log.responseTokens 
                            ? `${log.requestTokens} / ${log.responseTokens}`
                            : "-"
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {log.errorMessage && (
                    <div className="mt-2 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                      <p className="font-medium">Error:</p>
                      <p>{log.errorMessage}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 flex flex-col items-center justify-center">
              <FileTextIcon className="h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No request logs</h3>
              <p className="mt-1 text-sm text-gray-500">Logs will appear here as requests are made to the proxy.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
