'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { COPY } from '@/app/prototype/perron/_shared/copy'
import { BOOKINGS_COPY } from '@/app/prototype/perron/bookings/copy'
import type { Booking } from '@/app/prototype/perron/_shared/types'
import { usePerron } from '@/app/prototype/perron/_shared/store'
import { DevNote } from '@/app/prototype/perron/_shared/components/list-parts'

// Functional Spec §7: changing Booking status to Cancelled asks for confirmation and
// reminds the admin to update Available from by hand (BR15, SOP P7). Nothing else changes.

export function CancelBookingDialog({
  booking,
  onKeep,
  onConfirm,
}: {
  booking: Booking | null
  onKeep: () => void
  onConfirm: (b: Booking) => void
}) {
  const { room } = usePerron()
  const roomName = booking ? room(booking.roomId)?.name ?? '' : ''
  const D = BOOKINGS_COPY.cancelDialog

  return (
    <AlertDialog open={!!booking} onOpenChange={(open) => !open && onKeep()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{D.title}</AlertDialogTitle>
          <AlertDialogDescription>{D.body(roomName)}</AlertDialogDescription>
          <AlertDialogDescription>{D.signed}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="items-center">
          <DevNote q="JS" text={COPY.dev.cancelDialog} className="mr-auto" />
          <AlertDialogCancel>{D.keep}</AlertDialogCancel>
          {/* AlertDialogAction has no variant prop; asChild hands styling to Button */}
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={() => booking && onConfirm(booking)}>
              {D.confirm}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
