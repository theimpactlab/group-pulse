"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function ThankYouPage({ params }: { params: { id: string } }) {
  const router = useRouter()

  return (
    <div className="container mx-auto py-10 max-w-md">
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Thank You!</CardTitle>
          <CardDescription>Your response has been submitted successfully.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>The presenter may show another poll soon. You can wait on this page.</p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => router.push(`/participate/${params.id}`)}>Return to Session</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
