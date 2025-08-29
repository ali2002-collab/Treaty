import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, FileText, Eye, Trash2, Brain, CheckCircle } from "lucide-react"
import Link from "next/link"
import { deleteContract } from "@/app/(actions)/delete-contract"
import { toast } from "sonner"

export interface Contract {
  id: string
  filename: string
  type: string
  score: number
  createdAt: Date
}

interface ContractsTableProps {
  contracts: Contract[]
  onDelete: (id: string) => void
}

export function ContractsTable({ contracts, onDelete }: ContractsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    
    try {
      const result = await deleteContract(id)
      
      if (result.success) {
        toast.success("Contract deleted successfully")
        onDelete(id)
      } else {
        toast.error(result.error || "Failed to delete contract")
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error("An unexpected error occurred")
    } finally {
      setDeletingId(null)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
    if (score >= 60) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
    return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
  }

  const getScoreDisplay = (score: number) => {
    if (score === 0) return { text: "Pending Analysis", icon: <Brain className="h-4 w-4" />, variant: "secondary" as const }
    if (score >= 80) return { text: `${score}%`, icon: <CheckCircle className="h-4 w-4" />, variant: "default" as const }
    if (score >= 60) return { text: `${score}%`, icon: <CheckCircle className="h-4 w-4" />, variant: "secondary" as const }
    return { text: `${score}%`, icon: <CheckCircle className="h-4 w-4" />, variant: "destructive" as const }
  }

  if (contracts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contracts</CardTitle>
          <CardDescription>Your contract analysis history will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No contracts uploaded yet</p>
            <p className="text-sm mb-4">Upload your first contract to get started with AI-powered analysis.</p>
            <Button disabled>
              New Contract
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contracts</CardTitle>
        <CardDescription>Your contract analysis history and results.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Filename</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((contract) => {
              const scoreDisplay = getScoreDisplay(contract.score)
              return (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {contract.filename}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{contract.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={scoreDisplay.variant} className="flex items-center gap-1">
                      {scoreDisplay.icon}
                      {scoreDisplay.text}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {contract.createdAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/results/${contract.id}`} className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(contract.id)}
                          disabled={deletingId === contract.id}
                          className="flex items-center gap-2 text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                          {deletingId === contract.id ? 'Deleting...' : 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
} 