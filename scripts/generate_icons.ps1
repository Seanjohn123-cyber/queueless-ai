Add-Type -AssemblyName System.Drawing

function Generate-AppIcon($size, $path) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    $rect = New-Object System.Drawing.Rectangle 0, 0, $size, $size
    $bgBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#0b1120'))
    $g.FillRectangle($bgBrush, $rect)

    $inset = [int]($size * 0.08)
    $innerSize = $size - ($inset * 2)
    $innerRect = New-Object System.Drawing.Rectangle $inset, $inset, $innerSize, $innerSize
    $blueBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#2563eb'))
    $g.FillEllipse($blueBrush, $innerRect)

    $pen = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml('#60a5fa')), ([float]($size * 0.035))
    $ringInset = [int]($size * 0.16)
    $ringSize = $size - ($ringInset * 2)
    $g.DrawEllipse($pen, $ringInset, $ringInset, $ringSize, $ringSize)

    $fontSize = [float]($size * 0.44)
    $font = New-Object System.Drawing.Font 'Segoe UI', $fontSize, ([System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $textRect = New-Object System.Drawing.RectangleF 0, ([float]($size * -0.02)), $size, $size
    $g.DrawString('Q', $font, $textBrush, $textRect, $sf)

    $dotSize = [int]($size * 0.12)
    $dotX = [int]($size * 0.65)
    $dotY = [int]($size * 0.65)
    $dotBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#10b981'))
    $g.FillEllipse($dotBrush, $dotX, $dotY, $dotSize, $dotSize)

    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

Generate-AppIcon 192 'public/icon-192.png'
Generate-AppIcon 512 'public/icon-512.png'
Generate-AppIcon 180 'public/apple-touch-icon.png'
Write-Host 'PWA App Icons created successfully!'
