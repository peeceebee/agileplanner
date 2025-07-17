import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SprintItem, User } from "@shared/schema";
import DashboardTabs from "@/components/dashboard-tabs";
import SummaryStats from "@/components/summary-stats";
import DashboardFilters from "@/components/dashboard-filters";
import SprintDashboard from "@/components/sprint-dashboard";
import RefinementDashboard from "@/components/refinement-dashboard";
import BacklogDashboard from "@/components/backlog-dashboard";
import ReportsDashboard from "@/components/reports-dashboard";
import EditItemModal from "@/components/edit-item-modal";
import { ListTodo, User as UserIcon, Settings } from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("sprint");
  const [sprintFilter, setSprintFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [editingItem, setEditingItem] = useState<SprintItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: sprintItems = [], isLoading: itemsLoading } = useQuery<SprintItem[]>({
    queryKey: ["/api/sprint-items"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const filteredItems = sprintItems.filter(item => {
    if (sprintFilter && sprintFilter !== "all" && item.sprintNumber !== parseInt(sprintFilter)) return false;
    if (assigneeFilter && assigneeFilter !== "all" && item.assignedUser !== assigneeFilter) return false;
    
    // Apply dashboard-specific filters
    if (activeTab === "sprint" && !item.sprintNumber) return false;
    if (activeTab === "refinement" && item.refinementStatus === "none") return false;
    
    return true;
  });

  const handleEditItem = (item: SprintItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCreateItem = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  if (itemsLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-inter">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ListTodo className="text-blue-600 text-xl mr-3" />
              <h1 className="text-xl font-semibold text-slate-900">Sprint Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserIcon className="text-slate-400" size={20} />
                <span className="text-sm text-slate-700">John Doe</span>
              </div>
              <button className="text-slate-400 hover:text-slate-600">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <DashboardFilters
          sprintFilter={sprintFilter}
          assigneeFilter={assigneeFilter}
          onSprintFilterChange={setSprintFilter}
          onAssigneeFilterChange={setAssigneeFilter}
          onCreateItem={handleCreateItem}
          users={users}
          sprintItems={sprintItems}
        />

        {/* Summary Stats */}
        <SummaryStats items={filteredItems} />

        {/* Dashboard Content */}
        {activeTab === "sprint" && (
          <SprintDashboard items={filteredItems} onEditItem={handleEditItem} />
        )}
        {activeTab === "refinement" && (
          <RefinementDashboard items={filteredItems} onEditItem={handleEditItem} />
        )}
        {activeTab === "backlog" && (
          <BacklogDashboard items={filteredItems} onEditItem={handleEditItem} />
        )}
        {activeTab === "reports" && (
          <ReportsDashboard items={sprintItems} users={users} />
        )}

        {/* Edit Modal */}
        <EditItemModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          item={editingItem}
          users={users}
        />
      </main>
    </div>
  );
}
