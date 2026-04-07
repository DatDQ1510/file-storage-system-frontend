import type { ITenantCreateInput, ITenantRecord } from "@/pages/system-admin/types"
import { createTenantRecord, fetchTenantRecords } from "@/pages/system-admin/api/tenant-api"

export const loadTenantRecords = async (): Promise<ITenantRecord[]> => {
  return fetchTenantRecords()
}

export const registerTenant = async (
  input: ITenantCreateInput
): Promise<ITenantRecord> => {
  return createTenantRecord(input)
}
