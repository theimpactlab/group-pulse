"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface SimpleTestProps {
  onSubmit: (data: any) => void
}

export function SimpleTestComponent({ onSubmit }: SimpleTestProps) {
  const [value1, setValue1] = useState(0)
  const [value2, setValue2] = useState(0)

  console.log("SimpleTestComponent rendering, values:", value1, value2)

  const handleSubmit = () => {
    console.log("Submitting test values:", { value1, value2 })
    onSubmit({ test: { value1, value2 } })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Simple Test Component</h2>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <label>Option 1:</label>
          <Input
            type="number"
            value={value1}
            onChange={(e) => {
              console.log("Input 1 changed to:", e.target.value)
              setValue1(Number(e.target.value) || 0)
            }}
            className="w-24"
          />
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <label>Option 2:</label>
          <Input
            type="number"
            value={value2}
            onChange={(e) => {
              console.log("Input 2 changed to:", e.target.value)
              setValue2(Number(e.target.value) || 0)
            }}
            className="w-24"
          />
        </div>
      </Card>

      <Button onClick={handleSubmit} className="w-full">
        Submit Test
      </Button>
    </div>
  )
}
