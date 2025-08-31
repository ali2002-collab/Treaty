"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SeverityBadge } from "./severity-badge"
import { type Analysis } from "@/lib/analysis-schema"

interface AnalysisTabsProps {
  analysis: Analysis
}

export function AnalysisTabs({ analysis }: AnalysisTabsProps) {
  const formatClauseValue = (value: string | null | undefined) => {
    if (value === null || value === undefined || value === "null") {
      return "Not specified"
    }
    if (value.trim() === "") {
      return "Not specified"
    }
    return value
  }

  // Safe access to nested clause properties with fallbacks
  const getClauseValue = (clause: any, key: string) => {
    if (!clause || typeof clause !== 'object') {
      return "Not specified"
    }
    return formatClauseValue(clause[key])
  }

  // Ensure clauses object has all required properties
  const safeClauses = {
    payment: analysis.clauses?.payment || { amount: null, schedule: null, late_fees: null },
    liability: analysis.clauses?.liability || { cap: null, exclusions: null, indemnity: null },
    termination: analysis.clauses?.termination || { notice: null, for_cause: null, without_cause: null, auto_renewal: false },
    confidentiality: analysis.clauses?.confidentiality || { scope: null, duration: null, carve_outs: null },
    ip: analysis.clauses?.ip || { ownership: null, license: null, derivatives: null },
    law: analysis.clauses?.law || { governing_law: null, jurisdiction: null, dispute_resolution: null },
    renewal: analysis.clauses?.renewal || { term_length: null, renewal_window: null, conditions: null }
  }

  return (
    <Tabs defaultValue="summary" className="w-full">
      <TabsList className="flex w-full gap-1 sm:gap-2 mb-4 sm:mb-6">
        <TabsTrigger value="summary" className="text-xs sm:text-sm px-2 sm:px-3 py-2 flex-1">Summary</TabsTrigger>
        <TabsTrigger value="risks" className="text-xs sm:text-sm px-2 sm:px-3 py-2 flex-1">Risks</TabsTrigger>
        <TabsTrigger value="opportunities" className="text-xs sm:text-sm px-2 sm:px-3 py-2 flex-1">Opportunities</TabsTrigger>
        <TabsTrigger value="details" className="text-xs sm:text-sm px-2 sm:px-3 py-2 flex-1">Details</TabsTrigger>
      </TabsList>

      <TabsContent value="summary" className="space-y-4">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">Analysis Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 sm:space-y-6 px-4 sm:px-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-base sm:text-lg text-foreground">Analysis Summary</h4>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-left">
                {analysis.summary || "No summary available for this contract."}
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-base sm:text-lg text-foreground">Key Recommendations</h4>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-left">
                {analysis.recommendations || "No specific recommendations available for this contract."}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-base sm:text-lg text-foreground">Negotiation Points</h4>
              {analysis.negotiation_points.length > 0 ? (
                <ul className="space-y-3 pl-0">
                {analysis.negotiation_points.map((point, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-primary text-lg font-bold mt-0.5 flex-shrink-0 w-4 text-center">•</span>
                      <span className="text-sm sm:text-base text-muted-foreground leading-relaxed flex-1 pt-0.5">{point}</span>
                  </li>
                ))}
              </ul>
              ) : (
                <p className="text-sm sm:text-base text-muted-foreground text-left">No specific negotiation points identified.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="risks" className="space-y-4">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">Risk Assessment</CardTitle>
            <CardDescription>
              {analysis.risks.length} risk{analysis.risks.length !== 1 ? 's' : ''} identified
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {analysis.risks.length > 0 ? (
            <div className="space-y-4">
              {analysis.risks.map((risk, index) => (
                <div key={index} className="p-4 border rounded-lg bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    <h4 className="font-semibold text-red-900 dark:text-red-100 text-sm sm:text-base">{risk.type}</h4>
                    <SeverityBadge level={risk.severity} />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs sm:text-sm font-semibold text-red-800 dark:text-red-200">Excerpt:</span>
                      <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 mt-2 leading-relaxed">{risk.excerpt}</p>
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-semibold text-red-800 dark:text-red-200">Analysis:</span>
                      <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 mt-2 leading-relaxed">{risk.note}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm sm:text-base text-muted-foreground">No specific risks identified in this contract.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="opportunities" className="space-y-4">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">Opportunities</CardTitle>
            <CardDescription>
              {analysis.opportunities.length} opportunit{analysis.opportunities.length !== 1 ? 'ies' : 'y'} identified
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {analysis.opportunities.length > 0 ? (
            <div className="space-y-4">
              {analysis.opportunities.map((opportunity, index) => (
                <div key={index} className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                  <div className="mb-3">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 text-sm sm:text-base">{opportunity.type}</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs sm:text-sm font-semibold text-green-800 dark:text-green-200">Excerpt:</span>
                      <p className="text-xs sm:text-sm text-green-700 dark:text-green-300 mt-2 leading-relaxed">{opportunity.excerpt}</p>
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-semibold text-green-800 dark:text-green-200">Analysis:</span>
                      <p className="text-xs sm:text-sm text-green-700 dark:text-green-300 mt-2 leading-relaxed">{opportunity.note}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm sm:text-base text-muted-foreground">No specific opportunities identified.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="details" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Contract Details</CardTitle>
            <CardDescription>Detailed breakdown of contract clauses and terms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Payment Terms */}
              <div>
                <h4 className="font-medium mb-3 text-blue-600 dark:text-blue-400 text-base sm:text-lg">Payment Terms</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <span className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200">Amount</span>
                    <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-1">{getClauseValue(safeClauses.payment, 'amount')}</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <span className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200">Schedule</span>
                    <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-1">{getClauseValue(safeClauses.payment, 'schedule')}</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <span className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200">Late Fees</span>
                    <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-1">{getClauseValue(safeClauses.payment, 'late_fees')}</p>
                  </div>
                </div>
              </div>

              {/* Liability */}
              <div>
                <h4 className="font-medium mb-3 text-orange-600 dark:text-orange-400 text-base sm:text-lg">Liability</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <span className="text-xs sm:text-sm font-medium text-orange-800 dark:text-orange-200">Cap</span>
                    <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-300 mt-1">{getClauseValue(safeClauses.liability, 'cap')}</p>
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <span className="text-xs sm:text-sm font-medium text-orange-800 dark:text-orange-200">Exclusions</span>
                    <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-300 mt-1">{getClauseValue(safeClauses.liability, 'exclusions')}</p>
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <span className="text-xs sm:text-sm font-medium text-orange-800 dark:text-orange-200">Indemnity</span>
                    <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-300 mt-1">{getClauseValue(safeClauses.liability, 'indemnity')}</p>
                  </div>
                </div>
              </div>

              {/* Termination */}
              <div>
                <h4 className="font-medium mb-3 text-red-600 dark:text-red-400 text-base sm:text-lg">Termination</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                    <span className="text-xs sm:text-sm font-medium text-red-800 dark:text-red-200">Notice Period</span>
                    <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 mt-1">{getClauseValue(safeClauses.termination, 'notice')}</p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                    <span className="text-xs sm:text-sm font-medium text-red-800 dark:text-red-200">For Cause</span>
                    <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 mt-1">{getClauseValue(safeClauses.termination, 'for_cause')}</p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                    <span className="text-xs sm:text-sm font-medium text-red-800 dark:text-red-200">Without Cause</span>
                    <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 mt-1">{getClauseValue(safeClauses.termination, 'without_cause')}</p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                    <span className="text-xs sm:text-sm font-medium text-red-800 dark:text-red-200">Auto Renewal</span>
                    <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 mt-1">{safeClauses.termination?.auto_renewal ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Confidentiality */}
              <div>
                <h4 className="font-medium mb-3 text-purple-600 dark:text-purple-400 text-base sm:text-lg">Confidentiality</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <span className="text-xs sm:text-sm font-medium text-purple-800 dark:text-purple-200">Scope</span>
                    <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-300 mt-1">{getClauseValue(safeClauses.confidentiality, 'scope')}</p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <span className="text-xs sm:text-sm font-medium text-purple-800 dark:text-purple-200">Duration</span>
                    <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-300 mt-1">{getClauseValue(safeClauses.confidentiality, 'duration')}</p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <span className="text-xs sm:text-sm font-medium text-purple-800 dark:text-purple-200">Carve-outs</span>
                    <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-300 mt-1">{getClauseValue(safeClauses.confidentiality, 'carve_outs')}</p>
                  </div>
                </div>
              </div>

              {/* IP Rights */}
              <div>
                <h4 className="font-medium mb-3 text-indigo-600 dark:text-indigo-400 text-base sm:text-lg">Intellectual Property</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <span className="text-xs sm:text-sm font-medium text-indigo-800 dark:text-indigo-200">Ownership</span>
                    <p className="text-xs sm:text-sm text-indigo-700 dark:text-indigo-300 mt-1">{getClauseValue(safeClauses.ip, 'ownership')}</p>
                  </div>
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <span className="text-xs sm:text-sm font-medium text-indigo-800 dark:text-indigo-200">License</span>
                    <p className="text-xs sm:text-sm text-indigo-700 dark:text-indigo-300 mt-1">{getClauseValue(safeClauses.ip, 'license')}</p>
                  </div>
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <span className="text-xs sm:text-sm font-medium text-indigo-800 dark:text-indigo-200">Derivatives</span>
                    <p className="text-xs sm:text-sm text-indigo-700 dark:text-indigo-300 mt-1">{getClauseValue(safeClauses.ip, 'derivatives')}</p>
                  </div>
                </div>
              </div>

              {/* Governing Law */}
              <div>
                <h4 className="font-medium mb-3 text-teal-600 dark:text-teal-400 text-base sm:text-lg">Governing Law</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="p-3 bg-teal-50 dark:bg-teal-950/20 rounded-lg border border-teal-200 dark:border-teal-800">
                    <span className="text-xs sm:text-sm font-medium text-teal-800 dark:text-teal-200">Law</span>
                    <p className="text-xs sm:text-sm text-teal-700 dark:text-teal-300 mt-1">{getClauseValue(safeClauses.law, 'governing_law')}</p>
                  </div>
                  <div className="p-3 bg-teal-50 dark:bg-teal-950/20 rounded-lg border border-teal-200 dark:border-teal-800">
                    <span className="text-xs sm:text-sm font-medium text-teal-800 dark:text-teal-200">Jurisdiction</span>
                    <p className="text-xs sm:text-sm text-teal-700 dark:text-teal-300 mt-1">{getClauseValue(safeClauses.law, 'jurisdiction')}</p>
                  </div>
                  <div className="p-3 bg-teal-50 dark:bg-teal-950/20 rounded-lg border border-teal-200 dark:border-teal-800">
                    <span className="text-xs sm:text-sm font-medium text-teal-800 dark:text-teal-200">Dispute Resolution</span>
                    <p className="text-xs sm:text-sm text-teal-700 dark:text-teal-300 mt-1">{getClauseValue(safeClauses.law, 'dispute_resolution')}</p>
                  </div>
                </div>
              </div>

              {/* Renewal */}
              <div>
                <h4 className="font-medium mb-3 text-emerald-600 dark:text-emerald-400 text-base sm:text-lg">Renewal Terms</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <span className="text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-200">Term Length</span>
                    <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 mt-1">{getClauseValue(safeClauses.renewal, 'term_length')}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <span className="text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-200">Renewal Window</span>
                    <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 mt-1">{getClauseValue(safeClauses.renewal, 'renewal_window')}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <span className="text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-200">Conditions</span>
                    <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 mt-1">{getClauseValue(safeClauses.renewal, 'conditions')}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
} 