$auditInput = 'D:\Projects\Shyft\output\security-audit-2026-10-30\RocketRota_Security_Audit_2026-10-30.docx'
$auditPdf = 'D:\Projects\Shyft\tmp\security-audit-2026-10-30\render\RocketRota_Security_Audit_2026-10-30.pdf'
New-Item -ItemType Directory -Path (Split-Path -Parent $auditPdf) -Force | Out-Null
$auditWord = $null
$auditDocument = $null
try {
    $auditWord = New-Object -ComObject Word.Application
    if ($auditWord.Documents.Count -gt 0) { throw 'Renderer did not receive a separate empty Word instance.' }
    $auditWord.Visible = $false
    $auditWord.DisplayAlerts = 0
    $auditWord.AutomationSecurity = 3
    $auditDocument = $auditWord.Documents.Open($auditInput, $false, $true, $false)
    $auditDocument.Repaginate()
    $auditPageCount = $auditDocument.ComputeStatistics(2)
    $auditDocument.ExportAsFixedFormat($auditPdf, 17)
    Write-Output "Rendered $auditPageCount pages using native Word."
} finally {
    if ($auditDocument) { $auditDocument.Close(0); [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($auditDocument) }
    if ($auditWord -and $auditWord.Documents.Count -eq 0) { $auditWord.Quit(); [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($auditWord) }
}
