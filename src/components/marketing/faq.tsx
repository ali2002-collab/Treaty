import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "What file formats does Treaty support?",
    answer: "Treaty currently supports DOCX files. We're working on adding support for more formats including Google Docs and plain text files."
  },
  {
    question: "How accurate is the AI analysis?",
    answer: "Our AI model has been trained on millions of legal documents and achieves over 95% accuracy in clause identification and risk assessment. However, we always recommend having a legal professional review important contracts."
  },
  {
    question: "Is my contract data secure and private?",
    answer: "Absolutely. We use enterprise-grade encryption and never share your data with third parties. You can delete your data at any time, and we're fully compliant with GDPR and other privacy regulations."
  },
  {
    question: "Can I use Treaty for any type of contract?",
    answer: "Yes! Treaty works with employment agreements, service contracts, NDAs, partnership agreements, and more. Our AI adapts to different contract types and legal jurisdictions."
  },
  {
    question: "How long does analysis take?",
    answer: "Most contracts are analyzed in under 30 seconds. Complex documents with many pages may take up to 2-3 minutes. You'll receive real-time progress updates during analysis."
  },
  {
    question: "What if I need help understanding the results?",
    answer: "Our AI chat feature lets you ask questions about your specific contract. Plus, our support team is available to help with any questions about your analysis results."
  }
]

export function FAQ() {
  return (
    <Section id="faq" heading="Frequently Asked Questions" subheading="Everything you need to know about Treaty">
      <Container>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-medium">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </Section>
  )
} 