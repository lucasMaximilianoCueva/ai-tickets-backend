import { Request, Response } from "express";
import { ticketService } from "./ticket.service";
import { CreateTicketDTO, UpdateTicketStatusDTO, TicketStatus } from "./ticket.types";

/**
 * Controller layer for ticket endpoints
 * Handles HTTP requests and responses
 */
export const ticketController = {
  /**
   * POST /tickets
   * Creates a new support ticket
   * Validation is handled by middleware
   */
  createTicket: async (req: Request, res: Response): Promise<void> => {
    try {
      const { description }: CreateTicketDTO = req.body;

      const newTicket = await ticketService.createNewTicket(description);

      res.status(201).json({
        success: true,
        data: newTicket,
      });
    } catch (error) {
      console.error("Error creating ticket:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to create ticket",
      });
    }
  },

  /**
   * GET /tickets
   * Retrieves all tickets with optional filters
   * Validation is handled by middleware
   */
  getAllTickets: (req: Request, res: Response): void => {
    try {
      const { status, priority } = req.query;

      let tickets;

      if (status) {
        tickets = ticketService.getTicketsByStatus(status as TicketStatus);
      } else if (priority) {
        tickets = ticketService.getTicketsByPriority(priority as string);
      } else {
        tickets = ticketService.getAllTickets();
      }

      res.status(200).json({
        success: true,
        count: tickets.length,
        data: tickets,
      });
    } catch (error) {
      console.error("Error retrieving tickets:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to retrieve tickets",
      });
    }
  },

  /**
   * GET /tickets/:id
   * Retrieves a specific ticket by ID
   * Validation is handled by middleware
   */
  getTicketById: (req: Request, res: Response): void => {
    try {
      const id = parseInt(req.params.id, 10);
      const ticket = ticketService.getTicketById(id);

      if (!ticket) {
        res.status(404).json({
          error: "Not found",
          message: `Ticket with ID ${id} not found`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      console.error("Error retrieving ticket:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to retrieve ticket",
      });
    }
  },

  /**
   * PATCH /tickets/:id/status
   * Updates the status of a ticket
   * Validation is handled by middleware
   */
  updateTicketStatus: (req: Request, res: Response): void => {
    try {
      const id = parseInt(req.params.id, 10);
      const { status }: UpdateTicketStatusDTO = req.body;

      const updatedTicket = ticketService.updateTicketStatus(id, status);

      if (!updatedTicket) {
        res.status(404).json({
          error: "Not found",
          message: `Ticket with ID ${id} not found`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedTicket,
      });
    } catch (error) {
      console.error("Error updating ticket status:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to update ticket status",
      });
    }
  },
};
