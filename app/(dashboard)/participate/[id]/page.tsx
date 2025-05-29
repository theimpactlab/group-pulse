"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { api } from "@/convex/_generated/api"
import { useMutation, useQuery } from "convex/react"
import { Skeleton } from "@/components/ui/skeleton"
import { PointsAllocationParticipant } from "@/components/poll-participants/points-allocation-participant"

const ParticipatePage = ({ params }: { params: { id: string } }) => {
  const router = useRouter()
  const { toast } = useToast()
  const poll = useQuery(api.polls.getPoll, { id: params.id })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitResponse = useMutation(api.responses.createResponse)

  const SimpleChoiceSchema = z.object({
    choice: z.string().min(1, {
      message: "Please select a choice.",
    }),
  })

  const RankingSchema = z.object({
    ranking: z.array(z.string()).refine((data) => data.length > 0, {
      message: "You must rank all options.",
    }),
  })

  const MultipleChoiceSchema = z.object({
    choices: z.array(z.string()).refine((data) => data.length > 0, {
      message: "You must select at least one option.",
    }),
  })

  const FreeTextSchema = z.object({
    text: z.string().min(1, {
      message: "Please enter a response.",
    }),
  })

  const formSimpleChoice = useForm<z.infer<typeof SimpleChoiceSchema>>({
    resolver: zodResolver(SimpleChoiceSchema),
    defaultValues: {
      choice: "",
    },
  })

  const formRanking = useForm<z.infer<typeof RankingSchema>>({
    resolver: zodResolver(RankingSchema),
    defaultValues: {
      ranking: [],
    },
  })

  const formMultipleChoice = useForm<z.infer<typeof MultipleChoiceSchema>>({
    resolver: zodResolver(MultipleChoiceSchema),
    defaultValues: {
      choices: [],
    },
  })

  const formFreeText = useForm<z.infer<typeof FreeTextSchema>>({
    resolver: zodResolver(FreeTextSchema),
    defaultValues: {
      text: "",
    },
  })

  const handleSubmitResponse = async (data: any) => {
    setIsSubmitting(true)
    try {
      await submitResponse({
        pollId: params.id,
        data: data,
      })
      toast({
        title: "Response submitted",
        description: "Your response has been recorded.",
      })
      router.push("/(dashboard)")
    } catch (error) {
      toast({
        title: "Error submitting response",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderPoll = () => {
    if (!poll) {
      return <div>Loading...</div>
    }

    switch (poll.type) {
      case "simple-choice":
        return (
          <Form {...formSimpleChoice}>
            <form onSubmit={formSimpleChoice.handleSubmit(handleSubmitResponse)} className="space-y-4">
              <FormField
                control={formSimpleChoice.control}
                name="choice"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Select an option</FormLabel>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value}>
                      <div className="flex flex-col space-y-2">
                        {poll.data.options.map((option: string) => (
                          <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value={option} id={option} />
                            </FormControl>
                            <FormLabel htmlFor={option}>{option}</FormLabel>
                          </FormItem>
                        ))}
                      </div>
                    </RadioGroup>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                Submit
              </Button>
            </form>
          </Form>
        )
      case "ranking":
        return (
          <Form {...formRanking}>
            <form onSubmit={formRanking.handleSubmit(handleSubmitResponse)} className="space-y-4">
              <FormField
                control={formRanking.control}
                name="ranking"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Rank the options</FormLabel>
                    {poll.data.options.map((option: string, index: number) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Label htmlFor={`ranking-${index}`}>{index + 1}.</Label>
                        <Select
                          onValueChange={(value) => {
                            const newRanking = [...field.value]
                            newRanking[index] = value
                            field.onChange(newRanking)
                          }}
                        >
                          <SelectTrigger id={`ranking-${index}`}>
                            <SelectValue placeholder="Select" defaultValue={field.value[index]} />
                          </SelectTrigger>
                          <SelectContent>
                            {poll.data.options.map((option: string) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                Submit
              </Button>
            </form>
          </Form>
        )
      case "multiple-choice":
        return (
          <Form {...formMultipleChoice}>
            <form onSubmit={formMultipleChoice.handleSubmit(handleSubmitResponse)} className="space-y-4">
              <FormField
                control={formMultipleChoice.control}
                name="choices"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Select the options</FormLabel>
                    {poll.data.options.map((option: string) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={option}
                          checked={field.value.includes(option)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, option])
                            } else {
                              field.onChange(field.value.filter((val) => val !== option))
                            }
                          }}
                        />
                        <Label htmlFor={option}>{option}</Label>
                      </div>
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                Submit
              </Button>
            </form>
          </Form>
        )
      case "free-text":
        return (
          <Form {...formFreeText}>
            <form onSubmit={formFreeText.handleSubmit(handleSubmitResponse)} className="space-y-4">
              <FormField
                control={formFreeText.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter your response</FormLabel>
                    <FormControl>
                      <Input placeholder="Type your response here." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                Submit
              </Button>
            </form>
          </Form>
        )
      case "points-allocation":
        return <PointsAllocationParticipant poll={poll} onSubmit={handleSubmitResponse} disabled={isSubmitting} />
      default:
        return <div>Unknown poll type</div>
    }
  }

  if (!poll) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-80" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-50" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="space-y-2">
                <h2 className="text-sm font-medium">Description</h2>
                <Skeleton className="h-4 w-[400px]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>{poll.title}</CardTitle>
          <CardDescription>{poll.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="space-y-2">
              <h2 className="text-sm font-medium">Overview</h2>
              <p className="text-muted-foreground">
                This is a {poll.type} poll.{" "}
                {poll.type === "simple-choice" &&
                  `Choose one of the following options: ${poll.data.options.join(", ")}`}
                {poll.type === "ranking" && `Rank the following options: ${poll.data.options.join(", ")}`}
                {poll.type === "multiple-choice" &&
                  `Select multiple options from the following: ${poll.data.options.join(", ")}`}
                {poll.type === "free-text" && `Enter your response in the text box.`}
                {poll.type === "points-allocation" && `100 Points: ${poll.data.question}`}
              </p>
            </div>
            {renderPoll()}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the poll and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    try {
                      // await api.polls.deletePoll({ id: params.id }) // TODO: Fix this
                      toast({
                        title: "Poll deleted",
                        description: "The poll has been deleted.",
                      })
                      router.push("/(dashboard)")
                    } catch (error) {
                      toast({
                        title: "Error deleting poll",
                        description: "Please try again.",
                        variant: "destructive",
                      })
                    }
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={() => router.push(`/(dashboard)/polls/${params.id}/results`)}>View Results</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default ParticipatePage
