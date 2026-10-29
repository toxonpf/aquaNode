$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$cli = Get-Command arduino-cli -ErrorAction Stop
$log = Join-Path $root 'checks/firmware_build.txt'
& $cli.Source version 2>&1 | Out-File $log
& $cli.Source core list 2>&1 | Out-File $log -Append
& $cli.Source lib list 2>&1 | Out-File $log -Append
# Install esp32 core, OneWire, DallasTemperature through Arduino's official manager first.
# Verify FQBN/options using arduino-cli board details for your installed core.
& $cli.Source compile --fqbn 'esp32:esp32:XIAO_ESP32S3:CDCOnBoot=cdc' --warnings all --output-dir (Join-Path $root 'build/ec_bench') (Join-Path $root 'firmware/ec_bench') 2>&1 | Out-File $log -Append
if ($LASTEXITCODE -ne 0) { throw 'ESP32 compilation failed; inspect checks/firmware_build.txt' }
Write-Output 'Compilation finished. This is not a hardware test.'
