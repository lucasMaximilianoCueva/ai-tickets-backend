import { ticketService } from "../../../src/components/tickets/ticket.service";
import { ticketRepository } from "../../../src/components/tickets/ticket.repository";
import * as geminiService from "../../../src/services/gemini.service";

// Mock dependencies
jest.mock("../../../src/components/tickets/ticket.repository");
jest.mock("../../../src/services/gemini.service");

describe("Ticket Service - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createNewTicket", () => {
    it("should create ticket with AI-analyzed priority", async () => {
      const mockPriority = "ALTA";
      const mockTicket = {
        id: 1,
        description: "System is down",
        priority: mockPriority,
        status: "ABIERTO" as const,
        createdAt: new Date(),
      };

      // Mock Gemini AI response
      jest.spyOn(geminiService, "analyzeTicketPriority").mockResolvedValue(mockPriority);

      // Mock repository create
      (ticketRepository.create as jest.Mock).mockReturnValue(mockTicket);

      const result = await ticketService.createNewTicket("System is down");

      expect(geminiService.analyzeTicketPriority).toHaveBeenCalledWith("System is down");
      expect(ticketRepository.create).toHaveBeenCalledWith({
        description: "System is down",
        priority: mockPriority,
        status: "ABIERTO",
      });
      expect(result).toEqual(mockTicket);
    });

    it("should trim description before creating ticket", async () => {
      const mockPriority = "MEDIA";
      const mockTicket = {
        id: 1,
        description: "Test ticket",
        priority: mockPriority,
        status: "ABIERTO" as const,
        createdAt: new Date(),
      };

      jest.spyOn(geminiService, "analyzeTicketPriority").mockResolvedValue(mockPriority);
      (ticketRepository.create as jest.Mock).mockReturnValue(mockTicket);

      await ticketService.createNewTicket("  Test ticket  ");

      expect(ticketRepository.create).toHaveBeenCalledWith({
        description: "Test ticket",
        priority: mockPriority,
        status: "ABIERTO",
      });
    });
  });

  describe("getAllTickets", () => {
    it("should return all tickets from repository", () => {
      const mockTickets = [
        { id: 1, description: "T1", priority: "ALTA", status: "ABIERTO", createdAt: new Date() },
        { id: 2, description: "T2", priority: "BAJA", status: "CERRADO", createdAt: new Date() },
      ];

      (ticketRepository.findAll as jest.Mock).mockReturnValue(mockTickets);

      const result = ticketService.getAllTickets();

      expect(ticketRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockTickets);
    });
  });

  describe("getTicketById", () => {
    it("should return ticket when found", () => {
      const mockTicket = {
        id: 1,
        description: "Test",
        priority: "MEDIA",
        status: "ABIERTO",
        createdAt: new Date(),
      };

      (ticketRepository.findById as jest.Mock).mockReturnValue(mockTicket);

      const result = ticketService.getTicketById(1);

      expect(ticketRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockTicket);
    });

    it("should return undefined when ticket not found", () => {
      (ticketRepository.findById as jest.Mock).mockReturnValue(undefined);

      const result = ticketService.getTicketById(999);

      expect(result).toBeUndefined();
    });
  });

  describe("updateTicketStatus", () => {
    it("should update ticket status", () => {
      const mockUpdatedTicket = {
        id: 1,
        description: "Test",
        priority: "ALTA",
        status: "EN_PROCESO" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (ticketRepository.updateStatus as jest.Mock).mockReturnValue(mockUpdatedTicket);

      const result = ticketService.updateTicketStatus(1, "EN_PROCESO");

      expect(ticketRepository.updateStatus).toHaveBeenCalledWith(1, "EN_PROCESO");
      expect(result).toEqual(mockUpdatedTicket);
    });

    it("should return undefined when ticket not found", () => {
      (ticketRepository.updateStatus as jest.Mock).mockReturnValue(undefined);

      const result = ticketService.updateTicketStatus(999, "CERRADO");

      expect(result).toBeUndefined();
    });
  });

  describe("getTicketsByStatus", () => {
    it("should return tickets filtered by status", () => {
      const mockTickets = [
        { id: 1, description: "T1", priority: "ALTA", status: "ABIERTO", createdAt: new Date() },
      ];

      (ticketRepository.findByStatus as jest.Mock).mockReturnValue(mockTickets);

      const result = ticketService.getTicketsByStatus("ABIERTO");

      expect(ticketRepository.findByStatus).toHaveBeenCalledWith("ABIERTO");
      expect(result).toEqual(mockTickets);
    });
  });

  describe("getTicketsByPriority", () => {
    it("should return tickets filtered by priority", () => {
      const mockTickets = [
        { id: 1, description: "T1", priority: "CRITICA", status: "ABIERTO", createdAt: new Date() },
      ];

      (ticketRepository.findByPriority as jest.Mock).mockReturnValue(mockTickets);

      const result = ticketService.getTicketsByPriority("CRITICA");

      expect(ticketRepository.findByPriority).toHaveBeenCalledWith("CRITICA");
      expect(result).toEqual(mockTickets);
    });
  });
});
