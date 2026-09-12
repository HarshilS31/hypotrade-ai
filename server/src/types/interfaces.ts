export interface StructuredExperiment {
  instrument: string;
  dropPercentage: number | null;
  holdingPeriodDays: number | null;
  missingParameters: string[];
  assumptionsMade: string[];
  hypothesesSummary: string;
}