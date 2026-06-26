import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles, Loader2 } from 'lucide-react'
import type { Plan, PlanId } from '../types'
import { useBilling } from '../hooks/useBilling'

interface BillingDashboardProps {
  onPlanSelect?: (planId: PlanId) => void
}

export const BillingDashboard = ({ onPlanSelect }: BillingDashboardProps) => {
  const {
    plans,
    usage,
    loading,
    upgrading,
    error,
    currentPlanId,
    currentPlan,
    applicationsLimit,
    upgradePlan,
  } = useBilling()

  const handleUpgrade = async (planId: PlanId) => {
    if (onPlanSelect) {
      onPlanSelect(planId)
    } else {
      await upgradePlan(planId)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-800 rounded-lg">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Subscription Plans</h1>
          <p className="text-muted-foreground">Choose the plan that fits your job search needs</p>
        </div>
        <Badge variant="outline" className="border-emerald-500 text-emerald-400">
          Current: {currentPlan?.name || 'Free'}
        </Badge>
      </div>

      <UsageCard usage={usage} applicationsLimit={applicationsLimit} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            currentPlanId={currentPlanId}
            upgrading={upgrading}
            onUpgrade={handleUpgrade}
          />
        ))}
      </div>

      <FAQSection />
    </div>
  )
}

const UsageCard = ({
  usage,
  applicationsLimit
}: {
  usage: ReturnType<typeof useBilling>['usage']
  applicationsLimit: number
}) => {
  if (!usage) return null

  const limitDisplay = applicationsLimit === Infinity ? '∞' : applicationsLimit

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Your Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-muted-foreground text-sm">Applications Used</p>
            <p className="text-2xl font-bold text-foreground">
              {usage.applicationsUsed} / {limitDisplay}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-muted-foreground text-sm">Profile Views</p>
            <p className="text-2xl font-bold text-foreground">{usage.profileViews}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-muted-foreground text-sm">Interview Requests</p>
            <p className="text-2xl font-bold text-foreground">{usage.interviewRequests}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const PlanCard = ({
  plan,
  currentPlanId,
  upgrading,
  onUpgrade,
}: {
  plan: Plan
  currentPlanId: PlanId
  upgrading: boolean
  onUpgrade: (planId: PlanId) => void
}) => {
  const isCurrentPlan = currentPlanId === plan.id

  return (
    <Card
      className={`relative bg-card border-border ${
        plan.popular ? 'border-emerald-500' : ''
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-emerald-500 text-foreground">
            <Sparkles className="h-3 w-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}
      <CardHeader className="text-center">
        <CardTitle className="text-foreground text-xl">{plan.name}</CardTitle>
        <div className="text-4xl font-bold text-foreground mt-2">
          {plan.price}
          <span className="text-lg font-normal text-muted-foreground">/month</span>
        </div>
        <CardDescription className="text-muted-foreground">{plan.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 mb-6">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span className="text-foreground/80 text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          className={`w-full ${
            isCurrentPlan
              ? 'bg-muted'
              : plan.popular
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-muted hover:bg-muted'
          }`}
          disabled={isCurrentPlan || upgrading}
          onClick={() => onUpgrade(plan.id as PlanId)}
        >
          {isCurrentPlan
            ? 'Current Plan'
            : upgrading
            ? 'Processing...'
            : 'Upgrade'
          }
        </Button>
      </CardContent>
    </Card>
  )
}

const FAQSection = () => {
  const faqs = [
    {
      question: 'What counts as an application?',
      answer: 'Each job you apply to counts as one application. You can track your remaining applications in your dashboard.',
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access until the end of your billing period.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, and PayPal through our secure payment partner Stripe.',
    },
  ]

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Frequently Asked Questions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {faqs.map((faq) => (
          <div key={faq.question}>
            <h4 className="font-medium text-foreground">{faq.question}</h4>
            <p className="text-muted-foreground text-sm mt-1">{faq.answer}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default BillingDashboard
