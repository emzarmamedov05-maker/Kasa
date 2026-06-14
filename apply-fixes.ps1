$root = (Get-Location).Path
$changes = @(
  @{file='index.tsx'; old="import App from './App';"; new="import App from './App.tsx';"},
  @{file='App.tsx'; old="from './types';"; new="from './types.ts';"},
  @{file='App.tsx'; old="import SummaryHeader from './components/SummaryHeader';"; new="import SummaryHeader from './components/SummaryHeader.tsx';"},
  @{file='App.tsx'; old="import BarberGrid from './components/BarberGrid';"; new="import BarberGrid from './components/BarberGrid.tsx';"},
  @{file='App.tsx'; old="import ExpenseManager from './components/ExpenseManager';"; new="import ExpenseManager from './components/ExpenseManager.tsx';"},
  @{file='App.tsx'; old="import IncomeManager from './components/IncomeManager';"; new="import IncomeManager from './components/IncomeManager.tsx';"},
  @{file='App.tsx'; old="import CosmeticProductManager from './components/CosmeticProductManager';"; new="import CosmeticProductManager from './components/CosmeticProductManager.tsx';"},
  @{file='App.tsx'; old="import HistoryManager from './components/HistoryManager';"; new="import HistoryManager from './components/HistoryManager.tsx';"},
  @{file='App.tsx'; old="import HistorySearch from './components/HistorySearch';"; new="import HistorySearch from './components/HistorySearch.tsx';"},
  @{file='App.tsx'; old="import SyncPanel from './components/SyncPanel';"; new="import SyncPanel from './components/SyncPanel.tsx';"},

  @{file='components\BarberCard.tsx'; old="from '../types';"; new="from '../types.ts';"},
  @{file='components\CosmeticProductManager.tsx'; old="from '../types';"; new="from '../types.ts';"},
  @{file='components\HistoryManager.tsx'; old="from '../types';"; new="from '../types.ts';"},
  @{file='components\HistorySearch.tsx'; old="from '../types';"; new="from '../types.ts';"},
  @{file='components\BarberGrid.tsx'; old="from '../types';"; new="from '../types.ts';"},
  @{file='components\BarberGrid.tsx'; old="import BarberCard from './BarberCard';"; new="import BarberCard from './BarberCard.tsx';"},
  @{file='components\ExpenseManager.tsx'; old="from '../types';"; new="from '../types.ts';"},
  @{file='components\IncomeManager.tsx'; old="from '../types';"; new="from '../types.ts';"},
  @{file='components\SummaryHeader.tsx'; old="from '../types';"; new="from '../types.ts';"}
)

foreach ($c in $changes) {
  $path = Join-Path $root $c.file
  if (Test-Path $path) {
    $content = Get-Content -Raw -LiteralPath $path
    $new = $content -replace [regex]::Escape($c.old), $c.new
    if ($new -ne $content) {
      Set-Content -LiteralPath $path -Value $new -Encoding UTF8
      Write-Host "Patched: $c.file"
    }
  } else {
    Write-Host "Missing file: $c.file"
  }
}
Write-Host 'Replacement run complete.'