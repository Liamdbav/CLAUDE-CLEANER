import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { formatBytes } from '@/lib/format-bytes'
import type { CleanupItem, RiskLevel } from '@/types'

interface CleanupCardProps {
  item: CleanupItem
  selected: boolean
  onToggle: () => void
  onDelete: () => void
}

const RISK_LABEL: Record<RiskLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

const RISK_BADGE_CLASS: Record<RiskLevel, string> = {
  low: 'bg-gray-100 text-gray-600 border-gray-200',
  medium: 'bg-orange-100 text-orange-700 border-orange-200',
  high: 'bg-red-100 text-red-700 border-red-200',
}

function SizeLabel({ sizeBytes }: { sizeBytes: number }) {
  if (sizeBytes === -1) return <span className="text-muted-foreground text-sm">Non scanné</span>
  if (sizeBytes === 0) return <span className="text-muted-foreground text-sm">Vide</span>
  return <span className="text-sm font-medium">{formatBytes(sizeBytes)}</span>
}

export function CleanupCard({ item, selected, onToggle, onDelete }: CleanupCardProps) {
  const isScanning = item.scanStatus === 'scanning'
  const isDone = item.deleteStatus === 'done'
  const isDeleting = item.deleteStatus === 'deleting'
  const cleanDisabled = item.sizeBytes <= 0 || item.deleteStatus !== 'idle' || isScanning

  return (
    <Card className={selected ? 'border-primary' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Checkbox
              id={`check-${item.id}`}
              checked={selected}
              onCheckedChange={onToggle}
              disabled={isDone}
            />
            <label
              htmlFor={`check-${item.id}`}
              className="font-semibold text-sm leading-tight cursor-pointer select-none"
            >
              {item.label}
            </label>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isDone ? (
              <Badge className="bg-green-100 text-green-700 border-green-200 border">Nettoyé</Badge>
            ) : (
              <Badge className={`border ${RISK_BADGE_CLASS[item.risk]}`} variant="outline">
                {RISK_LABEL[item.risk]}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>

        <div className="space-y-1.5 rounded-md bg-muted/50 px-3 py-2 text-xs">
          <div>
            <span className="font-medium text-foreground">Impact — </span>
            <span className="text-muted-foreground">{item.impact}</span>
          </div>
          <div>
            <span className="font-medium text-foreground">Risques — </span>
            <span className="text-muted-foreground">{item.risks}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {isScanning ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Scan en cours…</span>
              </>
            ) : (
              <SizeLabel sizeBytes={item.sizeBytes} />
            )}
          </div>

          <Button
            size="sm"
            variant={item.risk === 'high' ? 'destructive' : 'default'}
            disabled={cleanDisabled}
            onClick={onDelete}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Nettoyage…
              </>
            ) : (
              'Nettoyer'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
