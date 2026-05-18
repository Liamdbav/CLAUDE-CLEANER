import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatBytes } from '@/lib/format-bytes'
import type { CleanupItem } from '@/types'

interface ConfirmDialogProps {
  open: boolean
  items: CleanupItem[]
  totalBytes: number
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, items, totalBytes, onConfirm, onCancel }: ConfirmDialogProps) {
  const highRiskItems = items.filter((item) => item.risk === 'high')

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmer le nettoyage</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Liste des items */}
          <ul className="divide-y divide-border rounded-md border">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between px-3 py-2 text-sm">
                <span className="text-foreground">{item.label}</span>
                <span className="text-muted-foreground tabular-nums">
                  {item.sizeBytes > 0 ? formatBytes(item.sizeBytes) : '—'}
                </span>
              </li>
            ))}
          </ul>

          {/* Total */}
          <p className="text-sm text-center">
            <span className="font-bold text-foreground">{formatBytes(totalBytes)}</span>
            {' '}seront libérés
          </p>

          {/* Avertissements risque élevé */}
          {highRiskItems.length > 0 && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 space-y-1">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span className="text-sm font-semibold">Attention — risque élevé</span>
              </div>
              {highRiskItems.map((item) => (
                <p key={item.id} className="text-xs text-red-600 pl-6">
                  {item.risks}
                </p>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Nettoyer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
