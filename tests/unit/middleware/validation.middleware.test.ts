import { Request, Response, NextFunction } from "express";
import {
  validateCreateTicket,
  validateTicketId,
  validateUpdateStatus,
  validateTicketFilters,
} from "../../../src/middleware/validation.middleware";

describe("Validation Middleware - Unit Tests", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe("validateCreateTicket", () => {
    it("should call next() when description is valid", () => {
      mockRequest.body = { description: "Valid ticket description" };

      validateCreateTicket(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should trim description and call next()", () => {
      mockRequest.body = { description: "  Trimmed description  " };

      validateCreateTicket(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body.description).toBe("Trimmed description");
      expect(mockNext).toHaveBeenCalled();
    });

    it("should return 400 when description is missing", () => {
      mockRequest.body = {};

      validateCreateTicket(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Validation error",
        message: "Description is required and must be a string",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 400 when description is not a string", () => {
      mockRequest.body = { description: 123 };

      validateCreateTicket(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 400 when description is empty after trim", () => {
      mockRequest.body = { description: "   " };

      validateCreateTicket(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Validation error",
        message: "Description cannot be empty",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 400 when description exceeds 5000 characters", () => {
      mockRequest.body = { description: "a".repeat(5001) };

      validateCreateTicket(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Validation error",
        message: "Description cannot exceed 5000 characters",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("validateTicketId", () => {
    it("should call next() when ID is valid", () => {
      mockRequest.params = { id: "123" };

      validateTicketId(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should return 400 when ID is not a number", () => {
      mockRequest.params = { id: "abc" };

      validateTicketId(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Validation error",
        message: "Invalid ticket ID. Must be a positive integer",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 400 when ID is zero", () => {
      mockRequest.params = { id: "0" };

      validateTicketId(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 400 when ID is negative", () => {
      mockRequest.params = { id: "-5" };

      validateTicketId(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("validateUpdateStatus", () => {
    it("should call next() when status is valid", () => {
      mockRequest.body = { status: "EN_PROCESO" };

      validateUpdateStatus(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should return 400 when status is missing", () => {
      mockRequest.body = {};

      validateUpdateStatus(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Validation error",
        message: "Invalid status. Must be: ABIERTO, EN_PROCESO, or CERRADO",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 400 when status is invalid", () => {
      mockRequest.body = { status: "INVALID_STATUS" };

      validateUpdateStatus(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should accept all valid statuses", () => {
      const validStatuses = ["ABIERTO", "EN_PROCESO", "CERRADO"];

      validStatuses.forEach((status) => {
        mockRequest.body = { status };
        mockNext = jest.fn();

        validateUpdateStatus(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });
    });
  });

  describe("validateTicketFilters", () => {
    it("should call next() when no filters provided", () => {
      mockRequest.query = {};

      validateTicketFilters(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should call next() when valid status filter provided", () => {
      mockRequest.query = { status: "ABIERTO" };

      validateTicketFilters(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("should call next() when valid priority filter provided", () => {
      mockRequest.query = { priority: "ALTA" };

      validateTicketFilters(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("should return 400 when status filter is invalid", () => {
      mockRequest.query = { status: "INVALID" };

      validateTicketFilters(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Validation error",
        message: "Invalid status filter. Must be: ABIERTO, EN_PROCESO, or CERRADO",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 400 when priority filter is invalid", () => {
      mockRequest.query = { priority: "INVALID" };

      validateTicketFilters(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Validation error",
        message: "Invalid priority filter. Must be: BAJA, MEDIA, ALTA, or CRITICA",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
