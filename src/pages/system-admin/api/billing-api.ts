import { api } from "@/lib/api/axios-client"
import type { IApiResponse } from "@/types/auth"
import type { IPlanCard, INewPlanInput, TBillingCycle } from "@/pages/system-admin/types"
import { PLAN_CARDS } from "@/pages/system-admin/constants"

const ARCHIVE_PLAN_CARDS: IPlanCard[] = [
  {
    tier: "Legacy",
    name: "Beta Preview Plan",
    price: "$0.00",
    period: "Lifetime",
    features: ["Limited tenant capacity", "Legacy support model", "No SLA"],
    tenants: "128",
  },
  {
    tier: "Legacy",
    name: "Legacy Small Business",
    price: "$29.00",
    period: "/month",
    features: ["5 active tenants", "20GB storage", "Email support"],
    tenants: "54",
  },
]

export const fetchPlanCards = async (): Promise<IPlanCard[]> => {
  return Promise.resolve(PLAN_CARDS)
}

export const fetchArchivePlanCards = async (): Promise<IPlanCard[]> => {
  return Promise.resolve(ARCHIVE_PLAN_CARDS)
}

export type TSubscriptionPlanBillingCycle = "MONTHLY" | "QUARTERLY" | "YEARLY"

export interface ISubscriptionPlanRequest {
  namePlan: string
  description: string
  baseStorageLimit: number
  maxUsers: number
  price: number
  billingCycle: TSubscriptionPlanBillingCycle
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
  status: "Active",
  description: plan.description,
  storageLimit:
    typeof plan.baseStorageLimit === "string"
      ? Number(plan.baseStorageLimit)
      : plan.baseStorageLimit,
  maxUsers: plan.maxUsers,
  features: plan.features ? Object.keys(plan.features) : [],
  tenants: `${plan.maxUsers}`,
})

export const fetchSubscriptionPlans = async (): Promise<IPlanCard[]> => {
  const response = await api.get<IApiResponse<ISubscriptionPlanResponse[]>>(
    "/subscription-plans"
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

export const createPlanCard = async (input: INewPlanInput): Promise<IPlanCard> => {
  const payload: ISubscriptionPlanRequest = {
    namePlan: input.name,
    description: input.description,
    baseStorageLimit: input.storageLimit,
    maxUsers: input.maxUsers,
    price: input.price,
    billingCycle: normalizeBillingCycleValue(input.billingCycle),
    features: input.features.reduce<Record<string, boolean>>((acc, feature) => {
      acc[feature] = true
      return acc
    }, {}),
  }

  await createSubscriptionPlan(payload)

  return {
    tier: input.name.includes("Enterprise")
      ? "Tier 03"
      : input.name.includes("Professional")
      ? "Tier 02"
      : "Tier 01",
    name: input.name,
    price: `$${input.price}`,
    period: input.billingCycle,
    status: input.status,
    description: input.description,
    storageLimit: input.storageLimit,
    maxUsers: input.maxUsers,
    features: input.features,
    tenants: `${input.maxUsers}`,
  }
}
