// src/types/birthday.types.ts

import { Event } from "./event.types";

export interface BirthdayBenefit {
  id: string;
  userId: string;
  eventId: string;
  description: string;
  guestLimit: number;
  guestsEntered: number;
  isEntryClaimed: boolean;
  entryClaimedAt: string | null;
  isGiftClaimed: boolean;
  giftClaimedAt: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  event: Event;
}