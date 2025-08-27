import { cn } from "@/lib/utils"

interface SectionProps {
  children: React.ReactNode
  className?: string
  id?: string
  heading?: string
  subheading?: string
}

export function Section({ 
  children, 
  className, 
  id, 
  heading, 
  subheading 
}: SectionProps) {
  return (
    <section id={id} className={cn("py-16 sm:py-24", className)}>
      {(heading || subheading) && (
        <div className="text-center mb-12 sm:mb-16">
          {heading && (
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              {heading}
            </h2>
          )}
          {subheading && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {subheading}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  )
} 