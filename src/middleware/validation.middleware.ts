import { Request, Response, NextFunction } from "express";
import { TicketStatus } from "../components/tickets/ticket.types";

/**
 * Validation middleware for ticket creation
 */
export const validateCreateTicket = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { description } = req.body;

  if (!description || typeof description !== "string") {
    res.status(400).json({
      error: "Validation error",
      message: "Description is required and must be a string",
    });
    return;
  }

  if (description.trim().length === 0) {
    res.status(400).json({
      error: "Validation error",
      message: "Description cannot be empty",
    });
    return;
  }

  if (description.length > 5000) {
    res.status(400).json({
      error: "Validation error",
      message: "Description cannot exceed 5000 characters",
    });
    return;
  }

  req.body.description = description.trim();

  next();
};

/**
 * Validation middleware for ticket ID parameter
 */
export const validateTicketId = (req: Request, res: Response, next: NextFunction): void => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id) || id <= 0) {
    res.status(400).json({
      error: "Validation error",
      message: "Invalid ticket ID. Must be a positive integer",
    });
    return;
  }

  req.params.id = id.toString();

  next();
};

/**
 * Validation middleware for updating ticket status
 */
export const validateUpdateStatus = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { status } = req.body;

  const validStatuses: TicketStatus[] = ["ABIERTO", "EN_PROCESO", "CERRADO"];

  if (!status || !validStatuses.includes(status)) {
    res.status(400).json({
      error: "Validation error",
      message: "Invalid status. Must be: ABIERTO, EN_PROCESO, or CERRADO",
    });
    return;
  }

  next();
};

/**
 * Validation middleware for query parameters (filters)
 */
export const validateTicketFilters = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { status, priority } = req.query;

  if (status) {
    const validStatuses: TicketStatus[] = ["ABIERTO", "EN_PROCESO", "CERRADO"];
    if (!validStatuses.includes(status as TicketStatus)) {
      res.status(400).json({
        error: "Validation error",
        message: "Invalid status filter. Must be: ABIERTO, EN_PROCESO, or CERRADO",
      });
      return;
    }
  }

  if (priority) {
    const validPriorities = ["BAJA", "MEDIA", "ALTA", "CRITICA"];
    if (!validPriorities.includes(priority as string)) {
      res.status(400).json({
        error: "Validation error",
        message: "Invalid priority filter. Must be: BAJA, MEDIA, ALTA, or CRITICA",
      });
      return;
    }
  }

  next();
};
