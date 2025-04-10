import { LockIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"

interface LockedFeatureProps {
  featureName: string
  description?: string
}

export function LockedFeature({ featureName, description }: LockedFeatureProps) {
  return (
    <div className="relative">
      <div className="border rounded-md p-4 bg-gray-50 opacity-75">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-muted-foreground">{featureName}</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                  <LockIcon className="h-3 w-3 mr-1" />
                  Enterprise
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Available with Enterprise plan</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        <div className="mt-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/settings/subscription">Upgrade to Enterprise</Link>
          </Button>
        </div>
      </div>
      <div className="absolute inset-0 bg-gray-100/50 backdrop-blur-[1px] flex items-center justify-center">
        <div className="bg-white/90 p-3 rounded-full shadow-lg">
          <LockIcon className="h-6 w-6 text-amber-500" />
        </div>
      </div>
    </div>
  )
}
