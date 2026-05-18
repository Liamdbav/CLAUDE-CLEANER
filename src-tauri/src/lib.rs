use std::fs;
use std::path::Path;
use std::process::Command;
use walkdir::WalkDir;

/// Calcule la taille totale en bytes d'un chemin (récursif).
/// Retourne 0 si le chemin n'existe pas.
fn dir_size(path: &Path) -> Result<u64, String> {
    if !path.exists() {
        return Ok(0);
    }
    let mut total = 0u64;
    for entry in WalkDir::new(path).into_iter().filter_map(|e| e.ok()) {
        if entry.file_type().is_file() {
            total += entry
                .metadata()
                .map_err(|e| e.to_string())?
                .len();
        }
    }
    Ok(total)
}

/// Supprime le contenu d'un répertoire sans supprimer le répertoire lui-même.
/// Protège settings.json et CLAUDE.md dans ~/.claude.
fn remove_dir_contents(path: &Path) -> Result<(), String> {
    if !path.exists() {
        return Ok(());
    }
    for entry in fs::read_dir(path).map_err(|e| format!("Permission refusée : {}", e))? {
        let entry = entry.map_err(|e| e.to_string())?;
        let entry_path = entry.path();

        // Fichiers protégés dans ~/.claude
        if let Some(name) = entry_path.file_name().and_then(|n| n.to_str()) {
            if name == "settings.json" || name == "CLAUDE.md" {
                continue;
            }
        }

        if entry_path.is_dir() {
            fs::remove_dir_all(&entry_path)
                .map_err(|e| format!("Impossible de supprimer {:?} : {}", entry_path, e))?;
        } else {
            fs::remove_file(&entry_path)
                .map_err(|e| format!("Impossible de supprimer {:?} : {}", entry_path, e))?;
        }
    }
    Ok(())
}

#[tauri::command]
fn scan_item(_id: String, path: String) -> Result<u64, String> {
    dir_size(Path::new(&path))
}

#[tauri::command]
fn delete_item(id: String, path: String) -> Result<u64, String> {
    let target = Path::new(&path);

    // npm-cache : déléguer à `npm cache clean --force`
    if id == "npm-cache" {
        let size_before = dir_size(target)?;
        let status = Command::new("npm")
            .args(["cache", "clean", "--force"])
            .status()
            .map_err(|e| format!("Impossible de lancer npm : {}", e))?;
        if !status.success() {
            return Err("npm cache clean --force a échoué".to_string());
        }
        let size_after = dir_size(target)?;
        return Ok(size_before.saturating_sub(size_after));
    }

    // orphan-worktrees : supprimer /tmp/claude-* répertoires
    if id == "orphan-worktrees" {
        let tmp = Path::new("/tmp");
        let mut freed = 0u64;
        if tmp.exists() {
            for entry in fs::read_dir(tmp).map_err(|e| e.to_string())? {
                let entry = entry.map_err(|e| e.to_string())?;
                let entry_path = entry.path();
                if entry_path.is_dir() {
                    if let Some(name) = entry_path.file_name().and_then(|n| n.to_str()) {
                        if name.starts_with("claude-") {
                            freed += dir_size(&entry_path)?;
                            fs::remove_dir_all(&entry_path)
                                .map_err(|e| format!("Impossible de supprimer {:?} : {}", entry_path, e))?;
                        }
                    }
                }
            }
        }
        return Ok(freed);
    }

    // Cas général : supprimer le contenu du répertoire, pas le répertoire lui-même
    let size_before = dir_size(target)?;
    remove_dir_contents(target)?;
    Ok(size_before)
}

#[tauri::command]
fn get_home_dir() -> Result<String, String> {
    std::env::var("HOME").map_err(|_| "Variable HOME introuvable".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            scan_item,
            delete_item,
            get_home_dir,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
