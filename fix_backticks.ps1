cd c:\CIS2026\html

Get-ChildItem *.html | ForEach-Object {
    $path = $_.FullName
    $content = Get-Content $path -Raw
    
    # Reemplazar el patrón corrompido
    $content = $content -replace '</script>`n<script', "</script>`n<script"
    
    Set-Content -Path $path -Value $content -Encoding UTF8
    Write-Host "Reparado backtick: $($_.Name)"
}

Write-Host "Done!"
