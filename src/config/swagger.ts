import swaggerJsdoc from "swagger-jsdoc";
import { SwaggerOptions } from "swagger-ui-express";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "AI Tickets API",
    version: "1.0.0",
    description:
      "Backend API for managing support tickets with AI-powered priority analysis using Gemini",
    contact: {
      name: "API Support",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
  ],
  components: {
    schemas: {
      Ticket: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            description: "Unique ticket identifier",
            example: 1,
          },
          description: {
            type: "string",
            description: "Detailed description of the issue or inquiry",
            example: "Cannot login, screen goes blank after entering credentials",
          },
          priority: {
            type: "string",
            enum: ["BAJA", "MEDIA", "ALTA", "CRITICA"],
            description: "AI-analyzed priority level",
            example: "ALTA",
          },
          status: {
            type: "string",
            enum: ["ABIERTO", "EN_PROCESO", "CERRADO"],
            description: "Current ticket status",
            example: "ABIERTO",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Timestamp when the ticket was created",
            example: "2024-01-15T10:30:00.000Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Timestamp when the ticket was last updated",
            example: "2024-01-15T11:45:00.000Z",
          },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: {
            type: "string",
            description: "Error type",
            example: "Validation error",
          },
          message: {
            type: "string",
            description: "Error message",
            example: "Description is required and cannot be empty",
          },
        },
      },
    },
  },
  tags: [
    {
      name: "Tickets",
      description: "Ticket management endpoints",
    },
    {
      name: "Health",
      description: "Health check endpoints",
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./src/components/**/*.routes.ts", "./src/app.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);

export const swaggerUiOptions: SwaggerOptions = {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "AI Tickets API Documentation",
};
