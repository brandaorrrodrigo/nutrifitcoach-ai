param(
  [string]$LibraryPath = "D:\NFC\Scripts\library\library_md",
  [string]$OutFile = "library_vector_db.json",
  [string]$OllamaUrl = "http://127.0.0.1:11434",
  [string]$Model = "all-minilm",
  [int]$ChunkSize = 500,
  [int]$ChunkOverlap = 60,
  [int]$ThrottleMs = 350,
  [int]$CheckpointEvery = 300,
  [int]$MaxFailStreak = 60,
  [int]$MaxFiles = 0,
  [int]$MaxChunks = 0
)

# =============== Utils de Sanitização ===============
function Remove-EmojisAndControls([string]$s) {
  if (-not $s) { return "" }
  # Mantém ASCII visível + Latin-1/Latin Ext.; remove demais
  $s = [System.Text.RegularExpressions.Regex]::Replace($s, '[^\u0009\u000A\u000D\u0020-\u007E\u00A0-\u024F]', '')
  return $s
}

function Strip-HTML-Markdown([string]$s) {
  if (-not $s) { return "" }
  # Remove blocos de código ``` ```
  $s = [System.Text.RegularExpressions.Regex]::Replace($s, '```[\s\S]*?```', '', [System.Text.RegularExpressions.RegexOptions]::Singleline)
  # Remove linhas de tabela simples contendo pipes
  $s = [System.Text.RegularExpressions.Regex]::Replace($s, '^\s*\|.*\|\s*$', '', [System.Text.RegularExpressions.RegexOptions]::Multiline)
  # Remove tags HTML
  $s = [System.Text.RegularExpressions.Regex]::Replace($s, '<[^>]+>', ' ')
  # Remove imagens markdown ![alt](url)
  $s = [System.Text.RegularExpressions.Regex]::Replace($s, '!\[[^\]]*\]\([^)]+\)', ' ')
  # Remove links markdown [text](url)
  $s = [System.Text.RegularExpressions.Regex]::Replace($s, '\[[^\]]*\]\([^)]+\)', ' ')
  # Normaliza espaços/linhas
  $s = [System.Text.RegularExpressions.Regex]::Replace($s, '[\t ]{2,}', ' ')
  $s = [System.Text.RegularExpressions.Regex]::Replace($s, '(\r?\n){3,}', "`n`n")
  return $s.Trim()
}

function Normalize-Text([string]$s) {
  if (-not $s) { return "" }
  $s = $s -replace "`r`n", "`n"
  $s = Strip-HTML-Markdown $s
  $s = Remove-EmojisAndControls $s
  return $s.Trim()
}

function Normalize-Text-Hard([string]$s) {
  if (-not $s) { return "" }
  $s = $s -replace "`r`n", "`n"
  $s = Strip-HTML-Markdown $s
  # Mantém letras/números/pontuação comum e quebras
  $s = [System.Text.RegularExpressions.Regex]::Replace($s, '[^0-9A-Za-zÀ-ÖØ-öø-ÿ\.\,\;\:\-\+\*\(\)\[\]\{\}\!\?\"''\/\%\&\=\s\n]', ' ')
  $s = [System.Text.RegularExpressions.Regex]::Replace($s, '[\t ]{2,}', ' ')
  $s = [System.Text.RegularExpressions.Regex]::Replace($s, '(\n){3,}', "`n`n")
  $s = Remove-EmojisAndControls $s
  return $s.Trim()
}

function Clamp-Text([string]$s, [int]$maxLen = 1200) {
  if (-not $s) { return "" }
  if ($s.Length -le $maxLen) { return $s }
  return $s.Substring(0, $maxLen)
}

# =============== Núcleo RAG ===============
function Get-Files($root) {
  if (-not (Test-Path $root)) { throw "Caminho da biblioteca não encontrado: $root" }
  Get-ChildItem -Path $root -Recurse -File -Include *.md,*.txt
}

function Chunk-Text([string]$text, [int]$size, [int]$overlap) {
  $chunks = @()
  if (-not $text) { return $chunks }
  $len = $text.Length
  $start = 0
  while ($start -lt $len) {
    $end = [Math]::Min($start + $size, $len)
    $chunk = $text.Substring($start, $end - $start).Trim()
    if ($chunk.Length -gt 0) { $chunks += $chunk }
    if ($end -ge $len) { break }
    $start = $end - [Math]::Min($overlap, $end)
  }
  return $chunks
}

function Try-Embedding([string]$payloadText, [string]$url, [string]$model) {
  $bodyObj = @{ model = $model; prompt = $payloadText }
  $body = $bodyObj | ConvertTo-Json -Depth 4
  try {
    $resp = Invoke-RestMethod -Method Post -Uri "$url/api/embeddings" -ContentType "application/json" -Body $body -TimeoutSec 300
    if ($resp -and $resp.embedding) { return ,$true, $resp.embedding, "" }
    else { throw "Sem campo 'embedding' na resposta." }
  } catch {
    $errMsg = $_.Exception.Message
    $respText = ""
    if ($_.Exception.Response -and $_.Exception.Response.GetResponseStream) {
      try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $respText = $reader.ReadToEnd()
      } catch {}
    }
    return ,$false, $null, ($errMsg + ($(if($respText){" | body: $respText"} else {""})))
  }
}

