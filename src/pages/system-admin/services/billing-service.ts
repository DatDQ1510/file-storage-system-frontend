import type { IPlanCard, INewPlanInput } from "@/pages/system-admin/types"
import { createPlanCard, fetchArchivePlanCards, fetchPlanCards } from "@/pages/system-admin/api/billing-api"

export const loadPlanCards = async (): Promise<IPlanCard[]> => {
  return fetchPlanCards()
}

export const loadArchivePlanCards = async (): Promise<IPlanCard[]> => {
  return fetchArchivePlanCards()
}

export const addPlanCard = async (input: INewPlanInput): Promise<IPlanCard> => {
  return createPlanCard(input)
}
