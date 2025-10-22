import request from "supertest";
import app from "../../src/app";
import { ticketRepository } from "../../src/components/tickets/ticket.repository";
import * as geminiService from "../../src/services/gemini.service";

// Mock Gemini service to avoid real API calls in tests
jest.mock("../../src/services/gemini.service");

describe("Tickets API - Integration Tests", () => {
  beforeEach(() => {
    // Clear repository before each test
    ticketRepository.clear();
    jest.clearAllMocks();
  });

  describe("POST /api/tickets", () => {
    it("should create a ticket with AI-analyzed priority", async () => {
      // Mock Gemini AI response
      jest.spyOn(geminiService, "analyzeTicketPriority").mockResolvedValue("ALTA");

      const response = await request(app)
        .post("/api/tickets")
        .send({
          description: "Cannot login, screen goes blank after entering credentials",
        })
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: 1,
          description: "Cannot login, screen goes blank after entering credentials",
          priority: "ALTA",
          status: "ABIERTO",
        },
      });
      expect(response.body.data.createdAt).toBeDefined();
      expect(geminiService.analyzeTicketPriority).toHaveBeenCalledWith(
        "Cannot login, screen goes blank after entering credentials"
      );
    });

    it("should return 400 when description is missing", async () => {
      const response = await request(app).post("/api/tickets").send({}).expect(400);

      expect(response.body).toMatchObject({
        error: "Validation error",
        message: "Description is required and must be a string",
      });
    });

    it("should return 400 when description is empty", async () => {
      const response = await request(app)
        .post("/api/tickets")
        .send({ description: "   " })
        .expect(400);

      expect(response.body).toMatchObject({
        error: "Validation error",
        message: "Description cannot be empty",
      });
    });

    it("should return 400 when description exceeds 5000 characters", async () => {
      const response = await request(app)
        .post("/api/tickets")
        .send({ description: "a".repeat(5001) })
        .expect(400);

      expect(response.body).toMatchObject({
        error: "Validation error",
        message: "Description cannot exceed 5000 characters",
      });
    });

    it("should trim whitespace from description", async () => {
      jest.spyOn(geminiService, "analyzeTicketPriority").mockResolvedValue("MEDIA");

      const response = await request(app)
        .post("/api/tickets")
        .send({ description: "  Test ticket  " })
        .expect(201);

      expect(response.body.data.description).toBe("Test ticket");
    });
  });

  describe("GET /api/tickets", () => {
    beforeEach(async () => {
      // Create test tickets
      jest.spyOn(geminiService, "analyzeTicketPriority").mockResolvedValue("ALTA");
      await request(app).post("/api/tickets").send({ description: "Ticket 1" });

      jest.spyOn(geminiService, "analyzeTicketPriority").mockResolvedValue("BAJA");
      await request(app).post("/api/tickets").send({ description: "Ticket 2" });

      jest.spyOn(geminiService, "analyzeTicketPriority").mockResolvedValue("CRITICA");
      await request(app).post("/api/tickets").send({ description: "Ticket 3" });
    });

    it("should return all tickets", async () => {
      const response = await request(app).get("/api/tickets").expect(200);

      expect(response.body).toMatchObject({
        success: true,
        count: 3,
      });
      expect(response.body.data).toHaveLength(3);
    });

    it("should filter tickets by status", async () => {
      // Update one ticket to EN_PROCESO
      await request(app).patch("/api/tickets/1/status").send({ status: "EN_PROCESO" });

      const response = await request(app).get("/api/tickets?status=EN_PROCESO").expect(200);

      expect(response.body.count).toBe(1);
      expect(response.body.data[0].status).toBe("EN_PROCESO");
    });

    it("should filter tickets by priority", async () => {
      const response = await request(app).get("/api/tickets?priority=CRITICA").expect(200);

      expect(response.body.count).toBe(1);
      expect(response.body.data[0].priority).toBe("CRITICA");
    });

    it("should return 400 for invalid status filter", async () => {
      const response = await request(app).get("/api/tickets?status=INVALID").expect(400);

      expect(response.body).toMatchObject({
        error: "Validation error",
        message: "Invalid status filter. Must be: ABIERTO, EN_PROCESO, or CERRADO",
      });
    });

    it("should return 400 for invalid priority filter", async () => {
      const response = await request(app).get("/api/tickets?priority=INVALID").expect(400);

      expect(response.body).toMatchObject({
        error: "Validation error",
        message: "Invalid priority filter. Must be: BAJA, MEDIA, ALTA, or CRITICA",
      });
    });
  });

  describe("GET /api/tickets/:id", () => {
    beforeEach(async () => {
      jest.spyOn(geminiService, "analyzeTicketPriority").mockResolvedValue("MEDIA");
      await request(app).post("/api/tickets").send({ description: "Test ticket" });
    });

    it("should return ticket by ID", async () => {
      const response = await request(app).get("/api/tickets/1").expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: 1,
          description: "Test ticket",
          priority: "MEDIA",
          status: "ABIERTO",
        },
      });
    });

    it("should return 404 when ticket does not exist", async () => {
      const response = await request(app).get("/api/tickets/999").expect(404);

      expect(response.body).toMatchObject({
        error: "Not found",
        message: "Ticket with ID 999 not found",
      });
    });

    it("should return 400 for invalid ID format", async () => {
      const response = await request(app).get("/api/tickets/abc").expect(400);

      expect(response.body).toMatchObject({
        error: "Validation error",
        message: "Invalid ticket ID. Must be a positive integer",
      });
    });

    it("should return 400 for negative ID", async () => {
      const response = await request(app).get("/api/tickets/-1").expect(400);

      expect(response.body.error).toBe("Validation error");
    });
  });

  describe("PATCH /api/tickets/:id/status", () => {
    beforeEach(async () => {
      jest.spyOn(geminiService, "analyzeTicketPriority").mockResolvedValue("ALTA");
      await request(app).post("/api/tickets").send({ description: "Test ticket" });
    });

    it("should update ticket status to EN_PROCESO", async () => {
      const response = await request(app)
        .patch("/api/tickets/1/status")
        .send({ status: "EN_PROCESO" })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: 1,
          status: "EN_PROCESO",
        },
      });
      expect(response.body.data.updatedAt).toBeDefined();
    });

    it("should update ticket status to CERRADO", async () => {
      const response = await request(app)
        .patch("/api/tickets/1/status")
        .send({ status: "CERRADO" })
        .expect(200);

      expect(response.body.data.status).toBe("CERRADO");
    });

    it("should return 404 when ticket does not exist", async () => {
      const response = await request(app)
        .patch("/api/tickets/999/status")
        .send({ status: "CERRADO" })
        .expect(404);

      expect(response.body).toMatchObject({
        error: "Not found",
        message: "Ticket with ID 999 not found",
      });
    });

    it("should return 400 for invalid status", async () => {
      const response = await request(app)
        .patch("/api/tickets/1/status")
        .send({ status: "INVALID_STATUS" })
        .expect(400);

      expect(response.body).toMatchObject({
        error: "Validation error",
        message: "Invalid status. Must be: ABIERTO, EN_PROCESO, or CERRADO",
      });
    });

    it("should return 400 when status is missing", async () => {
      const response = await request(app).patch("/api/tickets/1/status").send({}).expect(400);

      expect(response.body.error).toBe("Validation error");
    });

    it("should return 400 for invalid ticket ID", async () => {
      const response = await request(app)
        .patch("/api/tickets/abc/status")
        .send({ status: "CERRADO" })
        .expect(400);

      expect(response.body.error).toBe("Validation error");
    });
  });

  describe("GET /health", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.body).toMatchObject({
        status: "OK",
      });
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Complete workflow", () => {
    it("should handle complete ticket lifecycle", async () => {
      // 1. Create ticket
      jest.spyOn(geminiService, "analyzeTicketPriority").mockResolvedValue("CRITICA");
      const createResponse = await request(app)
        .post("/api/tickets")
        .send({ description: "Payment system is down" })
        .expect(201);

      const ticketId = createResponse.body.data.id;
      expect(createResponse.body.data.status).toBe("ABIERTO");
      expect(createResponse.body.data.priority).toBe("CRITICA");

      // 2. Get ticket by ID
      const getResponse = await request(app).get(`/api/tickets/${ticketId}`).expect(200);
      expect(getResponse.body.data.id).toBe(ticketId);

      // 3. Update to EN_PROCESO
      const updateResponse1 = await request(app)
        .patch(`/api/tickets/${ticketId}/status`)
        .send({ status: "EN_PROCESO" })
        .expect(200);
      expect(updateResponse1.body.data.status).toBe("EN_PROCESO");

      // 4. Update to CERRADO
      const updateResponse2 = await request(app)
        .patch(`/api/tickets/${ticketId}/status`)
        .send({ status: "CERRADO" })
        .expect(200);
      expect(updateResponse2.body.data.status).toBe("CERRADO");

      // 5. Verify in list
      const listResponse = await request(app).get("/api/tickets").expect(200);
      expect(listResponse.body.count).toBe(1);
      expect(listResponse.body.data[0].status).toBe("CERRADO");
    });
  });
});
