export interface StructuredExperiment {
  instrument: string;
  dropPercentage: number | null;
  holdingPeriodDays: number | null;
  missingParameters: string[];
  assumptionsMade: string[];
  hypothesesSummary: string;
  ticker:string;

}
export interface TradeRecord {
  entryDate: Date;
  exitDate: Date;
  entryPrice: number;
  exitPrice: number;
  profitPercentage: number;
}

export interface BacktestResult {
  totalTrades: number;
  winRate: number;
  averageReturn: number;
  trades: TradeRecord[];
}

interface ClosePrice {
  date: Date;
  close: number;
}