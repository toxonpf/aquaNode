$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
$cli=Get-Command kicad-cli -ErrorAction Stop
& $cli.Source version | Out-File (Join-Path $root 'checks/kicad_version.txt')
& $cli.Source sch erc --exit-code-violations --output (Join-Path $root 'checks/native_erc.rpt') (Join-Path $root 'cad/AquaNode.kicad_sch')
if ($LASTEXITCODE -ne 0) { throw 'ERC failed. No production release.' }
& $cli.Source pcb drc --exit-code-violations --output (Join-Path $root 'checks/native_drc.rpt') (Join-Path $root 'cad/AquaNode.kicad_pcb')
if ($LASTEXITCODE -ne 0) { throw 'DRC failed. No production release.' }
& $cli.Source sch export netlist --output (Join-Path $root 'checks/native_netlist.net') (Join-Path $root 'cad/AquaNode.kicad_sch')
if ($LASTEXITCODE -ne 0) { throw 'Netlist export failed.' }
& $cli.Source sch export pdf --output (Join-Path $root 'Schematic_review.pdf') (Join-Path $root 'cad/AquaNode.kicad_sch')
if ($LASTEXITCODE -ne 0) { throw 'PDF export failed.' }
