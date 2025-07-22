"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ShoppingCart,
  Plus,
  Calendar,
  Package2,
  Eye,
  Truck,
  Receipt,
  Calculator,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface InventoryItem {
  id: string
  name: string
  unit: string
  price: number
  category: string
  stockQuantity: number
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
}

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

interface StockPurchaseManagementProps {
  userType: "admin" | "superadmin" | null
  currentUser: string
}

export function StockPurchaseManagement({ userType, currentUser }: StockPurchaseManagementProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [stockPurchases, setStockPurchases] = useState<StockPurchase[]>([])
  const [showAddStockModal, setShowAddStockModal] = useState(false)
  const [showViewInventoryModal, setShowViewInventoryModal] = useState(false)
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null)
  const { toast } = useToast()

  // Form state for adding stock
  const [stockForm, setStockForm] = useState({
    itemId: "",
    purchaseQuantity: "",
    purchasePricePerUnit: "",
    totalPurchaseAmount: "",
    purchaseDate: new Date().toISOString().split('T')[0],
    supplier: "",
    isManualTotal: false,
  })

  // Load data from localStorage
  useEffect(() => {
    const savedInventory = JSON.parse(localStorage.getItem("cafeInventory") || "[]")
    const savedStockPurchases = JSON.parse(localStorage.getItem("cafeStockPurchases") || "[]")
    setInventory(savedInventory)
    setStockPurchases(savedStockPurchases)
  }, [])

  // Auto-calculate total purchase amount
  useEffect(() => {
    if (!stockForm.isManualTotal && stockForm.purchaseQuantity && stockForm.purchasePricePerUnit) {
      const total = parseFloat(stockForm.purchaseQuantity) * parseFloat(stockForm.purchasePricePerUnit)
      setStockForm(prev => ({
        ...prev,
        totalPurchaseAmount: total.toFixed(2)
      }))
    }
  }, [stockForm.purchaseQuantity, stockForm.purchasePricePerUnit, stockForm.isManualTotal])

  // Reset stock form
  const resetStockForm = () => {
    setStockForm({
      itemId: "",
      purchaseQuantity: "",
      purchasePricePerUnit: "",
      totalPurchaseAmount: "",
      purchaseDate: new Date().toISOString().split('T')[0],
      supplier: "",
      isManualTotal: false,
    })
  }

  // Get selected inventory item
  const selectedItem = inventory.find(item => item.id === stockForm.itemId)

  // Auto-fill purchase price per unit when item is selected
  useEffect(() => {
    if (selectedItem && !stockForm.purchasePricePerUnit) {
      setStockForm(prev => ({
        ...prev,
        purchasePricePerUnit: selectedItem.price.toString()
      }))
    }
  }, [selectedItem, stockForm.purchasePricePerUnit])

  // Add stock purchase
  const handleAddStockPurchase = () => {
    if (!stockForm.itemId || !stockForm.purchaseQuantity || !stockForm.purchasePricePerUnit || !stockForm.totalPurchaseAmount) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const selectedItem = inventory.find(item => item.id === stockForm.itemId)
    if (!selectedItem) return

    const newStockPurchase: StockPurchase = {
      id: Date.now().toString(),
      itemId: stockForm.itemId,
      itemName: selectedItem.name,
      purchaseQuantity: parseFloat(stockForm.purchaseQuantity),
      purchasePricePerUnit: parseFloat(stockForm.purchasePricePerUnit),
      totalPurchaseAmount: parseFloat(stockForm.totalPurchaseAmount),
      purchaseDate: stockForm.purchaseDate,
      supplier: stockForm.supplier || "Not specified",
      addedBy: currentUser,
      createdAt: new Date().toISOString(),
    }

    // Update stock purchases
    const updatedStockPurchases = [...stockPurchases, newStockPurchase]
    setStockPurchases(updatedStockPurchases)
    localStorage.setItem("cafeStockPurchases", JSON.stringify(updatedStockPurchases))

    // Update inventory stock quantity
    const updatedInventory = inventory.map(item => 
      item.id === stockForm.itemId 
        ? { ...item, stockQuantity: item.stockQuantity + parseFloat(stockForm.purchaseQuantity), updatedAt: new Date().toISOString() }
        : item
    )
    setInventory(updatedInventory)
    localStorage.setItem("cafeInventory", JSON.stringify(updatedInventory))

    setShowAddStockModal(false)
    resetStockForm()

    toast({
      title: "Stock Added Successfully",
      description: `${stockForm.purchaseQuantity} units of ${selectedItem.name} added to inventory.`,
    })
  }

  // Open add stock modal
  const openAddStockModal = () => {
    resetStockForm()
    setShowAddStockModal(true)
  }

  // View inventory item details
  const viewInventoryItem = (item: InventoryItem) => {
    setSelectedInventoryItem(item)
    setShowViewInventoryModal(true)
  }

  // Only allow Admin and Super Admin access
  if (userType !== "admin" && userType !== "superadmin") {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Stock Management is only available for Admin and Super Admin users.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Get recent stock purchases for current user or all if super admin
  const recentPurchases = userType === "superadmin" 
    ? stockPurchases.slice(-10).reverse()
    : stockPurchases.filter(purchase => purchase.addedBy === currentUser).slice(-10).reverse()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-blue-600" />
            Stock Management
          </h2>
          <p className="text-gray-600 mt-1">
            {userType === "admin" ? "View inventory and add stock purchases" : "Manage inventory and stock purchases"}
          </p>
        </div>
        
        <Button onClick={openAddStockModal} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Stock Purchase
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Items</p>
                <p className="text-2xl font-bold text-gray-900">{inventory.filter(item => item.status === 'active').length}</p>
              </div>
              <Package2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Stock Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{inventory.reduce((total, item) => total + (item.stockQuantity * item.price), 0).toFixed(2)}
                </p>
              </div>
              <Calculator className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Purchases</p>
                <p className="text-2xl font-bold text-gray-900">{recentPurchases.length}</p>
              </div>
              <Receipt className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package2 className="h-5 w-5" />
            Inventory Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inventory.length === 0 ? (
            <div className="text-center py-8">
              <Package2 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No inventory items found. Super Admin needs to add items first.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell className="font-semibold text-amber-600">₹{item.price}</TableCell>
                      <TableCell>
                        <Badge variant={item.stockQuantity > 0 ? "default" : "destructive"}>
                          {item.stockQuantity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.status === "active" ? "default" : "secondary"}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewInventoryItem(item)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Stock Purchases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Recent Stock Purchases
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentPurchases.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No stock purchases found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price/Unit</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Supplier</TableHead>
                    {userType === "superadmin" && <TableHead>Added By</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPurchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-medium">{purchase.itemName}</TableCell>
                      <TableCell>{purchase.purchaseQuantity}</TableCell>
                      <TableCell>₹{purchase.purchasePricePerUnit}</TableCell>
                      <TableCell className="font-semibold text-green-600">₹{purchase.totalPurchaseAmount}</TableCell>
                      <TableCell>{new Date(purchase.purchaseDate).toLocaleDateString()}</TableCell>
                      <TableCell>{purchase.supplier}</TableCell>
                      {userType === "superadmin" && <TableCell>{purchase.addedBy}</TableCell>}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Stock Purchase Modal */}
      <Dialog open={showAddStockModal} onOpenChange={setShowAddStockModal}>
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Add Stock Purchase
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="item">Select Item *</Label>
              <Select value={stockForm.itemId} onValueChange={(value) => setStockForm({...stockForm, itemId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose inventory item" />
                </SelectTrigger>
                <SelectContent>
                  {inventory.filter(item => item.status === 'active').map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.unit}) - Current: {item.stockQuantity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedItem && (
              <div className="p-3 bg-blue-50 rounded-lg border">
                <p className="text-sm text-blue-700">
                  <strong>Current Stock:</strong> {selectedItem.stockQuantity} {selectedItem.unit}
                </p>
                <p className="text-sm text-blue-700">
                  <strong>Current Price:</strong> ₹{selectedItem.price} per {selectedItem.unit}
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="quantity">Purchase Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={stockForm.purchaseQuantity}
                onChange={(e) => setStockForm({...stockForm, purchaseQuantity: e.target.value})}
                placeholder="e.g., 10, 20.5"
                required
              />
            </div>

            <div>
              <Label htmlFor="pricePerUnit">Purchase Price per Unit</Label>
              <Input
                id="pricePerUnit"
                type="number"
                step="0.01"
                value={stockForm.purchasePricePerUnit}
                onChange={(e) => setStockForm({...stockForm, purchasePricePerUnit: e.target.value})}
                placeholder="Override default price"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to use current item price</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="totalAmount">Total Purchase Amount *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStockForm(prev => ({...prev, isManualTotal: !prev.isManualTotal}))}
                  className="text-xs"
                >
                  {stockForm.isManualTotal ? "Auto Calculate" : "Manual Entry"}
                </Button>
              </div>
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                value={stockForm.totalPurchaseAmount}
                onChange={(e) => setStockForm({...stockForm, totalPurchaseAmount: e.target.value, isManualTotal: true})}
                placeholder="Total amount"
                readOnly={!stockForm.isManualTotal}
                className={stockForm.isManualTotal ? "" : "bg-gray-50"}
                required
              />
            </div>

            <div>
              <Label htmlFor="purchaseDate">Purchase Date *</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={stockForm.purchaseDate}
                onChange={(e) => setStockForm({...stockForm, purchaseDate: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={stockForm.supplier}
                onChange={(e) => setStockForm({...stockForm, supplier: e.target.value})}
                placeholder="Supplier name (optional)"
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddStockModal(false)
                  resetStockForm()
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleAddStockPurchase} className="flex-1 bg-blue-600 hover:bg-blue-700">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add Stock
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Inventory Item Modal */}
      <Dialog open={showViewInventoryModal} onOpenChange={setShowViewInventoryModal}>
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Inventory Item Details
            </DialogTitle>
          </DialogHeader>
          {selectedInventoryItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Item Name</Label>
                  <p className="text-lg font-semibold">{selectedInventoryItem.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Unit</Label>
                  <p className="text-lg">{selectedInventoryItem.unit}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Price</Label>
                  <p className="text-lg font-semibold text-amber-600">₹{selectedInventoryItem.price}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Stock Quantity</Label>
                  <p className="text-lg font-semibold text-green-600">{selectedInventoryItem.stockQuantity}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Category</Label>
                  <Badge variant="outline">{selectedInventoryItem.category}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge variant={selectedInventoryItem.status === "active" ? "default" : "secondary"}>
                    {selectedInventoryItem.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Total Stock Value</Label>
                <p className="text-xl font-bold text-blue-600">
                  ₹{(selectedInventoryItem.stockQuantity * selectedInventoryItem.price).toFixed(2)}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                <p className="text-sm text-gray-500">
                  {new Date(selectedInventoryItem.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 