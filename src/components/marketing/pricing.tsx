import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      "3 contract analyses per day",
      "Basic risk assessment",
      "Standard clause extraction",
      "Email support"
    ],
    popular: false,
    cta: "Get Started"
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For professionals and small teams",
    features: [
      "Unlimited contract analyses",
      "Advanced risk scoring",
      "AI-powered insights",
      "Priority support",
      "Export reports",
      "Team collaboration"
    ],
    popular: true,
    cta: "Start Pro Trial"
  },
  {
    name: "Business",
    price: "$99",
    period: "/month",
    description: "For enterprise teams",
    features: [
      "Everything in Pro",
      "Custom integrations",
      "Advanced analytics",
      "Dedicated support",
      "SLA guarantees",
      "Custom training"
    ],
    popular: false,
    cta: "Contact Sales"
  }
]

export function Pricing() {
  return (
    <Section id="pricing" heading="Simple, Transparent Pricing" subheading="Choose the plan that fits your needs">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative ${
                plan.popular 
                  ? 'ring-2 ring-violet-500 shadow-lg scale-105' 
                  : 'border-border/50'
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-violet-500 text-white">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl sm:text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {plan.description}
                </CardDescription>
                <div className="pt-4">
                  <span className="text-3xl sm:text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground text-sm sm:text-base">{plan.period}</span>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start space-x-3">
                      <Check className="h-4 w-4 text-violet-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-violet-500 hover:bg-violet-600' 
                      : 'bg-primary hover:bg-primary/90'
                  }`}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  )
} 