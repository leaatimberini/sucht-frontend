export interface SummaryMetrics {
  totalTicketsGenerated: number;
  totalPeopleAdmitted: number;
  totalEvents: number;
}

export interface EventPerformance {
  id: string;
  title: string;
  startDate: string;
  ticketsGenerated: number;
  peopleAdmitted: number;
}