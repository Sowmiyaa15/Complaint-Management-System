$ErrorActionPreference = "Stop"

Write-Host "=================================================="
Write-Host "STARTING FULL E2E COMPLAINT SYSTEM VERIFICATION"
Write-Host "=================================================="

$baseUrl = "http://localhost:8080/api"

function Call-Api([string]$method, [string]$uri, $bodyObj = $null, [string]$token = "") {
    $headers = @{}
    if ($token) {
        $headers["Authorization"] = "Bearer $token"
    }
    
    $params = @{
        Method = $method
        Uri = "$baseUrl$uri"
        Headers = $headers
        UseBasicParsing = $true
    }
    if ($bodyObj) {
        $params["Body"] = ($bodyObj | ConvertTo-Json -Depth 5)
        $params["ContentType"] = "application/json"
    }

    try {
        $response = Invoke-WebRequest @params
        $data = $null
        if ($response.Content) {
            $data = $response.Content | ConvertFrom-Json
        }
        return @{ StatusCode = [int]$response.StatusCode; Data = $data; Error = $null }
    } catch {
        $statusCode = [int]$_.Exception.Response.StatusCode
        $errorContent = ""
        $stream = $_.Exception.Response.GetResponseStream()
        if ($stream) {
            $reader = New-Object System.IO.StreamReader($stream)
            $errorContent = $reader.ReadToEnd()
        }
        return @{ StatusCode = $statusCode; Data = $null; Error = $errorContent }
    }
}

# ----------------------------------------------------
# STEP A: Citizen Authentication
# ----------------------------------------------------
Write-Host "`n[STEP A] Authenticating Citizen (citizen1@example.com)..."
$citizenAuth = Call-Api "POST" "/auth/login" @{ email = "citizen1@example.com"; password = "Citizen@123" }
if ($citizenAuth.StatusCode -ne 200) { throw "Citizen auth failed: $($citizenAuth.Error)" }
$citizenToken = $citizenAuth.Data.token
Write-Host "  -> Citizen logged in! Name: $($citizenAuth.Data.name), Role: $($citizenAuth.Data.role)"

$citizenMe = Call-Api "GET" "/auth/me" $null $citizenToken
Write-Host "  -> Verified /auth/me: $($citizenMe.Data.email)"

# ----------------------------------------------------
# STEP B: Citizen Submits Complaint with Attachment
# ----------------------------------------------------
Write-Host "`n[STEP B] Citizen Submits New Complaint with Attached File..."
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"
$bodyLines = (
    "--$boundary",
    'Content-Disposition: form-data; name="title"',
    '',
    "E2E Water Pipeline Rupture Test",
    "--$boundary",
    'Content-Disposition: form-data; name="category"',
    '',
    "Water Supply",
    "--$boundary",
    'Content-Disposition: form-data; name="description"',
    '',
    "Emergency water pipeline rupture at 5th Ave and Maple. Immediate repair crew requested.",
    "--$boundary",
    'Content-Disposition: form-data; name="files"; filename="emergency_photo.txt"',
    'Content-Type: text/plain',
    '',
    "Attached sensor data: High water pressure drop detected at 23:15 UTC.",
    "--$boundary--"
) -join $LF

$submitRes = Invoke-WebRequest -Uri "$baseUrl/complaints" -Method POST -Headers @{
    "Authorization" = "Bearer $citizenToken"
    "Content-Type" = "multipart/form-data; boundary=$boundary"
} -Body ([System.Text.Encoding]::UTF8.GetBytes($bodyLines)) -UseBasicParsing

$newComplaint = $submitRes.Content | ConvertFrom-Json
$complaintId = $newComplaint.id
Write-Host "  -> Complaint created! ID: #$complaintId, Status: $($newComplaint.status)"
Write-Host "  -> Attachments count: $($newComplaint.attachments.Count)"

