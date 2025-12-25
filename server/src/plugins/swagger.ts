import fp from "fastify-plugin";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";

// Export shared schemas for reuse
export const sharedSchemas = {
  ErrorResponse: {
    $id: "ErrorResponse",
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: false,
      },
      message: {
        type: "string",
        example: "Error message",
      },
      data: {
        type: "null",
      },
      error: {
        type: "object",
        properties: {
          message: {
            type: "string",
          },
          code: {
            type: "string",
          },
        },
      },
    },
  },
  UUID: {
    $id: "UUID",
    type: "string",
    format: "uuid",
    description: "UUID v4 identifier",
    example: "550e8400-e29b-41d4-a716-446655440000",
  },
  Timestamp: {
    $id: "Timestamp",
    type: "string",
    format: "date-time",
    description: "ISO 8601 timestamp",
    example: "2024-01-01T12:00:00Z",
  },
};

export default fp(async (fastify: FastifyInstance) => {
  // Register Swagger schema generator
  await fastify.register(fastifySwagger as any, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "Vollio API",
        description:
          "API documentation for Vollio - PDF annotation and note-taking platform",
        version: "1.0.0",
        contact: {
          name: "API Support",
          url: "https://github.com/gyro-mc/vollio",
        },
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Development server",
        },
        {
          url: process.env.API_URL || "https://api.vollio.app",
          description: "Production server",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "JWT Bearer token for authentication",
          },
          cookieAuth: {
            type: "apiKey",
            in: "cookie",
            name: "session",
            description: "Session cookie for authentication",
          },
        },
        schemas: {
          ErrorResponse: sharedSchemas.ErrorResponse,
          UUID: sharedSchemas.UUID,
          Timestamp: sharedSchemas.Timestamp,
        },
      },
      tags: [
        {
          name: "Notes",
          description: "Note management endpoints",
        },
        {
          name: "Files",
          description: "File and PDF management endpoints",
        },
        {
          name: "Folders",
          description: "Folder organization endpoints",
        },
        {
          name: "Highlights",
          description: "PDF highlight and annotation endpoints",
        },
        {
          name: "Google Classroom",
          description: "Google Classroom integration endpoints",
        },
        {
          name: "AI",
          description:
            "Generative AI endpoints for explanation and content generation",
        },
      ],
    },
  });

  // Register Swagger UI
  await fastify.register(fastifySwaggerUi, {
    routePrefix: "/api/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    } as any,
    staticCSP: true,
  });

  fastify.log.info("✅ Swagger documentation initialized at /api/docs");
});
