import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon, BrainIcon } from "lucide-react";
import ModelAliasForm from "@/components/forms/model-alias-form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ModelAlias, Api } from "@shared/schema";

interface ModelAliasWithApi extends ModelAlias {
  api?: Api;
}

export default function ModelAliases() {
  const [selectedAlias, setSelectedAlias] = useState<ModelAlias | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: aliases, isLoading } = useQuery<ModelAlias[]>({
    queryKey: ["/api/model-aliases"],
  });

  const { data: apis } = useQuery<Api[]>({
    queryKey: ["/api/apis"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/model-aliases/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/model-aliases"] });
      toast({
        title: "Success",
        description: "Model alias deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete model alias",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (alias: ModelAlias) => {
    setSelectedAlias(alias);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this model alias?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedAlias(null);
  };

  const getApiForAlias = (apiId: number) => {
    return apis?.find(api => api.id === apiId);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Model Aliases</h3>
          <p className="mt-1 text-sm text-gray-500">Create friendly aliases for your model names</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Alias
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedAlias ? "Edit Model Alias" : "Add Model Alias"}</DialogTitle>
            </DialogHeader>
            <ModelAliasForm alias={selectedAlias} onClose={handleDialogClose} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Model Aliases Grid */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        {aliases && aliases.length > 0 ? (
          <div className="flex flex-col space-y-4 max-w-3xl mx-auto">
            {aliases.map((alias) => {
              const api = getApiForAlias(alias.apiId);
              return (
                <div key={alias.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-center mb-3">
                      <div className="flex-shrink-0 w-10 h-10">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <BrainIcon className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="text-lg font-medium text-gray-900">{alias.alias}</h4>
                        <Badge variant={alias.isActive ? "default" : "secondary"} className="mt-1">
                          {alias.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div>
                        <div className="text-xs font-medium uppercase text-gray-500">Target Model</div>
                        <code className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {api?.modelName || "Unknown"}
                        </code>
                      </div>
                      
                      <div>
                        <div className="text-xs font-medium uppercase text-gray-500">API Endpoint</div>
                        <div className="text-sm text-gray-700 truncate">{api?.baseUrl || "Unknown"}</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-5 pt-3 border-t border-gray-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(alias)}
                        className="text-primary hover:text-primary-600 mr-3"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(alias.id)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <BrainIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No model aliases</h3>
            <p className="mt-1 text-sm text-gray-500">Create aliases to make your models easier to use.</p>
          </div>
        )}
      </div>
    </div>
  );
}
