import type { IPlanCard, INewPlanInput } from "@/pages/system-admin/types"
import {
  createPlanCard,
  createSubscriptionPlan,
  deleteSubscriptionPlan,
  fetchSubscriptionPlanById,
  fetchSubscriptionPlans,
  toSubscriptionPlanPayload,
  updateSubscriptionPlan,
} from "@/pages/system-admin/api/billing-api"

export const loadPlanCards = async (): Promise<IPlanCard[]> => {
  return fetchSubscriptionPlans("ACTIVE")
}

export const loadArchivePlanCards = async (): Promise<IPlanCard[]> => {
  return fetchSubscriptionPlans("INACTIVE")
}

export const loadSubscriptionPlans = async (): Promise<IPlanCard[]> => {
  return fetchSubscriptionPlans()
}

export const addPlanCard = async (input: INewPlanInput): Promise<IPlanCard> => {
  return createPlanCard(input)
}

export const getSubscriptionPlanDetail = async (planId: string) => {
  return fetchSubscriptionPlanById(planId)
}

export const createSubscriptionPlanFromInput = async (input: INewPlanInput) => {
  return createSubscriptionPlan(toSubscriptionPlanPayload(input))
}

export const updateSubscriptionPlanFromInput = async (
  planId: string,
  input: INewPlanInput
) => {
  return updateSubscriptionPlan(planId, toSubscriptionPlanPayload(input))
}

export const removeSubscriptionPlan = async (planId: string) => {
  return deleteSubscriptionPlan(planId)
}
