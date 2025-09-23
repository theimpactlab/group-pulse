"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface WhiteboardElement {
  id: string
  type: "drawing" | "sticky-note" | "text"
  x: number
  y: number
  width?: number
  height?: number
  content?: string
  color?: string
  strokeWidth?: number
  path?: { x: number; y: number }[]
  participantId?: string
  participantName?: string
  timestamp?: number
}

interface RealtimeWhiteboardHook {
  elements: WhiteboardElement[]
  broadcastElement: (element: WhiteboardElement) => void
  broadcastElements: (elements: WhiteboardElement[]) => void
  connectedParticipants: string[]
  isConnected: boolean
}

export function useRealtimeWhiteboard(
  pollId: string,
  participantId: string,
  participantName: string,
): RealtimeWhiteboardHook {
  const [elements, setElements] = useState<WhiteboardElement[]>([])
  const [connectedParticipants, setConnectedParticipants] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>()
  const lastSyncRef = useRef<number>(0)
  const lastBroadcastRef = useRef<number>(0)
  const pendingElementsRef = useRef<WhiteboardElement[]>([])
  const broadcastTimeoutRef = useRef<NodeJS.Timeout>()

  const elementsKey = `whiteboard_elements_${pollId}`
  const participantsKey = `whiteboard_participants_${pollId}`
  const heartbeatKey = `whiteboard_heartbeat_${pollId}_${participantId}`

  const throttledBroadcast = useCallback(() => {
    if (pendingElementsRef.current.length === 0) return

    const currentTime = Date.now()
    if (currentTime - lastBroadcastRef.current < 100) {
      // Throttle to max 10 updates per second
      return
    }

    try {
      localStorage.setItem(elementsKey, JSON.stringify(pendingElementsRef.current))
      lastBroadcastRef.current = currentTime
      console.log("[v0] Throttled broadcast:", pendingElementsRef.current.length, "elements")
    } catch (error) {
      console.error("[v0] Error broadcasting elements:", error)
    }
  }, [elementsKey])

  const debouncedBroadcast = useCallback(() => {
    if (broadcastTimeoutRef.current) {
      clearTimeout(broadcastTimeoutRef.current)
    }

    broadcastTimeoutRef.current = setTimeout(() => {
      throttledBroadcast()
    }, 50) // 50ms debounce
  }, [throttledBroadcast])

  const broadcastElement = useCallback(
    (element: WhiteboardElement) => {
      const enhancedElement = {
        ...element,
        participantId,
        participantName,
        timestamp: Date.now(),
      }

      // Get existing elements from storage
      const existingElements = JSON.parse(localStorage.getItem(elementsKey) || "[]")
      const updatedElements = [...existingElements, enhancedElement]

      // Update pending elements for throttled broadcast
      pendingElementsRef.current = updatedElements
      setElements(updatedElements)

      // Use debounced broadcast for single elements
      debouncedBroadcast()

      console.log("[v0] Queued element for broadcast:", enhancedElement.id)
    },
    [pollId, participantId, participantName, elementsKey, debouncedBroadcast],
  )

  const broadcastElements = useCallback(
    (newElements: WhiteboardElement[]) => {
      const enhancedElements = newElements.map((element) => ({
        ...element,
        participantId: element.participantId || participantId,
        participantName: element.participantName || participantName,
        timestamp: element.timestamp || Date.now(),
      }))

      pendingElementsRef.current = enhancedElements
      setElements(enhancedElements)

      // Immediate broadcast for bulk updates (like undo/redo)
      throttledBroadcast()

      console.log("[v0] Broadcasted bulk elements:", enhancedElements.length)
    },
    [pollId, participantId, participantName, throttledBroadcast],
  )

  const syncElements = useCallback(() => {
    try {
      const storedElements = localStorage.getItem(elementsKey)
      if (!storedElements) return

      const parsedElements = JSON.parse(storedElements)
      const currentTime = Date.now()

      // Check if there are any new elements since last sync
      const hasNewElements = parsedElements.some((el: WhiteboardElement) => (el.timestamp || 0) > lastSyncRef.current)

      if (hasNewElements) {
        // Only update if elements actually changed
        const currentElementsStr = JSON.stringify(elements)
        const newElementsStr = JSON.stringify(parsedElements)

        if (currentElementsStr !== newElementsStr) {
          setElements(parsedElements)
          pendingElementsRef.current = parsedElements
          lastSyncRef.current = currentTime

          const newCount = parsedElements.filter(
            (el: WhiteboardElement) => (el.timestamp || 0) > lastSyncRef.current - 1000,
          ).length

          if (newCount > 0) {
            console.log("[v0] Synced", newCount, "new elements")
          }
        }
      }
    } catch (error) {
      console.error("[v0] Error syncing elements:", error)
    }
  }, [elementsKey, elements])

  const updateHeartbeat = useCallback(() => {
    const currentTime = Date.now()

    try {
      // Update our heartbeat
      localStorage.setItem(heartbeatKey, currentTime.toString())

      // Get all participants and filter active ones (heartbeat within last 15 seconds)
      const allKeys = Object.keys(localStorage)
      const participantKeys = allKeys.filter(
        (key) => key.startsWith(`whiteboard_heartbeat_${pollId}_`) && key !== heartbeatKey,
      )

      const activeParticipants = participantKeys
        .map((key) => {
          const heartbeat = Number.parseInt(localStorage.getItem(key) || "0")
          const participantId = key.split("_").pop()
          return { participantId, heartbeat, key }
        })
        .filter((p) => {
          const isActive = currentTime - p.heartbeat < 15000 // 15 seconds timeout
          // Clean up stale heartbeats
          if (!isActive) {
            localStorage.removeItem(p.key)
          }
          return isActive
        })
        .map((p) => p.participantId)
        .filter(Boolean) as string[]

      // Add ourselves to the list
      activeParticipants.push(participantId)

      // Only update if participant list changed
      if (JSON.stringify(activeParticipants.sort()) !== JSON.stringify(connectedParticipants.sort())) {
        setConnectedParticipants(activeParticipants)
        console.log("[v0] Participant list updated:", activeParticipants.length, "active")
      }

      setIsConnected(true)
    } catch (error) {
      console.error("[v0] Error updating heartbeat:", error)
      setIsConnected(false)
    }
  }, [pollId, participantId, heartbeatKey, connectedParticipants])

  useEffect(() => {
    console.log("[v0] Initializing optimized real-time whiteboard for poll:", pollId)

    // Initial sync
    syncElements()
    updateHeartbeat()

    // Set up optimized polling intervals
    const syncInterval = setInterval(syncElements, 500) // Sync every 500ms for responsiveness
    const heartbeatInterval = setInterval(updateHeartbeat, 3000) // Heartbeat every 3 seconds

    // Store intervals for cleanup
    intervalRef.current = syncInterval

    // Cleanup on unmount
    return () => {
      clearInterval(syncInterval)
      clearInterval(heartbeatInterval)

      if (broadcastTimeoutRef.current) {
        clearTimeout(broadcastTimeoutRef.current)
      }

      // Remove our heartbeat
      try {
        localStorage.removeItem(heartbeatKey)
      } catch (error) {
        console.error("[v0] Error cleaning up heartbeat:", error)
      }
    }
  }, [pollId, syncElements, updateHeartbeat, heartbeatKey])

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === elementsKey && e.newValue) {
        try {
          const newElements = JSON.parse(e.newValue)

          // Only update if elements actually changed
          const currentElementsStr = JSON.stringify(elements)
          const newElementsStr = e.newValue

          if (currentElementsStr !== newElementsStr) {
            setElements(newElements)
            pendingElementsRef.current = newElements
            console.log("[v0] Received optimized storage update:", newElements.length, "elements")
          }
        } catch (error) {
          console.error("[v0] Error parsing storage update:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [elementsKey, elements])

  useEffect(() => {
    return () => {
      if (broadcastTimeoutRef.current) {
        clearTimeout(broadcastTimeoutRef.current)
      }
    }
  }, [])

  return {
    elements,
    broadcastElement,
    broadcastElements,
    connectedParticipants,
    isConnected,
  }
}
