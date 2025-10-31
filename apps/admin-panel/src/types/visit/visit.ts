import {
  VisitType,
  File,
  VisitStatus,
  Portal,
  Currency,
  TransactionStatus
} from "..";
import { User } from "../user";
import { Service } from "../website";
import { ExaminationSheet } from "./examination-sheet";

export interface VisitResponse {
  data: Visit;
}

export interface VisitsResponse {
  data: Visit[];
  count: number;
}

export interface Visit {
  id: string;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  price?: number | null;
  type: VisitType;
  status: VisitStatus;
  portal: Portal;
  linkOfMeet?: string | null;
  followUpNeeded?: boolean | null;
  followUpStartDatePeriod?: string | null;
  followUpEndDatePeriod?: string | null;

  transaction?: Transaction | null;
  documents: File[];
  examinationSheet?: ExaminationSheet | null;

  user: User;
  userId: string;
  service: Service;
  serviceId: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface Transaction {
  id: string;

  visit: Visit;
  visitId: string;

  user: User;
  userId: string;

  paymentId?: string | null;
  amount: number;
  currency: Currency;
  status: TransactionStatus;

  paidAt?: string | null;
  refundedAt?: string | null;

  createdAt?: string;
  updatedAt?: string;
}
