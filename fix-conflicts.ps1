# Script pour nettoyer automatiquement tous les conflits Git
$file = "src\App.jsx"
$content = Get-Content $file -Raw

# Regex pour détecter et résoudre les conflits en gardant HEAD
$pattern = '(?s)<<<<<<< HEAD\r?\n(.*?)\r?\n=======\r?\n.*?\r?\n>>>>>>> [a-f0-9]{40}\r?\n'
$resolved = $content -replace $pattern, '$1'

# Sauvegarder le fichier nettoyé
Set-Content -Path $file -Value $resolved -NoNewline

Write-Host "✅ Tous les conflits Git ont été résolus automatiquement"
Write-Host "✅ La version HEAD a été conservée pour tous les conflits"
