$path = "c:\Users\DELL\OneDrive\Desktop\News_MarketPlace\frontend\src\App.jsx"
$content = Get-Content $path
$newContent = @()
$inOldCode = $false

foreach ($line in $content) {
    if ($line -eq "/*") {
        $inOldCode = $true
        continue
    }
    if ($line -eq "*/") {
        $inOldCode = $false
        continue
    }
    
    if ($inOldCode) {
        $newContent += "// " + $line
    } else {
        $newContent += $line
    }
}

$newContent | Set-Content $path
