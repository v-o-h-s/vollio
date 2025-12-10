import { FastifyRequest, FastifyReply } from "fastify";
import { GetAllHighlightsUseCase } from "../../application/use-cases/highlights/GetAllHighlightsUseCase";
import { CreateHighlightUseCase } from "../../application/use-cases/highlights/CreateHighlightUseCase";
import { GetHighlightByIdUseCase } from "../../application/use-cases/highlights/GetHighlightByIdUseCase";
import { UpdateHighlightUseCase } from "../../application/use-cases/highlights/UpdateHighlightUseCase";
import { DeleteHighlightUseCase } from "../../application/use-cases/highlights/DeleteHighlightUseCase";
import {
    CreateHighlightDTO,
    UpdateHighlightDTO,
    HighlightIdParams,
    GetHighlightsQuery,
} from "../../shared/validation/highlightSchemas";
import {
    CreateHighlightResponse,
    UpdateHighlightResponse,
    GetHighlightsResponse,
    GetHighlightByIdResponse,
    DeleteHighlightResponse,
    HighlightData,
} from "../../shared/types/responses/highlightRoutes";
import { FastifyBaseLogger } from "fastify";

export class HighlightController {
    constructor(
        private getAllHighlightsUseCase: GetAllHighlightsUseCase,
        private createHighlightUseCase: CreateHighlightUseCase,
        private getHighlightByIdUseCase: GetHighlightByIdUseCase,
        private updateHighlightUseCase: UpdateHighlightUseCase,
        private deleteHighlightUseCase: DeleteHighlightUseCase,
        private logger: FastifyBaseLogger
    ) { }

    /**
     * GET /api/v1/highlights - List user's highlights
     */
    async getAllHighlights(
        request: FastifyRequest<{ Querystring: GetHighlightsQuery }>,
        reply: FastifyReply
    ): Promise<void> {
        const userId = request.user?.id;
        if (!userId) {
            this.logger.warn("Unauthorized access attempt to fetch highlights");
            reply.status(401).send({
                success: false,
                message: "Unauthorized",
                data: null,
                error: "User must be authenticated",
            });
            return;
        }

        const highlights = await this.getAllHighlightsUseCase.execute({
            userId,
            pdfId: request.query.pdfId,
        });

        const highlightsData: HighlightData[] = highlights.map((h) =>
            h.toJSON() as HighlightData
        );

        reply.status(200).send({
            success: true,
            message: "Highlights retrieved successfully",
            data: highlightsData,
            error: null,
        } satisfies GetHighlightsResponse);
    }

    /**
     * POST /api/v1/highlights - Create a new highlight
     */
    async createHighlight(
        request: FastifyRequest<{ Body: CreateHighlightDTO }>,
        reply: FastifyReply
    ): Promise<void> {
        const userId = request.user?.id;
        if (!userId) {
            this.logger.warn("Unauthorized access attempt to create highlight");
            reply.status(401).send({
                success: false,
                message: "Unauthorized",
                data: null,
                error: "User must be authenticated",
            });
            return;
        }

        await this.createHighlightUseCase.execute({
            userId,
            pdfId: request.body.pdfId,
            type: request.body.type,
            content: request.body.content,
            position: request.body.position,
            color: request.body.color,
            hasNote: request.body.hasNote,
            noteId: request.body.noteId,
            tags: request.body.tags,
            style: request.body.style,
        });


        reply.status(201).send({
            success: true,
            message: "Highlight created successfully",
            data: null,
            error: null,
        } satisfies CreateHighlightResponse);
    }

    /**
     * GET /api/v1/highlights/:id - Get a specific highlight by ID
     */
    async getHighlightById(
        request: FastifyRequest<{ Params: HighlightIdParams }>,
        reply: FastifyReply
    ): Promise<void> {
        const userId = request.user?.id;
        if (!userId) {
            this.logger.warn("Unauthorized access attempt to fetch highlight");
            reply.status(401).send({
                success: false,
                message: "Unauthorized",
                data: null,
                error: "User must be authenticated",
            });
            return;
        }

        await this.getHighlightByIdUseCase.execute({
            userId,
            highlightId: request.params.id,
        });


        reply.status(200).send({
            success: true,
            message: "Highlight retrieved successfully",
            data: null,
            error: null,
        } satisfies GetHighlightByIdResponse);
    }

    /**
     * PATCH /api/v1/highlights/:id - Update a highlight
     */
    async updateHighlight(
        request: FastifyRequest<{ Params: HighlightIdParams; Body: UpdateHighlightDTO }>,
        reply: FastifyReply
    ): Promise<void> {
        const userId = request.user?.id;
        if (!userId) {
            this.logger.warn("Unauthorized access attempt to update highlight");
            reply.status(401).send({
                success: false,
                message: "Unauthorized",
                data: null,
                error: "User must be authenticated",
            });
            return;
        }

        await this.updateHighlightUseCase.execute({
            userId,
            highlightId: request.params.id,
            color: request.body.color,
            content: request.body.content,
            hasNote: request.body.hasNote,
            noteId: request.body.noteId,
            position: request.body.position,
            type: request.body.type,
            pdfId: request.body.pdfId,
            tags: request.body.tags,
            style: request.body.style,
        });


        reply.status(200).send({
            success: true,
            message: "Highlight updated successfully",
            data: null,
            error: null,
        } satisfies UpdateHighlightResponse);
    }

    /**
     * DELETE /api/v1/highlights/:id - Delete a highlight
     */
    async deleteHighlight(
        request: FastifyRequest<{ Params: HighlightIdParams }>,
        reply: FastifyReply
    ): Promise<void> {
        const userId = request.user?.id;
        if (!userId) {
            this.logger.warn("Unauthorized access attempt to delete highlight");
            reply.status(401).send({
                success: false,
                message: "Unauthorized",
                data: null,
                error: "User must be authenticated",
            });
            return;
        }

        await this.deleteHighlightUseCase.execute({
            userId,
            highlightId: request.params.id,
        });

        reply.status(200).send({
            success: true,
            message: "Highlight deleted successfully",
            data: null,
            error: null,
        } satisfies DeleteHighlightResponse);
    }
}
