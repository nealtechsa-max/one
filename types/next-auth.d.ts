import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string
      role: string
      membership?: {
        id: string
        status: string
        hoursUsedThisMonth: number
        plan: {
          id: string
          name: string
          monthlyFee: number
          hoursIncluded: number
          discountedHourlyRate: number
          color: string
        }
      } | null
    }
  }
}
