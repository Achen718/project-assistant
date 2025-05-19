import { OpenAIEmbeddings } from '@langchain/openai';

// The OPENAI_API_KEY environment variable is automatically picked up by OpenAIEmbeddings.
// Ensure it's set in your .env.local file.
if (!process.env.OPENAI_API_KEY) {
  throw new Error(
    'OpenAI API key is not defined. Please set OPENAI_API_KEY in your .env.local file.'
  );
}

// Using one of OpenAI's newer, more cost-effective embedding models.
// text-embedding-3-small produces 1536-dimensional embeddings by default.
const EMBEDDING_MODEL_NAME = 'text-embedding-3-small';

const langchainEmbeddingsModel = new OpenAIEmbeddings({
  modelName: EMBEDDING_MODEL_NAME,
  // You can specify other options here if needed, like batchSize, dimensions (if supported by model and you want to truncate)
  // openAIApiKey: process.env.OPENAI_API_KEY // Explicitly pass if needed, but usually picked from env
});

/**
 * Generates embeddings for an array of input texts using the LangChain OpenAIEmbeddings model.
 *
 * @param texts An array of strings for which to generate embeddings.
 * @returns A Promise that resolves to an array of embedding vectors (arrays of numbers),
 *          or null if an error occurs.
 */
export async function generateEmbeddings(
  texts: string[]
): Promise<number[][] | null> {
  if (!texts || texts.length === 0) {
    console.warn('generateEmbeddings called with no texts.');
    return [];
  }

  const validTexts = texts.map((text) =>
    text.trim() === '' ? ' ' : text.trim()
  );

  try {
    const embeddings = await langchainEmbeddingsModel.embedDocuments(
      validTexts
    );
    if (!embeddings || embeddings.length !== validTexts.length) {
      throw new Error(
        'Embeddings generation returned unexpected results or mismatched count.'
      );
    }
    return embeddings;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(
      `Error generating embeddings with LangChain: ${message}`,
      error
    );
    return null;
  }
}

/**
 * Generates an embedding for a single input text using the LangChain OpenAIEmbeddings model.
 * This is typically used for embedding user queries.
 *
 * @param text The string for which to generate an embedding.
 * @returns A Promise that resolves to an embedding vector (array of numbers),
 *          or null if an error occurs.
 */
export async function generateEmbedding(
  text: string
): Promise<number[] | null> {
  if (!text || text.trim() === '') {
    console.warn('generateEmbedding called with empty text.');
    return null;
  }
  try {
    const embedding = await langchainEmbeddingsModel.embedQuery(text.trim());
    if (!embedding) {
      throw new Error('Single embedding generation returned no result.');
    }
    return embedding;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(
      `Error generating single embedding with LangChain: ${message}`,
      error
    );
    return null;
  }
}
