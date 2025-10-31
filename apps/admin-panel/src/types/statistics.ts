export interface DailyStatResponse {
  data: DailyStats;
}

export interface DailyStatsResponse {
  data: DailyStats[];
  count: number;
}

export interface MonthlyStatResponse {
  data: MonthlyStats;
}

export interface MonthlyStatsResponse {
  data: MonthlyStats[];
  count: number;
}

export interface DailyStats {
  id: string;

  date: Date;

  newUsers: number;
  activeUsers: number;

  newVisits: number;
  completedVisits: number;
  noShowVisits: number;

  traffic: number;

  revenueTetri: number;
  revenueInPersonTetri: number;
  revenueOnlineTetri: number;
  pendingTetri: number;

  transactionsCount: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface MonthlyStats {
  id: string;

  year: number;
  month: number;

  newUsers: number;
  activeUsers: number;

  newVisits: number;
  completedVisits: number;
  noShowVisits: number;

  traffic: number;

  revenueTetri: number;
  revenueInPersonTetri: number;
  revenueOnlineTetri: number;
  pendingTetri: number;

  transactionsCount: number;

  averageVisitTime: number;
  newVisitors: number;
  returningVisitors: number;
  conversionRatePercent?: number | null;
  averageAge?: number | null;

  bookingsByPortal?: Record<string, unknown> | null;
  topICDCodes?: Record<string, unknown> | null;

  createdAt: Date;
  updatedAt: Date;
}
