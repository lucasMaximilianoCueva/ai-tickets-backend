import { ticketRepository } from "../../../src/components/tickets/ticket.repository";
import { TicketStatus } from "../../../src/components/tickets/ticket.types";

describe("Ticket Repository - Unit Tests", () => {
  beforeEach(() => {
    // Clear repository before each test
    ticketRepository.clear();
  });

  describe("create", () => {
    it("should create a ticket with auto-generated ID", () => {
      const ticketData = {
        description: "Test ticket",
        priority: "MEDIA" as const,
        status: "ABIERTO" as TicketStatus,
      };

      const ticket = ticketRepository.create(ticketData);

      expect(ticket).toMatchObject({
        id: 1,
        description: "Test ticket",
        priority: "MEDIA",
        status: "ABIERTO",
      });
      expect(ticket.createdAt).toBeInstanceOf(Date);
    });

    it("should increment ID for each new ticket", () => {
      const ticketData = {
        description: "Test",
        priority: "BAJA" as const,
        status: "ABIERTO" as TicketStatus,
      };

      const ticket1 = ticketRepository.create(ticketData);
      const ticket2 = ticketRepository.create(ticketData);

      expect(ticket1.id).toBe(1);
      expect(ticket2.id).toBe(2);
    });
  });

  describe("findAll", () => {
    it("should return empty array when no tickets exist", () => {
      const tickets = ticketRepository.findAll();
      expect(tickets).toEqual([]);
    });

    it("should return all tickets", () => {
      ticketRepository.create({
        description: "Ticket 1",
        priority: "ALTA",
        status: "ABIERTO",
      });
      ticketRepository.create({
        description: "Ticket 2",
        priority: "BAJA",
        status: "CERRADO",
      });

      const tickets = ticketRepository.findAll();
      expect(tickets).toHaveLength(2);
    });

    it("should return a copy to prevent external mutations", () => {
      ticketRepository.create({
        description: "Test",
        priority: "MEDIA",
        status: "ABIERTO",
      });

      const tickets1 = ticketRepository.findAll();
      const tickets2 = ticketRepository.findAll();

      expect(tickets1).not.toBe(tickets2); // Different array references
      expect(tickets1).toEqual(tickets2); // Same content
    });
  });

  describe("findById", () => {
    it("should return ticket when ID exists", () => {
      const created = ticketRepository.create({
        description: "Test ticket",
        priority: "ALTA",
        status: "ABIERTO",
      });

      const found = ticketRepository.findById(created.id);

      expect(found).toEqual(created);
    });

    it("should return undefined when ID does not exist", () => {
      const found = ticketRepository.findById(999);
      expect(found).toBeUndefined();
    });
  });

  describe("updateStatus", () => {
    it("should update ticket status and set updatedAt", () => {
      const ticket = ticketRepository.create({
        description: "Test",
        priority: "MEDIA",
        status: "ABIERTO",
      });

      const updated = ticketRepository.updateStatus(ticket.id, "EN_PROCESO");

      expect(updated).toBeDefined();
      expect(updated?.status).toBe("EN_PROCESO");
      expect(updated?.updatedAt).toBeInstanceOf(Date);
    });

    it("should return undefined when ticket does not exist", () => {
      const updated = ticketRepository.updateStatus(999, "CERRADO");
      expect(updated).toBeUndefined();
    });
  });

  describe("findByStatus", () => {
    beforeEach(() => {
      ticketRepository.create({ description: "T1", priority: "ALTA", status: "ABIERTO" });
      ticketRepository.create({ description: "T2", priority: "MEDIA", status: "ABIERTO" });
      ticketRepository.create({ description: "T3", priority: "BAJA", status: "CERRADO" });
    });

    it("should return tickets with specified status", () => {
      const openTickets = ticketRepository.findByStatus("ABIERTO");
      expect(openTickets).toHaveLength(2);
      expect(openTickets.every((t) => t.status === "ABIERTO")).toBe(true);
    });

    it("should return empty array when no tickets match status", () => {
      const inProgress = ticketRepository.findByStatus("EN_PROCESO");
      expect(inProgress).toEqual([]);
    });
  });

  describe("findByPriority", () => {
    beforeEach(() => {
      ticketRepository.create({ description: "T1", priority: "CRITICA", status: "ABIERTO" });
      ticketRepository.create({ description: "T2", priority: "ALTA", status: "ABIERTO" });
      ticketRepository.create({ description: "T3", priority: "ALTA", status: "CERRADO" });
    });

    it("should return tickets with specified priority", () => {
      const highPriority = ticketRepository.findByPriority("ALTA");
      expect(highPriority).toHaveLength(2);
      expect(highPriority.every((t) => t.priority === "ALTA")).toBe(true);
    });

    it("should return empty array when no tickets match priority", () => {
      const lowPriority = ticketRepository.findByPriority("BAJA");
      expect(lowPriority).toEqual([]);
    });
  });

  describe("clear", () => {
    it("should remove all tickets and reset ID counter", () => {
      ticketRepository.create({ description: "T1", priority: "ALTA", status: "ABIERTO" });
      ticketRepository.create({ description: "T2", priority: "MEDIA", status: "ABIERTO" });

      ticketRepository.clear();

      expect(ticketRepository.findAll()).toEqual([]);

      const newTicket = ticketRepository.create({
        description: "T3",
        priority: "BAJA",
        status: "ABIERTO",
      });
      expect(newTicket.id).toBe(1); // ID reset to 1
    });
  });
});
