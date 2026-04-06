import { X } from "lucide-react";

interface ISettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut?: () => void | Promise<void>;
}

export const SettingsPanel = ({ isOpen, onClose, onSignOut }: ISettingsPanelProps) => {
  if (!isOpen) return null;

  const settingsOptions = [
    { label: "Account Settings", onClick: () => console.log("Account") },
    { label: "Privacy & Security", onClick: () => console.log("Privacy") },
    { label: "Notifications Settings", onClick: () => console.log("Notifications") },
    { label: "Help & Support", onClick: () => console.log("Help") },
  ];

  return (
    <div className="fixed right-8 top-20 z-40 w-80 rounded-lg border border-border bg-card p-4 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Settings</h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
          type="button"
          aria-label="Close settings"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-3">
        {settingsOptions.map((option) => (
          <button
            key={option.label}
            className="w-full rounded-md border border-border/50 bg-background px-3 py-2 text-left text-sm transition-colors hover:border-primary hover:bg-muted"
            onClick={option.onClick}
            type="button"
          >
            {option.label}
          </button>
        ))}
        <hr className="my-2 border-border/50" />
        <button
          className="w-full rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/20"
          onClick={onSignOut}
          type="button"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};
