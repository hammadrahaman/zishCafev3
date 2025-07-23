"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  MessageSquare,
  Star,
  Eye,
  Trash2,
  Download,
  Search,
  Filter,
  Calendar,
  User,
  Mail,
  X,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"

interface FeedbackItem {
  id: string
  customerName: string
  email: string
  rating: number
  feedback: string
  timestamp: string
  date: string
}

interface FeedbackManagementProps {
  userType: "admin" | "superadmin" | null
}

export function FeedbackManagement({ userType }: FeedbackManagementProps) {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<FeedbackItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const { toast } = useToast()

  // Load feedback from localStorage
  useEffect(() => {
    const savedFeedback = JSON.parse(localStorage.getItem("cafeFeedback") || "[]")
    // Sort by timestamp (newest first)
    const sortedFeedback = savedFeedback.sort((a: FeedbackItem, b: FeedbackItem) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    setFeedbacks(sortedFeedback)
  }, [])

  // Apply filters and search
  useEffect(() => {
    let filtered = [...feedbacks]

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(feedback => 
        feedback.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.feedback.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Rating filter
    if (ratingFilter !== "all") {
      filtered = filtered.filter(feedback => feedback.rating.toString() === ratingFilter)
    }

    setFilteredFeedbacks(filtered)
  }, [feedbacks, searchTerm, ratingFilter])

  // Delete feedback
  const deleteFeedback = (id: string) => {
    const feedback = feedbacks.find(f => f.id === id)
    if (!feedback) return

    if (confirm(`Are you sure you want to delete feedback from "${feedback.customerName}"?`)) {
      const updatedFeedbacks = feedbacks.filter(f => f.id !== id)
      setFeedbacks(updatedFeedbacks)
      localStorage.setItem("cafeFeedback", JSON.stringify(updatedFeedbacks))

      toast({
        title: "Feedback Deleted",
        description: `Feedback from ${feedback.customerName} has been removed.`,
      })
    }
  }

  // Export feedback to CSV
  const exportFeedbackToCSV = () => {
    if (feedbacks.length === 0) {
      toast({
        title: "No Data",
        description: "No feedback data to export.",
        variant: "destructive",
      })
      return
    }

    const csvData = []
    
    // Add headers
    csvData.push(['Customer Feedback Report'])
    csvData.push(['Generated on:', new Date().toLocaleString()])
    csvData.push([])
    csvData.push(['Customer Name', 'Email', 'Rating', 'Feedback', 'Date Submitted'])
    
    // Add feedback data
    feedbacks.forEach(feedback => {
      csvData.push([
        feedback.customerName,
        feedback.email,
        `${feedback.rating}/5 stars`,
        feedback.feedback.replace(/,/g, ';'), // Replace commas to avoid CSV issues
        new Date(feedback.timestamp).toLocaleString()
      ])
    })

    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `customer-feedback-${new Date().toISOString().split('T')[0]}.csv`
    a.click()

    toast({
      title: "Feedback Exported",
      description: "Customer feedback has been downloaded as CSV.",
    })
  }

  // View feedback details
  const viewFeedbackDetails = (feedback: FeedbackItem) => {
    setSelectedFeedback(feedback)
    setShowDetailModal(true)
  }

  // Get star display
  const getStarDisplay = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
      />
    ))
  }

  // Get rating color
  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "bg-green-100 text-green-800 border-green-200"
    if (rating >= 3) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  // Calculate stats
  const averageRating = feedbacks.length > 0 
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : "0.0"

  const ratingDistribution = {
    5: feedbacks.filter(f => f.rating === 5).length,
    4: feedbacks.filter(f => f.rating === 4).length,
    3: feedbacks.filter(f => f.rating === 3).length,
    2: feedbacks.filter(f => f.rating === 2).length,
    1: feedbacks.filter(f => f.rating === 1).length,
  }

  // Only allow Super Admin access
  if (userType !== "superadmin") {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <MessageSquare className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Customer Feedback is only available for Super Admin users.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            Customer Feedback
          </h2>
          <p className="text-gray-600 mt-1">Review customer feedback and ratings</p>
        </div>
        
        <Button onClick={exportFeedbackToCSV} className="bg-green-600 hover:bg-green-700">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                <p className="text-2xl font-bold text-gray-900">{feedbacks.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-amber-600">{averageRating}</p>
                  <div className="flex">
                    {getStarDisplay(Math.round(parseFloat(averageRating)))}
                  </div>
                </div>
              </div>
              <Star className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">5-Star Reviews</p>
                <p className="text-2xl font-bold text-green-600">{ratingDistribution[5]}</p>
                <p className="text-xs text-gray-500">
                  {feedbacks.length > 0 ? Math.round((ratingDistribution[5] / feedbacks.length) * 100) : 0}%
                </p>
              </div>
              <div className="text-green-600">⭐</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Ratings (1-2)</p>
                <p className="text-2xl font-bold text-red-600">{ratingDistribution[1] + ratingDistribution[2]}</p>
                <p className="text-xs text-gray-500">Need attention</p>
              </div>
              <div className="text-red-600">⚠️</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search customer, email, or feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Rating Filter */}
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(searchTerm || ratingFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setRatingFilter("all")
                }}
              >
                <X className="h-3 w-3 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feedback Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredFeedbacks.length} of {feedbacks.length} feedback entries
        </p>
      </div>

      {/* Feedback List */}
      {filteredFeedbacks.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">
                {feedbacks.length === 0 ? "No customer feedback found" : "No feedback matches your filters"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Feedback Preview</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFeedbacks.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{feedback.customerName}</div>
                          <div className="text-sm text-gray-500">{feedback.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getRatingColor(feedback.rating)} border`}>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current" />
                            {feedback.rating}/5
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-600 line-clamp-2 max-w-md">
                          {feedback.feedback.length > 100 
                            ? feedback.feedback.substring(0, 100) + "..." 
                            : feedback.feedback
                          }
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(feedback.timestamp).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewFeedbackDetails(feedback)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteFeedback(feedback.id)}
                            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden space-y-4">
            {filteredFeedbacks.map((feedback) => (
              <Card key={feedback.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{feedback.customerName}</h3>
                      <p className="text-sm text-gray-500">{feedback.email}</p>
                    </div>
                    <Badge className={`${getRatingColor(feedback.rating)} border`}>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        {feedback.rating}/5
                      </div>
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {feedback.feedback}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      {new Date(feedback.timestamp).toLocaleDateString()}
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewFeedbackDetails(feedback)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteFeedback(feedback.id)}
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Feedback Detail Modal */}
      {showDetailModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Feedback Details
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetailModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Customer Name</Label>
                    <p className="text-lg font-semibold">{selectedFeedback.customerName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Email</Label>
                    <p className="text-lg">{selectedFeedback.email}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Rating</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">
                      {getStarDisplay(selectedFeedback.rating)}
                    </div>
                    <span className="text-lg font-semibold text-amber-600">
                      {selectedFeedback.rating}/5
                    </span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Feedback</Label>
                  <div className="mt-1 p-4 bg-gray-50 rounded-lg border">
                    <p className="text-gray-800 leading-relaxed">{selectedFeedback.feedback}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Submitted On</Label>
                  <p className="text-lg">{new Date(selectedFeedback.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 