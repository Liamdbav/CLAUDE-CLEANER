import type { CleanupItem } from '@/types'

export function getCleanupItems(homeDir: string): CleanupItem[] {
  return [
    {
      id: 'transcripts',
      label: 'Transcripts de sessions',
      description:
        'Historique complet des conversations Claude Code, stocké projet par projet. Chaque session génère un fichier JSON dans un sous-dossier nommé d\'après le chemin du projet.',
      impact: 'Supprime tous les fichiers de transcripts dans ~/.claude/projects/**. Le dossier projects/ lui-même est conservé.',
      risks: 'L\'historique des sessions est définitivement perdu. Aucun impact fonctionnel sur Claude Code.',
      risk: 'medium',
      sizeBytes: -1,
      path: `${homeDir}/.claude/projects`,
      scanStatus: 'idle',
      deleteStatus: 'idle',
    },
    {
      id: 'todos',
      label: 'Listes de tâches',
      description:
        'Fichiers de todos créés par Claude Code pendant les sessions. Persistent entre les conversations pour suivre l\'avancement des tâches en cours.',
      impact: 'Supprime tous les fichiers de todos dans ~/.claude/todos.',
      risks: 'Les todos en cours sont perdus. Une session active qui s\'appuie sur ces fichiers pourrait perdre son contexte de tâches.',
      risk: 'low',
      sizeBytes: -1,
      path: `${homeDir}/.claude/todos`,
      scanStatus: 'idle',
      deleteStatus: 'idle',
    },
    {
      id: 'tasks',
      label: 'Tâches en arrière-plan',
      description:
        'État des tâches background lancées par Claude Code (agents, sous-processus). Permet à Claude de retrouver des tâches longues entre les sessions.',
      impact: 'Supprime tous les fichiers de tâches dans ~/.claude/tasks.',
      risks: 'Les tâches en cours d\'exécution perdent leur état. Des tâches background actives pourraient ne plus être retrouvables.',
      risk: 'low',
      sizeBytes: -1,
      path: `${homeDir}/.claude/tasks`,
      scanStatus: 'idle',
      deleteStatus: 'idle',
    },
    {
      id: 'shell-snapshots',
      label: 'Snapshots shell',
      description:
        'Captures de l\'état du shell (variables d\'environnement, répertoire courant) prises par Claude Code pour maintenir le contexte entre les commandes.',
      impact: 'Supprime tous les snapshots dans ~/.claude/shell-snapshots.',
      risks: 'Claude Code devra recapturer le contexte shell à la prochaine session. Aucun impact permanent.',
      risk: 'low',
      sizeBytes: -1,
      path: `${homeDir}/.claude/shell-snapshots`,
      scanStatus: 'idle',
      deleteStatus: 'idle',
    },
    {
      id: 'backups',
      label: 'Sauvegardes de fichiers',
      description:
        'Copies de sauvegarde des fichiers modifiés par Claude Code, utilisées par la commande /rewind pour restaurer un état antérieur.',
      impact: 'Supprime toutes les sauvegardes dans ~/.claude/backups.',
      risks: 'RISQUE ÉLEVÉ — la commande /rewind devient inopérante. Il sera impossible de revenir à un état antérieur des fichiers modifiés par Claude Code.',
      risk: 'high',
      sizeBytes: -1,
      path: `${homeDir}/.claude/backups`,
      scanStatus: 'idle',
      deleteStatus: 'idle',
    },
    {
      id: 'statsig-cache',
      label: 'Cache Statsig',
      description:
        'Cache local du SDK Statsig utilisé par Claude Code pour la gestion des feature flags et l\'analytics. Se reconstruit automatiquement.',
      impact: 'Supprime le cache dans ~/.claude/statsig.',
      risks: 'Claude Code rechargera les feature flags depuis le réseau au prochain lancement. Aucun impact fonctionnel.',
      risk: 'low',
      sizeBytes: -1,
      path: `${homeDir}/.claude/statsig`,
      scanStatus: 'idle',
      deleteStatus: 'idle',
    },
    {
      id: 'ide-sockets',
      label: 'Sockets IDE',
      description:
        'Fichiers de socket Unix créés pour la communication entre Claude Code et les extensions IDE (VS Code, JetBrains). Les sockets actives sont recréées automatiquement.',
      impact: 'Supprime les fichiers de socket dans ~/.claude/ide.',
      risks: 'Les connexions IDE actives seront interrompues. Une reconnexion manuelle peut être nécessaire dans l\'IDE.',
      risk: 'low',
      sizeBytes: -1,
      path: `${homeDir}/.claude/ide`,
      scanStatus: 'idle',
      deleteStatus: 'idle',
    },
    {
      id: 'npm-cache',
      label: 'Cache npm',
      description:
        'Cache global npm contenant les paquets téléchargés, dont les dépendances de Claude Code. Nettoyé via `npm cache clean --force`.',
      impact: 'Vide le cache npm global. Exécute `npm cache clean --force`.',
      risks: 'Claude Code devra retélécharger ses dépendances npm au prochain lancement, ce qui peut prendre du temps selon la connexion.',
      risk: 'medium',
      sizeBytes: -1,
      path: '',
      scanStatus: 'idle',
      deleteStatus: 'idle',
    },
    {
      id: 'orphan-worktrees',
      label: 'Worktrees orphelins',
      description:
        'Répertoires git worktree temporaires créés par Claude Code dans /tmp (pattern claude-*). Restent sur disque si une session s\'est terminée anormalement.',
      impact: 'Supprime tous les répertoires /tmp/claude-* correspondant à des worktrees orphelins.',
      risks: 'Un worktree encore utilisé par une session active serait supprimé, causant des erreurs git dans cette session.',
      risk: 'high',
      sizeBytes: -1,
      path: '/tmp',
      scanStatus: 'idle',
      deleteStatus: 'idle',
    },
  ]
}
