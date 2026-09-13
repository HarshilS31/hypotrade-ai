// Mirrors backend/types/interfaces.ts — keep these two files in sync by hand,
// or later replace with a shared package if the repo becomes a monorepo.

export interface StructuredExperiment {
  instrument: string;
  ticker: string;
  dropPercentage: number | null;
  holdingPeriodDays: number | null;
  missingParameters: string[];
  assumptionsMade: string[];
  hypothesesSummary: string;
}

export interface TradeRecord {
  entryDate: string; 
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  profitPercentage: number;
}

export interface BacktestResult {
  totalTrades: number;
  winRate: number;
  averageReturn: number;
  largestLoss: number;
  averageWinReturn: number;
  averageLossReturn: number;
  trades: TradeRecord[];
}

export interface AnalyzeResponse {
  success: true;
  experiment: StructuredExperiment;
  results: BacktestResult;
}

export interface AnalyzeErrorResponse {
  success: false;
  error: string;
}