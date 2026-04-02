import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface INotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsPanel = ({ isOpen, onClose }: INotificationsPanelProps) => {
  if (!isOpen) return null;

  const notifications = [
    { title: "New file uploaded", time: "5 minutes ago" },
    { title: "Project access granted", time: "1 hour ago" },
    { title: "Security audit completed", time: "3 hours ago" },
  ];

  return (
    <div className="fixed right-8 top-20 z-40 w-80 rounded-lg border border-border bg-card p-4 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Notifications</h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
          type="button"
          aria-label="Close notifications"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-2">
        {notifications.map((notification, index) => (
          <div key={index} className="rounded-md border border-border/50 bg-background p-3 text-sm">
            <p className="font-medium text-foreground">{notification.title}</p>
            <p className="text-xs text-muted-foreground">{notification.time}</p>
          </div>
        ))}
      </div>
      <Button variant="ghost" size="sm" className="mt-4 w-full text-primary">
        View All Notifications
      </Button>
    </div>
  );
};
