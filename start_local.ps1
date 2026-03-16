$python = "C:\Users\Dima\AppData\Local\Programs\Python\Python310\python.exe"

if (-not (Test-Path $python)) {
  Write-Error "Python не найден по пути $python"
  exit 1
}

if (-not $env:GEMINI_API_KEY) {
  $secureKey = Read-Host "Введите GEMINI_API_KEY" -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
  $env:GEMINI_API_KEY = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
}

Set-Location $PSScriptRoot
& $python server.py
