import { Container } from "@/components/ui/container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
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
            <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
            <CardDescription className="text-lg">
              Last updated: {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <p className="text-muted-foreground mb-4">
                Treaty collects information you provide directly to us, such as when you create an account, upload contracts, or contact us for support.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Account information (email, password)</li>
                <li>Contract documents you upload for analysis</li>
                <li>Usage data and analytics</li>
                <li>Communication records when you contact us</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">
                We use the information we collect to provide, maintain, and improve our services:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Process and analyze your contracts using AI</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Improve our AI models and service quality</li>
                <li>Send important service updates and notifications</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">3. Data Security</h2>
              <p className="text-muted-foreground mb-4">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>End-to-end encryption for data transmission</li>
                <li>Secure cloud storage with access controls</li>
                <li>Regular security audits and updates</li>
                <li>Limited employee access to user data</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">4. Data Retention</h2>
              <p className="text-muted-foreground">
                We retain your data only as long as necessary to provide our services. You can request deletion of your account and associated data at any time.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">5. Third-Party Services</h2>
              <p className="text-muted-foreground">
                We use trusted third-party services for AI processing (Google Gemini) and cloud infrastructure. These services are bound by strict data protection agreements and never retain your contract data beyond processing.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
              <p className="text-muted-foreground mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Access and download your data</li>
                <li>Request correction of inaccurate information</li>
                <li>Delete your account and associated data</li>
                <li>Opt-out of non-essential communications</li>
                <li>Contact us with privacy concerns</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions about this Privacy Policy or our data practices, please contact us at:{" "}
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