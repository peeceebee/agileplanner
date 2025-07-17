import { SprintItem, User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ReportsDashboardProps {
  items: SprintItem[];
  users: User[];
}

export default function ReportsDashboard({ items, users }: ReportsDashboardProps) {
  // Calculate sprint progress
  const sprintProgress = items.reduce((acc, item) => {
    if (!item.sprintNumber) return acc;
    
    const sprint = item.sprintNumber;
    if (!acc[sprint]) {
      acc[sprint] = { total: 0, completed: 0 };
    }
    acc[sprint].total++;
    if (item.status === "complete") {
      acc[sprint].completed++;
    }
    return acc;
  }, {} as Record<number, { total: number; completed: number }>);

  // Calculate team workload
  const teamWorkload = users.map(user => {
    const userItems = items.filter(item => item.assignedUser === user.username);
    const totalPoints = userItems.reduce((sum, item) => sum + (item.points || 0), 0);
    return {
      user,
      items: userItems.length,
      points: totalPoints,
    };
  });

  // Calculate velocity data
  const velocityData = Object.entries(sprintProgress).map(([sprint, data]) => ({
    sprint: parseInt(sprint),
    velocity: data.completed,
    capacity: data.total,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sprint Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Sprint Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(sprintProgress).map(([sprint, data]) => {
            const progress = (data.completed / data.total) * 100;
            return (
              <div key={sprint} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Sprint {sprint}</span>
                  <span className="text-sm font-medium text-slate-900">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Team Workload */}
      <Card>
        <CardHeader>
          <CardTitle>Team Workload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {teamWorkload.map(({ user, points }) => (
            <div key={user.id} className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-medium text-xs">{user.initials}</span>
                </div>
                <span className="text-sm text-slate-900">{user.name}</span>
              </div>
              <span className="text-sm font-medium text-slate-900">{points} pts</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Velocity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Velocity Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between space-x-2">
            {velocityData.map(({ sprint, velocity }) => (
              <div key={sprint} className="flex flex-col items-center">
                <div 
                  className="w-8 bg-blue-500 mb-2" 
                  style={{ height: `${(velocity / Math.max(...velocityData.map(d => d.velocity))) * 200}px` }}
                />
                <span className="text-xs text-slate-600">Sprint {sprint}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {["new", "in-progress", "complete", "deleted"].map(status => {
              const count = items.filter(item => item.status === status).length;
              const percentage = items.length > 0 ? (count / items.length) * 100 : 0;
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 capitalize">{status.replace("-", " ")}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-slate-900">{count}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
