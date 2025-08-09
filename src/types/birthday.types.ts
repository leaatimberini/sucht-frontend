// src/types/birthday.types.ts

import { Event } from "./event.types";

export interface BirthdayBenefit {
  id: string;
  entryQrId: string;
  giftQrId: string;
  userId: string;
  eventId: string;
  guestLimit: number;
  updatesRemaining: number;
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