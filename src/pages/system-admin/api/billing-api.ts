import { api } from "@/lib/api/axios-client"
import type { IApiResponse } from "@/types/auth"
import type { IPlanCard, INewPlanInput, TBillingCycle } from "@/pages/system-admin/types"

export type TSubscriptionPlanBillingCycle = "MONTHLY" | "QUARTERLY" | "YEARLY"
export type TSubscriptionPlanStatus = "ACTIVE" | "INACTIVE"

export interface ISubscriptionPlanRequest {
  namePlan: string
  description: string
  baseStorageLimit: number
  maxUsers: number
  price: number
  billingCycle: TSubscriptionPlanBillingCycle
  planStatus: TSubscriptionPlanStatus
  features: Record<string, unknown>
}

export interface ISubscriptionPlanResponse {
  id: string
  namePlan: string
  description?: string
  baseStorageLimit: number | string
  maxUsers: number
  price: number
  billingCycle: TSubscriptionPlanBillingCycle
  planStatus: TSubscriptionPlanStatus
  features: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

const formatBillingCycle = (billingCycle: string) => {
  switch (billingCycle) {
    case "MONTHLY":
      return "Monthly"
    case "QUARTERLY":
      return "Quarterly"
    case "YEARLY":
      return "Yearly"
    default:
      return billingCycle
  }
}

const mapSubscriptionPlanToPlanCard = (plan: ISubscriptionPlanResponse): IPlanCard => ({
  id: plan.id,
  tier: plan.namePlan.includes("Enterprise")
    ? "Tier 03"
    : plan.namePlan.includes("Professional")
    ? "Tier 02"
    : "Tier 01",
  name: plan.namePlan,
  price: `$${plan.price}`,
  period: formatBillingCycle(plan.billingCycle),
  status: plan.planStatus === "INACTIVE" ? "Inactive" : "Active",
  description: plan.description,
  storageLimit:
    typeof plan.baseStorageLimit === "string"
      ? Number(plan.baseStorageLimit)
      : plan.baseStorageLimit,
  maxUsers: plan.maxUsers,
  features: plan.features ? Object.keys(plan.features) : [],
  tenants: `${plan.maxUsers}`,
})

export const fetchSubscriptionPlans = async (
  status?: TSubscriptionPlanStatus
): Promise<IPlanCard[]> => {
  const response = await api.get<IApiResponse<ISubscriptionPlanResponse[]>>(
    "/subscription-plans",
    status ? { params: { status } } : undefined
  )

  return response.data.data.map(mapSubscriptionPlanToPlanCard)
}

export const createSubscriptionPlan = async (
  input: ISubscriptionPlanRequest
): Promise<ISubscriptionPlanResponse> => {
  const response = await api.post<IApiResponse<ISubscriptionPlanResponse>>(
    "/subscription-plans",
    input
  )

  return response.data.data
}

export const fetchSubscriptionPlanById = async (
  subscriptionPlanId: string
): Promise<ISubscriptionPlanResponse> => {
  const response = await api.get<IApiResponse<ISubscriptionPlanResponse>>(
    `/subscription-plans/${subscriptionPlanId}`
  )

  return response.data.data
}

export const updateSubscriptionPlan = async (
  subscriptionPlanId: string,
  input: ISubscriptionPlanRequest
): Promise<ISubscriptionPlanResponse> => {
  const response = await api.put<IApiResponse<ISubscriptionPlanResponse>>(
    `/subscription-plans/${subscriptionPlanId}`,
    input
  )

  return response.data.data
}

export const deleteSubscriptionPlan = async (
  subscriptionPlanId: string
): Promise<void> => {
  await api.delete(`/subscription-plans/${subscriptionPlanId}`)
}

const normalizeBillingCycleValue = (
  billingCycle: TBillingCycle
): TSubscriptionPlanBillingCycle => {
  switch (billingCycle) {
    case "Monthly":
      return "MONTHLY"
    case "Quarterly":
      return "QUARTERLY"
    case "Yearly":
      return "YEARLY"
    default:
      return billingCycle as TSubscriptionPlanBillingCycle
  }
}

const normalizePlanStatusValue = (status: INewPlanInput["status"]): TSubscriptionPlanStatus => {
  return status === "Inactive" ? "INACTIVE" : "ACTIVE"
}

export const createPlanCard = async (input: INewPlanInput): Promise<IPlanCard> => {
  const payload = toSubscriptionPlanPayload(input)
  const created = await createSubscriptionPlan(payload)
  return mapSubscriptionPlanToPlanCard(created)
}

export const toSubscriptionPlanPayload = (input: INewPlanInput): ISubscriptionPlanRequest => {
  return {
    namePlan: input.name,
    description: input.description,
    baseStorageLimit: input.storageLimit,
    maxUsers: input.maxUsers,
    price: input.price,
    billingCycle: normalizeBillingCycleValue(input.billingCycle),
    planStatus: normalizePlanStatusValue(input.status),
    features: input.features.reduce<Record<string, boolean>>((acc, feature) => {
      acc[feature] = true
      return acc
    }, {}),
  }
}
