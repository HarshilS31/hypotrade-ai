import YahooFinance from 'yahoo-finance2';
import { StructuredExperiment,BacktestResult,TradeRecord,ClosePrice } from '../types/interfaces.js';
const yahooFinance = new YahooFinance();
export async function runBacktest(
  experiment: StructuredExperiment,
  options: { includeTrades?: boolean; maxTrades?: number } = {}
): Promise<BacktestResult> {
  const { includeTrades = true, maxTrades } = options;

  const ticker = experiment.ticker || '^NSEI';
  const dropThreshold = experiment.dropPercentage || 2.0;
  const holdDays = experiment.holdingPeriodDays || 5;

  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 5);

  let chartResult;
  try {
    chartResult = await yahooFinance.chart(ticker, {
      period1: startDate.toISOString().split('T')[0],
      interval: '1d',
    });
  } catch (err) {
    throw new Error(`Invalid or unsupported ticker symbol '${ticker}' provided for asset '${experiment.instrument}'.`);
  }

  const rawQuotes = chartResult?.quotes;

  if (!rawQuotes || rawQuotes.length === 0) {
    throw new Error(`No historical price data found for ticker: ${ticker}`);
  }
  const first = rawQuotes[0];
  if (typeof first !== 'object' || first === null || !('close' in first) || !('date' in first)) {
    throw new Error(`Unexpected data shape returned for ticker: ${ticker}`);
  }
  const closes: ClosePrice[] = rawQuotes
    .filter((row: any) => row.close != null && row.date != null)
    .map((row: any) => ({ date: row.date as Date, close: row.close as number }));

  const trades: TradeRecord[] = [];
  let winningTrades = 0;
  let cumulativeReturn = 0;
  let totalTrades = 0;

  for (let i = 1; i < closes.length - holdDays; i++) {
    const yesterday = closes[i - 1];
    const today = closes[i];

    const pctChange = ((today.close - yesterday.close) / yesterday.close) * 100;

    if (pctChange <= -dropThreshold) {
      const exitDay = closes[i + holdDays];
      if (!exitDay) continue;

      const entryPrice = today.close;
      const exitPrice = exitDay.close;
      const profitPercentage = ((exitPrice - entryPrice) / entryPrice) * 100;

      totalTrades++;
      if (profitPercentage > 0) winningTrades++;
      cumulativeReturn += profitPercentage;

      if (includeTrades && (maxTrades === undefined || trades.length < maxTrades)) {
        trades.push({
          entryDate: today.date,
          exitDate: exitDay.date,
          entryPrice,
          exitPrice,
          profitPercentage
        });
      }
    }
  }

  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const averageReturn = totalTrades > 0 ? cumulativeReturn / totalTrades : 0;

  return {
    totalTrades,
    winRate: Number(winRate.toFixed(2)),
    averageReturn: Number(averageReturn.toFixed(2)),
    trades
  };
}