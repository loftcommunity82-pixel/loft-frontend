import type { Plan, UserSubscription, BillingUsage, PlanId } from '../types'
import api from '@/lib/api'

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started',
    credits: '10',
    features: [
      '10 job applications',
      'Basic profile',
      'Resume upload',
      'English proficiency test',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    description: 'For serious job seekers',
    credits: '100',
    popular: true,
    features: [
      '100 job applications',
      'Premium profile badge',
      'Resume optimization',
      'Priority support',
      'Application tracking',
      'Interview scheduling',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$99',
    description: 'Maximum job search power',
    credits: 'Unlimited',
    features: [
      'Unlimited applications',
      'Featured profile',
      'Direct employer contacts',
      '24/7 support',
      'Resume review by experts',
      'Mock interviews',
      'Career coaching',
    ],
  },
]

export const getPlans = (): Plan[] => {
  return PLANS
}

export const getPlanById = (planId: PlanId): Plan | undefined => {
  return PLANS.find(plan => plan.id === planId)
}

export const getCurrentSubscription = async (): Promise<UserSubscription> => {
  const { data } = await api.get('/billing/subscription')
  return data
}

export const getBillingUsage = async (): Promise<BillingUsage> => {
  const { data } = await api.get('/billing/usage')
  return data
}

export const upgradeSubscription = async (planId: PlanId): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.post('/billing/upgrade', { planId })
  return data
}

export const getPlanLimit = (planId: PlanId): number => {
  const plan = getPlanById(planId)
  if (!plan) return 0
  if (plan.credits === 'Unlimited') return Infinity
  return parseInt(plan.credits, 10)
}
