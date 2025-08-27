"use client"

import { motion } from "framer-motion"
import { Container } from "@/components/ui/container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  FileText, 
  Shield, 
  MessageSquare, 
  MessageCircle, 
  Trash2 
} from "lucide-react"

const features = [
  {
    icon: Upload,
    title: "Upload & Parse",
    description: "Support for PDF and DOCX files with intelligent document parsing",
    gradient: "from-blue-500/20 to-cyan-500/20",
    borderGradient: "from-blue-500/50 to-cyan-500/50"
  },
  {
    icon: FileText,
    title: "Clause Extraction",
    description: "Automatically identify Payment, IP, Termination, and Liability clauses",
    gradient: "from-violet-500/20 to-purple-500/20",
    borderGradient: "from-violet-500/50 to-purple-500/50"
  },
  {
    icon: Shield,
    title: "Risk Scoring",
    description: "Get High/Medium/Low risk assessments with detailed explanations",
    gradient: "from-orange-500/20 to-red-500/20",
    borderGradient: "from-orange-500/50 to-red-500/50"
  },
  {
    icon: MessageSquare,
    title: "Negotiation Points",
    description: "Actionable suggestions to improve contract terms and conditions",
    gradient: "from-green-500/20 to-emerald-500/20",
    borderGradient: "from-green-500/50 to-emerald-500/50"
  },
  {
    icon: MessageCircle,
    title: "Ask-AI Chat",
    description: "Get instant answers to questions about your specific contract",
    gradient: "from-indigo-500/20 to-blue-500/20",
    borderGradient: "from-indigo-500/50 to-blue-500/50"
  },
  {
    icon: Trash2,
    title: "Privacy-First",
    description: "Delete your data anytime with full control over your information",
    gradient: "from-gray-500/20 to-slate-500/20",
    borderGradient: "from-gray-500/50 to-slate-500/50"
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
}

export function BentoGrid() {
  return (
    <Section id="features" heading="Powerful Features" subheading="Everything you need to analyze contracts with confidence">
      <Container>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {features.map((feature, index) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card className="group h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <CardHeader className="relative z-10 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${feature.gradient} border border-gradient-to-r ${feature.borderGradient}`}>
                      <feature.icon className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                    </div>
                    <CardTitle className="text-base sm:text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                
                <CardContent className="relative z-10">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                  
                  {/* Example badges for risk scoring */}
                  {feature.title === "Risk Scoring" && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Badge variant="destructive" className="text-xs">High</Badge>
                      <Badge variant="secondary" className="text-xs">Medium</Badge>
                      <Badge variant="default" className="text-xs">Low</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Section>
  )
}

// Import Section component
import { Section } from "@/components/ui/section" 