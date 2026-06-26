'use server'

import { createLogger } from '@/lib/logger'

const log = createLogger('dashboard-data')

export const getDashboardData = async () => {
  try {
    return {
      user: null,
      stats: {
        totalApplications: 0,
        pendingApplications: 0,
        interviews: 0,
        hired: 0,
      },
      recentJobs: [],
    }
  } catch (error) {
    log.error('Error fetching dashboard data', error)
    return null
  }
}
