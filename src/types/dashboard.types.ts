// src/types/dashboard.types.ts
import { Ticket } from "./ticket.types";

export interface SummaryMetrics {
    totalTicketsGenerated: number;
    totalPeopleAdmitted: number;
    totalVIPTicketsGenerated: number;
    totalVIPPeopleAdmitted: number;
    totalEvents: number;
}

export interface EventPerformance {
    id: string;
    title: string;
    startDate: string;
    ticketsGenerated: number;
    peopleAdmitted: number;
    vipTicketsGenerated: number;
    vipPeopleAdmitted: number;
}

// --- NUEVOS TIPOS ---

export interface RRPPPerformance {
    rrppId: string;
    rrppName: string;
    ticketsGenerated: number;
    peopleAdmitted: number;
    vipTicketsGenerated: number;
    vipPeopleAdmitted: number;
}

export interface MyRRPPStats {
    ticketsGenerated: number;
    peopleAdmitted: number;
    vipTicketsGenerated: number;
    vipPeopleAdmitted: number;
    guestList: Guest[];
}

export interface Guest {
    id: string;
    status: Ticket['status'];
    redeemedCount: number;
    user: {
        name: string;
        email: string;
    };
    event: {
        title: string;
    };
    tier: {
        name: string;
    };
}