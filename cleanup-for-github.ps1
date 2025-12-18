# Cleanup Script untuk Persiapan GitHub Upload
# Run script ini sebelum upload ke GitHub

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GitHub Upload Preparation Script" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$errors = 0
$warnings = 0

# Function untuk check file
function Check-File {
    param($path, $shouldExist)
    if ($shouldExist) {
        if (Test-Path $path) {
            Write-Host "✅ Found: $path" -ForegroundColor Green
        } else {
            Write-Host "❌ Missing: $path" -ForegroundColor Red
            $script:errors++
        }
    } else {
        if (Test-Path $path) {
            Write-Host "⚠️  Should remove: $path" -ForegroundColor Yellow
            $script:warnings++
        } else {
            Write-Host "✅ Not found (good): $path" -ForegroundColor Green
        }
    }
}

Write-Host "[1/7] Checking Required Files..." -ForegroundColor Yellow
Check-File ".gitignore" $true
Check-File ".env.example" $true
Check-File "settings.json.example" $true
Check-File "README.md" $true
Check-File "LICENSE" $true
Check-File "package.json" $true

Write-Host "`n[2/7] Checking Sensitive Files (should be ignored)..." -ForegroundColor Yellow
Check-File ".env" $false
Check-File "settings.json" $false
Check-File "whatsapp-session" $false
Check-File "config/superadmin.txt" $false

Write-Host "`n[3/7] Checking for .zip files..." -ForegroundColor Yellow
$zipFiles = Get-ChildItem -Path "." -Filter "*.zip" -ErrorAction SilentlyContinue
if ($zipFiles.Count -gt 0) {
    Write-Host "⚠️  Found $($zipFiles.Count) .zip file(s):" -ForegroundColor Yellow
    foreach ($zip in $zipFiles) {
        Write-Host "   - $($zip.Name)" -ForegroundColor Yellow
        $warnings++
    }
    
    $delete = Read-Host "`nDelete .zip files? (y/n)"
    if ($delete -eq 'y' -or $delete -eq 'Y') {
        foreach ($zip in $zipFiles) {
            Remove-Item $zip.FullName -Force
            Write-Host "   ✅ Deleted: $($zip.Name)" -ForegroundColor Green
        }
        $warnings = $warnings - $zipFiles.Count
    }
} else {
    Write-Host "✅ No .zip files found" -ForegroundColor Green
}

Write-Host "`n[4/7] Checking node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules exists (will be ignored by .gitignore)" -ForegroundColor Green
} else {
    Write-Host "⚠️  node_modules not found (run 'npm install' untuk testing)" -ForegroundColor Yellow
}

Write-Host "`n[5/7] Checking for hardcoded credentials..." -ForegroundColor Yellow
Write-Host "Searching for common credential patterns..." -ForegroundColor Gray

$patterns = @("password", "token", "secret", "api_key", "apikey")
$foundCredentials = $false

foreach ($pattern in $patterns) {
    $results = Get-ChildItem -Recurse -Include *.js,*.json -Exclude node_modules,package-lock.json | 
               Select-String -Pattern $pattern -CaseSensitive:$false -SimpleMatch
    
    if ($results.Count -gt 0) {
        $foundCredentials = $true
        Write-Host "⚠️  Found '$pattern' in:" -ForegroundColor Yellow
        foreach ($result in $results | Select-Object -First 3) {
            Write-Host "   - $($result.Path):$($result.LineNumber)" -ForegroundColor Gray
        }
        if ($results.Count -gt 3) {
            Write-Host "   ... and $($results.Count - 3) more" -ForegroundColor Gray
        }
    }
}

if ($foundCredentials) {
    Write-Host "`n⚠️  REVIEW THESE FILES MANUALLY!" -ForegroundColor Yellow
    Write-Host "Make sure they are variable names, not actual credentials." -ForegroundColor Gray
    $warnings++
} else {
    Write-Host "✅ No obvious credential patterns found" -ForegroundColor Green
}

Write-Host "`n[6/7] Testing .gitignore..." -ForegroundColor Yellow
git status --short --ignored > $null 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Git initialized" -ForegroundColor Green
    
    # Check if sensitive files are ignored
    $gitStatus = git status --short
    if ($gitStatus -match "\.env$|settings\.json$|whatsapp-session") {
        Write-Host "❌ .gitignore NOT working! Sensitive files will be committed!" -ForegroundColor Red
        $errors++
    } else {
        Write-Host "✅ .gitignore is working correctly" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  Git not initialized. Run 'git init' first." -ForegroundColor Yellow
    $warnings++
}

Write-Host "`n[7/7] Summary..." -ForegroundColor Yellow

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "CLEANUP SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Errors: $errors" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Green" })
Write-Host "Warnings: $warnings" -ForegroundColor $(if ($warnings -gt 0) { "Yellow" } else { "Green" })

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "`n✅ ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host "Repository is ready for GitHub upload.`n" -ForegroundColor Green
    
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Review PRE_UPLOAD_CHECKLIST.md"
    Write-Host "2. git add ."
    Write-Host "3. git commit -m 'Initial commit'"
    Write-Host "4. git push`n"
} elseif ($errors -eq 0) {
    Write-Host "`n⚠️  WARNINGS FOUND" -ForegroundColor Yellow
    Write-Host "Please review warnings above before upload.`n" -ForegroundColor Yellow
} else {
    Write-Host "`n❌ ERRORS FOUND" -ForegroundColor Red
    Write-Host "Fix errors before uploading to GitHub!`n" -ForegroundColor Red
}

Write-Host "========================================`n" -ForegroundColor Cyan
