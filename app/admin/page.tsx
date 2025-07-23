"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Coffee,
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChefHat,
  Package,
  LogOut,
  Home,
  TrendingUp,
  Download, // Add this
  ShoppingCart,
  Plus,
  Calendar,
  MessageSquare,
  Package2,
  Eye,
  Truck,
  Receipt,
  Calculator,
  Star, // Added for specials tab
  BarChart3, // Add this
  FileSpreadsheet, // Add this
  FileText, // Add this
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { InventoryManagement } from "@/components/inventory-management"
import { StockPurchaseManagement } from "@/components/stock-purchase-management"
import { StockInsightsDashboard } from "@/components/stock-insights-dashboard"
import { FeedbackManagement } from "@/components/feedback-management"

interface Order {
  id: string
  items: Array<{
    name: string
    price: number
    quantity: number
    specialInstructions?: string
    subtotal: string
  }>
  total: string
  customerName: string
  phoneNumber?: string
  generalInstructions?: string
  status: string
  paymentStatus: string
  date: string
  timestamp: string
}

interface Special {
  id: number
  name: string
  price: number
  category: string
  description: string
  image?: string
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userType, setUserType] = useState<"admin" | "superadmin" | null>(null) // Add this line
  const [currentUser, setCurrentUser] = useState("") // Add this line
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [todaysSpecials, setTodaysSpecials] = useState<Special[]>([])
  const [newSpecial, setNewSpecial] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
  })
  const [showAddSpecial, setShowAddSpecial] = useState(false)
  const { toast } = useToast()

  const [existingMenuItems] = useState([
    {
      id: 1,
      name: "Normal Tea",
      price: 15,
      category: "Tea",
      description: "Classic Indian tea",
      image: "/images/menu/normal-tea.jpg",
    },
    {
      id: 2,
      name: "Black Tea",
      price: 15,
      category: "Tea", 
      description: "Pure black tea",
      image: "/images/menu/black-tea.jpg",
    },
    {
      id: 3,
      name: "Masala Tea",
      price: 22,
      category: "Tea",
      description: "Traditional spiced tea", 
      image: "/images/menu/masala-tea.jpg",
    },
    {
      id: 4,
      name: "Special Masala Tea",
      price: 25,
      category: "Tea",
      description: "Spicy masala tea with a twist",
      image: "/images/menu/special-masala-tea.jpg",
    },
    {
      id: 5,
      name: "Elachi Tea",
      price: 20,
      category: "Tea",
      description: "Cardamom-infused tea",
      image: "/images/menu/elachi-tea.jpg",
    },
    {
      id: 6,
      name: "Ginger Tea",
      price: 20,
      category: "Tea",
      description: "Warming ginger tea",
      image: "/images/menu/ginger-tea.jpg",
    },
    {
      id: 7,
      name: "Green Tea",
      price: 20,
      category: "Tea",
      description: "Refreshing green tea",
      image: "/images/menu/green-tea.jpg",
    },
    {
      id: 8,
      name: "Green Tea with Honey",
      price: 25,
      category: "Tea",
      description: "Green tea sweetened with honey",
      image: "/images/menu/green-tea-with-honey.jpg",
    },
    {
      id: 9,
      name: "Honey Lemon Tea",
      price: 25,
      category: "Tea",
      description: "Lemon tea with a hint of honey",
      image: "/images/menu/honey-lemon-tea.jpg",
    },
    {
      id: 10,
      name: "Chocolate Tea",
      price: 30,
      category: "Tea",
      description: "Rich chocolate tea",
      image: "/images/menu/chocolate-tea.jpg",
    },
    {
      id: 11,
      name: "Kashmiri Kahwa",
      price: 30,
      category: "Tea",
      description: "Saffron-infused Kashmiri tea",
      image: "/images/menu/kashmiri-kahwa.jpg",
    },
    {
      id: 12,
      name: "Black Coffee",
      price: 25,
      category: "Coffee",
      description: "Strong black coffee",
      image: "/images/menu/black-coffee.jpg",
    },
    {
      id: 13,
      name: "Milk Coffee",
      price: 30,
      category: "Coffee",
      description: "Creamy milk coffee",
      image: "/images/menu/milk-coffee.jpg",
    },
    {
      id: 14,
      name: "Special Filter Coffee",
      price: 35,
      category: "Coffee",
      description: "Premium filter coffee",
      image: "/images/menu/special-filter-coffee.jpg",
    },
    {
      id: 15,
      name: "Jaggery Coffee",
      price: 35,
      category: "Coffee",
      description: "Sweet jaggery coffee",
      image: "/images/menu/jaggery-coffee.jpg",
    },
    {
      id: 16,
      name: "Chocolate Coffee",
      price: 40,
      category: "Coffee",
      description: "Decadent chocolate coffee",
      image: "/images/menu/chocolate-coffee.jpg",
    },
    {
      id: 17,
      name: "Belgian Coffee",
      price: 45,
      category: "Coffee",
      description: "Belgian-style coffee",
      image: "/images/menu/belgian-coffee.jpg",
    },
    {
      id: 18,
      name: "Coffee On The Rocks",
      price: 45,
      category: "Coffee",
      description: "Iced coffee with a twist",
      image: "/images/menu/coffee-on-the-rocks.jpg",
    },
    {
      id: 19,
      name: "Ferrero Coffee",
      price: 50,
      category: "Coffee",
      description: "Ferrero Rocher coffee",
      image: "/images/menu/ferrero-coffee.jpg",
    },
    {
      id: 20,
      name: "Hard Rock Coffee",
      price: 50,
      category: "Coffee",
      description: "Hard Rock Cafe-style coffee",
      image: "/images/menu/hard-rock-coffee.jpg",
    },
    {
      id: 21,
      name: "Mud Coffee",
      price: 50,
      category: "Coffee",
      description: "Mudslide coffee",
      image: "/images/menu/mud-coffee.jpg",
    },
    {
      id: 22,
      name: "Turkish Coffee",
      price: 50,
      category: "Coffee",
      description: "Traditional Turkish coffee",
      image: "/images/menu/turkish-coffee.jpg",
    },
    {
      id: 23,
      name: "Fresh Lime",
      price: 25,
      category: "Juice",
      description: "Refreshing lime juice",
      image: "/images/menu/fresh-lime.jpg",
    },
    {
      id: 24,
      name: "Ginger Lime",
      price: 30,
      category: "Juice",
      description: "Spicy ginger lime juice",
      image: "/images/menu/ginger-lime.jpg",
    },
    {
      id: 25,
      name: "Jaljeera",
      price: 30,
      category: "Juice",
      description: "Spiced jaljeera drink",
      image: "/images/menu/jaljeera.jpg",
    },
    {
      id: 26,
      name: "Watermelon",
      price: 35,
      category: "Juice",
      description: "Fresh watermelon juice",
      image: "/images/menu/watermelon.jpg",
    },
    {
      id: 27,
      name: "Pineapple",
      price: 35,
      category: "Juice",
      description: "Tangy pineapple juice",
      image: "/images/menu/pineapple.jpg",
    },
    {
      id: 28,
      name: "Mango",
      price: 35,
      category: "Juice",
      description: "Sweet mango juice",
      image: "/images/menu/mango.jpg",
    },
    {
      id: 29,
      name: "Mango Alphonso",
      price: 40,
      category: "Juice",
      description: "Premium Alphonso mango juice",
      image: "/images/menu/mango-alphonso.jpg",
    },
    {
      id: 30,
      name: "Banana",
      price: 35,
      category: "Juice",
      description: "Creamy banana juice",
      image: "/images/menu/banana.jpg",
    },
    {
      id: 31,
      name: "Chickoo",
      price: 35,
      category: "Juice",
      description: "Sweet chickoo juice",
      image: "/images/menu/chickoo.jpg",
    },
    {
      id: 32,
      name: "Musk Melon",
      price: 35,
      category: "Juice",
      description: "Exotic musk melon juice",
      image: "/images/menu/musk-melon.jpg",
    },
    {
      id: 33,
      name: "Avocado",
      price: 40,
      category: "Juice",
      description: "Creamy avocado juice",
      image: "/images/menu/avocado.jpg",
    },
    {
      id: 34,
      name: "Badam Milk",
      price: 40,
      category: "Milk",
      description: "Almond milk",
      image: "/images/menu/badam-milk.jpg",
    },
    {
      id: 35,
      name: "Boost Milk",
      price: 40,
      category: "Milk",
      description: "Boost energy drink",
      image: "/images/menu/boost-milk.jpg",
    },
    {
      id: 36,
      name: "Cold Boost",
      price: 45,
      category: "Milk",
      description: "Iced Boost energy drink",
      image: "/images/menu/cold-boost.jpg",
    },
    {
      id: 37,
      name: "Cold Bournvita",
      price: 45,
      category: "Milk",
      description: "Iced Bournvita drink",
      image: "/images/menu/cold-bournvita.jpg",
    },
    {
      id: 38,
      name: "Horlicks Milk",
      price: 45,
      category: "Milk",
      description: "Horlicks malted drink",
      image: "/images/menu/horlicks-milk.jpg",
    },
    {
      id: 39,
      name: "Hot Chocolate Milk",
      price: 45,
      category: "Milk",
      description: "Hot chocolate milk",
      image: "/images/menu/hot-chocolate-milk.jpg",
    },
    {
      id: 40,
      name: "Pilani Milk",
      price: 45,
      category: "Milk",
      description: "Pilani milk drink",
      image: "/images/menu/pilani-milk.jpg",
    },
    {
      id: 41,
      name: "Butter Milk",
      price: 25,
      category: "Milk",
      description: "Creamy butter milk",
      image: "/images/menu/butter-milk.jpg",
    },
    {
      id: 42,
      name: "Nutella Shake",
      price: 50,
      category: "Shakes",
      description: "Chocolate Nutella shake",
      image: "/images/menu/nutella-shake.jpg",
    },
    {
      id: 43,
      name: "Dry Fruit Shake",
      price: 50,
      category: "Shakes",
      description: "Mixed dry fruit shake",
      image: "/images/menu/dry-fruit-shake.jpg",
    },
    {
      id: 44,
      name: "Berry Blue Berry Shake",
      price: 50,
      category: "Shakes",
      description: "Berry-flavored shake",
      image: "/images/menu/berry-blue-berry-shake.jpg",
    },
    {
      id: 45,
      name: "Natural Protein",
      price: 50,
      category: "Shakes",
      description: "Natural protein shake",
      image: "/images/menu/natural-protein.jpg",
    },
    {
      id: 46,
      name: "Whey Protein",
      price: 50,
      category: "Shakes",
      description: "Whey protein shake",
      image: "/images/menu/whey-protein.jpg",
    },
    {
      id: 47,
      name: "Ice Cream Scoop",
      price: 30,
      category: "Ice Cream",
      description: "Single scoop of ice cream",
      image: "/images/menu/ice-cream-scoop.jpg",
    },
    {
      id: 48,
      name: "Vanilla Shoo Shoo",
      price: 40,
      category: "Ice Cream",
      description: "Vanilla ice cream",
      image: "/images/menu/vanilla-shoo-shoo.jpg",
    },
    {
      id: 49,
      name: "Strawberry Shoo Shoo",
      price: 40,
      category: "Ice Cream",
      description: "Strawberry ice cream",
      image: "/images/menu/strawberry-shoo-shoo.jpg",
    },
    {
      id: 50,
      name: "Chocolate Ice Cream",
      price: 40,
      category: "Ice Cream",
      description: "Chocolate ice cream",
      image: "/images/menu/chocolate-ice-cream.jpg",
    },
    {
      id: 51,
      name: "Madagascar Ice Cream",
      price: 45,
      category: "Ice Cream",
      description: "Premium Madagascar vanilla ice cream",
      image: "/images/menu/madagascar-ice-cream.jpg",
    },
    {
      id: 52,
      name: "Red Velvet Ice Cream",
      price: 45,
      category: "Ice Cream",
      description: "Red velvet ice cream",
      image: "/images/menu/red-velvet-ice-cream.jpg",
    },
    {
      id: 53,
      name: "Butterscotch",
      price: 45,
      category: "Ice Cream",
      description: "Butterscotch ice cream",
      image: "/images/menu/butterscotch.jpg",
    },
    {
      id: 54,
      name: "Chocolate",
      price: 45,
      category: "Ice Cream",
      description: "Chocolate ice cream",
      image: "/images/menu/chocolate.jpg",
    },
    {
      id: 55,
      name: "Malai Kulfi",
      price: 45,
      category: "Ice Cream",
      description: "Malai kulfi",
      image: "/images/menu/malai-kulfi.jpg",
    },
    {
      id: 56,
      name: "Punjab Kulfi",
      price: 45,
      category: "Ice Cream",
      description: "Punjab kulfi",
      image: "/images/menu/punjab-kulfi.jpg",
    },
    {
      id: 57,
      name: "Veg Sandwich",
      price: 50,
      category: "Sandwich",
      description: "Vegetable sandwich",
      image: "/images/menu/veg-sandwich.jpg",
    },
    {
      id: 58,
      name: "Veg Grilled Sandwich",
      price: 55,
      category: "Sandwich",
      description: "Grilled vegetable sandwich",
      image: "/images/menu/veg-grilled-sandwich.jpg",
    },
    {
      id: 59,
      name: "Cheese Grilled Sandwich",
      price: 60,
      category: "Sandwich",
      description: "Grilled cheese sandwich",
      image: "/images/menu/cheese-grilled-sandwich.jpg",
    },
    {
      id: 60,
      name: "Corn Cheese Sandwich",
      price: 60,
      category: "Sandwich",
      description: "Corn and cheese sandwich",
      image: "/images/menu/corn-cheese-sandwich.jpg",
    },
    {
      id: 61,
      name: "Corn Peri Peri Sandwich",
      price: 65,
      category: "Sandwich",
      description: "Spicy corn peri peri sandwich",
      image: "/images/menu/corn-peri-peri-sandwich.jpg",
    },
    {
      id: 62,
      name: "Paneer Sandwich",
      price: 65,
      category: "Sandwich",
      description: "Paneer sandwich",
      image: "/images/menu/paneer-sandwich.jpg",
    },
    {
      id: 63,
      name: "Paneer Nutella Sandwich",
      price: 70,
      category: "Sandwich",
      description: "Paneer and Nutella sandwich",
      image: "/images/menu/paneer-nutella-sandwich.jpg",
    },
    {
      id: 64,
      name: "Choco Peanut Nutella Sandwich",
      price: 75,
      category: "Sandwich",
      description: "Chocolate, peanut, and Nutella sandwich",
      image: "/images/menu/choco-peanut-nutella-sandwich.jpg",
    },
    {
      id: 65,
      name: "Mexican Peri Peri Sandwich",
      price: 75,
      category: "Sandwich",
      description: "Spicy Mexican peri peri sandwich",
      image: "/images/menu/mexican-peri-peri-sandwich.jpg",
    },
    {
      id: 66,
      name: "Egg Sandwich",
      price: 50,
      category: "Sandwich",
      description: "Egg sandwich",
      image: "/images/menu/egg-sandwich.jpg",
    },
    {
      id: 67,
      name: "Bread Butter Jam",
      price: 30,
      category: "Snacks",
      description: "Bread with butter and jam",
      image: "/images/menu/bread-butter-jam.jpg",
    },
    {
      id: 68,
      name: "Bread Omelette",
      price: 35,
      category: "Snacks",
      description: "Bread omelette",
      image: "/images/menu/bread-omelette.jpg",
    },
    {
      id: 69,
      name: "Bread Mayo Omelette",
      price: 40,
      category: "Snacks",
      description: "Bread omelette with mayonnaise",
      image: "/images/menu/bread-mayo-omelette.jpg",
    },
    {
      id: 70,
      name: "Bun Butter Jam",
      price: 30,
      category: "Snacks",
      description: "Bun with butter and jam",
      image: "/images/menu/bun-butter-jam.jpg",
    },
    {
      id: 71,
      name: "Bun Muska",
      price: 35,
      category: "Snacks",
      description: "Bun muska",
      image: "/images/menu/bun-muska.jpg",
    },
    {
      id: 72,
      name: "Double Cheese Margherita",
      price: 80,
      category: "Pizza",
      description: "Double cheese margherita pizza",
      image: "/images/menu/double-cheese-margherita.jpg",
    },
    {
      id: 73,
      name: "Corn Cheese Pizza",
      price: 80,
      category: "Pizza",
      description: "Corn and cheese pizza",
      image: "/images/menu/corn-cheese-pizza.jpg",
    },
    {
      id: 74,
      name: "Paneer Cheese Pizza",
      price: 85,
      category: "Pizza",
      description: "Paneer and cheese pizza",
      image: "/images/menu/paneer-cheese-pizza.jpg",
    },
    {
      id: 75,
      name: "Chilli Paneer Pizza",
      price: 90,
      category: "Pizza",
      description: "Spicy chilli paneer pizza",
      image: "/images/menu/chilli-paneer-pizza.jpg",
    },
    {
      id: 76,
      name: "Mexican Pizza",
      price: 90,
      category: "Pizza",
      description: "Mexican pizza",
      image: "/images/menu/mexican-pizza.jpg",
    },
    {
      id: 77,
      name: "Italian Pizza",
      price: 90,
      category: "Pizza",
      description: "Italian pizza",
      image: "/images/menu/italian-pizza.jpg",
    },
    {
      id: 78,
      name: "Greek Pizza",
      price: 90,
      category: "Pizza",
      description: "Greek pizza",
      image: "/images/menu/greek-pizza.jpg",
    },
    {
      id: 79,
      name: "Classic Fries",
      price: 40,
      category: "Fries",
      description: "Classic fries",
      image: "/images/menu/classic-fries.jpg",
    },
    {
      id: 80,
      name: "Masala Fries",
      price: 45,
      category: "Fries",
      description: "Spicy masala fries",
      image: "/images/menu/masala-fries.jpg",
    },
    {
      id: 81,
      name: "Peri Peri Fries",
      price: 50,
      category: "Fries",
      description: "Spicy peri peri fries",
      image: "/images/menu/peri-peri-fries.jpg",
    },
    {
      id: 82,
      name: "Lemon Fries",
      price: 50,
      category: "Fries",
      description: "Lemon fries",
      image: "/images/menu/lemon-fries.jpg",
    },
    {
      id: 83,
      name: "Loaded Cheese Fries",
      price: 55,
      category: "Fries",
      description: "Loaded cheese fries",
      image: "/images/menu/loaded-cheese-fries.jpg",
    },
    {
      id: 84,
      name: "Loaded Peri Peri Fries",
      price: 60,
      category: "Fries",
      description: "Loaded spicy peri peri fries",
      image: "/images/menu/loaded-peri-peri-fries.jpg",
    },
    {
      id: 85,
      name: "Loaded Tikka Fries",
      price: 60,
      category: "Fries",
      description: "Loaded tikka fries",
      image: "/images/menu/loaded-tikka-fries.jpg",
    },
    {
      id: 86,
      name: "Paneer Fries",
      price: 60,
      category: "Fries",
      description: "Paneer fries",
      image: "/images/menu/paneer-fries.jpg",
    },
    {
      id: 87,
      name: "Potato Wedges",
      price: 50,
      category: "Fries",
      description: "Potato wedges",
      image: "/images/menu/potato-wedges.jpg",
    },
    {
      id: 88,
      name: "Potato Bites",
      price: 50,
      category: "Fries",
      description: "Potato bites",
      image: "/images/menu/potato-bites.jpg",
    },
    {
      id: 89,
      name: "Crispy Corn",
      price: 40,
      category: "Snacks",
      description: "Crispy corn",
      image: "/images/menu/crispy-corn.jpg",
    },
  ])
  const [selectedExistingItem, setSelectedExistingItem] = useState("")

  // Add hydration safety
  const [isClient, setIsClient] = useState(false)

  // Check if user is already logged in
  useEffect(() => {
    setIsClient(true)
    
    // Restore login session
    const savedLogin = localStorage.getItem("adminLoggedIn")
    const savedUserType = localStorage.getItem("userType")
    const savedCurrentUser = localStorage.getItem("currentUser")
    
    if (savedLogin === "true" && savedUserType && savedCurrentUser) {
      setIsLoggedIn(true)
      setUserType(savedUserType as "admin" | "superadmin")
      setCurrentUser(savedCurrentUser)
    }

    // Load orders and specials
    const savedOrders = JSON.parse(localStorage.getItem("cafeOrders") || "[]")
    setOrders(savedOrders)
    const savedSpecials = JSON.parse(localStorage.getItem("todaysSpecials") || "[]")
    setTodaysSpecials(savedSpecials)
  }, [])

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load orders and specials
  useEffect(() => {
    if (isLoggedIn) {
      loadOrders()
      loadTodaysSpecials()
    }
  }, [isLoggedIn])

  const loadOrders = () => {
    try {
      const savedOrders = JSON.parse(localStorage.getItem("cafeOrders") || "[]")
      setOrders(savedOrders || [])
    } catch (error) {
      console.error("Error loading orders:", error)
      setOrders([])
    }
  }

  const loadTodaysSpecials = () => {
    try {
      const savedSpecials = JSON.parse(localStorage.getItem("todaysSpecials") || "[]")
      setTodaysSpecials(savedSpecials || [])
    } catch (error) {
      console.error("Error loading specials:", error)
      setTodaysSpecials([])
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Define users with their credentials and types
    const users = {
      admin: { password: "zish2025", type: "admin" as const },
      superadmin: { password: "zishsuper2025", type: "superadmin" as const }
    }
    
    // Check credentials
    const user = users[username as keyof typeof users]
    if (user && password === user.password) {
      setIsLoggedIn(true)
      setUserType(user.type)
      setCurrentUser(username)
      localStorage.setItem("adminLoggedIn", "true")
      localStorage.setItem("userType", user.type)
      localStorage.setItem("currentUser", username)
      
      toast({
        title: "Login Successful",
        description: `Welcome ${user.type === "superadmin" ? "Super Admin" : "Admin"}!`,
      })
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserType(null)
    setCurrentUser("")
    localStorage.removeItem("adminLoggedIn")
    localStorage.removeItem("userType")
    localStorage.removeItem("currentUser")
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
  }

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    try {
      const updatedOrders = orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
      setOrders(updatedOrders)
      localStorage.setItem("cafeOrders", JSON.stringify(updatedOrders))
      toast({
        title: "Status Updated",
        description: `Order #${orderId.slice(-6)} status changed to ${newStatus}`,
      })
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      })
    }
  }

  const updatePaymentStatus = (orderId: string, newPaymentStatus: string) => {
    try {
      const updatedOrders = orders.map((order) =>
        order.id === orderId ? { ...order, paymentStatus: newPaymentStatus } : order,
      )
      setOrders(updatedOrders)
      localStorage.setItem("cafeOrders", JSON.stringify(updatedOrders))
      toast({
        title: "Payment Status Updated",
        description: `Order #${orderId.slice(-6)} payment status changed to ${newPaymentStatus}`,
      })
    } catch (error) {
      console.error("Error updating payment status:", error)
      toast({
        title: "Error",
        description: "Failed to update payment status.",
        variant: "destructive",
      })
    }
  }

  const handleExistingItemSelect = (itemId: string) => {
    if (itemId === "create-new") {
      setNewSpecial({ name: "", price: "", category: "", description: "" })
      setSelectedExistingItem("")
      return
    }

    const item = existingMenuItems.find((item) => item.id.toString() === itemId)
    if (item) {
      setNewSpecial({
        name: item.name,
        price: item.price.toString(),
        category: item.category,
        description: item.description,
      })
      setSelectedExistingItem(itemId)
    }
  }

  const addTodaysSpecial = () => {
    if (!newSpecial.name) {
      toast({
        title: "Missing Information",
        description: "Please provide at least a name for the special.",
        variant: "destructive",
      })
      return
    }

    try {
      const special: Special = {
        id: Date.now(),
        name: newSpecial.name,
        price: newSpecial.price ? Number.parseFloat(newSpecial.price) : 0,
        category: newSpecial.category || "Other",
        description: newSpecial.description,
        image: `/images/menu/${getImageFileName(newSpecial.name)}`,
      }

      const updatedSpecials = [...todaysSpecials, special]
      setTodaysSpecials(updatedSpecials)
      localStorage.setItem("todaysSpecials", JSON.stringify(updatedSpecials))

      setNewSpecial({ name: "", price: "", category: "", description: "" })
      setSelectedExistingItem("")
      setShowAddSpecial(false)

      toast({
        title: "Special Added",
        description: `${special.name} has been added to today's specials!`,
      })
    } catch (error) {
      console.error("Error adding special:", error)
      toast({
        title: "Error",
        description: "Failed to add special.",
        variant: "destructive",
      })
    }
  }

  const removeSpecial = (specialId: number) => {
    try {
      const updatedSpecials = todaysSpecials.filter((special) => special.id !== specialId)
      setTodaysSpecials(updatedSpecials)
      localStorage.setItem("todaysSpecials", JSON.stringify(updatedSpecials))
      toast({
        title: "Special Removed",
        description: "Special has been removed from today's menu.",
      })
    } catch (error) {
      console.error("Error removing special:", error)
      toast({
        title: "Error",
        description: "Failed to remove special.",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "preparing":
        return <ChefHat className="h-4 w-4" />
      case "ready":
        return <Package className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "preparing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "ready":
        return "bg-green-100 text-green-800 border-green-200"
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPaymentStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "unpaid":
        return <XCircle className="h-4 w-4" />
      case "paid cash":
        return <DollarSign className="h-4 w-4" />
      case "paid upi":
        return <Coffee className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  // Calculate stats
  const today = new Date().toDateString()
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  // Daily stats - only count PAID orders for revenue
  const todayOrders = orders?.filter((order) => new Date(order.timestamp).toDateString() === today) || []
  const totalOrdersToday = todayOrders.length
  
  // Filter only PAID orders for daily revenue
  const todayPaidOrders = todayOrders.filter((order) => 
    (order?.paymentStatus || "unpaid").toLowerCase() !== "unpaid"
  )
  const totalRevenueToday = todayPaidOrders.reduce((sum, order) => sum + Number.parseFloat(order?.total || "0"), 0) || 0
  
  // Monthly stats - only count PAID orders for revenue
  const monthlyOrders = orders?.filter((order) => {
    const orderDate = new Date(order.timestamp)
    return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
  }) || []
  
  // Filter only PAID orders for monthly revenue
  const monthlyPaidOrders = monthlyOrders.filter((order) => 
    (order?.paymentStatus || "unpaid").toLowerCase() !== "unpaid"
  )
  const totalMonthlyRevenue = monthlyPaidOrders.reduce((sum, order) => sum + Number.parseFloat(order?.total || "0"), 0) || 0
  
  // Status-based stats
  const pendingOrders = orders?.filter((order) => order?.status?.toLowerCase() === "pending")?.length || 0
  const completedOrders = orders?.filter((order) => order?.status?.toLowerCase() === "completed")?.length || 0
  const unpaidOrders = orders?.filter((order) => (order?.paymentStatus || "unpaid").toLowerCase() === "unpaid")?.length || 0
  
  // Unpaid amount calculation (remains the same)
  const unpaidAmount = orders?.filter((order) => (order?.paymentStatus || "unpaid").toLowerCase() === "unpaid")
    .reduce((sum, order) => sum + Number.parseFloat(order?.total || "0"), 0) || 0

  // Fast moving products calculation (remains the same)
  const productCounts = {}
  orders?.forEach((order) => {
    if (order?.items && Array.isArray(order.items)) {
      order.items.forEach((item) => {
        const productName = item?.name || "Unknown Item"
        const quantity = item?.quantity || 0
        productCounts[productName] = (productCounts[productName] || 0) + quantity
      })
    } else if (order?.item) {
      // Handle legacy single item format
      const productName = order.item
      const quantity = order?.quantity || 1
      productCounts[productName] = (productCounts[productName] || 0) + quantity
    }
  })

  // Find the most popular product
  const fastMovingProduct = Object.entries(productCounts).length > 0 
    ? Object.entries(productCounts).reduce((a, b) => a[1] > b[1] ? a : b)
    : ["No orders yet", 0]

  const exportToExcel = () => {
    try {
      // Create comprehensive data for export
      const exportData = []
      
      // Add summary statistics
      exportData.push(['=== CAFE STATISTICS REPORT ==='])
      exportData.push(['Generated on:', new Date().toLocaleString()])
      exportData.push([''])
      exportData.push(['DAILY STATS'])
      exportData.push(['Total Orders Today:', totalOrdersToday])
      exportData.push(['Paid Orders Today:', todayPaidOrders.length])
      exportData.push(['Daily Revenue (Paid Only):', `₹${totalRevenueToday.toFixed(2)}`])
      exportData.push([''])
      exportData.push(['MONTHLY STATS'])
      exportData.push(['Total Monthly Orders:', monthlyOrders.length])
      exportData.push(['Paid Monthly Orders:', monthlyPaidOrders.length])
      exportData.push(['Monthly Revenue (Paid Only):', `₹${totalMonthlyRevenue.toFixed(2)}`])
      exportData.push([''])
      exportData.push(['ORDER STATUS'])
      exportData.push(['Pending Orders:', pendingOrders])
      exportData.push(['Completed Orders:', completedOrders])
      exportData.push(['Unpaid Orders:', unpaidOrders])
      exportData.push(['Unpaid Amount:', `₹${unpaidAmount.toFixed(2)}`])
      exportData.push([''])
      
      // Add revenue breakdown
      exportData.push(['=== REVENUE BREAKDOWN ==='])
      exportData.push(['Payment Status', 'Order Count', 'Total Amount'])
      
      const paidOrders = orders?.filter((order) => (order?.paymentStatus || "unpaid").toLowerCase() !== "unpaid") || []
      const unpaidOrdersList = orders?.filter((order) => (order?.paymentStatus || "unpaid").toLowerCase() === "unpaid") || []
      
      const paidAmount = paidOrders.reduce((sum, order) => sum + Number.parseFloat(order?.total || "0"), 0)
      const unpaidAmountCalc = unpaidOrdersList.reduce((sum, order) => sum + Number.parseFloat(order?.total || "0"), 0)
      
      exportData.push(['Paid Orders', paidOrders.length, `₹${paidAmount.toFixed(2)}`])
      exportData.push(['Unpaid Orders', unpaidOrdersList.length, `₹${unpaidAmountCalc.toFixed(2)}`])
      exportData.push(['Total Orders', orders?.length || 0, `₹${(paidAmount + unpaidAmountCalc).toFixed(2)}`])
      exportData.push([''])
      
      // Add product sales data
      exportData.push(['=== PRODUCT SALES REPORT ==='])
      exportData.push(['Product Name', 'Total Quantity Sold', 'Revenue Impact'])
      
      // Sort products by quantity sold (descending)
      const sortedProducts = Object.entries(productCounts).sort((a, b) => b[1] - a[1])
      
      sortedProducts.forEach(([productName, quantity]) => {
        // Calculate revenue impact for each product
        let productRevenue = 0
        orders?.forEach((order) => {
          if (order?.items && Array.isArray(order.items)) {
            order.items.forEach((item) => {
              if (item?.name === productName) {
                productRevenue += (item?.price || 0) * (item?.quantity || 0)
              }
            })
          }
        })
        
        exportData.push([productName, quantity, `₹${productRevenue.toFixed(2)}`])
      })
      
      exportData.push([''])
      
      // Add detailed orders data
      exportData.push(['=== DETAILED ORDERS DATA ==='])
      exportData.push(['Order ID', 'Customer Name', 'Phone', 'Date', 'Status', 'Payment Status', 'Items', 'Total Amount'])
      
      orders?.forEach((order) => {
        const itemsText = order?.items && Array.isArray(order.items) 
          ? order.items.map(item => `${item.quantity}x ${item.name}`).join('; ')
          : `${order?.quantity || 1}x ${order?.item || 'Unknown'}`
        
        exportData.push([
          order?.id?.slice(-6) || 'Unknown',
          order?.customerName || 'N/A',
          order?.phoneNumber || 'N/A',
          new Date(order?.timestamp).toLocaleString(),
          order?.status || 'Unknown',
          order?.paymentStatus || 'unpaid',
          itemsText,
          `₹${order?.total || '0'}`
        ])
      })
      
      // Convert to CSV format
      const csvContent = exportData.map(row => 
        row.map(field => `"${field}"`).join(',')
      ).join('\n')
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `cafe-report-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "Export Successful",
        description: "Cafe data has been downloaded as CSV file.",
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting the data.",
        variant: "destructive",
      })
    }
  }

  const [activeTab, setActiveTab] = useState("dashboard") // Add this

  if (!isClient) {
    return <div>Loading...</div>
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Coffee className="h-8 w-8 text-amber-600" />
              <CardTitle className="text-2xl font-bold text-amber-600">Admin Login</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  <p>👤 Admin: <code>admin</code></p>
                  <p>🦸‍♂️ Super Admin: <code>superadmin</code></p>
                </div>
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Cafe Admin Dashboard</h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-gray-600">Manage orders and track performance</p>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={userType === "superadmin" ? "default" : "secondary"}
                  className={userType === "superadmin" ? "bg-purple-600 hover:bg-purple-700" : ""}
                >
                  {userType === "superadmin" ? "🦸‍♂️ Super Admin" : "👤 Admin"}
                </Badge>
                <span className="text-sm text-gray-500">({currentUser})</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            {/* Only show Export Data for Super Admin */}
            {userType === "superadmin" && (
              <Button
                onClick={exportToExcel}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export Data</span>
                <span className="sm:hidden">Export</span>
              </Button>
            )}
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" className="flex items-center justify-center space-x-2 w-full">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Visit Website</span>
                <span className="sm:hidden">Website</span>
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center justify-center space-x-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 w-full sm:w-auto"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Exit</span>
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        {userType && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 p-1 bg-white rounded-lg shadow-sm border">
              <Button
                variant={activeTab === "dashboard" ? "default" : "ghost"}
                onClick={() => setActiveTab("dashboard")}
                className="flex-1 sm:flex-none"
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              
              {userType === "superadmin" && (
                <Button
                  variant={activeTab === "inventory" ? "default" : "ghost"}
                  onClick={() => setActiveTab("inventory")}
                  className="flex-1 sm:flex-none"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Inventory
                </Button>
              )}

              <Button
                variant={activeTab === "stock" ? "default" : "ghost"}
                onClick={() => setActiveTab("stock")}
                className="flex-1 sm:flex-none"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Stock Management
              </Button>

              {/* Only show Insights for Super Admin */}
              {userType === "superadmin" && (
                <Button
                  variant={activeTab === "insights" ? "default" : "ghost"}
                  onClick={() => setActiveTab("insights")}
                  className="flex-1 sm:flex-none"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Insights
                </Button>
              )}

              {userType === "superadmin" && (
                <Button
                  variant={activeTab === "specials" ? "default" : "ghost"}
                  onClick={() => setActiveTab("specials")}
                  className="flex-1 sm:flex-none"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Today's Specials
                </Button>
              )}

              {userType === "superadmin" && (
                <Button
                  variant={activeTab === "feedback" ? "default" : "ghost"}
                  onClick={() => setActiveTab("feedback")}
                  className="flex-1 sm:flex-none"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Feedback
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === "insights" && userType === "superadmin" ? (
          <StockInsightsDashboard userType={userType} />
        ) : activeTab === "inventory" && userType === "superadmin" ? (
          <InventoryManagement userType={userType} />
        ) : activeTab === "stock" ? (
          <StockPurchaseManagement userType={userType} currentUser={currentUser} />
        ) : activeTab === "feedback" && userType === "superadmin" ? (
          <FeedbackManagement userType={userType} />
        ) : (
          <>
            {/* Existing dashboard content - Stats Cards, Orders, etc. */}
            {/* Stats Cards - Only for Super Admin */}
            {userType === "superadmin" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-8">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600 mb-1">Orders Today</p>
                        <p className="text-2xl font-bold text-gray-900">{totalOrdersToday}</p>
                      </div>
                      <ShoppingBag className="h-6 w-6 text-amber-600 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600 mb-1">Daily Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">₹{totalRevenueToday.toFixed(2)}</p>
                      </div>
                      <DollarSign className="h-6 w-6 text-green-600 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600 mb-1">Monthly Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">₹{totalMonthlyRevenue.toFixed(2)}</p>
                      </div>
                      <DollarSign className="h-6 w-6 text-blue-600 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600 mb-1">Pending Orders</p>
                        <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
                      </div>
                      <Clock className="h-6 w-6 text-yellow-600 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600 mb-1">Unpaid Orders</p>
                        <p className="text-2xl font-bold text-gray-900">{unpaidOrders}</p>
                      </div>
                      <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600 mb-1">Unpaid Amount</p>
                        <p className="text-2xl font-bold text-red-600">₹{unpaidAmount.toFixed(2)}</p>
                      </div>
                      <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600 mb-1">Fast Moving Items</p>
                        <p className="text-2xl font-bold text-purple-600">{fastMovingProduct[1]}</p>
                        <p className="text-xs text-gray-500 mt-1">Total Sold</p>
                      </div>
                      <TrendingUp className="h-6 w-6 text-purple-600 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600 mb-1">Completed Orders</p>
                        <p className="text-2xl font-bold text-gray-900">{completedOrders}</p>
                      </div>
                      <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Super Admin Only Section */}
            {userType === "superadmin" && (
              <Card className="mb-8 border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-purple-700">
                    <AlertCircle className="h-5 w-5" />
                    <span>Super Admin Tools</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => {
                        localStorage.clear()
                        toast({
                          title: "Data Cleared",
                          description: "All application data has been reset.",
                        })
                        window.location.reload()
                      }}
                    >
                      🗑️ Clear All Data
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-purple-300 text-purple-700 hover:bg-purple-100"
                      onClick={() => {
                        const backupData = {
                          orders: JSON.parse(localStorage.getItem("cafeOrders") || "[]"),
                          specials: JSON.parse(localStorage.getItem("todaysSpecials") || "[]"),
                          feedback: JSON.parse(localStorage.getItem("cafeFeedback") || "[]"),
                          timestamp: new Date().toISOString()
                        }
                        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `cafe-backup-${new Date().toISOString().split('T')[0]}.json`
                        a.click()
                        toast({
                          title: "Backup Created",
                          description: "Full system backup downloaded.",
                        })
                      }}
                    >
                      💾 Backup Data
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-purple-300 text-purple-700 hover:bg-purple-100"
                      onClick={() => {
                        const stats = {
                          totalOrders: orders.length,
                          totalRevenue: orders.reduce((sum, order) => sum + parseFloat(order.total), 0),
                          activeSpecials: todaysSpecials.length,
                          systemHealth: "Operational"
                        }
                        alert(`System Stats:\n${JSON.stringify(stats, null, 2)}`)
                      }}
                    >
                      📊 System Stats
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Orders Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingBag className="h-5 w-5" />
                  <span>Orders Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orders?.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No orders found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders?.map((order) => (
                      <div key={order?.id} className="border rounded-lg p-4 bg-white shadow-sm">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="font-semibold text-lg">Order #{order?.id?.slice(-6) || "N/A"}</h3>
                              <p className="text-sm text-gray-600">{order?.customerName || "Unknown Customer"}</p>
                              {order?.phoneNumber && <p className="text-sm text-gray-600">📞 {order.phoneNumber}</p>}
                              <p className="text-sm text-gray-500">{order?.date || "No date"}</p>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <Badge className={`${getStatusColor(order?.status || "")} border`}>
                              {order?.status || "Unknown"}
                            </Badge>
                            <span className="text-lg font-bold text-amber-600">₹{order?.total || "0.00"}</span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Items:</h4>
                          <div className="space-y-2">
                            {order?.items?.map((item, index) => (
                              <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                                <div>
                                  <span className="font-medium">{item?.name || "Unknown Item"}</span>
                                  <span className="text-gray-600 ml-2">x{item?.quantity || 0}</span>
                                  {item?.specialInstructions && (
                                    <div className="text-xs text-blue-600 mt-1">Note: {item.specialInstructions}</div>
                                  )}
                                </div>
                                <span className="font-medium">₹{item?.subtotal || "0.00"}</span>
                              </div>
                            )) || <p className="text-gray-500">No items</p>}
                          </div>
                        </div>

                        {/* Special Instructions */}
                        {order?.generalInstructions && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-800 mb-1">Special Instructions:</h4>
                            <p className="text-sm text-blue-700">{order.generalInstructions}</p>
                          </div>
                        )}

                        {/* Status and Payment Controls */}
                        <div className="flex flex-col sm:flex-row gap-4">
                          {/* Status Buttons */}
                          <div className="flex-1">
                            <Label className="text-sm font-medium mb-2 block">Order Status:</Label>
                            <div className="flex flex-wrap gap-2">
                              {["Pending", "Preparing", "Ready", "Completed", "Cancelled"].map((status) => (
                                <Button
                                  key={status}
                                  variant={order?.status?.toLowerCase() === status.toLowerCase() ? "default" : "outline"}
                                  size="sm"
                                  className={`flex items-center space-x-1 ${
                                    order?.status?.toLowerCase() === status.toLowerCase()
                                      ? "bg-amber-600 hover:bg-amber-700 text-white"
                                      : "hover:bg-amber-50"
                                  }`}
                                  onClick={() => updateOrderStatus(order?.id || "", status)}
                                >
                                  {getStatusIcon(status)}
                                  <span>{status}</span>
                                </Button>
                              ))}
                            </div>
                          </div>

                          {/* Payment Status Buttons */}
                          <div className="flex-1">
                            <Label className="text-sm font-medium mb-2 block">Payment Status:</Label>
                            <div className="flex flex-wrap gap-2">
                              {[
                                { status: "unpaid", label: "Unpaid" },
                                { status: "paid cash", label: "Paid Cash" },
                                { status: "paid upi", label: "Paid UPI" }
                              ].map(({ status, label }) => (
                                <Button
                                  key={status}
                                  variant={order?.paymentStatus?.toLowerCase() === status.toLowerCase() ? "default" : "outline"}
                                  size="sm"
                                  className={`flex items-center space-x-1 ${
                                    order?.paymentStatus?.toLowerCase() === status.toLowerCase()
                                      ? (() => {
                                          switch (status.toLowerCase()) {
                                            case "unpaid":
                                              return "bg-red-600 hover:bg-red-700 text-white"
                                            case "paid cash":
                                              return "bg-green-600 hover:bg-green-700 text-white"
                                            case "paid upi":
                                              return "bg-blue-600 hover:bg-blue-700 text-white"
                                            default:
                                              return "bg-gray-600 hover:bg-gray-700 text-white"
                                          }
                                        })()
                                      : (() => {
                                          switch (status.toLowerCase()) {
                                            case "unpaid":
                                              return "hover:bg-red-50 border-red-200"
                                            case "paid cash":
                                              return "hover:bg-green-50 border-green-200"
                                            case "paid upi":
                                              return "hover:bg-blue-50 border-blue-200"
                                            default:
                                              return "hover:bg-gray-50 border-gray-200"
                                          }
                                        })()
                                  }`}
                                  onClick={() => updatePaymentStatus(order?.id || "", status)}
                                >
                                  {getPaymentStatusIcon(status)}
                                  <span>{label}</span>
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )) || <p className="text-gray-500">No orders to display</p>}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Today's Specials Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center space-x-2">
                    <Coffee className="h-5 w-5" />
                    <span>Today's Specials</span>
                  </CardTitle>
                  <Button onClick={() => setShowAddSpecial(true)} className="bg-amber-600 hover:bg-amber-700">
                    Add Special
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {todaysSpecials?.length === 0 ? (
                  <div className="text-center py-8">
                    <Coffee className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No specials added for today</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {todaysSpecials?.map((special) => (
                      <div key={special?.id} className="border rounded-lg p-4 bg-white shadow-sm">
                        <img
                          src={special?.image || "/placeholder.svg"}
                          alt={special?.name || "Special"}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <h3 className="font-semibold text-lg mb-1">{special?.name || "Unknown Special"}</h3>
                        <p className="text-sm text-gray-600 mb-2">{special?.description || "No description"}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-amber-600">₹{special?.price || 0}</span>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{special?.category || "Unknown"}</Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeSpecial(special?.id || 0)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    )) || <p className="text-gray-500">No specials to display</p>}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add Special Modal */}
            <Dialog open={showAddSpecial} onOpenChange={setShowAddSpecial}>
              <DialogContent aria-describedby="add-special-description">
                <DialogHeader>
                  <DialogTitle>Add Today's Special</DialogTitle>
                </DialogHeader>
                <div id="add-special-description" className="sr-only">
                  Add a new special item to today's menu by selecting an existing item or creating a new one.
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="existingItem">Select Existing Item (Optional)</Label>
                    <Select
                      value={selectedExistingItem || "create-new"}
                      onValueChange={handleExistingItemSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose from existing menu items" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="create-new">Create New Item</SelectItem>
                        {existingMenuItems.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name} - ₹{item.price} ({item.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="specialName">Name</Label>
                    <Input
                      id="specialName"
                      value={newSpecial.name}
                      onChange={(e) => setNewSpecial({ ...newSpecial, name: e.target.value })}
                      placeholder="Special item name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialPrice">Price</Label>
                    <Input
                      id="specialPrice"
                      type="number"
                      value={newSpecial.price}
                      onChange={(e) => setNewSpecial({ ...newSpecial, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialCategory">Category</Label>
                    <Select
                      value={newSpecial.category}
                      onValueChange={(value) => setNewSpecial({ ...newSpecial, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tea">Tea</SelectItem>
                        <SelectItem value="Coffee">Coffee</SelectItem>
                        <SelectItem value="Juice">Juice</SelectItem>
                        <SelectItem value="Shakes">Shakes</SelectItem>
                        <SelectItem value="Ice Cream">Ice Cream</SelectItem>
                        <SelectItem value="Food">Food</SelectItem>
                        <SelectItem value="Snacks">Snacks</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="specialDescription">Description</Label>
                    <Textarea
                      id="specialDescription"
                      value={newSpecial.description}
                      onChange={(e) => setNewSpecial({ ...newSpecial, description: e.target.value })}
                      placeholder="Describe the special item"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAddSpecial(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addTodaysSpecial} className="bg-amber-600 hover:bg-amber-700">
                      Add Special
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  )
}
