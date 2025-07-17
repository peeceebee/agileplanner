import { SprintItem } from "@shared/schema";
import { CheckCircle, Clock, Circle, Trash2 } from "lucide-react";

interface SummaryStatsProps {
  items: SprintItem[];
}

export default function SummaryStats({ items }: SummaryStatsProps) {
  const stats = items.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const statCards = [
    {
      label: "New",
      value: stats.new || 0,
      icon: Circle,
      bgColor: "bg-gray-100",
      iconColor: "text-gray-500",
    },
    {
      label: "In Progress",
      value: stats["in-progress"] || 0,
      icon: Clock,
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-500",
    },
    {
      label: "Complete",
      value: stats.complete || 0,
      icon: CheckCircle,
      bgColor: "bg-green-100",
      iconColor: "text-green-500",
    },
    {
      label: "Deleted",
      value: stats.deleted || 0,
      icon: Trash2,
      bgColor: "bg-red-100",
      iconColor: "text-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                  <Icon className={`${stat.iconColor} text-sm`} size={16} />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-900">{stat.label}</p>
                <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
