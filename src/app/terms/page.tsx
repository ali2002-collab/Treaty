import { Container } from "@/components/ui/container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-8">
      <Container className="max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
            <CardDescription className="text-lg">
              Last updated: {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using Treaty, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground mb-4">
                Treaty is an AI-powered contract analysis platform that provides:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Contract document analysis and risk assessment</li>
                <li>AI-generated insights and recommendations</li>
                <li>Contract type detection and clause extraction</li>
                <li>Risk scoring and opportunity identification</li>
                <li>Professional contract analysis tools</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
              <p className="text-muted-foreground mb-4">
                As a user of Treaty, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide accurate and complete information when creating your account</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use the service only for lawful purposes</li>
                <li>Not upload malicious files or attempt to compromise the system</li>
                <li>Respect intellectual property rights of others</li>
                <li>Not share your account with unauthorized users</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">4. Contract Analysis Disclaimer</h2>
              <p className="text-muted-foreground mb-4">
                Treaty provides AI-powered contract analysis for informational purposes only. Our analysis:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Is not legal advice and should not replace professional legal consultation</li>
                <li>May contain inaccuracies or errors</li>
                <li>Should be reviewed by qualified legal professionals</li>
                <li>Does not guarantee the completeness or accuracy of results</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">5. Data and Privacy</h2>
              <p className="text-muted-foreground">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices regarding the collection and use of your information.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">6. Service Availability</h2>
              <p className="text-muted-foreground">
                We strive to maintain high service availability but cannot guarantee uninterrupted access. The service may be temporarily unavailable due to maintenance, updates, or technical issues beyond our control.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                Treaty shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service. Our total liability shall not exceed the amount paid by you for the service.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
              <p className="text-muted-foreground">
                You may terminate your account at any time through your dashboard settings. We reserve the right to terminate or suspend your account for violations of these terms or for any other reason at our sole discretion.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">9. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We may modify these terms at any time. We will notify users of significant changes via email or through the service. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
              <p className="text-muted-foreground">
                If you have questions about these Terms of Service, please contact us at:{" "}
                <a href="mailto:syedmuhammadalihassan2002@hotmail.com" className="text-primary hover:underline">
                  syedmuhammadalihassan2002@hotmail.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  )
} 