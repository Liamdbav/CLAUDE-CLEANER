export type CleanupCategory =
  | 'transcripts'
  | 'todos'
  | 'tasks'
  | 'shell-snapshots'
  | 'backups'
  | 'statsig-cache'
  | 'ide-sockets'
  | 'npm-cache'
  | 'orphan-worktrees'

export type RiskLevel = 'low' | 'medium' | 'high'

export interface CleanupItem {
  id: CleanupCategory
  label: string
  description: string
  impact: string
  risks: string
  risk: RiskLevel
  sizeBytes: number
  path: string
  scanStatus: 'idle' | 'scanning' | 'ready' | 'error'
  deleteStatus: 'idle' | 'deleting' | 'done' | 'error'
}

export interface ScanResult {
  id: CleanupCategory
  sizeBytes: number
  error?: string
}

export interface DeleteResult {
  id: CleanupCategory
  freedBytes: number
  error?: string
}
