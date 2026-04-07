import type { IProjectFileDetail } from "@/types/project-file";

export const PROJECT_FILE_ITEMS: IProjectFileDetail[] = [
  {
    id: "titan-foundation-plan-v2",
    projectId: "titan-infrastructure",
    projectName: "Titan Corporate Plaza",
    name: "Titan-Foundation-Plan-V2.pdf",
    fileTypeLabel: "Technical Architectural Specification · PDF Document",
    owner: "Sarah Chen",
    sizeLabel: "12.8 MB",
    dimensionsLabel: "PDF (A1)",
    createdLabel: "Created Oct 15",
    modifiedLabel: "Modified Today",
    complianceTitle: "Compliance Seal",
    complianceDescription: "Verified for Titan Corporate Plaza safety regulations on Oct 24, 2023",
    permissions: ["Editor", "Viewer"],
    versions: [
      {
        id: "v20",
        label: "V2.0",
        title: "Current Version",
        submittedAt: "Oct 24, 2023 · 14:32",
      },
      {
        id: "v12",
        label: "V1.2",
        title: "Internal Review Build",
        submittedAt: "Oct 22, 2023 · 09:15",
      },
      {
        id: "v10",
        label: "V1.0",
        title: "Initial Submission",
        submittedAt: "Oct 15, 2023 · 11:00",
      },
    ],
    activityItems: [
      {
        id: "a1",
        actor: "Alex Thompson",
        message: "viewed the file",
        timeLabel: "24 minutes ago",
      },
      {
        id: "a2",
        actor: "Sarah Chen",
        message: "uploaded V2.0",
        timeLabel: "4 hours ago",
      },
      {
        id: "a3",
        actor: "Marcus Reed",
        message: "shared with 2 stakeholders",
        timeLabel: "Yesterday at 16:45",
      },
    ],
  },
  {
    id: "market-sentinel-kpi-dashboard",
    projectId: "market-sentinel",
    projectName: "Market Sentinel",
    name: "KPI-Research-Dashboard.pdf",
    fileTypeLabel: "Quarterly Analytics Summary · PDF Document",
    owner: "James Wilson",
    sizeLabel: "9.4 MB",
    dimensionsLabel: "PDF (A3)",
    createdLabel: "Created Feb 03",
    modifiedLabel: "Modified Yesterday",
    complianceTitle: "Compliance Seal",
    complianceDescription: "Validated for executive reporting standards on Feb 04, 2026",
    permissions: ["Editor", "Viewer"],
    versions: [
      {
        id: "ms20",
        label: "V2.0",
        title: "Current Version",
        submittedAt: "Feb 04, 2026 · 09:20",
      },
      {
        id: "ms11",
        label: "V1.1",
        title: "Stakeholder Review",
        submittedAt: "Feb 03, 2026 · 18:00",
      },
    ],
    activityItems: [
      {
        id: "msa1",
        actor: "Priya Nair",
        message: "added comments",
        timeLabel: "1 hour ago",
      },
      {
        id: "msa2",
        actor: "James Wilson",
        message: "exported as PDF",
        timeLabel: "Yesterday",
      },
    ],
  },
  {
    id: "cyber-audit-remediation-pack",
    projectId: "cyber-audit-q4",
    projectName: "Cyber Audit Q4",
    name: "Remediation-Pack-Q4.pdf",
    fileTypeLabel: "Security Remediation Report · PDF Document",
    owner: "Alex Morgen",
    sizeLabel: "6.7 MB",
    dimensionsLabel: "PDF (A4)",
    createdLabel: "Created Mar 10",
    modifiedLabel: "Modified 2 h ago",
    complianceTitle: "Compliance Seal",
    complianceDescription: "Approved for internal governance review on Mar 11, 2026",
    permissions: ["Editor", "Viewer"],
    versions: [
      {
        id: "ca21",
        label: "V2.1",
        title: "Current Version",
        submittedAt: "Mar 11, 2026 · 08:50",
      },
      {
        id: "ca20",
        label: "V2.0",
        title: "Audit Committee Draft",
        submittedAt: "Mar 10, 2026 · 22:14",
      },
    ],
    activityItems: [
      {
        id: "caa1",
        actor: "Lina Gomez",
        message: "confirmed remediation status",
        timeLabel: "2 h ago",
      },
      {
        id: "caa2",
        actor: "Alex Morgen",
        message: "uploaded supporting evidence",
        timeLabel: "5 h ago",
      },
    ],
  },
];

export const getProjectFilePathByIds = (projectId: string, fileId: string) => {
  return `/projects/${projectId}/files/${fileId}`;
};

export const getProjectFileDetail = (projectId?: string, fileId?: string) => {
  return PROJECT_FILE_ITEMS.find((fileItem) => {
    return fileItem.projectId === projectId && fileItem.id === fileId;
  });
};

export const getDefaultProjectFileId = (projectId?: string) => {
  const firstProjectFile = PROJECT_FILE_ITEMS.find((fileItem) => {
    return fileItem.projectId === projectId;
  });

  return firstProjectFile?.id;
};

