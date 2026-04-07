import type { ITenantCreateInput, ITenantRecord } from "@/pages/system-admin/types"
import { TENANT_TABLE_DATA } from "@/pages/system-admin/constants"

const formatTenantCreatedDate = (): string =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date())

const resolveQuotaPercent = (extraStorageSize: number): number => {
  return Math.min(Math.max(Math.round((extraStorageSize / 100) * 100), 0), 100)
}

export const fetchTenantRecords = async (): Promise<ITenantRecord[]> => {
  // TODO: Replace mock implementation with real backend request
  return Promise.resolve(TENANT_TABLE_DATA)
}

export const createTenantRecord = async (
  input: ITenantCreateInput
): Promise<ITenantRecord> => {
  const quotaPercent = resolveQuotaPercent(input.extraStorageSize)

  return Promise.resolve({
    businessName: input.businessName,
    nodeCode: input.nodeCode,
    status: input.status,
    plan: input.plan,
    quotaUsed: `${input.extraStorageSize} ${input.storageUnit}`,
    quotaPercent,
    createdDate: formatTenantCreatedDate(),
    region: input.region,
    adminName: input.adminName,
    adminEmail: input.adminEmail,
  })
}
