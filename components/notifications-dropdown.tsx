"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import type { Notification } from "@/types/notification-types"

export function NotificationsDropdown() {
  const { data: session } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if (session?.user?.id && open) {
      fetchNotifications()
    }
  }, [session?.user?.id, open])

  const fetchNotifications = async () => {
    if (!session?.user?.id) return

    setIsLoading(true)
    try {
      // In a real implementation, this would fetch from a notifications table
      // For now, we'll use mock data
      const mockNotifications: Notification[] = [
        {
          id: "1",
          userId: session.user.id,
          type: "session_created",
          title: "New Session Created",
          message: "You've successfully created a new interactive session.",
          link: "/sessions",
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        },
        {
          id: "2",
          userId: session.user.id,
          type: "response_received",
          title: "New Responses",
          message: "You've received 5 new responses to your active session.",
          link: "/sessions/latest",
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        },
        {
          id: "3",
          userId: session.user.id,
          type: "trial_expiring",
          title: "Trial Expiring Soon",
          message: "Your free trial will expire in 3 days. Upgrade now to continue using all features.",
          link: "/settings/subscription",
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        },
      ]

      setNotifications(mockNotifications)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    // In a real implementation, this would update the database
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = async () => {
    // In a real implementation, this would update the database
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    setOpen(false)
    if (notification.link) {
      router.push(notification.link)
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-auto py-1 px-2">
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start p-3 cursor-pointer ${!notification.read ? "bg-muted/50" : ""}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between w-full">
                  <span className="font-medium">{notification.title}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                {!notification.read && <div className="w-2 h-2 rounded-full bg-primary absolute top-4 right-3"></div>}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="justify-center text-sm">
          <Link href="/settings/notifications">Manage notifications</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
