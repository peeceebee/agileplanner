import { SprintItem, User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import ItemsTable from "./items-table";

interface BacklogDashboardProps {
  items: SprintItem[];
  onEditItem: (item: SprintItem) => void;
}

export default function BacklogDashboard({ items, onEditItem }: BacklogDashboardProps) {
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const columns = [
    { key: "itemId", label: "ID", sortable: true },
    { key: "title", label: "Title", sortable: true },
    { key: "assignee", label: "Assignee", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "createDate", label: "Created", sortable: true },
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Backlog Items</h2>
      </div>
      <ItemsTable
        items={items}
        users={users}
        onEditItem={onEditItem}
        columns={columns}
      />
    </div>
  );
}