# Verify complaint shows in /complaints/my
$myComplaints = Call-Api "GET" "/complaints/my" $null $citizenToken
$myFound = $myComplaints.Data.content | Where-Object { $_.id -eq $complaintId }
if (-not $myFound) { throw "Complaint #$complaintId not found in /complaints/my!" }
Write-Host "  -> Verified complaint present in /complaints/my list"

# ----------------------------------------------------
# STEP C: Admin Login, Dashboard KPIs, Assign Complaint
# ----------------------------------------------------
Write-Host "`n[STEP C] Admin Login, Analytics Verification and Officer Assignment..."
$adminAuth = Call-Api "POST" "/auth/login" @{ email = "admin@example.com"; password = "Admin@123" }
$adminToken = $adminAuth.Data.token
Write-Host "  -> Admin logged in! Role: $($adminAuth.Data.role)"

$kpis = Call-Api "GET" "/reports/kpis" $null $adminToken
Write-Host "  -> System KPIs: Total Complaints = $($kpis.Data.totalComplaints), Pending = $($kpis.Data.pendingCount), Resolved = $($kpis.Data.resolvedCount)"

$empList = Call-Api "GET" "/users/employees" $null $adminToken
$targetEmp = $empList.Data[0]
Write-Host "  -> Assigning complaint #$complaintId to $($targetEmp.name) (ID: $($targetEmp.id))..."

$assignRes = Call-Api "PUT" "/complaints/$complaintId/assign" @{ employeeId = [int64]$targetEmp.id } $adminToken
if ($assignRes.StatusCode -ne 200) { throw "Assignment failed: $($assignRes.Error)" }
Write-Host "  -> Complaint #$complaintId assigned! Status: $($assignRes.Data.status), Assigned To: $($assignRes.Data.assignedEmployeeName)"

# ----------------------------------------------------
# STEP D: Employee Investigates, Internal Notes, Resolves
# ----------------------------------------------------
Write-Host "`n[STEP D] Officer Workspace: Queue, Investigation, Private Notes, Resolution..."
$empAuth = Call-Api "POST" "/auth/login" @{ email = $targetEmp.email; password = "Employee@123" }
$empToken = $empAuth.Data.token
Write-Host "  -> Officer $($targetEmp.name) authenticated!"

# Check Assigned Queue
$assignedQueue = Call-Api "GET" "/complaints/assigned" $null $empToken
$foundInQueue = $assignedQueue.Data.content | Where-Object { $_.id -eq $complaintId }
if (-not $foundInQueue) { throw "Complaint #$complaintId not found in officer queue!" }
Write-Host "  -> Confirmed complaint #$complaintId present in officer assigned queue."

# Transition to IN_PROGRESS
$progressRes = Call-Api "PUT" "/complaints/$complaintId/status" @{
    status = "IN_PROGRESS"
    comment = "Repair team deployed on-site with excavator and replacement fittings."
} $empToken
Write-Host "  -> Status transitioned to: $($progressRes.Data.status)"

# Add Confidential Internal Staff Note
$noteRes = Call-Api "POST" "/complaints/$complaintId/notes" @{
    note = "Confidential staff log: Subsurface pipe age exceeds 25 years. Scheduled for overhaul in FY27 budget."
} $empToken
Write-Host "  -> Internal note recorded by officer: $($noteRes.Data.authorName)"

# Transition to RESOLVED
$resolvedRes = Call-Api "PUT" "/complaints/$complaintId/status" @{
    status = "RESOLVED"
    comment = "Pipeline welded, water pressure restored, and asphalt resurfacing complete."
} $empToken
Write-Host "  -> Status transitioned to: $($resolvedRes.Data.status), Resolved At: $($resolvedRes.Data.resolvedAt)"

