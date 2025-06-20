import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertApiUserSchema, type ApiUser, type InsertApiUser, type ModelAlias } from "@shared/schema";

interface UserFormProps {
  user?: ApiUser | null;
  onClose: () => void;
}

export default function UserForm({ user, onClose }: UserFormProps) {
  const { toast } = useToast();
  const isEditing = !!user;

  const { data: modelAliases } = useQuery<ModelAlias[]>({
    queryKey: ["/api/model-aliases"],
  });

  const form = useForm<InsertApiUser>({
    resolver: zodResolver(insertApiUserSchema),
    defaultValues: {
      name: user?.name || "",
      apiKey: user?.apiKey || `user-${Date.now()}-key`,
      allowedModels: user?.allowedModels || [],
      isActive: user?.isActive ?? true,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertApiUser) => {
      if (isEditing) {
        await apiRequest("PUT", `/api/users/${user.id}`, data);
      } else {
        await apiRequest("POST", "/api/users", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: `User ${isEditing ? "updated" : "created"} successfully`,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} user`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertApiUser) => {
    mutation.mutate(data);
  };

  const generateApiKey = () => {
    const key = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    form.setValue("apiKey", key);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Name</FormLabel>
              <FormControl>
                <Input placeholder="User 1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Key</FormLabel>
              <div className="flex space-x-2">
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateApiKey}
                >
                  Generate
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="allowedModels"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allowed Models</FormLabel>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {modelAliases?.map((alias) => (
                  <div key={alias.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`model-${alias.id}`}
                      checked={field.value.includes(alias.alias)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          field.onChange([...field.value, alias.alias]);
                        } else {
                          field.onChange(field.value.filter(m => m !== alias.alias));
                        }
                      }}
                    />
                    <label
                      htmlFor={`model-${alias.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {alias.alias}
                    </label>
                  </div>
                ))}
              </div>
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
                  Enable this user for API access
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
