import { XIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function NewRotaDialogShell({ children }: { children: ReactNode }) {
  return (
    <DialogContent
      showCloseButton={false}
      overlayClassName="bg-[#101b31]/55 backdrop-blur-[1px]"
      className="top-auto bottom-4 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[34rem] translate-y-0 flex-col gap-0 overflow-hidden rounded-[26px] bg-white p-0 text-[#10285c] shadow-[0_20px_60px_rgba(8,18,38,0.28)] ring-0 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 sm:rounded-[22px] sm:ring-1 sm:ring-[#dfe5f0] data-open:slide-in-from-bottom-6 data-closed:slide-out-to-bottom-6"
    >
      <DialogClose
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-5 right-5 size-9 rounded-full bg-[#f3f5f9] text-[#10285c] hover:bg-[#e9edf4]"
          />
        }
      >
        <XIcon className="size-4" />
        <span className="sr-only">Close</span>
      </DialogClose>
      <DialogHeader className="px-6 pt-8 pb-5 sm:px-7 sm:pt-7">
        <DialogTitle className="text-[26px] leading-none font-bold tracking-[-0.035em] sm:text-2xl">
          New rota
        </DialogTitle>
        <DialogDescription className="mt-1 max-w-[calc(100%-2.5rem)] text-sm leading-5 font-medium text-[#526991]">
          Choose a week, location and how you want to start
        </DialogDescription>
      </DialogHeader>
      {children}
    </DialogContent>
  )
}

export { NewRotaDialogShell }
