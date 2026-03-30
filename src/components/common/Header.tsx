import { Search, Bell, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface IHeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: IHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Search:", searchQuery);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="flex items-center justify-between gap-4 px-8 py-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search files, folders, and projects..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full rounded-lg border border-border bg-muted px-4 py-2 pl-10 text-sm placeholder-muted-foreground transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" title="Notifications">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" title="Settings">
            <Settings className="h-5 w-5 text-muted-foreground" />
          </Button>

          {/* User Profile Avatar */}
          <button
            className="ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-orange-400 to-orange-500 text-sm font-semibold text-white transition-all hover:shadow-md"
            title="Profile"
          >
            AW
          </button>
        </div>
      </div>
    </header>
  );
};
