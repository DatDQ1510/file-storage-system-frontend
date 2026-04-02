import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickAccessSection } from "@/components/common/QuickAccessSection";
import { RecentActivitySection } from "@/components/common/RecentActivitySection";
// import { StorageSummaryCard } from "@/components/common/StorageSummaryCard";
import { SuggestedProjectsSection } from "@/components/common/SuggestedProjectsSection";
import type { IDashboardData } from "@/types/dashboard";

// Mock data - replace with actual data from API
const MOCK_DASHBOARD_DATA: IDashboardData = {
  greeting: "Good Morning, Alexander",
  auditRequests: 3,
  quickAccessFiles: [
    {
      id: "1",
      name: "Q4_Financial_Report.pdf",
      type: "pdf",
      size: "2.4 MB",
      dateModified: "Edited 25 days",
      icon: "pdf",
    },
    {
      id: "2",
      name: "Asset_Inventory_2024.xl",
      type: "excel",
      size: "1.9 MB",
      dateModified: "Edited 5h ago",
      icon: "excel",
    },
    {
      id: "3",
      name: "Security_Policy_v2.docx",
      type: "document",
      size: "590 KB",
      dateModified: "Opened yesterday",
      icon: "security",
    },
    {
      id: "4",
      name: "Board_Deck_Final.pptx",
      type: "presentation",
      size: "3.4 MB",
      dateModified: "Edited 3h ago",
      icon: "pptx",
    },
  ],
  recentActivities: [
    {
      id: "1",
      type: "audit",
      title: "Security Audit",
      description:
        "Automatically verified 14 new documents. Encryption standards met for all Tier 1 files.",
      timestamp: "JUST NOW",
      icon: "shield",
      user: "System",
    },
    {
      id: "2",
      type: "share",
      title: "Sarah Jenkins shared 5 files with the Marketing Team",
      description: "",
      timestamp: "5H AGO",
      icon: "users",
      user: "Sarah Jenkins",
    },
    {
      id: "3",
      type: "sync",
      title: "Automatic Sync",
      description: "successful for External Drive A",
      timestamp: "5H AGO",
      icon: "refresh",
      user: "System",
    },
  ],
  storage: {
    usedSpace: "9425 GB / 1 TB",
    totalSpace: "1 TB",
    percentUsed: 94,
    media: "412 GB",
    docs: "320 GB",
  },
  suggestedProjects: [
    {
      id: "1",
      name: "Horizon Architecture Revamp",
      description:
        "Unified design system migration for core enterprise applications. High visibility audit.",
      status: "active",
      lastActivity: "1m ago",
      icon: "A",
    },
    {
      id: "2",
      name: "Security Protocol 2024",
      description:
        "Reviewing ISO 27001 compliance and implementing hardware-based M/A across...",
      status: "in-review",
      lastActivity: "1w ago",
      icon: "🔒",
    },
    {
      id: "3",
      name: "Data Lake Consolidation",
      description:
        "Migrating legacy SQL structure to high-performance, distributed storage with analytical...",
      status: "planning",
      lastActivity: "Yesterday",
      icon: "📊",
    },
  ],
};

export const Dashboard = () => {
  const data = MOCK_DASHBOARD_DATA;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {data.greeting}
          </h1>
          <p className="text-sm text-muted-foreground">
            You have {data.auditRequests} projects requiring immediate audit review
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-blue-600 text-white hover:bg-blue-700">
            <Upload className="mr-2 h-5 w-5" />
            Upload New
          </Button>
        </div>
      </div>

      {/* Quick Access Section */}
      <QuickAccessSection files={data.quickAccessFiles} />

      {/* Recent Activity and Suggested Projects Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="h-full">
          <RecentActivitySection activities={data.recentActivities} />
        </div>
        <div className="h-full">
          <SuggestedProjectsSection projects={data.suggestedProjects} />
        </div>
        {/* <div className="lg:col-span-1">
          <StorageSummaryCard storage={data.storage} />
        </div> */}
      </div>
    </div>
  );
};
