import { cn } from "@/lib/utils";
import { BarChart3, Edit, List, Zap } from "lucide-react";

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "sprint", label: "Sprint Dashboard", icon: Zap },
  { id: "refinement", label: "Refinement Dashboard", icon: Edit },
  { id: "backlog", label: "Backlog Dashboard", icon: List },
  { id: "reports", label: "Reports Dashboard", icon: BarChart3 },
];

export default function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "py-4 px-1 border-b-2 font-medium text-sm flex items-center",
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                )}
              >
                <Icon size={16} className="mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
