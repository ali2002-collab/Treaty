"use client"

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface ScoreDonutProps {
  score: number
}

export function ScoreDonut({ score }: ScoreDonutProps) {
  const data = [
    { name: 'Score', value: score, color: getScoreColor(score) },
    { name: 'Remaining', value: 100 - score, color: '#f1f5f9' }
  ]

  function getScoreColor(score: number): string {
    if (score >= 80) return '#22c55e' // green-500
    if (score >= 60) return '#eab308' // yellow-500
    return '#ef4444' // red-500
  }

  return (
    <div className="w-36 h-36 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={32}
            outerRadius={68}
            paddingAngle={0}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center label - more compact */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center leading-tight">
          <div className={`text-xl font-semibold ${getScoreColor(score) === '#22c55e' ? 'text-green-600 dark:text-green-400' : getScoreColor(score) === '#eab308' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
            {score}%
          </div>
          <div className="text-xs text-muted-foreground">Score</div>
        </div>
      </div>
    </div>
  )
} 