import { analyzeTicketPriority } from "../../services/gemini.service";
import { ticketRepository } from "./ticket.repository";
import { ITicket, TicketStatus } from "./ticket.types";

/**
 * Business logic layer for ticket operations
 */
export const ticketService = {
  /**
   * Creates a new ticket with AI-analyzed priority
   * @param description - Ticket description from user
   * @returns The created ticket with assigned priority
   */
  createNewTicket: async (description: string): Promise<ITicket> => {
    const priority = await analyzeTicketPriority(description);
    const newTicket = ticketRepository.create({
      description: description.trim(),
      priority: priority,
      status: "ABIERTO",
    });
    return newTicket;
  },

  /**
   * Retrieves all tickets
   * @returns Array of all tickets
   */
  getAllTickets: (): ITicket[] => {
    return ticketRepository.findAll();
  },

  /**
   * Retrieves a specific ticket by ID
   * @param id - Ticket identifier
   * @returns The ticket if found, undefined otherwise
   */
  getTicketById: (id: number): ITicket | undefined => {
    return ticketRepository.findById(id);
  },

  /**
   * Updates the status of a ticket
   * @param id - Ticket identifier
   * @param status - New status
   * @returns The updated ticket if found, undefined otherwise
   */
  updateTicketStatus: (id: number, status: TicketStatus): ITicket | undefined => {
    return ticketRepository.updateStatus(id, status);
  },

  /**
   * Filters tickets by status
   * @param status - Status to filter by
   * @returns Array of tickets with the specified status
   */
  getTicketsByStatus: (status: TicketStatus): ITicket[] => {
    return ticketRepository.findByStatus(status);
  },

  /**
   * Filters tickets by priority
   * @param priority - Priority level to filter by
   * @returns Array of tickets with the specified priority
   */
  getTicketsByPriority: (priority: string): ITicket[] => {
    return ticketRepository.findByPriority(priority);
  },
};
