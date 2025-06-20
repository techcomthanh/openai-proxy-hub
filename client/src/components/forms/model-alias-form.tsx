import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertModelAliasSchema, type ModelAlias, type InsertModelAlias, type Api } from "@shared/schema";

interface ModelAliasFormProps {
  alias?: ModelAlias | null;
  onClose: () => void;
}

export default function ModelAliasForm({ alias, onClose }: ModelAliasFormProps) {
  const { toast } = useToast();
  const isEditing = !!alias;

  const { data: apis } = useQuery<Api[]>({
    queryKey: ["/api/apis"],
  });

  const form = useForm<InsertModelAlias>({
    resolver: zodResolver(insertModelAliasSchema),
    defaultValues: {
      alias: alias?.alias || "",
      apiId: alias?.apiId || 0,
      isActive: alias?.isActive ?? true,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertModelAlias) => {
      if (isEditing) {
        await apiRequest("PUT", `/api/model-aliases/${alias.id}`, data);
      } else {
        await apiRequest("POST", "/api/model-aliases", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/model-aliases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: `Model alias ${isEditing ? "updated" : "created"} successfully`,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} model alias`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertModelAlias) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="alias"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alias Name</FormLabel>
              <FormControl>
                <Input placeholder="coder-model" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="apiId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target API</FormLabel>
              <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select API..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {apis?.map((api) => (
                    <SelectItem key={api.id} value={api.id.toString()}>
                      {api.name} - {api.modelName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Enable this alias for requests
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending 
              ? (isEditing ? "Updating..." : "Creating...") 
              : (isEditing ? "Update" : "Create")
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}
