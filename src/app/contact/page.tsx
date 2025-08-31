import { Container } from "@/components/ui/container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Mail, MessageSquare, Clock, MapPin } from "lucide-react"

export default function ContactPage() {
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
            <CardTitle className="text-3xl font-bold">Contact Us</CardTitle>
            <CardDescription className="text-lg">
              Get in touch with our team for support, questions, or feedback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-muted/30 rounded-lg">
                <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Got a question? Send us an email anytime
                </p>
                <a 
                  href="mailto:syedmuhammadalihassan2002@hotmail.com"
                  className="text-primary hover:underline font-medium"
                >
                </a>
              </div>
              
              <div className="text-center p-6 bg-muted/30 rounded-lg">
                <MessageSquare className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Response Time</h3>
                <p className="text-sm text-muted-foreground">
                  We typically respond within 24 hours during business days
                </p>
              </div>
              
              <div className="text-center p-6 bg-muted/30 rounded-lg">
                <Clock className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Support Hours</h3>
                <p className="text-sm text-muted-foreground">
                  Monday - Friday: 9:00 AM - 6:00 PM GMT
                </p>
              </div>
            </div>

            {/* Quick Contact */}
            <div className="text-center p-6 bg-primary/5 rounded-lg border border-primary/20">
              <h3 className="text-xl font-semibold mb-4">Quick Contact</h3>
              <p className="text-muted-foreground mb-4">
                For immediate assistance, click the button below to send us an email:
              </p>
              <Button asChild size="lg" className="px-8">
                <a href="mailto:syedmuhammadalihassan2002@hotmail.com?subject=Treaty Support Request">
                  Send Email
                </a>
              </Button>
            </div>

            {/* What We Can Help With */}
            <div>
              <h3 className="text-xl font-semibold mb-4">What We Can Help With</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/20 rounded-lg">
                  <h4 className="font-medium mb-2">Technical Support</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Account access issues</li>
                    <li>• Contract upload problems</li>
                    <li>• Analysis result questions</li>
                    <li>• Platform navigation help</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-muted/20 rounded-lg">
                  <h4 className="font-medium mb-2">General Inquiries</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Feature requests</li>
                    <li>• Partnership opportunities</li>
                    <li>• Feedback and suggestions</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="text-center p-6 bg-muted/30 rounded-lg">
              <h3 className="font-semibold mb-2">Need More Help?</h3>
              <p className="text-muted-foreground mb-4">
                Check out our FAQ section for quick answers to common questions
              </p>
              <Button asChild variant="outline">
                <Link href="/#faq">View FAQ</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  )
} 