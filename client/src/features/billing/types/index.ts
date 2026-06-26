export interface Plan {
  id: string
  name: string
  price: string
  description: string
  features: string[]
  popular?: boolean
  credits: string
}

export interface UserSubscription {
  id: string
  userId: string
  planId: string
  status: 'active' | 'cancelled' | 'expired'
  currentPeriodStart: Date
  currentPeriodEnd: Date
}

export interface BillingUsage {
  applicationsUsed: number
  applicationsLimit: number
  profileViews: number
  interviewRequests: number
}

export interface UpgradeRequest {
  planId: string
}

export interface UpgradeResponse {
  success: boolean
  message: string
  subscription?: UserSubscription
}

export type PlanId = 'free' | 'pro' | 'premium'
