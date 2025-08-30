"use client"

import { useState, useEffect, useCallback } from "react"
import { Container } from "@/components/ui/container"
import { FileText, TrendingUp, AlertTriangle } from "lucide-react"
import { KPICard } from "@/components/dashboard/kpi-card"
import { ContractsTable, type Contract } from "@/components/dashboard/contracts-table"
import { NewContractDialog } from "@/components/dashboard/new-contract-dialog"
import { getContracts, type Contract as DBContract } from "@/app/(actions)/get-contracts"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [isLoading, setIsLoading] = useState(true)


  const fetchContracts = useCallback(async () => {
    try {
      setIsLoading(true)
      const dbContracts = await getContracts()
      
      // Transform DB contracts to match the table interface
      const transformedContracts: Contract[] = dbContracts.map(dbContract => {
        const transformed = {
          id: dbContract.id,
          filename: dbContract.filename,
          type: dbContract.detected_type || 'Detecting...',
          score: dbContract.score || 0, // Use actual score from database or default to 0
          createdAt: new Date(dbContract.created_at)
        }
        return transformed
      })
      
      setContracts(transformedContracts)
    } catch (error) {
      console.error('Dashboard: Error fetching contracts:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContracts()
  }, [fetchContracts])

  const handleContractAdded = () => {
    // Refresh the contracts list after a new contract is added
    fetchContracts()
  }

  const handleContractDeleted = (id: string) => {
    setContracts(prev => prev.filter(contract => contract.id !== id))
  }

  // Calculate KPI values
  const totalContracts = contracts.length
  const contractsWithScores = contracts.filter(contract => contract.score > 0)
  const averageScore = contractsWithScores.length > 0 
    ? Math.round(contractsWithScores.reduce((sum, contract) => sum + contract.score, 0) / contractsWithScores.length)
    : 0
  const highRiskContracts = contracts.filter(contract => contract.score > 0 && contract.score < 70).length

  if (isLoading) {
    return (
      <div className="p-4">
        <Container>
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="h-8 bg-muted animate-pulse rounded w-48 mb-2"></div>
              <div className="h-4 bg-muted animate-pulse rounded w-64"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded"></div>
              ))}
            </div>
            
            <div className="h-96 bg-muted animate-pulse rounded"></div>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="p-4">
      <Container>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome to your contract analysis dashboard.
                </p>
              </div>
              <div className="flex gap-2">
                <NewContractDialog onContractAdded={handleContractAdded} />
              </div>
            </div>
          </div>
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <KPICard
              title="Total Contracts"
              value={totalContracts}
              icon={FileText}
              description={totalContracts === 0 ? "No contracts analyzed yet" : `${totalContracts} contract${totalContracts === 1 ? '' : 's'} analyzed`}
            />
            
            <KPICard
              title="Average Score"
              value={contractsWithScores.length > 0 ? `${averageScore}%` : "N/A"}
              icon={TrendingUp}
              trend={contractsWithScores.length > 0 ? {
                value: "+18.01bps from last month",
                isPositive: true
              } : undefined}
              description={contractsWithScores.length === 0 ? "No analyzed contracts yet" : "Overall risk assessment score"}
            />
            
            <KPICard
              title="High-Risk Contracts"
              value={highRiskContracts}
              icon={AlertTriangle}
              trend={highRiskContracts > 0 ? {
                value: "↓ 2 from last month",
                isPositive: true
              } : undefined}
              description={totalContracts === 0 ? "No data available" : "Contracts with score below 70%"}
            />
          </div>

          {/* Contracts Table */}
          <ContractsTable 
            contracts={contracts} 
            onDelete={handleContractDeleted}
          />
        </div>
      </Container>
    </div>
  )
} 