function Get-Embedding([string]$txt, [string]$url, [string]$model) {
  # 1) Normal + clamp 1200
  $t1 = Clamp-Text (Normalize-Text $txt) 1200
  $ok,$emb,$why = Try-Embedding $t1 $url $model
  if ($ok) { return $emb }

  # 2) Se 400, hard + clamp 800
  if ($why -match '400') {
    $t2 = Clamp-Text (Normalize-Text-Hard $txt) 800
    $ok2,$emb2,$why2 = Try-Embedding $t2 $url $model
    if ($ok2) { return $emb2 }

    # 3) Último recurso: ASCII básico + clamp 600
    $t3 = [System.Text.RegularExpressions.Regex]::Replace($t2, '[^\u0009\u000A\u000D\u0020-\u007E]', '')
    $t3 = Clamp-Text $t3 600
    $ok3,$emb3,$why3 = Try-Embedding $t3 $url $model
    if ($ok3) { return $emb3 }

    Write-Host ("⛔ 400 persistente. Último erro: {0}" -f $why3) -ForegroundColor Red
    return $null
  }

  # 4) Outros erros → backoff leve e re-tenta
  Start-Sleep -Seconds 2
  $ok4,$emb4,$why4 = Try-Embedding $t1 $url $model
  if ($ok4) { return $emb4 }

  Start-Sleep -Seconds 4
  $ok5,$emb5,$why5 = Try-Embedding $t1 $url $model
  if ($ok5) { return $emb5 }

  Write-Host ("⛔ Falha no embedding: {0}" -f $why5) -ForegroundColor Red
  return $null
}

# =============== Checkpoint / Resume ===============
$existing = @()
if (Test-Path $OutFile) {
  try {
    $rawJson = Get-Content $OutFile -Raw -Encoding UTF8
    if ($rawJson.Trim().StartsWith("[")) {
      $existing = ConvertFrom-Json $rawJson
      if (-not ($existing -is [System.Collections.IEnumerable])) { $existing = @() }
    }
  } catch { $existing = @() }
}
$seen = New-Object 'System.Collections.Generic.HashSet[string]'
foreach ($e in $existing) { if ($e -and $e.text) { [void]$seen.Add(($e.text)) } }

Write-Host "📚 Lendo biblioteca em: $LibraryPath" -ForegroundColor Cyan
$allFiles = Get-Files -root $LibraryPath
if ($MaxFiles -gt 0) { $allFiles = $allFiles | Select-Object -First $MaxFiles }
if (-not $allFiles -or $allFiles.Count -eq 0) { throw "Nenhum arquivo .md/.txt encontrado em $LibraryPath" }
Write-Host ("• {0} arquivos para processar" -f $allFiles.Count) -ForegroundColor Gray

# Estimativa simples
$totalChunks = 0
foreach ($f in $allFiles) {
  $raw = Get-Content $f.FullName -Raw -Encoding UTF8
  $norm = Normalize-Text $raw
  if ($norm.Length -eq 0) { continue }
  $approx = [Math]::Max([Math]::Ceiling($norm.Length / $ChunkSize),1)
  $totalChunks += $approx
}
Write-Host ("~{0} chunks estimados" -f $totalChunks) -ForegroundColor Gray

# Autoteste
$health = Get-Embedding -txt "healthcheck" -url $OllamaUrl -model $Model
if ($null -eq $health) { throw "❌ Falha no healthcheck de embedding com modelo '$Model' em $OllamaUrl." }

$vectorDB = New-Object System.Collections.Generic.List[Object]
foreach ($e in $existing) { $vectorDB.Add($e) }

$processed = 0
$failStreak = 0

foreach ($f in $allFiles) {
  $raw = Get-Content $f.FullName -Raw -Encoding UTF8
  $norm = Normalize-Text $raw
  if ($norm.Length -eq 0) { continue }

  $chunks = Chunk-Text -text $norm -size $ChunkSize -overlap $ChunkOverlap
  foreach ($c in $chunks) {
    if ($MaxChunks -gt 0 -and ($processed -ge $MaxChunks)) {
      Write-Host "⏹ Limite MaxChunks atingido — salvando e saindo." -ForegroundColor Yellow
      $vectorDB | ConvertTo-Json -Depth 6 | Set-Content -Path $OutFile -Encoding UTF8
      Write-Host "✅ Vector DB salvo (checkpoint): $OutFile" -ForegroundColor Green
      Write-Host ("🔎 Chunks indexados: {0}" -f $processed) -ForegroundColor Green
      exit 0
    }

    if ($seen.Contains($c)) { continue }
    if ($ThrottleMs -gt 0) { Start-Sleep -Milliseconds $ThrottleMs }

    $emb = Get-Embedding -txt $c -url $OllamaUrl -model $Model
    if ($null -eq $emb) {
      $failStreak++
      if ($failStreak -ge $MaxFailStreak) { throw "❌ Muitas falhas seguidas ($failStreak). Abortando." }
      continue
    }
    $failStreak = 0

    $vectorDB.Add([PSCustomObject]@{ text = $c; embedding = $emb })
    [void]$seen.Add($c)

    $processed++
    if (($processed % 25) -eq 0) {
      Write-Host (".. {0}/{1} chunks (+checkpoint {2})" -f $processed, $totalChunks, $CheckpointEvery)
    }
    if (($processed % $CheckpointEvery) -eq 0) {
      try {
        $vectorDB | ConvertTo-Json -Depth 6 | Set-Content -Path $OutFile -Encoding UTF8
        Write-Host ("💾 Checkpoint salvo: {0} entradas" -f $vectorDB.Count) -ForegroundColor DarkGreen
      } catch {
        Write-Host "⚠️  Falha ao salvar checkpoint (continua)." -ForegroundColor Yellow
      }
    }
  }
}

$vectorDB | ConvertTo-Json -Depth 6 | Set-Content -Path $OutFile -Encoding UTF8
Write-Host "✅ Vector DB salvo: $OutFile" -ForegroundColor Green
Write-Host ("🔎 Chunks indexados nesta execução: {0}" -f $processed) -ForegroundColor Green
