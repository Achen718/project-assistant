import { NextRequest, NextResponse } from 'next/server';
import {
  startIndexingPipeline,
  clearProjectEmbeddings,
} from '../../../lib/rag/indexing-pipeline';
import { getFirebaseUser } from '../../../lib/auth/firebase-auth-utils'; // Corrected import
import path from 'path';
import fs from 'fs/promises';

// Define a base path for projects. This should be configured securely.
// For local development, it might be a subdirectory in the user's home or project folder.
// IMPORTANT: In a production environment, this path validation needs to be very robust
// to prevent unauthorized file system access.
const ALLOWED_BASE_PROJECT_DIR =
  process.env.ALLOWED_PROJECTS_BASE_PATH ||
  path.resolve(
    'C:\\Users\\alvin\\OneDrive\\Desktop\\Projects\\' // Explicitly set your desired base path here
  );
// path.resolve(
//   process.env.HOME || process.env.USERPROFILE || '~',
//   'ai_assistant_projects'
// );

// Ensure the base directory exists or can be created (optional, based on requirements)
async function ensureBaseDir() {
  try {
    await fs.mkdir(ALLOWED_BASE_PROJECT_DIR, { recursive: true });
    console.log(
      `[ensureBaseDir] Ensured base project directory exists: ${ALLOWED_BASE_PROJECT_DIR}`
    );
  } catch (err) {
    console.warn(
      `[ensureBaseDir] Could not create or access base project directory: ${ALLOWED_BASE_PROJECT_DIR}`,
      err
    );
    // Depending on strictness, you might throw an error here if the directory is critical
  }
}
ensureBaseDir(); // Call once at startup

async function isSafeProjectPath(projectPath: string): Promise<boolean> {
  try {
    const resolvedPath = path.resolve(projectPath);
    // Security: Check if the resolved path is within the allowed base directory.
    // It must start with the base directory path followed by a path separator to avoid partial matches (e.g. /base/dir vs /base/directory)
    // Also allow the base directory itself.
    if (
      !resolvedPath.startsWith(ALLOWED_BASE_PROJECT_DIR + path.sep) &&
      resolvedPath !== ALLOWED_BASE_PROJECT_DIR
    ) {
      console.warn(
        `[isSafeProjectPath] Path traversal attempt or disallowed path: ${projectPath}. Resolved: ${resolvedPath}. Allowed base: ${ALLOWED_BASE_PROJECT_DIR}`
      );
      return false;
    }
    const stats = await fs.stat(resolvedPath);
    if (!stats.isDirectory()) {
      console.warn(
        `[isSafeProjectPath] Path is not a directory: ${resolvedPath}`
      );
      return false;
    }
    return true;
  } catch (error: unknown) {
    // Check for specific error codes if needed, e.g., for ENOENT
    if (
      error instanceof Error &&
      (error as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      console.warn(`[isSafeProjectPath] Directory not found: ${projectPath}`);
    } else if (error instanceof Error) {
      console.error(
        `[isSafeProjectPath] Error validating path ${projectPath}: ${error.message}`
      );
    } else {
      console.error(
        `[isSafeProjectPath] Unknown error validating path ${projectPath}:`,
        error
      );
    }
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const firebaseUser = await getFirebaseUser(request);
    if (!firebaseUser || !firebaseUser.uid) {
      return NextResponse.json(
        { error: 'Unauthorized or user ID missing' },
        { status: 401 }
      );
    }
    const userId = firebaseUser.uid; // Extract Firebase UID
    console.log(request);
    const body = await request.json();
    const { projectPath, projectId, resync } = body; // projectId from request is UUID for your projects table

    if (!projectPath || !projectId) {
      return NextResponse.json(
        { error: 'Missing projectPath or projectId' },
        { status: 400 }
      );
    }

    if (typeof projectPath !== 'string' || typeof projectId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid projectPath or projectId format' },
        { status: 400 }
      );
    }

    // Validate the projectPath
    if (!(await isSafeProjectPath(projectPath))) {
      return NextResponse.json(
        {
          error:
            'Invalid or unsafe project path. Ensure it is within the configured allowed directory and exists as a directory.',
        },
        { status: 400 }
      );
    }

    if (resync === true) {
      console.log(
        `[API index-project] User: ${userId}, Project: ${projectId}. Resync requested. Clearing existing embeddings.`
      );
      const clearResult = await clearProjectEmbeddings(projectId, userId); // Pass userId
      if (!clearResult.success) {
        console.warn(
          `[API index-project] User: ${userId}, Project: ${projectId}. Failed to clear embeddings: ${clearResult.error}`
        );
      }
    }

    console.log(
      `[API index-project] User: ${userId}, Project: ${projectId}. Indexing at path: ${projectPath}`
    );

    // Asynchronously start the indexing pipeline.
    // For production, consider a job queue system (e.g., BullMQ, Celery) for long-running tasks.
    startIndexingPipeline(projectPath, projectId, userId) // Pass userId
      .then((indexingResult) => {
        console.log(
          `[API index-project] User: ${userId}, Project: ${projectId}. Async indexing completed. Files: ${indexingResult.totalFilesProcessed}, Chunks: ${indexingResult.totalChunksCreated}, Stored: ${indexingResult.totalEmbeddingsStored}, Errors: ${indexingResult.errors.length}`
        );
        if (indexingResult.errors.length > 0) {
          console.warn(
            `[API index-project] User: ${userId}, Project: ${projectId}. Indexing completed with errors:`,
            indexingResult.errors
          );
        }
        // Example: Update a database status or send a notification
      })
      .catch((pipelineError) => {
        console.error(
          `[API index-project] User: ${userId}, Project: ${projectId}. Critical failure in async startIndexingPipeline:`,
          pipelineError
        );
        // Example: Update a database status to FAILED or send an alert
      });

    // Return an immediate acknowledgment response
    return NextResponse.json(
      {
        message:
          'Indexing process initiated successfully. Monitor server logs for progress and completion.',
        projectId: projectId,
        userId: userId,
        status: 'pending',
      },
      { status: 202 } // Accepted
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Internal server error in POST /api/index-project';
    console.error('[API index-project] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
