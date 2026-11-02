param([string]$Cli='arduino-cli', [string]$ConfigFile='')
$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
$options=@()
if ($ConfigFile) { $options+=@('--config-file',$ConfigFile) }
$log=Join-Path $root 'checks/firmware_build.txt'
& $Cli @options version 2>&1 | Out-File $log
& $Cli @options core list 2>&1 | Out-File $log -Append
& $Cli @options lib list 2>&1 | Out-File $log -Append
& $Cli @options compile --fqbn 'esp32:esp32:XIAO_ESP32S3:CDCOnBoot=cdc' --warnings all --output-dir (Join-Path $root 'build/ec_ph_bench') (Join-Path $root 'firmware/ec_ph_bench') 2>&1 | Out-File $log -Append
if ($LASTEXITCODE -ne 0) { throw 'ESP32 compilation failed. See checks/firmware_build.txt' }
Write-Output 'ESP32 compilation passed. Hardware not tested.'
