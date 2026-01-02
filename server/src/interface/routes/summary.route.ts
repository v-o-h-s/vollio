import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyPluginOptions,
} from "fastify";
import {
  CreateSummaryDTO,
  CreateSummaryDTOSchema,
  DeleteSummaryDTO,
  DeleteSummaryDTOSchema,
  GetSummaryByDocumentIdDTO,
  GetSummaryByDocumentIdDTOSchema,
  GetSummaryByIdDTO,
  GetSummaryByIdDTOSchema,
  UpdateSummaryDTO,
  UpdateSummaryDTOSchema,
} from "../../shared/validation/summarySchema";
import { GenerateSummaryDTO, CreateQuizDTO } from "@vollio/shared";
import { GenerateSummaryDTOSchema } from "../../shared/validation/aiSchemas";
import { createQuizSchema } from "../../shared/validation/quizSchemas";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../shared/validation/validator";
import fp from "fastify-plugin";

const summaryHandler: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
): Promise<void> => {
  fastify.post<{ Body: GenerateSummaryDTO }>(
    `${opts.prefix}/generate`,
    {
      schema: {
        body: GenerateSummaryDTOSchema,
      },
      preHandler: validateBody(GenerateSummaryDTOSchema),
    },
    async (request, reply) => {
      const summaryController = request.diScope.resolve("summaryController");
      return summaryController.generateSummary(request, reply);
    }
  );

  fastify.post<{ Body: CreateSummaryDTO }>(
    `${opts.prefix}`,
    {
      schema: {
        body: CreateSummaryDTOSchema,
      },
      preHandler: validateBody(CreateSummaryDTOSchema),
    },
    async (request, reply) => {
      const summaryController = request.diScope.resolve("summaryController");
      return summaryController.generateSummary(request, reply);
    }
  );

  fastify.delete<{ Body: DeleteSummaryDTO }>(
    `${opts.prefix}`,
    {
      schema: {
        body: DeleteSummaryDTOSchema,
      },
      preHandler: validateBody(DeleteSummaryDTOSchema),
    },
    async (request, reply) => {
      const summaryController = request.diScope.resolve("summaryController");
      return summaryController.deleteSummary(request, reply);
    }
  );

  fastify.patch<{ Body: UpdateSummaryDTO }>(
    `${opts.prefix}`,
    {
      schema: {
        body: UpdateSummaryDTOSchema,
      },
      preHandler: validateBody(UpdateSummaryDTOSchema),
    },
    async (request, reply) => {
      const summaryController = request.diScope.resolve("summaryController");
      return summaryController.updateSummary(request, reply);
    }
  );

  fastify.get<{ Querystring: GetSummaryByDocumentIdDTO }>(
    `${opts.prefix}`,
    {
      schema: {
        querystring: GetSummaryByDocumentIdDTOSchema,
      },
      preHandler: validateQuery(GetSummaryByDocumentIdDTOSchema),
    },
    async (request, reply) => {
      const summaryController = request.diScope.resolve("summaryController");
      return summaryController.getSummariesByDocumentId(request, reply);
    }
  );

  fastify.get<{ Params: GetSummaryByIdDTO }>(
    `${opts.prefix}/:id`,
    {
      schema: {
        params: GetSummaryByIdDTOSchema,
      },
      preHandler: validateParams(GetSummaryByIdDTOSchema),
    },
    async (request, reply) => {
      const summaryController = request.diScope.resolve("summaryController");
      return summaryController.getSummaryById(request, reply);
    }
  );
};
export const summaryRoutes = fp(summaryHandler, {
  name: "summary-routes",
  fastify: "5.x",
});
