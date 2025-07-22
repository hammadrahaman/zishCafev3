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
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  X,
  Save,
  Eye,
  EyeOff,
  ShoppingCart,
  DollarSign,
  AlertCircle,
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

interface InventoryManagementProps {
  userType: "admin" | "superadmin" | null
}

export function InventoryManagement({ userType }: InventoryManagementProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isMobile, setIsMobile] = useState(false)
  const { toast } = useToast()

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    price: "",
    category: "",
    stockQuantity: "",
    status: "active" as "active" | "inactive",
  })

  // Categories for dropdown
  const categories = [
    "Dairy", "Fruits", "Vegetables", "Beverages", "Snacks", 
    "Grains", "Spices", "Tea", "Coffee", "Desserts", "Other"
  ]

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load inventory from localStorage
  useEffect(() => {
    const savedInventory = JSON.parse(localStorage.getItem("cafeInventory") || "[]")
    setInventory(savedInventory)
  }, [])

  // Apply filters and search
  useEffect(() => {
    let filtered = [...inventory]

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(item => item.category === categoryFilter)
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(item => item.status === statusFilter)
    }

    setFilteredInventory(filtered)
  }, [inventory, searchTerm, categoryFilter, statusFilter])

  // Save inventory to localStorage
  const saveInventory = (newInventory: InventoryItem[]) => {
    setInventory(newInventory)
    localStorage.setItem("cafeInventory", JSON.stringify(newInventory))
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      unit: "",
      price: "",
      category: "",
      stockQuantity: "",
      status: "active",
    })
  }

  // Add new item
  const handleAddItem = () => {
    if (!formData.name.trim() || !formData.unit.trim() || !formData.price.trim()) {
      toast({
        title: "Validation Error",
        description: "Name, Unit, and Price are required fields.",
        variant: "destructive",
      })
      return
    }

    const newItem: InventoryItem = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      unit: formData.unit.trim(),
      price: parseFloat(formData.price),
      category: formData.category || "Other",
      stockQuantity: parseInt(formData.stockQuantity) || 0,
      status: formData.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedInventory = [...inventory, newItem]
    saveInventory(updatedInventory)
    setShowAddModal(false)
    resetForm()

    toast({
      title: "Item Added",
      description: `${newItem.name} has been added to inventory.`,
    })
  }

  // Edit item
  const handleEditItem = () => {
    if (!editingItem || !formData.name.trim() || !formData.unit.trim() || !formData.price.trim()) {
      toast({
        title: "Validation Error",
        description: "Name, Unit, and Price are required fields.",
        variant: "destructive",
      })
      return
    }

    const updatedItem: InventoryItem = {
      ...editingItem,
      name: formData.name.trim(),
      unit: formData.unit.trim(),
      price: parseFloat(formData.price),
      category: formData.category || "Other",
      stockQuantity: parseInt(formData.stockQuantity) || 0,
      status: formData.status,
      updatedAt: new Date().toISOString(),
    }

    const updatedInventory = inventory.map(item => 
      item.id === editingItem.id ? updatedItem : item
    )
    saveInventory(updatedInventory)
    setShowEditModal(false)
    setEditingItem(null)
    resetForm()

    toast({
      title: "Item Updated",
      description: `${updatedItem.name} has been updated.`,
    })
  }

  // Delete item
  const handleDeleteItem = (id: string) => {
    const item = inventory.find(item => item.id === id)
    if (!item) return

    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      const updatedInventory = inventory.filter(item => item.id !== id)
      saveInventory(updatedInventory)

      toast({
        title: "Item Deleted",
        description: `${item.name} has been removed from inventory.`,
      })
    }
  }

  // Open edit modal
  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      unit: item.unit,
      price: item.price.toString(),
      category: item.category,
      stockQuantity: item.stockQuantity.toString(),
      status: item.status,
    })
    setShowEditModal(true)
  }

  // Open add modal
  const openAddModal = () => {
    resetForm()
    setShowAddModal(true)
  }

  // Only allow Super Admin access
  if (userType !== "superadmin") {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Inventory Management is only available for Super Admin users.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Mobile card view
  const MobileInventoryCard = ({ item }: { item: InventoryItem }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{item.name}</h3>
            <p className="text-sm text-gray-600">{item.unit}</p>
            <p className="text-lg font-bold text-amber-600">₹{item.price}</p>
          </div>
          <Badge variant={item.status === "active" ? "default" : "secondary"}>
            {item.status === "active" ? (
              <Eye className="h-3 w-3 mr-1" />
            ) : (
              <EyeOff className="h-3 w-3 mr-1" />
            )}
            {item.status}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
          <div>
            <span className="font-medium">Category:</span> {item.category}
          </div>
          <div>
            <span className="font-medium">Stock:</span> {item.stockQuantity}
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openEditModal(item)}
            className="flex-1"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteItem(item.id)}
            className="flex-1 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-purple-600" />
            Inventory Management
          </h2>
          <p className="text-gray-600 mt-1">Manage your cafe inventory items</p>
        </div>
        
        {/* Add Button - Desktop */}
        <div className="hidden sm:block">
          <Button onClick={openAddModal} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Add New Item
          </Button>
        </div>
      </div>

      {/* Super Admin Dashboard Insights */}
      {userType === "superadmin" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Total Inventory Items</p>
                  <p className="text-2xl font-bold text-purple-900">{inventory.length}</p>
                  <p className="text-xs text-purple-500 mt-1">
                    {inventory.filter(item => item.status === 'active').length} active
                  </p>
                </div>
                <Package className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Stock Quantity</p>
                  <p className="text-2xl font-bold text-green-900">
                    {inventory.reduce((total, item) => total + item.stockQuantity, 0)}
                  </p>
                  <p className="text-xs text-green-500 mt-1">units in stock</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Stock Value</p>
                  <p className="text-2xl font-bold text-blue-900">
                    ₹{inventory.reduce((total, item) => total + (item.stockQuantity * item.price), 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-blue-500 mt-1">current valuation</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Low Stock Items</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {inventory.filter(item => item.stockQuantity <= 5 && item.status === 'active').length}
                  </p>
                  <p className="text-xs text-orange-500 mt-1">need attention</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredInventory.length} of {inventory.length} items
        </p>
        {(searchTerm || categoryFilter !== "all" || statusFilter !== "all") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm("")
              setCategoryFilter("all")
              setStatusFilter("all")
            }}
          >
            <X className="h-3 w-3 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Inventory List */}
      {filteredInventory.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">
                {inventory.length === 0 ? "No inventory items found" : "No items match your filters"}
              </p>
              {inventory.length === 0 && (
                <Button onClick={openAddModal} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Item
                </Button>
              )}
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
                    <TableHead>Item Name</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell className="font-semibold text-amber-600">₹{item.price}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell>{item.stockQuantity}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === "active" ? "default" : "secondary"}>
                          {item.status === "active" ? (
                            <Eye className="h-3 w-3 mr-1" />
                          ) : (
                            <EyeOff className="h-3 w-3 mr-1" />
                          )}
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(item)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteItem(item.id)}
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
          <div className="block md:hidden">
            {filteredInventory.map((item) => (
              <MobileInventoryCard key={item.id} item={item} />
            ))}
          </div>
        </>
      )}

      {/* Floating Action Button - Mobile */}
      {isMobile && (
        <Button
          onClick={openAddModal}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg z-50"
          size="sm"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {/* Add Item Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-purple-600" />
              Add New Inventory Item
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Milk, Mango"
                required
              />
            </div>

            <div>
              <Label htmlFor="unit">Unit *</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                placeholder="e.g., 1 Ltr, 1 Kg, 500g"
                required
              />
            </div>

            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: "active" | "inactive") => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false)
                  resetForm()
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleAddItem} className="flex-1 bg-purple-600 hover:bg-purple-700">
                <Save className="h-4 w-4 mr-2" />
                Save Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-purple-600" />
              Edit Inventory Item
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Item Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Milk, Mango"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-unit">Unit *</Label>
              <Input
                id="edit-unit"
                value={formData.unit}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                placeholder="e.g., 1 Ltr, 1 Kg, 500g"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-price">Price *</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-stock">Stock Quantity</Label>
              <Input
                id="edit-stock"
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value: "active" | "inactive") => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false)
                  setEditingItem(null)
                  resetForm()
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleEditItem} className="flex-1 bg-purple-600 hover:bg-purple-700">
                <Save className="h-4 w-4 mr-2" />
                Update Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 