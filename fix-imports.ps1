# fix-imports.ps1
# Recursively adds file extensions to local import paths when the referenced file exists.
# Usage: In repository root run: pwsh .\fix-imports.ps1

$extensions = @('.tsx', '.ts', '.jsx', '.js')
$files = Get-ChildItem -Recurse -File -Include *.ts,*.tsx,*.js,*.jsx | Where-Object { $_.Name -notmatch '\.d\.ts$' }
foreach ($file in $files) {
    $content = Get-Content -Raw -LiteralPath $file.FullName
    $dir = Split-Path $file.FullName
    $changed = $false

    $newContent = ($content -split "\r?\n") | ForEach-Object {
        $line = $_
        if ($line -match "from\s+['\"](?<path>(\.\.?\/[^'\"]+))['\"]") {
            $imp = $Matches['path']
            $ext = [IO.Path]::GetExtension($imp)
            if ([string]::IsNullOrEmpty($ext)) {
                foreach ($e in $extensions) {
                    $candidate = Join-Path $dir ($imp + $e)
                    if (Test-Path $candidate) {
                        $line = $line -replace ([regex]::Escape($imp) + "(?=['\"])"), ($imp + $e)
                        $changed = $true
                        break
                    }
                }
            }
        }
        $line
    } -join "`n"

    if ($changed) {
        Set-Content -LiteralPath $file.FullName -Value $newContent -Encoding UTF8
        Write-Host "Updated:" $file.FullName
    }
}

Write-Host "Done. If nothing updated, all local imports already include extensions or referenced targets were not found."