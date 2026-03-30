import type { IRecentActivity } from "@/types/dashboard";
import { Shield, Users, RefreshCw } from "lucide-react";

interface IRecentActivitySectionProps {
  activities: IRecentActivity[];
}

const ACTIVITY_ICON_MAP: Record<string, React.ReactNode> = {
  audit: <Shield className="h-5 w-5 text-blue-600" />,
  share: <Users className="h-5 w-5 text-purple-600" />,
  sync: <RefreshCw className="h-5 w-5 text-amber-600" />,
};

export const RecentActivitySection = ({
  activities,
}: IRecentActivitySectionProps) => {
  return (
    <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          RECENT ACTIVITY
        </h2>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-blue-300 hover:shadow-sm"
            >
              <div className="mt-1 shrink-0">
                {ACTIVITY_ICON_MAP[activity.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">
                  {activity.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>
                {activity.user && (
                  <p className="text-xs text-muted-foreground mt-1">
                    By {activity.user}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {activity.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
