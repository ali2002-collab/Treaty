"use client"

import { motion } from "framer-motion"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import Image from "next/image"

const companies = [
  { 
    name: "Microsoft", 
    logo: "/logos/microsoft.svg",
    fallback: "M"
  },
  { 
    name: "IBM", 
    logo: "/logos/ibm.svg",
    fallback: "IBM"
  },
  { 
    name: "Google", 
    logo: "/logos/google.svg",
    fallback: "G"
  },
  { 
    name: "Barclays", 
    logo: "/logos/barclays.svg",
    fallback: "B"
  }
]

export function SocialProof() {
  return (
    <Section className="bg-gradient-to-br from-muted/40 via-muted/20 to-background">
      <Container>
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            trusted by
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Leading companies rely on Treaty for their contract analysis needs
          </p>
        </div>
          
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
                  <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                    <Image
                      src={company.logo}
                      alt={`${company.name} logo`}
                      fill
                      className="object-contain"
                      onError={(e) => {
                        // Fallback to text if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<span class="text-lg sm:text-xl font-bold text-violet-600 dark:text-violet-400">${company.fallback}</span>`;
                        }
                      }}
                    />
                  </div>
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                  {company.name}
                </span>
              </motion.div>
            ))}
          </div>
      </Container>
    </Section>
  )
} 