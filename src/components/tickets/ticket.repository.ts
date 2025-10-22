import { ITicket, TicketStatus } from "./ticket.types";

/**
 * In-memory database for tickets
 * Persists during server execution
 */
const tickets: ITicket[] = [];
let currentId = 1;

/**
 * Repository pattern for ticket data access
 */
export const ticketRepository = {
  /**
   * Creates a new ticket in the database
   * @param newTicketData - Ticket data without id and createdAt
   * @returns The created ticket with generated id and timestamp
   */
  create: (newTicketData: Omit<ITicket, "id" | "createdAt">): ITicket => {
    const ticket: ITicket = {
      ...newTicketData,
      id: currentId++,
      createdAt: new Date(),
    };
    tickets.push(ticket);
    return ticket;
  },

  /**
   * Retrieves all tickets
   * @returns Array of all tickets
   */
  findAll: (): ITicket[] => {
    return [...tickets];
  },

  /**
   * Finds a ticket by its ID
   * @param id - Ticket identifier
   * @returns The ticket if found, undefined otherwise
   */
  findById: (id: number): ITicket | undefined => {
    return tickets.find((t) => t.id === id);
  },

  /**
   * Updates a ticket's status
   * @param id - Ticket identifier
   * @param status - New status
   * @returns The updated ticket if found, undefined otherwise
   */
  updateStatus: (id: number, status: TicketStatus): ITicket | undefined => {
    const ticket = tickets.find((t) => t.id === id);
    if (ticket) {
      ticket.status = status;
      ticket.updatedAt = new Date();
      return ticket;
    }
    return undefined;
  },

  /**
   * Filters tickets by status
   * @param status - Status to filter by
   * @returns Array of tickets with the specified status
   */
  findByStatus: (status: TicketStatus): ITicket[] => {
    return tickets.filter((t) => t.status === status);
  },

  /**
   * Filters tickets by priority
   * @param priority - Priority level to filter by
   * @returns Array of tickets with the specified priority
   */
  findByPriority: (priority: string): ITicket[] => {
    return tickets.filter((t) => t.priority === priority);
  },

  /**
   * Clears all tickets (useful for testing)
   */
  clear: (): void => {
    tickets.length = 0;
    currentId = 1;
  },
};
