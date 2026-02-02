# Script pour corriger l'encodage UTF-8 dans App.jsx
$file = "src\App.jsx"
$content = Get-Content $file -Raw -Encoding UTF8

# Corriger les caractères mal encodés
$content = $content -replace 'V�hicules', 'Véhicules'
$content = $content -replace 'v�hicules', 'véhicules'
$content = $content -replace 'mat�riel', 'matériel'

# Sauvegarder avec UTF-8 sans BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($file, $content, $utf8NoBom)

Write-Host "✅ Encodage UTF-8 corrigé dans App.jsx"
