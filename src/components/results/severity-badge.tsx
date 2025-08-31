import { Badge } from "@/components/ui/badge"

interface SeverityBadgeProps {
  level: "high" | "medium" | "low"
}

export function SeverityBadge({ level }: SeverityBadgeProps) {
  const getLabel = (level: "high" | "medium" | "low") => {
    return level.charAt(0).toUpperCase() + level.slice(1)
  }

  const getCustomClasses = (level: "high" | "medium" | "low") => {
    switch (level) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-300 dark:border-yellow-800"
      case "low":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800"
      default:
        return ""
    }
  }

  return (
    <Badge 
      variant="outline"
      className={`text-xs font-medium ${getCustomClasses(level)}`}
    >
      {getLabel(level)}
    </Badge>
  )
} 