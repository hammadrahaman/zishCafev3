"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ShoppingCart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CartItem {
  cartId: string
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  specialInstructions?: string
}

interface OrderModalProps {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  clearCart: () => void
}

export function OrderModal({ isOpen, onClose, cart, clearCart }: OrderModalProps) {
  const [customerName, setCustomerName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [generalInstructions, setGeneralInstructions] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("Form submitted")
    console.log("Cart:", cart)
    console.log("Customer name:", customerName)

    if (!customerName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your full name to place the order.",
        variant: "destructive",
      })
      return
    }

    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before placing an order.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const order = {
        id: Date.now().toString(),
        items: cart.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions || "",
          subtotal: (item.price * item.quantity).toFixed(2),
        })),
        total: getTotalPrice().toFixed(2),
        customerName: customerName.trim(),
        phoneNumber: phoneNumber.trim(),
        generalInstructions: generalInstructions.trim(),
        status: "pending",
        paymentStatus: "unpaid",
        date: new Date().toDateString(),
        timestamp: new Date().toISOString(),
      }

      console.log("Order to save:", order)

      // Save to localStorage
      const existingOrders = JSON.parse(localStorage.getItem("cafeOrders") || "[]")
      existingOrders.push(order)
      localStorage.setItem("cafeOrders", JSON.stringify(existingOrders))

      console.log("Order saved successfully")

      toast({
        title: "Order Placed Successfully!",
        description: `Your order for ${getTotalItems()} item${getTotalItems() !== 1 ? "s" : ""} has been placed. Order ID: #${order.id.slice(-6)}`,
      })

      // Reset form and clear cart
      setCustomerName("")
      setPhoneNumber("")
      setGeneralInstructions("")
      clearCart()
      onClose()
    } catch (error) {
      console.error("Error placing order:", error)
      toast({
        title: "Error",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  if (!isOpen) return null

  const total = getTotalPrice()

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-amber-600" />
            Checkout ({getTotalItems()} items)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.cartId} className="flex items-center gap-4 p-3 bg-amber-50 rounded-lg">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{item.name}</h4>
                    <p className="text-sm text-gray-600">
                      ₹{item.price} × {item.quantity}
                    </p>
                    {item.specialInstructions && (
                      <p className="text-xs text-blue-600 mt-1">Note: {item.specialInstructions}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-amber-600">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total:</span>
              <span className="text-amber-600">₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Customer Information Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="customerName">Full Name *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your full name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="123-456-7890"
                type="tel"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="generalInstructions">General Instructions (Optional)</Label>
              <Textarea
                id="generalInstructions"
                value={generalInstructions}
                onChange={(e) => setGeneralInstructions(e.target.value)}
                placeholder="Any general requests or dietary requirements for your entire order..."
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 bg-transparent"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700" disabled={isSubmitting}>
                {isSubmitting ? "Placing Order..." : `Place Order - ₹${total.toFixed(2)}`}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