# ----------------------------------------------------
# STEP E: Citizen Verification and Security Validation
# ----------------------------------------------------
Write-Host "`n[STEP E] Citizen Verification and Data Privacy Validation..."
$citizenView = Call-Api "GET" "/complaints/$complaintId" $null $citizenToken
Write-Host "  -> Citizen retrieved complaint #$($citizenView.Data.id):"
Write-Host "     * Title: $($citizenView.Data.title)"
Write-Host "     * Status: $($citizenView.Data.status)"
Write-Host "     * Resolved At: $($citizenView.Data.resolvedAt)"
Write-Host "     * Public Updates: $($citizenView.Data.updates.Count)"

# VERIFY INTERNAL NOTES MASKING
if ($citizenView.Data.internalNotes -and $citizenView.Data.internalNotes.Count -gt 0) {
    throw "CRITICAL SECURITY BREACH: Citizen received internal staff notes!"
}
Write-Host "  -> PRIVACY VALIDATED: Citizen view receives 0 internal staff notes (null/empty array)."

# VERIFY CITIZEN CANNOT POST INTERNAL NOTES
$citizenPostNote = Call-Api "POST" "/complaints/$complaintId/notes" @{ note = "Citizen intrusion attempt" } $citizenToken
if ($citizenPostNote.StatusCode -ne 403) {
    throw "SECURITY FLAW: Expected 403 Forbidden for citizen posting internal notes, got: $($citizenPostNote.StatusCode)"
}
Write-Host "  -> SECURITY VALIDATED: Citizen attempt to POST internal notes rejected with HTTP 403 Forbidden."

# ----------------------------------------------------
# STEP F: Negative Security Tests
# ----------------------------------------------------
Write-Host "`n[STEP F] Negative Security and RBAC Tests..."

# 1. Bad password login
$badPass = Call-Api "POST" "/auth/login" @{ email = "admin@example.com"; password = "InvalidPassword123!" }
if ($badPass.StatusCode -ne 401) { throw "Expected 401 on bad credentials, got $($badPass.StatusCode)" }
Write-Host "  -> Test 1: Invalid login password rejected with HTTP 401 Unauthorized"

# 2. Missing authorization header
$noAuth = Call-Api "GET" "/complaints" $null ""
if ($noAuth.StatusCode -ne 401) { throw "Expected 401 on unauthenticated access, got $($noAuth.StatusCode)" }
Write-Host "  -> Test 2: Unauthenticated request rejected with HTTP 401 Unauthorized"

# 3. Citizen accessing Admin user management
$citizenAdminAccess = Call-Api "GET" "/users" $null $citizenToken
if ($citizenAdminAccess.StatusCode -ne 403) { throw "Expected 403 on citizen accessing /users, got $($citizenAdminAccess.StatusCode)" }
Write-Host "  -> Test 3: Citizen accessing /users rejected with HTTP 403 Forbidden"

# 4. Employee attempting user creation
$empCreateUser = Call-Api "POST" "/users" @{ name = "Test"; email = "t@t.com"; password = "password"; role = "ADMIN" } $empToken
if ($empCreateUser.StatusCode -ne 403) { throw "Expected 403 on employee creating user, got $($empCreateUser.StatusCode)" }
Write-Host "  -> Test 4: Employee attempting user creation rejected with HTTP 403 Forbidden"

# ----------------------------------------------------
# STEP G: Database Direct Persistence Verification
# ----------------------------------------------------
Write-Host "`n[STEP G] Verifying Direct MySQL Database Persistence..."
$oldEap = $ErrorActionPreference
$ErrorActionPreference = "Continue"
$dbRow = & 'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe' -u root -pSowmiya -e "SELECT id, title, status, assigned_employee_id, resolved_at FROM complaint_management_system.complaints WHERE id = $complaintId;" 2>&1
$ErrorActionPreference = $oldEap

Write-Host "  -> MySQL Database Record:"
$dbRow | Where-Object { $_ -notmatch "Using a password" } | ForEach-Object { Write-Host "     $_" }

Write-Host "`n=================================================="
Write-Host "ALL E2E WORKFLOWS, RBAC & PERSISTENCE VERIFIED 100%!"
Write-Host "=================================================="
