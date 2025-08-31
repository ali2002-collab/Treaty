"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, AlertTriangle, CheckCircle, Clock } from "lucide-react"

export function Hero() {
  return (
    <Section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-transparent" />
      
      <Container className="relative">
        <div className="text-center max-w-4xl mx-auto px-4 sm:px-6">
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6 leading-tight"
          >
            Turn complex contracts into{" "}
            <span className="bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">
              clear decisions.
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-2 sm:px-4 leading-relaxed"
          >
            Upload any contract and get instant AI-powered insights, risk assessment, and negotiation tips. Supports 50+ contract types across all industries.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 px-4"
          >
            <Link href="/signin" className="w-full sm:w-auto">
              <Button size="lg" className="text-base px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto min-w-[200px]">
                Analyze a contract
              </Button>
            </Link>
            <Link href="#demo" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="text-base px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto min-w-[200px]">
                View demo
              </Button>
            </Link>
          </motion.div>

          {/* Mock Analysis Card Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative px-2 sm:px-4"
          >
            <Card className="max-w-2xl mx-auto bg-card/50 backdrop-blur-sm border-border/50 shadow-2xl">
              <CardContent className="p-4 sm:p-6">
                {/* Header - Better mobile layout */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <FileText className="h-5 w-5 text-violet-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base font-medium truncate">Service Agreement Analysis</span>
                  </div>
                  <Badge variant="secondary" className="w-fit flex-shrink-0">Completed</Badge>
                </div>
                
                {/* Content - Improved mobile grid layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Risk Level - Full width on mobile */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground text-center sm:text-left">Risk Level</span>
                    <Badge variant="destructive" className="w-fit mx-auto sm:mx-0">High</Badge>
                  </div>
                  
                  {/* Key Issues - Full width on mobile */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground text-center sm:text-left">Key Issues</span>
                    <span className="text-sm font-medium text-center sm:text-left">3 found</span>
                  </div>
                  
                  {/* Analysis Time - Full width on mobile, spans both columns on larger screens */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-muted/30 rounded-lg sm:col-span-2">
                    <span className="text-sm text-muted-foreground text-center sm:text-left">Analysis Time</span>
                    <div className="flex items-center space-x-1 mx-auto sm:mx-0">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">2.3s</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Floating elements - Adjusted for mobile */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-6 h-6 sm:w-8 sm:h-8 bg-violet-500/20 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-violet-500" />
            </motion.div>
            
            <motion.div
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 w-6 h-6 sm:w-8 sm:h-8 bg-orange-500/20 rounded-full flex items-center justify-center"
            >
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </Section>
  )
}

// Import Section component
import { Section } from "@/components/ui/section" 