"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  Users,
  ShoppingCart,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface StockPurchase {
  id: string
  itemId: string
  itemName: string
  purchaseQuantity: number
  purchasePricePerUnit: number
  totalPurchaseAmount: number
  purchaseDate: string
  supplier: string
  addedBy: string
  createdAt: string
}

interface MonthlyMetrics {
  totalItemsPurchased: number
  totalQuantityPurchased: number
  totalValuePurchased: number
  mostPurchasedItem: { name: string; quantity: number; unit: string } | null
  leastPurchasedItem: { name: string; quantity: number; unit: string } | null
  topSupplier: { name: string; purchases: number } | null
  uniqueItems: number
  averagePurchaseValue: number
  purchaseCount: number
}

interface StockInsightsDashboardProps {
  userType: "admin" | "superadmin" | null
}

export function StockInsightsDashboard({ userType }: StockInsightsDashboardProps) {
  const [stockPurchases, setStockPurchases] = useState<StockPurchase[]>([])
  const [inventory, setInventory] = useState<any[]>([])
  const [dateFilter, setDateFilter] = useState<"thisMonth" | "lastMonth" | "custom">("thisMonth")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const savedStockPurchases = JSON.parse(localStorage.getItem("cafeStockPurchases") || "[]")
    const savedInventory = JSON.parse(localStorage.getItem("cafeInventory") || "[]")
    setStockPurchases(savedStockPurchases)
    setInventory(savedInventory)
  }, [])

  // Helper function to get month data
  const getMonthRange = (monthOffset: number = 0) => {
    const now = new Date()
    const targetDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59)
    return { start: startOfMonth, end: endOfMonth }
  }

  // Filter purchases by date range
  const getFilteredPurchases = (startDate: Date, endDate: Date) => {
    return stockPurchases.filter(purchase => {
      const purchaseDate = new Date(purchase.purchaseDate)
      return purchaseDate >= startDate && purchaseDate <= endDate
    })
  }

  // Calculate metrics for a given period
  const calculateMetrics = (purchases: StockPurchase[]): MonthlyMetrics => {
    if (purchases.length === 0) {
      return {
        totalItemsPurchased: 0,
        totalQuantityPurchased: 0,
        totalValuePurchased: 0,
        mostPurchasedItem: null,
        leastPurchasedItem: null,
        topSupplier: null,
        uniqueItems: 0,
        averagePurchaseValue: 0,
        purchaseCount: 0,
      }
    }

    // Calculate totals
    const totalItemsPurchased = purchases.length
    const totalQuantityPurchased = purchases.reduce((sum, p) => sum + p.purchaseQuantity, 0)
    const totalValuePurchased = purchases.reduce((sum, p) => sum + p.totalPurchaseAmount, 0)

    // Group by item for most/least purchased
    const itemQuantities: { [key: string]: { quantity: number; name: string; unit: string } } = {}
    purchases.forEach(purchase => {
      const item = inventory.find(inv => inv.id === purchase.itemId)
      const unit = item?.unit || ""
      
      if (itemQuantities[purchase.itemName]) {
        itemQuantities[purchase.itemName].quantity += purchase.purchaseQuantity
      } else {
        itemQuantities[purchase.itemName] = {
          quantity: purchase.purchaseQuantity,
          name: purchase.itemName,
          unit: unit
        }
      }
    })

    const itemEntries = Object.values(itemQuantities)
    const mostPurchasedItem = itemEntries.length > 0 
      ? itemEntries.reduce((max, current) => current.quantity > max.quantity ? current : max)
      : null

    const leastPurchasedItem = itemEntries.length > 0
      ? itemEntries.reduce((min, current) => current.quantity < min.quantity ? current : min)
      : null

    // Group by supplier
    const supplierCounts: { [key: string]: number } = {}
    purchases.forEach(purchase => {
      const supplier = purchase.supplier || "Not specified"
      supplierCounts[supplier] = (supplierCounts[supplier] || 0) + 1
    })

    const supplierEntries = Object.entries(supplierCounts)
    const topSupplier = supplierEntries.length > 0
      ? supplierEntries.reduce((max, current) => current[1] > max[1] ? current : max)
      : null

    return {
      totalItemsPurchased,
      totalQuantityPurchased,
      totalValuePurchased,
      mostPurchasedItem,
      leastPurchasedItem,
      topSupplier: topSupplier ? { name: topSupplier[0], purchases: topSupplier[1] } : null,
      uniqueItems: Object.keys(itemQuantities).length,
      averagePurchaseValue: totalValuePurchased / totalItemsPurchased,
      purchaseCount: totalItemsPurchased,
    }
  }

  // Get current period data
  const getCurrentPeriodData = () => {
    let startDate: Date, endDate: Date

    switch (dateFilter) {
      case "thisMonth":
        const thisMonth = getMonthRange(0)
        startDate = thisMonth.start
        endDate = thisMonth.end
        break
      case "lastMonth":
        const lastMonth = getMonthRange(-1)
        startDate = lastMonth.start
        endDate = lastMonth.end
        break
      case "custom":
        if (!customStartDate || !customEndDate) return null
        startDate = new Date(customStartDate)
        endDate = new Date(customEndDate + "T23:59:59")
        break
      default:
        return null
    }

    const filteredPurchases = getFilteredPurchases(startDate, endDate)
    return calculateMetrics(filteredPurchases)
  }

  // Get comparison data (always previous month for comparison)
  const getComparisonData = () => {
    let comparisonOffset = -1
    
    if (dateFilter === "lastMonth") {
      comparisonOffset = -2 // Compare last month with month before that
    }

    const comparisonRange = getMonthRange(comparisonOffset)
    const comparisonPurchases = getFilteredPurchases(comparisonRange.start, comparisonRange.end)
    return calculateMetrics(comparisonPurchases)
  }

  const currentMetrics = getCurrentPeriodData()
  const comparisonMetrics = dateFilter !== "custom" ? getComparisonData() : null

  // Export functions
  const exportToCSV = () => {
    if (!currentMetrics) return

    const csvData = []
    
    // Add headers
    csvData.push(['Stock Insights Report'])
    csvData.push(['Generated on:', new Date().toLocaleString()])
    csvData.push(['Period:', getPeriodLabel()])
    csvData.push([])
    
    // Add metrics comparison
    csvData.push(['Metric', 'Current Period', 'Previous Period', 'Change'])
    csvData.push(['Total Items Purchased', currentMetrics.totalItemsPurchased, comparisonMetrics?.totalItemsPurchased || 0, getChangeText(currentMetrics.totalItemsPurchased, comparisonMetrics?.totalItemsPurchased)])
    csvData.push(['Total Quantity Purchased', currentMetrics.totalQuantityPurchased, comparisonMetrics?.totalQuantityPurchased || 0, getChangeText(currentMetrics.totalQuantityPurchased, comparisonMetrics?.totalQuantityPurchased)])
    csvData.push(['Total Stock Value Purchased (₹)', currentMetrics.totalValuePurchased, comparisonMetrics?.totalValuePurchased || 0, getChangeText(currentMetrics.totalValuePurchased, comparisonMetrics?.totalValuePurchased)])
    csvData.push(['Most Purchased Item', currentMetrics.mostPurchasedItem ? `${currentMetrics.mostPurchasedItem.name} (${currentMetrics.mostPurchasedItem.quantity} ${currentMetrics.mostPurchasedItem.unit})` : 'N/A', comparisonMetrics?.mostPurchasedItem ? `${comparisonMetrics.mostPurchasedItem.name} (${comparisonMetrics.mostPurchasedItem.quantity} ${comparisonMetrics.mostPurchasedItem.unit})` : 'N/A', ''])
    csvData.push(['Least Purchased Item', currentMetrics.leastPurchasedItem ? `${currentMetrics.leastPurchasedItem.name} (${currentMetrics.leastPurchasedItem.quantity} ${currentMetrics.leastPurchasedItem.unit})` : 'N/A', comparisonMetrics?.leastPurchasedItem ? `${comparisonMetrics.leastPurchasedItem.name} (${comparisonMetrics.leastPurchasedItem.quantity} ${comparisonMetrics.leastPurchasedItem.unit})` : 'N/A', ''])
    csvData.push(['Top Supplier', currentMetrics.topSupplier?.name || 'N/A', comparisonMetrics?.topSupplier?.name || 'N/A', ''])

    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stock-insights-${getPeriodLabel().replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()

    toast({
      title: "CSV Exported",
      description: "Stock insights report has been downloaded as CSV.",
    })
  }

  const exportToExcel = () => {
    if (!currentMetrics) return

    // Create comprehensive Excel data
    const excelData = {
      summary: currentMetrics,
      comparison: comparisonMetrics,
      period: getPeriodLabel(),
      generatedOn: new Date().toLocaleString(),
      detailedPurchases: getDetailedPurchasesForPeriod()
    }

    const jsonContent = JSON.stringify(excelData, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stock-insights-detailed-${getPeriodLabel().replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`
    a.click()

    toast({
      title: "Excel Data Exported",
      description: "Detailed stock insights report has been downloaded.",
    })
  }

  const getDetailedPurchasesForPeriod = () => {
    let startDate: Date, endDate: Date

    switch (dateFilter) {
      case "thisMonth":
        const thisMonth = getMonthRange(0)
        startDate = thisMonth.start
        endDate = thisMonth.end
        break
      case "lastMonth":
        const lastMonth = getMonthRange(-1)
        startDate = lastMonth.start
        endDate = lastMonth.end
        break
      case "custom":
        if (!customStartDate || !customEndDate) return []
        startDate = new Date(customStartDate)
        endDate = new Date(customEndDate + "T23:59:59")
        break
      default:
        return []
    }

    return getFilteredPurchases(startDate, endDate)
  }

  const getPeriodLabel = () => {
    switch (dateFilter) {
      case "thisMonth":
        return "This Month"
      case "lastMonth":
        return "Last Month"
      case "custom":
        return `${customStartDate} to ${customEndDate}`
      default:
        return ""
    }
  }

  const getChangeText = (current: number, previous?: number) => {
    if (!previous) return "N/A"
    const change = current - previous
    const percentage = previous !== 0 ? ((change / previous) * 100).toFixed(1) : "N/A"
    return `${change >= 0 ? '+' : ''}${change} (${percentage}%)`
  }

  const getChangeIcon = (current: number, previous?: number) => {
    if (!previous) return null
    const change = current - previous
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return null
  }

  // Only allow Admin and Super Admin access
  if (userType !== "admin" && userType !== "superadmin") {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Stock Insights Dashboard is only available for Admin and Super Admin users.</p>
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
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Stock App Insights Dashboard
          </h2>
          <p className="text-gray-600 mt-1">Analyze stock purchase patterns and trends</p>
        </div>

        {/* Export Buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={exportToCSV}
            variant="outline"
            className="flex items-center gap-2"
            disabled={!currentMetrics}
          >
            <FileText className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            onClick={exportToExcel}
            variant="outline"
            className="flex items-center gap-2"
            disabled={!currentMetrics}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Date Filtering Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Date Filtering Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <Label>Period</Label>
              <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateFilter === "custom" && (
              <>
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="flex items-center">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Showing: {getPeriodLabel()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Comparison Table */}
      {currentMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              This Month / Last Month Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold bg-gray-50">Metric</th>
                    <th className="text-center p-4 font-semibold bg-blue-50">{getPeriodLabel()}</th>
                    {comparisonMetrics && (
                      <>
                        <th className="text-center p-4 font-semibold bg-gray-50">
                          {dateFilter === "lastMonth" ? "Month Before" : "Last Month"}
                        </th>
                        <th className="text-center p-4 font-semibold bg-green-50">Change</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">Total Items Purchased</td>
                    <td className="p-4 text-center font-bold text-blue-600">
                      {currentMetrics.totalItemsPurchased}
                    </td>
                    {comparisonMetrics && (
                      <>
                        <td className="p-4 text-center">{comparisonMetrics.totalItemsPurchased}</td>
                        <td className="p-4 text-center flex items-center justify-center gap-2">
                          {getChangeIcon(currentMetrics.totalItemsPurchased, comparisonMetrics.totalItemsPurchased)}
                          <span className={
                            currentMetrics.totalItemsPurchased > comparisonMetrics.totalItemsPurchased
                              ? "text-green-600" : currentMetrics.totalItemsPurchased < comparisonMetrics.totalItemsPurchased
                              ? "text-red-600" : "text-gray-600"
                          }>
                            {getChangeText(currentMetrics.totalItemsPurchased, comparisonMetrics.totalItemsPurchased)}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>

                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">Total Quantity Purchased</td>
                    <td className="p-4 text-center font-bold text-blue-600">
                      {currentMetrics.totalQuantityPurchased.toFixed(1)} Ltr/Kg
                    </td>
                    {comparisonMetrics && (
                      <>
                        <td className="p-4 text-center">{comparisonMetrics.totalQuantityPurchased.toFixed(1)} Ltr/Kg</td>
                        <td className="p-4 text-center flex items-center justify-center gap-2">
                          {getChangeIcon(currentMetrics.totalQuantityPurchased, comparisonMetrics.totalQuantityPurchased)}
                          <span className={
                            currentMetrics.totalQuantityPurchased > comparisonMetrics.totalQuantityPurchased
                              ? "text-green-600" : currentMetrics.totalQuantityPurchased < comparisonMetrics.totalQuantityPurchased
                              ? "text-red-600" : "text-gray-600"
                          }>
                            {getChangeText(currentMetrics.totalQuantityPurchased, comparisonMetrics.totalQuantityPurchased)}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>

                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">Total Stock Value Purchased (₹)</td>
                    <td className="p-4 text-center font-bold text-blue-600">
                      ₹{currentMetrics.totalValuePurchased.toLocaleString()}
                    </td>
                    {comparisonMetrics && (
                      <>
                        <td className="p-4 text-center">₹{comparisonMetrics.totalValuePurchased.toLocaleString()}</td>
                        <td className="p-4 text-center flex items-center justify-center gap-2">
                          {getChangeIcon(currentMetrics.totalValuePurchased, comparisonMetrics.totalValuePurchased)}
                          <span className={
                            currentMetrics.totalValuePurchased > comparisonMetrics.totalValuePurchased
                              ? "text-green-600" : currentMetrics.totalValuePurchased < comparisonMetrics.totalValuePurchased
                              ? "text-red-600" : "text-gray-600"
                          }>
                            {getChangeText(currentMetrics.totalValuePurchased, comparisonMetrics.totalValuePurchased)}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>

                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">Most Purchased Item</td>
                    <td className="p-4 text-center font-bold text-blue-600">
                      {currentMetrics.mostPurchasedItem 
                        ? `${currentMetrics.mostPurchasedItem.name} (${currentMetrics.mostPurchasedItem.quantity} ${currentMetrics.mostPurchasedItem.unit})`
                        : "N/A"
                      }
                    </td>
                    {comparisonMetrics && (
                      <>
                        <td className="p-4 text-center">
                          {comparisonMetrics.mostPurchasedItem 
                            ? `${comparisonMetrics.mostPurchasedItem.name} (${comparisonMetrics.mostPurchasedItem.quantity} ${comparisonMetrics.mostPurchasedItem.unit})`
                            : "N/A"
                          }
                        </td>
                        <td className="p-4 text-center text-gray-500">-</td>
                      </>
                    )}
                  </tr>

                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">Least Purchased Item</td>
                    <td className="p-4 text-center font-bold text-blue-600">
                      {currentMetrics.leastPurchasedItem 
                        ? `${currentMetrics.leastPurchasedItem.name} (${currentMetrics.leastPurchasedItem.quantity} ${currentMetrics.leastPurchasedItem.unit})`
                        : "N/A"
                      }
                    </td>
                    {comparisonMetrics && (
                      <>
                        <td className="p-4 text-center">
                          {comparisonMetrics.leastPurchasedItem 
                            ? `${comparisonMetrics.leastPurchasedItem.name} (${comparisonMetrics.leastPurchasedItem.quantity} ${comparisonMetrics.leastPurchasedItem.unit})`
                            : "N/A"
                          }
                        </td>
                        <td className="p-4 text-center text-gray-500">-</td>
                      </>
                    )}
                  </tr>

                  <tr className="hover:bg-gray-50">
                    <td className="p-4 font-medium">Top Supplier (optional)</td>
                    <td className="p-4 text-center font-bold text-blue-600">
                      {currentMetrics.topSupplier?.name || "N/A"}
                    </td>
                    {comparisonMetrics && (
                      <>
                        <td className="p-4 text-center">{comparisonMetrics.topSupplier?.name || "N/A"}</td>
                        <td className="p-4 text-center text-gray-500">-</td>
                      </>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Insights */}
      {currentMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unique Items</p>
                  <p className="text-2xl font-bold text-blue-600">{currentMetrics.uniqueItems}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Purchase Value</p>
                  <p className="text-2xl font-bold text-green-600">₹{currentMetrics.averagePurchaseValue.toFixed(0)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Purchase Transactions</p>
                  <p className="text-2xl font-bold text-orange-600">{currentMetrics.purchaseCount}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Top Supplier Orders</p>
                  <p className="text-2xl font-bold text-purple-600">{currentMetrics.topSupplier?.purchases || 0}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No Data State */}
      {!currentMetrics && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No stock purchase data found for the selected period.</p>
              <p className="text-sm text-gray-400">Add some stock purchases to see insights here.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 