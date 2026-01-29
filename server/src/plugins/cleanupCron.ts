import { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { DocumentRepository } from "../infrastructure/repositories/DocumentRepository";
import { StorageService } from "../infrastructure/services/StorageService";

const cleanupCronPlugin: FastifyPluginAsync = async (
  fastify: FastifyInstance,
) => {
  // Interval for the cron job (e.g., check every hour)
  const CHECK_INTERVAL_MS = 1000 * 60 * 60; // 1 hour

  // The age of documents to cleanup (24 hours)
  const CLEANUP_AGE_HOURS = 24;

  const runCleanup = async () => {
    fastify.log.info("[CleanupCron] Starting Google Drive cache cleanup...");

    try {
      // Resolve dependencies from the DI container (request-scoped)
      // Note: Since this is a background job not tied to a request, we need to create a scope or access singletons.
      // However, repositories are usually SCOPED in this project.
      // We will create a scope for this execution.

      const scope = fastify.diContainer.createScope();

      // We need to register a "fake" request or minimal context if the repository relies on request-scoped supabase client.
      // BUT, looking at container.ts:
      // - tokenQuotaRepository is SCOPED (needs supabase)
      // - documentRepository is SCOPED (needs supabase)
      // - supabaseClient is registered in 'onRequest' hook.

      // We need a Service Role Supabase client for this background job since there is no user request.
      // This is important: We cannot use the user's supabase client because there is no user.
      // We must check if we have a way to get a service role client.

      // Looking at `server.ts` or `container.ts`, we don't have a global admin supabase client registered.
      // We should create one here or rely on the `createUserClient` equivalent for admin.

      const { createClient } = await import("@supabase/supabase-js");
      const supabaseAdmin = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );

      // Register the admin client in our custom scope
      scope.register({
        supabaseClient: { resolve: () => supabaseAdmin },
      });

      const documentRepository =
        scope.resolve<DocumentRepository>("documentRepository");
      const storageService = scope.resolve<StorageService>("storageService");

      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - CLEANUP_AGE_HOURS);

      const oldDocs =
        await documentRepository.findOldCachedGoogleDocuments(cutoffDate);

      fastify.log.info(
        `[CleanupCron] Found ${oldDocs.length} cached Google Drive documents older than ${CLEANUP_AGE_HOURS} hours.`,
      );

      for (const doc of oldDocs) {
        const storagePath = doc.getStoragePath();
        if (storagePath) {
          try {
            fastify.log.info(
              `[CleanupCron] Deleting cache for document ${doc.getId()}...`,
            );

            // 1. Delete actual file from Supabase Storage
            await storageService.deleteFile(storagePath);

            // 2. Update DB to remove storage_path reference
            await documentRepository.updateDocumentStoragePath(
              doc.getId(),
              null,
            );

            fastify.log.info(
              `[CleanupCron] Successfully cleaned up cache for document ${doc.getId()}`,
            );
          } catch (error) {
            fastify.log.error(
              { error, documentId: doc.getId() },
              `[CleanupCron] Failed to cleanup cache for document ${doc.getId()}`,
            );
          }
        }
      }
    } catch (error) {
      fastify.log.error(
        { error },
        "[CleanupCron] Error during cleanup execution",
      );
    }
  };

  // Schedule the job
  const intervalId = setInterval(runCleanup, CHECK_INTERVAL_MS);

  // Initial run (optional, maybe wait a bit to ensure server is fully up)
  setTimeout(runCleanup, 1000 * 60); // Run 1 minute after startup

  // Graceful shutdown
  fastify.addHook("onClose", (instance, done) => {
    clearInterval(intervalId);
    done();
  });
};

export default fp(cleanupCronPlugin, {
  name: "cleanup-cron",
  dependencies: ["di-container-plugin"], // Ensure container is ready
});
