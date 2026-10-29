$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$cli = Get-Command kicad-cli -ErrorAction Stop
$sch = Join-Path $root 'cad/AquaNode.kicad_sch'
$pcb = Join-Path $root 'cad/AquaNode.kicad_pcb'
& $cli.Source version | Out-File (Join-Path $root 'checks/kicad_version.txt')
& $cli.Source sch erc --exit-code-violations --output (Join-Path $root 'checks/native_erc.rpt') $sch
if ($LASTEXITCODE -ne 0) { throw 'ERC failed; inspect native report. No export released.' }
& $cli.Source pcb drc --exit-code-violations --output (Join-Path $root 'checks/native_drc.rpt') $pcb
if ($LASTEXITCODE -ne 0) { throw 'DRC failed; inspect native report. No export released.' }
& $cli.Source sch export netlist --output (Join-Path $root 'checks/native_netlist.net') $sch
if ($LASTEXITCODE -ne 0) { throw 'Netlist export failed' }
& $cli.Source sch export pdf --output (Join-Path $root 'Schematic.pdf') $sch
if ($LASTEXITCODE -ne 0) { throw 'PDF export failed' }
Write-Output 'Native reports and review PDF generated. Human review and CAM release remain required.'
