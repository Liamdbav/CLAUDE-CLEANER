import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatBytes } from '@/lib/format-bytes'
import type { DeleteResult } from '@/types'

interface SuccessDialogProps {
  open: boolean
  results: DeleteResult[]
  onClose: () => void
}

export function SuccessDialog({ open, results, onClose }: SuccessDialogProps) {
  const totalFreed = results.reduce((sum, r) => sum + r.freedBytes, 0)
  const successResults = results.filter((r) => !r.error && r.freedBytes > 0)
  const nothingCleaned = totalFreed === 0

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            {nothingCleaned ? (
              <div style={{ width: 56, height: 56 }}>
                <svg viewBox="0 0 52 52" width="56" height="56" xmlns="http://www.w3.org/2000/svg"
                  style={{ animation: 'checkmark-scale 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }}>
                  <circle cx="26" cy="26" r="25" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
                  <text x="26" y="33" textAnchor="middle" fontSize="20" fill="#64748b">✓</text>
                </svg>
              </div>
            ) : (
              <div className="checkmark-circle">
                <svg className="checkmark-svg" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
                  <circle className="checkmark-bg" cx="26" cy="26" r="25" fill="none" />
                  <path className="checkmark-check" fill="none" d="M14 27 l8 8 l16 -16" />
                </svg>
              </div>
            )}
          </div>

          <DialogTitle className="text-xl">
            {nothingCleaned ? 'Déjà propre' : 'Nettoyage terminé'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {nothingCleaned ? (
            <p className="text-muted-foreground text-sm">
              Rien à nettoyer — votre installation est déjà propre.
            </p>
          ) : (
            <>
              <p className="text-muted-foreground text-sm">
                <span className="text-2xl font-bold text-foreground block">
                  {formatBytes(totalFreed)}
                </span>
                libérés sur votre machine
              </p>

              {successResults.length > 1 && (
                <ul className="divide-y divide-border rounded-md border text-left">
                  {successResults.map((r) => (
                    <li key={r.id} className="flex items-center justify-between px-3 py-2 text-sm">
                      <span className="text-foreground capitalize">{r.id.replace(/-/g, ' ')}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {formatBytes(r.freedBytes)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        <DialogFooter className="justify-center">
          <Button onClick={onClose}>Fermer</Button>
        </DialogFooter>

        <style>{`
          .checkmark-circle { width: 56px; height: 56px; }
          .checkmark-svg {
            width: 56px; height: 56px;
            animation: checkmark-scale 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
          .checkmark-bg {
            stroke: #22c55e; stroke-width: 2;
            animation: checkmark-fill 0.3s ease-in-out forwards;
          }
          .checkmark-check {
            stroke: #22c55e; stroke-width: 3;
            stroke-linecap: round; stroke-linejoin: round;
            stroke-dasharray: 36; stroke-dashoffset: 36;
            animation: checkmark-draw 0.35s ease-in-out 0.25s forwards;
          }
          @keyframes checkmark-scale {
            0% { transform: scale(0); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes checkmark-fill {
            0% { fill: transparent; }
            100% { fill: #dcfce7; }
          }
          @keyframes checkmark-draw { to { stroke-dashoffset: 0; } }
        `}</style>
      </DialogContent>
    </Dialog>
  )
}
