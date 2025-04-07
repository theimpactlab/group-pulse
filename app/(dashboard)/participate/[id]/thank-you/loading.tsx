import { Skeleton } from "@/components/ui/skeleton"

export default function ThankYouLoading() {
  return (
    <div className="container max-w-lg mx-auto py-10 px-4">
      <div className="flex flex-col items-center justify-center space-y-6 text-center">
        <Skeleton className="h-12 w-48 mb-2" />
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-4 w-3/4 max-w-md" />
        <Skeleton className="h-10 w-32 mt-4" />
      </div>
    </div>
  )
}

