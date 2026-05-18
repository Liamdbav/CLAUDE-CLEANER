import { useCallback, useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { CleanupCard } from '@/components/CleanupCard'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { SuccessDialog } from '@/components/SuccessDialog'
import { getCleanupItems } from '@/lib/cleanup-items'
import { formatBytes } from '@/lib/format-bytes'
import type { CleanupItem, DeleteResult } from '@/types'

export default function App() {
  const [items, setItems] = useState<CleanupItem[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isScanning, setIsScanning] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [deleteResults, setDeleteResults] = useState<DeleteResult[]>([])

  // --- Init ---

  useEffect(() => {
    invoke<string>('get_home_dir')
      .then((homeDir) => setItems(getCleanupItems(homeDir)))
      .catch(console.error)
  }, [])

  // --- Helpers ---

  const updateItem = useCallback((id: string, patch: Partial<CleanupItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    )
  }, [])

  // --- Scan ---

  const handleScanAll = useCallback(async () => {
    if (isScanning) return
    setIsScanning(true)

    // Marquer tous en scanning
    setItems((prev) =>
      prev.map((item) => ({ ...item, scanStatus: 'scanning' as const }))
    )

    await Promise.all(
      items.map(async (item) => {
        try {
          const sizeBytes = await invoke<number>('scan_item', {
            id: item.id,
            path: item.path,
          })
          updateItem(item.id, { sizeBytes, scanStatus: 'ready' })
        } catch {
          updateItem(item.id, { scanStatus: 'error' })
        }
      })
    )

    setIsScanning(false)
  }, [isScanning, items, updateItem])

  // --- Sélection ---

  const handleToggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const selectableIds = items
    .filter((item) => item.deleteStatus !== 'done')
    .map((item) => item.id)

  const allSelected =
    selectableIds.length > 0 && selectableIds.every((id) => selected.has(id))

  const handleToggleAll = useCallback(() => {
    setSelected(allSelected ? new Set() : new Set(selectableIds))
  }, [allSelected, selectableIds])

  // --- Suppression ---

  const selectedItems = items.filter((item) => selected.has(item.id))
  const totalSelectedBytes = selectedItems.reduce(
    (sum, item) => sum + Math.max(item.sizeBytes, 0),
    0
  )

  const handleConfirm = useCallback(async () => {
    setConfirmOpen(false)
    const results: DeleteResult[] = []

    for (const item of selectedItems) {
      updateItem(item.id, { deleteStatus: 'deleting' })
      try {
        const freedBytes = await invoke<number>('delete_item', {
          id: item.id,
          path: item.path,
        })
        updateItem(item.id, { deleteStatus: 'done', sizeBytes: 0 })
        results.push({ id: item.id, freedBytes })
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err)
        updateItem(item.id, { deleteStatus: 'error' })
        results.push({ id: item.id, freedBytes: 0, error })
      }
    }

    setDeleteResults(results)
    setSelected(new Set())
    setSuccessOpen(true)
  }, [selectedItems, updateItem])

  // --- Render ---

  const isAnyScanning = items.some((item) => item.scanStatus === 'scanning')
  const canClean = selectedItems.length > 0 && selectedItems.some((item) => item.sizeBytes > 0)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Claude Cleaner</h1>
            <p className="text-xs text-muted-foreground">v1.0.0</p>
          </div>
          <Button
            onClick={handleScanAll}
            disabled={isAnyScanning || items.length === 0}
            variant="outline"
          >
            {isAnyScanning ? 'Scan en cours…' : 'Scanner tout'}
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 pb-28">
        {/* Select all */}
        {items.length > 0 && (
          <div className="flex items-center gap-2 mb-5">
            <Checkbox
              id="select-all"
              checked={allSelected}
              onCheckedChange={handleToggleAll}
            />
            <label
              htmlFor="select-all"
              className="text-sm text-muted-foreground cursor-pointer select-none"
            >
              Tout sélectionner
            </label>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <CleanupCard
              key={item.id}
              item={item}
              selected={selected.has(item.id)}
              onToggle={() => handleToggle(item.id)}
              onDelete={() => {
                setSelected(new Set([item.id]))
                setConfirmOpen(true)
              }}
            />
          ))}
        </div>
      </main>

      {/* Footer sticky */}
      <footer className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {selectedItems.length > 0 ? (
              <>
                <span className="font-medium text-foreground">{selectedItems.length}</span>{' '}
                item{selectedItems.length > 1 ? 's' : ''} sélectionné
                {selectedItems.length > 1 ? 's' : ''} —{' '}
                <span className="font-medium text-foreground">
                  {formatBytes(totalSelectedBytes)}
                </span>
              </>
            ) : (
              'Aucun item sélectionné'
            )}
          </p>
          <Button
            variant="destructive"
            disabled={!canClean}
            onClick={() => setConfirmOpen(true)}
          >
            Nettoyer la sélection
          </Button>
        </div>
      </footer>

      {/* Dialogs */}
      <ConfirmDialog
        open={confirmOpen}
        items={selectedItems}
        totalBytes={totalSelectedBytes}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />

      <SuccessDialog
        open={successOpen}
        results={deleteResults}
        onClose={() => setSuccessOpen(false)}
      />
    </div>
  )
}
