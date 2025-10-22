import { Router } from "express";
import { ticketController } from "./ticket.controller";
import {
  validateCreateTicket,
  validateTicketId,
  validateUpdateStatus,
  validateTicketFilters,
} from "../../middleware/validation.middleware";

const router = Router();

/**
 * @openapi
 * /api/tickets:
 *   post:
 *     tags:
 *       - Tickets
 *     summary: Create a new support ticket
 *     description: Creates a new ticket and automatically analyzes its priority using AI
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *             properties:
 *               description:
 *                 type: string
 *                 description: Detailed description of the issue or inquiry
 *                 example: "No puedo iniciar sesión, la pantalla se queda en blanco después de ingresar mis credenciales"
 *     responses:
 *       201:
 *         description: Ticket created successfully with AI-analyzed priority
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Internal server error
 */
router.post("/", validateCreateTicket, ticketController.createTicket);

/**
 * @openapi
 * /api/tickets:
 *   get:
 *     tags:
 *       - Tickets
 *     summary: Get all tickets
 *     description: Retrieves all tickets with optional filtering by status or priority
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ABIERTO, EN_PROCESO, CERRADO]
 *         description: Filter tickets by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [BAJA, MEDIA, ALTA, CRITICA]
 *         description: Filter tickets by priority
 *     responses:
 *       200:
 *         description: List of tickets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticket'
 *       500:
 *         description: Internal server error
 */
router.get("/", validateTicketFilters, ticketController.getAllTickets);

/**
 * @openapi
 * /api/tickets/{id}:
 *   get:
 *     tags:
 *       - Tickets
 *     summary: Get a specific ticket
 *     description: Retrieves a ticket by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", validateTicketId, ticketController.getTicketById);

/**
 * @openapi
 * /api/tickets/{id}/status:
 *   patch:
 *     tags:
 *       - Tickets
 *     summary: Update ticket status
 *     description: Updates the status of an existing ticket
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ABIERTO, EN_PROCESO, CERRADO]
 *                 example: "EN_PROCESO"
 *     responses:
 *       200:
 *         description: Ticket status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/:id/status",
  validateTicketId,
  validateUpdateStatus,
  ticketController.updateTicketStatus
);

export default router;
