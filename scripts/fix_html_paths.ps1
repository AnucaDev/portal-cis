cd c:\CIS2026\html

Get-ChildItem *.html | ForEach-Object {
    $path = $_.FullName
    $content = Get-Content $path -Raw
    
    $content = $content -replace 'href="\.\./css/', 'href="/css/'
    $content = $content -replace 'href="\.\./js/', 'href="/js/'
    $content = $content -replace 'src="\.\./imagenes/', 'src="/imagenes/'
    $content = $content -replace 'src="\.\./js/', 'src="/js/'
    $content = $content -replace '"></script>``n<script', '"></script>`n<script'
    
    Set-Content -Path $path -Value $content
    Write-Host "Reparado: $($_.Name)"
}

Write-Host "Done!"
