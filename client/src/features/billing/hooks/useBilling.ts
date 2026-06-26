import { useState, useEffect, useCallback } from 'react'
import type { Plan, UserSubscription, BillingUsage, PlanId } from '../types'
import {
  getPlans,
  getCurrentSubscription,
  getBillingUsage,
  upgradeSubscription,
  getPlanLimit,
} from '../services/billingService'

interface UseBillingState {
  plans: Plan[]
  currentSubscription: UserSubscription | null
  usage: BillingUsage | null
  loading: boolean
  upgrading: boolean
  error: string | null
  currentPlanId: PlanId
  currentPlan: Plan | undefined
  applicationsLimit: number
}

interface UseBillingActions {
  upgradePlan: (planId: PlanId) => Promise<boolean>
  refreshData: () => Promise<void>
}

export type UseBilling = UseBillingState & UseBillingActions

export const useBilling = (): UseBilling => {
  const [plans, setPlans] = useState<Plan[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null)
  const [usage, setUsage] = useState<BillingUsage | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [plansData, subscriptionData, usageData] = await Promise.all([
        getPlans(),
        getCurrentSubscription(),
        getBillingUsage(),
      ])

      setPlans(plansData)
      setCurrentSubscription(subscriptionData)
      setUsage(usageData)
    } catch (err) {
      console.error('Error fetching billing data', err)
      setError('Failed to load billing information')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const upgradePlan = useCallback(async (planId: PlanId): Promise<boolean> => {
    try {
      setUpgrading(true)
      setError(null)

      const result = await upgradeSubscription(planId)

      if (result.success) {
        const updatedSubscription = await getCurrentSubscription()
        const updatedUsage = await getBillingUsage()

        setCurrentSubscription(updatedSubscription)
        setUsage(updatedUsage)

        return true
      }

      setError(result.message)
      return false
    } catch (err) {
      console.error('Error upgrading plan', err)
      setError('Failed to upgrade subscription')
      return false
    } finally {
      setUpgrading(false)
    }
  }, [])

  const refreshData = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  const currentPlanId: PlanId = (currentSubscription?.planId as PlanId) || 'free'
  const currentPlan = plans.find(p => p.id === currentPlanId)
  const applicationsLimit = currentPlan ? getPlanLimit(currentPlanId) : 0

  return {
    plans,
    currentSubscription,
    usage,
    loading,
    upgrading,
    error,
    currentPlanId,
    currentPlan,
    applicationsLimit,
    upgradePlan,
    refreshData,
  }
}
