import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon, ServerIcon, EditIcon, TrashIcon } from "lucide-react";
import ApiForm from "@/components/forms/api-form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Api } from "@shared/schema";

export default function ApiManagement() {
  const [selectedApi, setSelectedApi] = useState<Api | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: apis, isLoading } = useQuery<Api[]>({
    queryKey: ["/api/apis"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/apis/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apis"] });
      toast({
        title: "Success",
        description: "API deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete API",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (api: Api) => {
    setSelectedApi(api);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this API?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedApi(null);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6 h-24 bg-gray-200"></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">API Management</h3>
          <p className="mt-1 text-sm text-gray-500">Configure and manage upstream OpenAI-compatible APIs</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add New API
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedApi ? "Edit API" : "Add New API"}</DialogTitle>
            </DialogHeader>
            <ApiForm api={selectedApi} onClose={handleDialogClose} />
          </DialogContent>
        </Dialog>
      </div>

      {/* API List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {apis && apis.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {apis.map((api) => (
              <li key={api.id}>
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ServerIcon className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">{api.baseUrl}</p>
                        <Badge
                          variant={api.isActive ? "default" : "secondary"}
                          className="ml-2"
                        >
                          {api.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="mt-1">
                        <p className="text-sm text-gray-500">
                          Model: <code className="text-xs bg-gray-100 px-1 rounded">{api.modelName}</code>
                        </p>
                        <p className="text-sm text-gray-500">Name: {api.name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(api)}
                    >
                      <EditIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(api.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <ServerIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No APIs configured</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first upstream API.</p>
          </div>
        )}
      </div>
    </div>
  );
}
