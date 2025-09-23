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
  const broadcastTimeoutRef = useRef<NodeJS.Timeout>()

  const elementsKey = `whiteboard_elements_${pollId}`
  const participantsKey = `whiteboard_participants_${pollId}`
  const heartbeatKey = `whiteboard_heartbeat_${pollId}_${participantId}`

  const throttledBroadcast = useCallback(
    (elementsToSave: WhiteboardElement[]) => {
      const currentTime = Date.now()
      if (currentTime - lastBroadcastRef.current < 100) {
        // Throttle to max 10 updates per second
        return
      }

      try {
        localStorage.setItem(elementsKey, JSON.stringify(elementsToSave))
        lastBroadcastRef.current = currentTime
        console.log("[v0] Broadcasted elements:", elementsToSave.length)
      } catch (error) {
        console.error("[v0] Error broadcasting elements:", error)
      }
    },
    [elementsKey],
  )

  const broadcastElement = useCallback(
    (element: WhiteboardElement) => {
      const enhancedElement = {
        ...element,
        participantId,
        participantName,
        timestamp: Date.now(),
      }

      console.log("[v0] Broadcasting new element:", enhancedElement.id)

      setElements((currentElements) => {
        const updatedElements = [...currentElements, enhancedElement]

        // Broadcast the updated elements
        if (broadcastTimeoutRef.current) {
          clearTimeout(broadcastTimeoutRef.current)
        }

        broadcastTimeoutRef.current = setTimeout(() => {
          throttledBroadcast(updatedElements)
        }, 50)

        return updatedElements
      })
    },
    [participantId, participantName, throttledBroadcast],
  )

  const broadcastElements = useCallback(
    (newElements: WhiteboardElement[]) => {
      const enhancedElements = newElements.map((element) => ({
        ...element,
        participantId: element.participantId || participantId,
        participantName: element.participantName || participantName,
        timestamp: element.timestamp || Date.now(),
      }))

      console.log("[v0] Broadcasting bulk elements:", enhancedElements.length)

      setElements(enhancedElements)

      // Immediate broadcast for bulk updates
      throttledBroadcast(enhancedElements)
    },
    [participantId, participantName, throttledBroadcast],
  )

  const syncElements = useCallback(() => {
    try {
      const storedElements = localStorage.getItem(elementsKey)
      if (!storedElements) return

      const parsedElements = JSON.parse(storedElements) as WhiteboardElement[]

      setElements((currentElements) => {
        const currentElementsStr = JSON.stringify(currentElements.sort((a, b) => a.id.localeCompare(b.id)))
        const newElementsStr = JSON.stringify(parsedElements.sort((a, b) => a.id.localeCompare(b.id)))

        if (currentElementsStr !== newElementsStr) {
          console.log("[v0] Syncing elements:", parsedElements.length, "total")
          return parsedElements
        }

        return currentElements
      })
    } catch (error) {
      console.error("[v0] Error syncing elements:", error)
    }
  }, [elementsKey])

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
      setConnectedParticipants((currentParticipants) => {
        const currentSorted = currentParticipants.sort().join(",")
        const newSorted = activeParticipants.sort().join(",")

        if (currentSorted !== newSorted) {
          console.log("[v0] Participant list updated:", activeParticipants.length, "active")
          return activeParticipants
        }

        return currentParticipants
      })

      setIsConnected(true)
    } catch (error) {
      console.error("[v0] Error updating heartbeat:", error)
      setIsConnected(false)
    }
  }, [pollId, participantId, heartbeatKey])

  useEffect(() => {
    console.log("[v0] Initializing real-time whiteboard for poll:", pollId)

    // Initial sync
    syncElements()
    updateHeartbeat()

    // Set up polling intervals
    const syncInterval = setInterval(syncElements, 1000) // Sync every second
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
          const newElements = JSON.parse(e.newValue) as WhiteboardElement[]

          setElements((currentElements) => {
            const currentElementsStr = JSON.stringify(currentElements.sort((a, b) => a.id.localeCompare(b.id)))
            const newElementsStr = JSON.stringify(newElements.sort((a, b) => a.id.localeCompare(b.id)))

            if (currentElementsStr !== newElementsStr) {
              console.log("[v0] Received storage update:", newElements.length, "elements")
              return newElements
            }

            return currentElements
          })
        } catch (error) {
          console.error("[v0] Error parsing storage update:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [elementsKey])

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
