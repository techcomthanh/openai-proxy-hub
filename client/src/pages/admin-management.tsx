import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  ShieldCheck,
  ShieldX,
  Eye,
  EyeOff
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Admin } from "@shared/schema";

const adminFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  isActive: z.boolean().default(true),
});

const createAdminFormSchema = adminFormSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AdminFormData = z.infer<typeof adminFormSchema>;

interface AdminFormProps {
  admin?: Admin | null;
  onClose: () => void;
}

function AdminForm({ admin, onClose }: AdminFormProps) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<AdminFormData>({
    resolver: zodResolver(admin ? adminFormSchema : createAdminFormSchema),
    defaultValues: {
      username: admin?.username || "",
      password: "",
      isActive: admin?.isActive ?? true,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: AdminFormData) => {
      if (admin) {
        return apiRequest("PUT", `/api/admins/${admin.id}`, data);
      } else {
        return apiRequest("POST", "/api/admins", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admins"] });
      toast({
        title: "Success",
        description: `Admin ${admin ? "updated" : "created"} successfully`,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${admin ? "update" : "create"} admin`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AdminFormData) => {
    // For updates, only include password if it's provided
    if (admin && !data.password) {
      const { password, ...dataWithoutPassword } = data;
      mutation.mutate(dataWithoutPassword);
    } else {
      mutation.mutate(data);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          {...form.register("username")}
          className="mt-1"
        />
        {form.formState.errors.username && (
          <p className="text-sm text-red-600 mt-1">
            {form.formState.errors.username.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="password">
          {admin ? "New Password (leave empty to keep current)" : "Password"}
        </Label>
        <div className="relative mt-1">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            {...form.register("password")}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {form.formState.errors.password && (
          <p className="text-sm text-red-600 mt-1">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={form.watch("isActive")}
          onCheckedChange={(checked) => form.setValue("isActive", checked)}
        />
        <Label htmlFor="isActive">Active</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : admin ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}

export default function AdminManagement() {
  const { toast } = useToast();
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);

  const { data: admins, isLoading } = useQuery<Admin[]>({
    queryKey: ["/api/admins"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admins/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admins"] });
      toast({
        title: "Success",
        description: "Admin deleted successfully",
      });
      setAdminToDelete(null);
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to delete admin";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setAdminToDelete(null);
    },
  });

  const handleEdit = (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowForm(true);
  };

  const handleAdd = () => {
    setSelectedAdmin(null);
    setShowForm(true);
  };

  const handleDelete = (admin: Admin) => {
    // Check if this would be the last active admin
    const activeAdmins = admins?.filter(a => a.isActive) || [];
    if (activeAdmins.length <= 1) {
      toast({
        title: "Cannot Delete Admin",
        description: "You cannot delete the last active admin account. At least one admin must remain active to manage the system.",
        variant: "destructive",
      });
      return;
    }
    setAdminToDelete(admin);
  };

  const confirmDelete = () => {
    if (adminToDelete) {
      deleteMutation.mutate(adminToDelete.id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6 h-24 bg-gray-200"></Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Admin Management
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage administrator accounts and permissions
          </p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedAdmin ? "Edit Admin" : "Add New Admin"}
              </DialogTitle>
              <DialogDescription>
                {selectedAdmin 
                  ? "Update the administrator account details."
                  : "Create a new administrator account."
                }
              </DialogDescription>
            </DialogHeader>
            <AdminForm
              admin={selectedAdmin}
              onClose={() => setShowForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {admins?.map((admin) => {
          const activeAdmins = admins?.filter(a => a.isActive) || [];
          const isLastActiveAdmin = activeAdmins.length <= 1 && admin.isActive;
          
          return (
            <Card key={admin.id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      {admin.isActive ? (
                        <ShieldCheck className="h-5 w-5 text-green-600" />
                      ) : (
                        <ShieldX className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {admin.username}
                        </h4>
                        <Badge variant={admin.isActive ? "default" : "secondary"}>
                          {admin.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {isLastActiveAdmin && (
                          <Badge variant="outline" className="text-orange-600 border-orange-300">
                            Last Admin
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Admin ID: {admin.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(admin)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(admin)}
                      disabled={isLastActiveAdmin}
                      className={`text-red-600 hover:text-red-700 ${
                        isLastActiveAdmin ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title={isLastActiveAdmin ? 'Cannot delete the last active admin' : 'Delete admin'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {(!admins || admins.length === 0) && (
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No administrators found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Get started by creating your first admin account.
              </p>
              <Button onClick={handleAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Admin
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!adminToDelete} onOpenChange={() => setAdminToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the admin account "{adminToDelete?.username}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}