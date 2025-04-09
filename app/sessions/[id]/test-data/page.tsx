"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export default function TestDataPage({ params }: { params: { id: string } }) {
  const [count, setCount] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const generateTestData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/test/generate-responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: params.id,
          count,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate test data")
      }

      toast({
        title: "Success",
        description: data.message,
      })

      // Refresh the page data
      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate test data",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Generate Test Data</h1>
      <Card>
        <CardHeader>
          <CardTitle>Test Response Generator</CardTitle>
          <CardDescription>Generate random test responses for your session to test analytics.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="count">Number of responses to generate</Label>
              <Input
                id="count"
                type="number"
                value={count}
                onChange={(e) => setCount(Number.parseInt(e.target.value) || 10)}
                min={1}
                max={100}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push(`/sessions/${params.id}/analytics`)}>
            Cancel
          </Button>
          <Button onClick={generateTestData} disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate Test Data"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
