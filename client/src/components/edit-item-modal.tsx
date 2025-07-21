import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SprintItem, User, insertSprintItemSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: SprintItem | null;
  users: User[];
}

export default function EditItemModal({ isOpen, onClose, item, users }: EditItemModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = Boolean(item);

  const formatDateForInput = (date: Date | string | null) => {
    if (!date) return "";
    return format(new Date(date), "yyyy-MM-dd");
  };

  const form = useForm({
    resolver: zodResolver(insertSprintItemSchema),
    defaultValues: {
      title: item?.title || "",
      description: item?.description || "",
      assignedUser: item?.assignedUser || "unassigned",
      status: item?.status || "new",
      refinementStatus: item?.refinementStatus || "none",
      sprintNumber: item?.sprintNumber || undefined,
      hoursOfEffort: item?.hoursOfEffort || undefined,
      points: item?.points || undefined,
      startDate: item?.startDate ? formatDateForInput(item.startDate) : "",
      plannedCompleteDate: item?.plannedCompleteDate ? formatDateForInput(item.plannedCompleteDate) : "",
      actualCompleteDate: item?.actualCompleteDate ? formatDateForInput(item.actualCompleteDate) : "",
      readyDate: item?.readyDate ? formatDateForInput(item.readyDate) : "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/sprint-items", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sprint-items"] });
      toast({ title: "Success", description: "Sprint item created successfully" });
      onClose();
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to create sprint item", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/sprint-items/${item!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sprint-items"] });
      toast({ title: "Success", description: "Sprint item updated successfully" });
      onClose();
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to update sprint item", variant: "destructive" });
    },
  });

  const onSubmit = (data: any) => {
    // Convert date strings to Date objects and handle unassigned user
    const processedData = {
      ...data,
      assignedUser: data.assignedUser === "unassigned" ? null : data.assignedUser,
      sprintNumber: data.sprintNumber && data.sprintNumber !== "" ? parseInt(data.sprintNumber) : null,
      points: data.points && data.points !== "" ? parseInt(data.points) : null,
      hoursOfEffort: data.hoursOfEffort && data.hoursOfEffort !== "" ? parseFloat(data.hoursOfEffort) : null,
      startDate: data.startDate && data.startDate !== "" ? new Date(data.startDate) : null,
      plannedCompleteDate: data.plannedCompleteDate && data.plannedCompleteDate !== "" ? new Date(data.plannedCompleteDate) : null,
      actualCompleteDate: data.actualCompleteDate && data.actualCompleteDate !== "" ? new Date(data.actualCompleteDate) : null,
      readyDate: data.readyDate && data.readyDate !== "" ? new Date(data.readyDate) : null,
    };

    if (isEditing) {
      updateMutation.mutate(processedData);
    } else {
      createMutation.mutate(processedData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Sprint Item" : "Create New Sprint Item"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Item ID</label>
                  <Input value={item?.itemId || ""} disabled className="bg-slate-50" />
                </div>
              )}
              <FormField
                control={form.control}
                name="sprintNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sprint Number</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="assignedUser"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned User</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {users.map(user => (
                          <SelectItem key={user.username} value={user.username}>
                            {user.name}
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="complete">Complete</SelectItem>
                        <SelectItem value="deleted">Deleted</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="refinementStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Refinement Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="drafting">Drafting</SelectItem>
                        <SelectItem value="designing">Designing</SelectItem>
                        <SelectItem value="refined">Refined</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="points"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Story Points</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="hoursOfEffort"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours of Effort</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.5"
                        {...field} 
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Create Date</label>
                  <Input 
                    type="date" 
                    value={formatDateForInput(item?.createDate || "")} 
                    disabled 
                    className="bg-slate-50" 
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value ? formatDateForInput(field.value) : ""} 
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plannedCompleteDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Planned Complete Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value ? formatDateForInput(field.value) : ""} 
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="readyDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ready Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value ? formatDateForInput(field.value) : ""} 
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="actualCompleteDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Complete Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value ? formatDateForInput(field.value) : ""} 
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}