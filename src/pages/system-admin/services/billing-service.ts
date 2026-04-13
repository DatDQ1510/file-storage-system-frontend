import type { IPlanCard, INewPlanInput } from "@/pages/system-admin/types"
import {
  createPlanCard,
  fetchArchivePlanCards,
  fetchSubscriptionPlans,
} from "@/pages/system-admin/api/billing-api"

export const loadPlanCards = async (): Promise<IPlanCard[]> => {
  return fetchSubscriptionPlans()
}

export const loadArchivePlanCards = async (): Promise<IPlanCard[]> => {
  return fetchArchivePlanCards()
}

export const loadSubscriptionPlans = async (): Promise<IPlanCard[]> => {
  return fetchSubscriptionPlans()
}

export const addPlanCard = async (input: INewPlanInput): Promise<IPlanCard> => {
  return createPlanCard(input)
}
