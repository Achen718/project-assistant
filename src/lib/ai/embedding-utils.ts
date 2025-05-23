import { pipeline, env } from '@huggingface/transformers';
import type {
  FeatureExtractionPipeline,
  PipelineType,
  ProgressCallback,
} from '@huggingface/transformers';

// Optional: Configure Transformers.js environment
// env.allowLocalModels = false; // Default: true. Set to false to ensure download if not cached.
// env.localModelPath = '/path/to/models'; // If you want to store models in a specific directory
// env.cacheDir = '/path/to/cache'; // If you want to set a specific cache directory
// env.allowRemoteModels = true; // Default: true. Set to false to disable downloading models.

// Explicitly set the ONNX WebAssembly backend to use a single thread
// This can help prevent errors in some Node.js environments or with certain models.
if (env.backends.onnx && env.backends.onnx.wasm) {
  env.backends.onnx.wasm.numThreads = 1;
}

// Module-level store for the pipeline instance
let pipelineInstance: Promise<FeatureExtractionPipeline> | null = null;

const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';
const TASK_TYPE: PipelineType = 'feature-extraction';

/**
 * Initializes and returns the feature extraction pipeline.
 * Ensures that the pipeline is only initialized once.
 */
async function getPipelineInstance(
  progress_callback?: ProgressCallback
): Promise<FeatureExtractionPipeline> {
  if (pipelineInstance === null) {
    console.log(
      '[getPipelineInstance] Initializing new pipeline for model:',
      MODEL_NAME
    );
    // Using 'any' as a pragmatic workaround for potential complex type issues with the pipeline function,
    // then casting to the known expected Promise<FeatureExtractionPipeline>.
    // eslint-disable-next-line
    pipelineInstance = pipeline(TASK_TYPE, MODEL_NAME, {
      progress_callback,
    }) as any as Promise<FeatureExtractionPipeline>;
  }
  return pipelineInstance;
}

/**
 * Generates embeddings for an array of input texts using Transformers.js.
 *
 * @param texts An array of strings for which to generate embeddings.
 * @returns A Promise that resolves to an array of embedding vectors (arrays of numbers),
 *          or null if an error occurs.
 */
export async function generateEmbeddings(
  texts: string[]
): Promise<number[][] | null> {
  if (!texts || texts.length === 0) {
    console.warn('[generateEmbeddings] Called with no texts.');
    return [];
  }

  try {
    const extractor = await getPipelineInstance(); // Use the functional instance getter
    const embeddings: number[][] = [];
    for (const text of texts) {
      // Handle empty strings to avoid errors with some models if they can't process them
      const validText = text.trim() === '' ? ' ' : text.trim();
      const output = await extractor(validText, {
        pooling: 'mean',
        normalize: true,
      });
      // Ensure output.data is a flat array of numbers (Float32Array)
      if (output.data && typeof output.data[0] === 'number') {
        embeddings.push(Array.from(output.data as Float32Array));
      } else {
        console.warn(
          '[generateEmbeddings] Unexpected output structure for text:',
          validText,
          output
        );
        // Handle case where embedding might not be what's expected, e.g., push an array of zeros or skip
        // For now, let's skip if structure is wrong to avoid errors down the line.
      }
    }
    if (embeddings.length !== texts.length) {
      console.warn(
        '[generateEmbeddings] Mismatch between input text count and generated embeddings count.'
      );
      // This could happen if some texts resulted in unexpected output structure and were skipped.
    }
    return embeddings;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(
      `[generateEmbeddings] Error with Transformers.js: ${message}`,
      error
    );
    return null;
  }
}

/**
 * Generates an embedding for a single input text using Transformers.js.
 *
 * @param text The string for which to generate an embedding.
 * @returns A Promise that resolves to an embedding vector (array of numbers),
 *          or null if an error occurs.
 */
export async function generateEmbedding(
  text: string
): Promise<number[] | null> {
  if (!text || text.trim() === '') {
    console.warn('[generateEmbedding] Called with empty text.');
    return null;
  }
  try {
    const extractor = await getPipelineInstance(); // Use the functional instance getter
    // Handle empty strings to avoid errors with some models
    const validText = text.trim() === '' ? ' ' : text.trim();
    const output = await extractor(validText, {
      pooling: 'mean',
      normalize: true,
    });

    // Ensure output.data is a flat array of numbers (Float32Array)
    if (output.data && typeof output.data[0] === 'number') {
      return Array.from(output.data as Float32Array);
    }
    console.warn('[generateEmbedding] Unexpected output structure:', output);
    return null; // Or handle as an error appropriately
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(
      `[generateEmbedding] Error with Transformers.js: ${message}`,
      error
    );
    return null;
  }
}
