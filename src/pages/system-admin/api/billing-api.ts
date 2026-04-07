import type { IPlanCard, INewPlanInput } from "@/pages/system-admin/types"
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

export const createPlanCard = async (input: INewPlanInput): Promise<IPlanCard> => {
  return Promise.resolve({
    tier: input.name.includes("Enterprise") ? "Tier 03" : input.name.includes("Professional") ? "Tier 02" : "Tier 01",
    name: input.name,
    price: `$${input.price}`,
    period: input.billingCycle,
    status: input.status,
    description: input.description,
    storageLimit: input.storageLimit,
    maxUsers: input.maxUsers,
    features: input.features,
    tenants: `${input.maxUsers}`,
  })
}
