import {
  pipeline,
  type FeatureExtractionPipeline,
} from '@huggingface/transformers';
import { Embeddings, type EmbeddingsParams } from '@langchain/core/embeddings';

// Ensure you have `@huggingface/transformers` installed.
// Models are downloaded on first use and cached.

export interface TransformersJsEmbeddingsParams extends EmbeddingsParams {
  modelName?: string;
  // Add any other specific parameters for Transformers.js pipeline if needed
}

export class TransformersJsEmbeddings
  extends Embeddings
  implements TransformersJsEmbeddingsParams
{
  modelName: string;
  private pipelinePromise: Promise<FeatureExtractionPipeline> | null = null;

  constructor(fields?: TransformersJsEmbeddingsParams) {
    super(fields ?? {});
    this.modelName = fields?.modelName ?? 'Xenova/all-MiniLM-L6-v2';
    // Initialize the pipeline promise here to load the model on instantiation
    this.pipelinePromise = this.initializePipeline();
  }

  private async initializePipeline(): Promise<FeatureExtractionPipeline> {
    // Dynamically import 'pipeline' from '@huggingface/transformers'
    // This is often recommended for ESM environments or to avoid top-level awaits.
    // However, since we are in a class method, direct import should be fine
    // as long as the environment supports it. For Next.js, this might need care.
    // For simplicity, we assume direct usage here. If issues arise (e.g., server-side vs client-side),
    // a dynamic import within this method might be more robust.

    // Using a singleton pattern for the pipeline to avoid re-initialization
    // This.pipelinePromise ensures it's only initialized once.
    if (!this.pipelinePromise) {
      // This check is slightly redundant due to constructor init, but safe.
      console.log(
        `Initializing embedding pipeline for model: ${this.modelName}`
      );
      this.pipelinePromise = (async () => {
        const extractionPipeline = await pipeline(
          'feature-extraction',
          this.modelName
        );
        return extractionPipeline as FeatureExtractionPipeline;
      })();
    }
    return this.pipelinePromise!;
  }

  async _embed(texts: string[]): Promise<number[][]> {
    const extractor = await this.initializePipeline();

    // The output of the feature-extraction pipeline needs to be processed.
    // For sentence transformers like all-MiniLM-L6-v2, the common approach is to
    // take the mean of the last hidden state tokens (or a specific pooling strategy).
    // Xenova's transformers.js might handle this with specific model configurations or post-processing.

    // Let's assume the pipeline provides a direct embedding or a way to easily get it.
    // The output structure for feature-extraction can be a bit complex.
    // Typically, for models like sentence-transformers, we look for a pooled output.
    const results = [];
    for (const text of texts) {
      const output = await extractor(text, {
        pooling: 'mean',
        normalize: true,
      });
      // The structure of 'output' from Xenova/transformers.js for feature-extraction
      // with pooling and normalization (for sentence-transformer models) is typically a Tensor.
      // We need to convert this Tensor to a flat array of numbers.
      if (output && output.data && typeof output.data === 'object') {
        // output.data is an array-like object (e.g., Float32Array)
        results.push(Array.from(output.data as number[]));
      } else {
        // Fallback or error handling if the output format is not as expected
        console.warn(
          `Unexpected output format for text: "${text}". Using zero vector.`
        );
        // Determine the expected dimensionality, e.g., 384 for all-MiniLM-L6-v2
        // This is a fallback, ideally, we should ensure the model always returns expected output.
        results.push(new Array(384).fill(0));
      }
    }
    return results;
  }

  async embedDocuments(documents: string[]): Promise<number[][]> {
    return this._embed(documents);
  }

  async embedQuery(document: string): Promise<number[]> {
    const embeddings = await this._embed([document]);
    return embeddings[0];
  }
}
