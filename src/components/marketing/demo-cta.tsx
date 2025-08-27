import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Shield, BarChart3, Play } from "lucide-react"

const steps = [
  {
    icon: Upload,
    title: "Upload",
    description: "Drag & drop your contract file"
  },
  {
    icon: FileText,
    title: "Parse",
    description: "AI extracts key information"
  },
  {
    icon: Shield,
    title: "Analyze",
    description: "Risk assessment & insights"
  },
  {
    icon: BarChart3,
    title: "Report",
    description: "Get actionable recommendations"
  }
]

export function DemoCTA() {
  return (
    <Section id="demo" className="bg-gradient-to-br from-background via-muted/30 to-background">
      <Container>
        <Card className="max-w-4xl mx-auto bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
          <CardHeader className="text-center pb-6 sm:pb-8 px-4 sm:px-6">
            <CardTitle className="text-2xl sm:text-3xl md:text-4xl mb-4">
              See Treaty in Action
            </CardTitle>
            <CardDescription className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Watch how Treaty transforms complex contracts into clear, actionable insights in just a few seconds.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 sm:space-y-8 px-4 sm:px-6">
            {/* Analysis Flow */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {steps.map((step, index) => (
                <div key={step.title} className="text-center">
                  <div className="relative">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <step.icon className="h-5 w-5 sm:h-6 sm:w-6 text-violet-500" />
                    </div>
                    {index < steps.length - 1 && (
                      <div className="hidden sm:block absolute top-5 left-full w-full h-px bg-gradient-to-r from-violet-500/30 to-transparent transform translate-x-1/2" />
                    )}
                  </div>
                  <h3 className="font-semibold mb-1 text-sm sm:text-base">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button size="lg" variant="outline" className="text-base px-6 sm:px-8 py-5 sm:py-6">
                <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Watch Quick Demo
              </Button>
              <Button size="lg" className="text-base px-6 sm:px-8 py-5 sm:py-6">
                Get Started Free
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>
    </Section>
  )
} 