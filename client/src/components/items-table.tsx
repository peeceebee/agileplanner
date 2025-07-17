import { SprintItem, User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";

interface ItemsTableProps {
  items: SprintItem[];
  users: User[];
  onEditItem: (item: SprintItem) => void;
  columns: Array<{
    key: string;
    label: string;
    sortable?: boolean;
    render?: (item: SprintItem) => React.ReactNode;
  }>;
}

export default function ItemsTable({ items, users, onEditItem, columns }: ItemsTableProps) {
  const getUserByUsername = (username: string | null) => {
    if (!username) return null;
    return users.find(user => user.username === username);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { variant: "secondary" as const, label: "New" },
      "in-progress": { variant: "default" as const, label: "In Progress" },
      complete: { variant: "default" as const, label: "Complete" },
      deleted: { variant: "destructive" as const, label: "Deleted" },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge variant={config.variant} className={
        status === "in-progress" ? "bg-yellow-100 text-yellow-800" :
        status === "complete" ? "bg-green-100 text-green-800" :
        ""
      }>
        {config.label}
      </Badge>
    );
  };

  const getRefinementStatusBadge = (status: string) => {
    const statusConfig = {
      none: { variant: "outline" as const, label: "None" },
      drafting: { variant: "secondary" as const, label: "Drafting" },
      designing: { variant: "secondary" as const, label: "Designing" },
      refined: { variant: "default" as const, label: "Refined" },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge variant={config.variant} className={
        status === "drafting" ? "bg-orange-100 text-orange-800" :
        status === "designing" ? "bg-purple-100 text-purple-800" :
        status === "refined" ? "bg-blue-100 text-blue-800" :
        ""
      }>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "-";
    return format(new Date(date), "MMM d, yyyy");
  };

  const defaultRenderFunctions = {
    itemId: (item: SprintItem) => (
      <span className="font-medium text-slate-900">{item.itemId}</span>
    ),
    title: (item: SprintItem) => (
      <span className="text-slate-900">{item.title}</span>
    ),
    assignee: (item: SprintItem) => {
      const user = getUserByUsername(item.assignedUser);
      return (
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
            user ? "bg-blue-100" : "bg-gray-100"
          }`}>
            <span className={`font-medium text-xs ${
              user ? "text-blue-600" : "text-gray-600"
            }`}>
              {user?.initials || "-"}
            </span>
          </div>
          <span className="text-slate-900">{user?.name || "Unassigned"}</span>
        </div>
      );
    },
    status: (item: SprintItem) => getStatusBadge(item.status),
    refinementStatus: (item: SprintItem) => getRefinementStatusBadge(item.refinementStatus),
    sprintNumber: (item: SprintItem) => (
      <span className="text-slate-900">{item.sprintNumber || "-"}</span>
    ),
    points: (item: SprintItem) => (
      <span className="text-slate-900">{item.points || "-"}</span>
    ),
    hoursOfEffort: (item: SprintItem) => (
      <span className="text-slate-900">{item.hoursOfEffort || "-"}</span>
    ),
    plannedCompleteDate: (item: SprintItem) => (
      <span className="text-slate-900">{formatDate(item.plannedCompleteDate)}</span>
    ),
    createDate: (item: SprintItem) => (
      <span className="text-slate-900">{formatDate(item.createDate)}</span>
    ),
    readyDate: (item: SprintItem) => (
      <span className="text-slate-900">{formatDate(item.readyDate)}</span>
    ),
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  <div className="flex items-center cursor-pointer hover:bg-slate-100 -mx-2 px-2 py-1 rounded">
                    {column.label}
                    {column.sortable && <ArrowUpDown className="ml-1" size={12} />}
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {items.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-slate-50 cursor-pointer"
                onClick={() => onEditItem(item)}
              >
                {columns.map(column => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm">
                    {column.render
                      ? column.render(item)
                      : defaultRenderFunctions[column.key as keyof typeof defaultRenderFunctions]?.(item) || 
                        item[column.key as keyof SprintItem]
                    }
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditItem(item);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement delete functionality
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
