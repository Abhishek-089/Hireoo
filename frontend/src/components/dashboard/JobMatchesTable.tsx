"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Briefcase, MapPin, DollarSign, Calendar, MoreHorizontal, Send, Eye, CheckCircle } from "lucide-react"
import Link from "next/link"

interface JobMatch {
  id: string
  job: {
    id: string
    title: string
    company: string
    location: string | null
    salary_range: string | null
    job_type: string | null
    posted_date: string | null
    status: string
  }
  matchScore: number
  matchedAt: string
  applied: boolean
  appliedAt: string | null
  notes: string | null
  lastEmailSent: string | null
  totalEmails: number
  status: string
}

interface JobMatchesResponse {
  data: JobMatch[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
  }
}

export function JobMatchesTable() {
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("matched_at")
  const [sortOrder, setSortOrder] = useState("desc")

  useEffect(() => {
    fetchJobMatches()
  }, [currentPage, statusFilter, sortBy, sortOrder])

  const fetchJobMatches = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        status: statusFilter,
        sortBy,
        sortOrder,
      })

      const response = await fetch(`/api/dashboard/job-matches?${params}`)
      if (response.ok) {
        const data: JobMatchesResponse = await response.json()
        setJobMatches(data.data)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error("Failed to fetch job matches:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyToJob = async (jobMatchId: string) => {
    try {
      const response = await fetch("/api/dashboard/job-matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobMatchId,
          applied: true,
        }),
      })

      if (response.ok) {
        // Refresh the data
        fetchJobMatches()
      }
    } catch (error) {
      console.error("Failed to update job match:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600"
    if (score >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading job matches...</span>
      </div>
    )
  }

  if (jobMatches.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No job matches yet</h3>
        <p className="text-gray-600 mb-6">
          Job matches will appear here once the system finds suitable opportunities based on your profile.
        </p>
        <Button>
          <Briefcase className="h-4 w-4 mr-2" />
          Browse Jobs Manually
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Matches</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="not-applied">Not Applied</SelectItem>
          </SelectContent>
        </Select>

        <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
          const [field, order] = value.split('-')
          setSortBy(field)
          setSortOrder(order)
        }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="matched_at-desc">Newest First</SelectItem>
            <SelectItem value="matched_at-asc">Oldest First</SelectItem>
            <SelectItem value="match_score-desc">Highest Match</SelectItem>
            <SelectItem value="match_score-asc">Lowest Match</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Match Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobMatches.map((match) => (
              <TableRow key={match.id}>
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900">{match.job.title}</div>
                    <div className="text-sm text-gray-500">{match.job.job_type}</div>
                  </div>
                </TableCell>
                <TableCell>{match.job.company}</TableCell>
                <TableCell>
                  {match.job.location ? (
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                      {match.job.location}
                    </div>
                  ) : (
                    <span className="text-gray-400">Remote</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`font-medium ${getMatchScoreColor(match.matchScore)}`}>
                    {(match.matchScore * 100).toFixed(0)}%
                  </span>
                </TableCell>
                <TableCell>
                  {match.applied ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Applied
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Matched</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {match.lastEmailSent ? (
                    <span className="text-sm text-gray-600">
                      {formatDate(match.lastEmailSent)}
                    </span>
                  ) : (
                    <span className="text-gray-400">Never</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/job-matches/${match.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      {!match.applied && (
                        <DropdownMenuItem onClick={() => handleApplyToJob(match.id)}>
                          <Send className="h-4 w-4 mr-2" />
                          Apply Now
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <Link href={`/dashboard/job-matches/${match.id}/email`}>
                          <Send className="h-4 w-4 mr-2" />
                          Send Email
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
