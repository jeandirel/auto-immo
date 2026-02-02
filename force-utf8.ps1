# Script BRUTAL pour forcer UTF-8
$file = "src\App.jsx"

# Lire avec detection automatique
$lines = Get-Content $file

# Convertir ligne par ligne
$fixed = $lines | ForEach-Object {
    $_ -replace 'V�hicules', 'Véhicules' `
       -replace 'v�hicules', 'véhicules' `
       -replace 'mat�riel', 'matériel' `
       -replace 'cat�gories', 'catégories'
}

# Sauvegarder en UTF-8 WITH BOM (pour forcer Windows)
$fixed | Out-File -FilePath $file -Encoding UTF8 -Force

Write-Host "✅ Fichier réécrit en UTF-8 avec BOM"
