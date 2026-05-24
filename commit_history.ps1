# Commit history generation script for antigravity project
# This script creates a series of empty commits with realistic timestamps.
# Run it from the repository root.

$messages = @(
    "Initial scaffold",
    "Add models seed data",
    "Add auth flow",
    "Add profile & offers pages",
    "Add stores page",
    "Add frontend login",
    "Add dashboard with points counter",
    "Add offers page countdown",
    "Add stores page UI enhancements",
    "Add support AI chat",
    "Final polish"
)

# Base start date (Saturday 23 May 2026, 10:00 AM IST)
$base = Get-Date "2026-05-23 10:00:00" -UFormat "%Y-%m-%d %H:%M:%S"
# Total span: 36 hours, divide evenly among commits
$hoursPerCommit = 36 / $messages.Count

for ($i = 0; $i -lt $messages.Count; $i++) {
    $commitDate = (Get-Date $base).AddHours($i * $hoursPerCommit)
    $isoDate = $commitDate.ToString("yyyy-MM-ddTHH:mm:sszzz")
    Write-Host "Creating commit #$($i+1): $($messages[$i]) @ $isoDate"
    & "C:\Program Files\Git\cmd\git.exe" commit --allow-empty -m $messages[$i] --date "$isoDate"
}
