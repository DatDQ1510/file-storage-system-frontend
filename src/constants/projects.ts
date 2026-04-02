import type { IProjectItem } from "@/types/projects";

export const PROJECT_ITEMS: IProjectItem[] = [
  {
    id: "titan-infrastructure",
    name: "Titan Infrastructure",
    category: "Internal Development",
    status: "active",
    projectLead: "Sarah Chen",
    updatedLabel: "2 h ago",
    totalFiles: 428,
    description:
      "Core platform modernization program for shared infrastructure, deployment workflows, and governance controls.",
    folders: [
      {
        id: "architecture",
        name: "Architecture",
        filesCount: 96,
        updatedLabel: "1 h ago",
      },
      {
        id: "deployment",
        name: "Deployment",
        filesCount: 74,
        updatedLabel: "3 h ago",
      },
      {
        id: "security-policies",
        name: "Security Policies",
        filesCount: 38,
        updatedLabel: "Yesterday",
      },
    ],
  },
  {
    id: "market-sentinel",
    name: "Market Sentinel",
    category: "Analytics and Research",
    status: "active",
    projectLead: "James Wilson",
    updatedLabel: "Yesterday",
    totalFiles: 1192,
    description:
      "Competitive intelligence and forecasting workspace with automated report generation and review loops.",
    folders: [
      {
        id: "raw-data",
        name: "Raw Data",
        filesCount: 468,
        updatedLabel: "4 h ago",
      },
      {
        id: "dashboards",
        name: "Dashboards",
        filesCount: 152,
        updatedLabel: "Today",
      },
      {
        id: "quarterly-reports",
        name: "Quarterly Reports",
        filesCount: 84,
        updatedLabel: "2 days ago",
      },
    ],
  },
  {
    id: "cyber-audit-q4",
    name: "Cyber Audit Q4",
    category: "Security Compliance",
    status: "active",
    projectLead: "Alex Morgen",
    updatedLabel: "5 min ago",
    totalFiles: 88,
    description:
      "Audit artifacts, compliance evidence, and remediation plans for the Q4 security assessment cycle.",
    folders: [
      {
        id: "evidence",
        name: "Evidence",
        filesCount: 37,
        updatedLabel: "10 min ago",
      },
      {
        id: "risk-register",
        name: "Risk Register",
        filesCount: 21,
        updatedLabel: "35 min ago",
      },
      {
        id: "remediation",
        name: "Remediation",
        filesCount: 14,
        updatedLabel: "1 h ago",
      },
    ],
  },
  {
    id: "project-orion-2023",
    name: "Project Orion (2023)",
    category: "Legacy Migration",
    status: "archived",
    projectLead: "System Archive",
    updatedLabel: "3 mo ago",
    totalFiles: 2440,
    description:
      "Archived migration dossier for Orion with historical runbooks, dependency maps, and postmortems.",
    folders: [
      {
        id: "migration-plan",
        name: "Migration Plan",
        filesCount: 129,
        updatedLabel: "3 mo ago",
      },
      {
        id: "legacy-schemas",
        name: "Legacy Schemas",
        filesCount: 322,
        updatedLabel: "4 mo ago",
      },
      {
        id: "postmortems",
        name: "Postmortems",
        filesCount: 43,
        updatedLabel: "5 mo ago",
      },
    ],
  },
];
