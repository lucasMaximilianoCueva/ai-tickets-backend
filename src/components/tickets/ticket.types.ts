import { PriorityLevel } from "../../services/gemini.service";

export type TicketStatus = "ABIERTO" | "EN_PROCESO" | "CERRADO";

export interface ITicket {
  id: number;
  description: string;
  priority: PriorityLevel;
  status: TicketStatus;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateTicketDTO {
  description: string;
}

export interface UpdateTicketStatusDTO {
  status: TicketStatus;
}
