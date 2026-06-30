<div align="center">

# 🧹 Claude Cleaner

**Libère l'espace disque accumulé par Claude Code en quelques clics.**

![Tauri](https://img.shields.io/badge/Tauri-v2-FFC131?style=flat-square&logo=tauri&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-v3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Platform](https://img.shields.io/badge/macOS-aarch64-000000?style=flat-square&logo=apple&logoColor=white)

</div>

---

## Pourquoi Claude Cleaner ?

Claude Code accumule silencieusement des gigaoctets de données au fil des sessions : transcripts de conversations, sauvegardes de fichiers, caches npm, worktrees git orphelins... Ces fichiers restent sur votre disque indéfiniment, même lorsqu'ils ne servent plus à rien.

Claude Cleaner scanne, mesure et supprime ces données en toute sécurité — avec une indication claire du risque avant chaque suppression.

---

## Fonctionnement

### Ce que l'app nettoie

| Catégorie | Chemin | Risque |
|-----------|--------|--------|
| Transcripts de sessions | `~/.claude/projects/**` | Medium |
| Listes de tâches | `~/.claude/todos` | Low |
| Tâches en arrière-plan | `~/.claude/tasks` | Low |
| Snapshots shell | `~/.claude/shell-snapshots` | Low |
| Sauvegardes de fichiers | `~/.claude/backups` | **High** |
| Cache Statsig | `~/.claude/statsig` | Low |
| Sockets IDE | `~/.claude/ide` | Low |
| Cache npm | `npm cache clean --force` | Medium |
| Worktrees orphelins | `/tmp/claude-*` | **High** |

### Workflow

```
Scanner tout  →  Sélectionner les items  →  Nettoyer la sélection  →  Confirmation  →  Résultat
```

1. **Scanner** — mesure la taille de chaque catégorie en parallèle via `walkdir` (Rust)
2. **Sélectionner** — cochez individuellement ou "Tout sélectionner"
3. **Confirmer** — un dialog liste les items et affiche les avertissements pour les items à risque élevé
4. **Résultat** — total libéré avec détail par catégorie

### Protections intégrées

- `~/.claude/settings.json` et `~/.claude/CLAUDE.md` ne sont **jamais** supprimés
- Le dossier `~/.claude/projects/` lui-même est conservé (seul son contenu est supprimé)
- La suppression est **séquentielle** (pas en parallèle) pour éviter les conditions de course
- Badge de risque visible sur chaque carte avant toute action

---

## Installation

### Prérequis

- macOS 12+ (Apple Silicon ou Intel)
- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) 1.77+
- Xcode Command Line Tools : `xcode-select --install`

### Depuis les sources

```bash
# Cloner le projet
git clone https://github.com/votre-user/claude-cleaner.git
cd claude-cleaner

# Installer les dépendances JS
npm install

# Lancer en développement
npm run tauri dev

# Produire un build de distribution
npm run tauri build
# → .app et .dmg dans src-tauri/target/release/bundle/macos/
```

### Depuis le DMG

1. Télécharger `claude-cleaner_x.x.x_aarch64.dmg` depuis les [Releases](../../releases)
2. Ouvrir le DMG et glisser l'app dans `/Applications`
3. Au premier lancement : clic droit → Ouvrir (Gatekeeper)

---

## Troubleshooting

### "Non scanné" affiché sur tous les items

Claude Code n'a pas encore créé ces dossiers. Cliquez sur **Scanner tout** — les items vides afficheront "Vide".

### Le bouton "Nettoyer" reste grisé

Le bouton est désactivé si la taille est à 0 ou si le scan n'a pas encore été effectué. Lancez d'abord **Scanner tout**.

### Erreur de permission sur un item

Certains fichiers peuvent être verrouillés par un processus Claude Code actif. Fermez Claude Code et relancez l'opération.

### `npm cache clean --force` échoue

Vérifiez que `npm` est accessible dans le `PATH` système (pas seulement dans votre shell). Vous pouvez le nettoyer manuellement :
```bash
npm cache clean --force
```

### L'app ne s'ouvre pas (macOS Gatekeeper)

```bash
xattr -d com.apple.quarantine /Applications/claude-cleaner.app
```

### Les worktrees orphelins ne sont pas détectés

Le scan cherche les dossiers `/tmp/claude-*`. Si vos worktrees Claude sont dans un autre répertoire temporaire, ils ne seront pas détectés par cette version.

---

## Nettoyage manuel

Si vous préférez ne pas utiliser l'app, voici les commandes équivalentes :

```bash
# Transcripts
rm -rf ~/.claude/projects/*/

# Todos, tasks, snapshots, cache Statsig, sockets IDE
rm -rf ~/.claude/todos ~/.claude/tasks ~/.claude/shell-snapshots
rm -rf ~/.claude/statsig ~/.claude/ide

# Sauvegardes (/rewind sera inopérant ensuite)
rm -rf ~/.claude/backups

# Cache npm
npm cache clean --force

# Worktrees orphelins
rm -rf /tmp/claude-*
```

> ⚠️ Ne supprimez pas `~/.claude/settings.json` ni `~/.claude/CLAUDE.md`.

---

## Stack technique

```
Frontend      React 18 + TypeScript + Vite
UI            Tailwind CSS v3 + shadcn/ui
Desktop       Tauri v2 (WebView natif macOS)
Backend Rust  walkdir · std::fs · std::process::Command
Plugins       tauri-plugin-fs · tauri-plugin-shell · tauri-plugin-opener
```

---

<div align="center">

Fait avec soin par **Liam** — License MIT — voir [LICENSE](LICENSE)

</div>
