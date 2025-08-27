"use client"

import { motion } from "framer-motion"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"

const companies = [
  { name: "Microsoft", logo: "M" },
  { name: "IBM", logo: "IBM" },
  { name: "Google", logo: "G" },
  { name: "Stanford", logo: "S" }
]

export function SocialProof() {
  return (
    <Section className="bg-gradient-to-br from-muted/40 via-muted/20 to-background">
      <Container>
        <div className="text-center px-4">
          <p className="text-sm text-muted-foreground mb-6">
            Built with industry-standard practices
          </p>
          
          <div className="flex items-center justify-center space-x-8 sm:space-x-12 opacity-70">
            {companies.map((company, index) => (
              <motion.div
                key={company.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center space-y-2 group"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-violet-500/10 to-violet-600/10 border border-violet-500/20 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105">
                  <span className="text-lg sm:text-xl font-bold text-violet-600 dark:text-violet-400">
                    {company.logo}
                  </span>
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                  {company.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
} 