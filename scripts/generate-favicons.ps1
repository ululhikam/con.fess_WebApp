<#
  generate-favicons.ps1
  ---------------------------------------------------------------------------
  Menurunkan set ikon situs dari master logo.

  Kenapa perlu: Google hanya memakai favicon yang berbentuk persegi dengan
  ukuran kelipatan 48 px (48/96/144/192). Aset lama 64 px & 32 px tidak
  memenuhi syarat itu, sehingga logo brand tidak muncul di hasil pencarian.

  Sumber:
    • public/logo.png  (192x192, tajam untuk skala kecil)
    • public/logo2.jpg (2048x2048, untuk turunan 512 px)

  Keluaran (semua di public/):
    favicon.ico            16 + 32 + 48 (PNG-embedded)
    favicon-48.png         48x48
    favicon-96.png         96x96
    favicon-144.png        144x144
    favicon-192.png        192x192
    icon-512.png           512x512

  Jalankan ulang hanya bila master logo berubah:
    powershell -ExecutionPolicy Bypass -File scripts/generate-favicons.ps1
#>

Add-Type -AssemblyName System.Drawing

$publicDir = Join-Path $PSScriptRoot '..\public' | Resolve-Path
$small = Join-Path $publicDir 'logo.png'
$large = Join-Path $publicDir 'logo2.jpg'

function Resize-Logo {
  param(
    [string]$SourcePath,
    [int]$Size,
    [string]$OutPath
  )

  $src = [System.Drawing.Image]::FromFile($SourcePath)
  try {
    $bmp = New-Object System.Drawing.Bitmap $Size, $Size
    try {
      $g = [System.Drawing.Graphics]::FromImage($bmp)
      try {
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.DrawImage($src, 0, 0, $Size, $Size)
      } finally {
        $g.Dispose()
      }
      $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $bmp.Dispose()
    }
  } finally {
    $src.Dispose()
  }
}

# --- PNG turunan (persegi, kelipatan 48) -----------------------------------
foreach ($size in 48, 96, 144, 192) {
  Resize-Logo -SourcePath $small -Size $size -OutPath (Join-Path $publicDir "favicon-$size.png")
  Write-Host "favicon-$size.png"
}
Resize-Logo -SourcePath $large -Size 512 -OutPath (Join-Path $publicDir 'icon-512.png')
Write-Host 'icon-512.png'

# --- favicon.ico (header ICONDIR + entri PNG) ------------------------------
$icoSizes = 16, 32, 48
$blobs = @()
foreach ($size in $icoSizes) {
  $tmp = Join-Path ([System.IO.Path]::GetTempPath()) "fnc-ico-$size.png"
  Resize-Logo -SourcePath $small -Size $size -OutPath $tmp
  $blobs += , @{ size = $size; bytes = [System.IO.File]::ReadAllBytes($tmp) }
  Remove-Item $tmp -Force
}

$icoPath = Join-Path $publicDir 'favicon.ico'
$fs = [System.IO.File]::Create($icoPath)
$bw = New-Object System.IO.BinaryWriter $fs
try {
  # ICONDIR
  $bw.Write([UInt16]0)               # reserved
  $bw.Write([UInt16]1)               # type = icon
  $bw.Write([UInt16]$blobs.Count)    # image count

  $offset = 6 + (16 * $blobs.Count)
  foreach ($blob in $blobs) {
    $bw.Write([Byte]$blob.size)      # width  (0 = 256, tidak dipakai di sini)
    $bw.Write([Byte]$blob.size)      # height
    $bw.Write([Byte]0)               # colour count
    $bw.Write([Byte]0)               # reserved
    $bw.Write([UInt16]1)             # colour planes
    $bw.Write([UInt16]32)            # bits per pixel
    $bw.Write([UInt32]$blob.bytes.Length)
    $bw.Write([UInt32]$offset)
    $offset += $blob.bytes.Length
  }

  foreach ($blob in $blobs) {
    $bw.Write($blob.bytes)
  }
} finally {
  $bw.Dispose()
  $fs.Dispose()
}
Write-Host "favicon.ico ($($blobs.Count) ukuran)"

Write-Host 'Selesai.'
