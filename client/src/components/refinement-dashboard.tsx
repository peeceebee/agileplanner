import { SprintItem, User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import ItemsTable from "./items-table";

interface RefinementDashboardProps {
  items: SprintItem[];
  onEditItem: (item: SprintItem) => void;
}

export default function RefinementDashboard({ items, onEditItem }: RefinementDashboardProps) {
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const columns = [
    { key: "itemId", label: "ID", sortable: true },
    { key: "title", label: "Title", sortable: true },
    { key: "assignee", label: "Assignee", sortable: true },
    { key: "refinementStatus", label: "Refinement Status", sortable: true },
    { key: "readyDate", label: "Ready Date", sortable: true },
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Refinement Items</h2>
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
