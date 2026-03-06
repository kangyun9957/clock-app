$port = 8080
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $port)
$listener.Start()
Write-Host "Server running at http://localhost:$port"
Write-Host "Press Ctrl+C to stop"

$mimeTypes = @{
    '.html' = 'text/html; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.js'   = 'application/javascript; charset=utf-8'
    '.json' = 'application/json'
    '.png'  = 'image/png'
    '.svg'  = 'image/svg+xml'
    '.ico'  = 'image/x-icon'
}

$root = 'C:\Users\철우\clock-app'

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = New-Object System.IO.StreamReader($stream)

        $requestLine = $reader.ReadLine()
        # Read headers
        while ($reader.ReadLine() -ne '') {}

        if ($requestLine -match '^GET\s+(/[^\s]*)\s+HTTP') {
            $path = $Matches[1]
            if ($path -eq '/') { $path = '/index.html' }
            $filePath = Join-Path $root ($path.Replace('/', '\'))

            if (Test-Path $filePath) {
                $ext = [System.IO.Path]::GetExtension($filePath)
                $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { 'application/octet-stream' }
                $body = [System.IO.File]::ReadAllBytes($filePath)
                $header = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
            } else {
                $body = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found')
                $header = "HTTP/1.1 404 Not Found`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
            }
        } else {
            $body = [System.Text.Encoding]::UTF8.GetBytes('400 Bad Request')
            $header = "HTTP/1.1 400 Bad Request`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
        }

        $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
        $stream.Write($headerBytes, 0, $headerBytes.Length)
        $stream.Write($body, 0, $body.Length)
        $stream.Flush()
        $client.Close()
    }
} finally {
    $listener.Stop()
}
