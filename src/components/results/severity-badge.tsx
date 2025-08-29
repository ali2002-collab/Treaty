import { Badge } from "@/components/ui/badge"

interface SeverityBadgeProps {
  level: "high" | "medium" | "low"
}

export function SeverityBadge({ level }: SeverityBadgeProps) {
  const getVariant = (level: "high" | "medium" | "low") => {
    switch (level) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  const getLabel = (level: "high" | "medium" | "low") => {
    return level.charAt(0).toUpperCase() + level.slice(1)
  }

  return (
    <Badge variant={getVariant(level)} className="text-xs">
      {getLabel(level)}
    </Badge>
  )
} 