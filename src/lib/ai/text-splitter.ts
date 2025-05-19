import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

// Define a type for the specific short codes LangChain's fromLanguage expects.
// This list is based on common usage and the linter error messages.
export type LangChainLanguageCode =
  | 'js' // JavaScript
  | 'ts' // TypeScript
  | 'py' // Python
  | 'md' // Markdown
  | 'html' // HTML
  | 'cpp' // C++
  | 'go' // Go
  | 'java' // Java
  | 'php' // PHP
  | 'proto' // Protocol Buffers
  | 'rst' // reStructuredText
  | 'ruby' // Ruby
  | 'rust' // Rust
  | 'scala' // Scala
  | 'swift' // Swift
  | 'latex' // LaTeX
  | 'sol' // Solidity
  | 'json' // JSON (will be mapped to 'js' for splitting)
  | 'text'; // Generic text (will be mapped to 'js' for splitting)

// Define a clear structure for the metadata associated with each chunk.
export interface ChunkMetadata {
  filePath: string;
  language: LangChainLanguageCode; // Use the LangChain short code type
}

// Define the structure of a document chunk after splitting.
export interface SplitDocument {
  pageContent: string; // The actual text of the code chunk
  metadata: ChunkMetadata;
}

const DEFAULT_CHUNK_SIZE = 768;
const DEFAULT_CHUNK_OVERLAP = 100;

// Create pre-configured splitters for common languages.
// Keys are LangChainLanguageCode, values are the splitters.
const textSplitters: Partial<
  Record<LangChainLanguageCode, RecursiveCharacterTextSplitter>
> = {
  ts: RecursiveCharacterTextSplitter.fromLanguage('js', {
    chunkSize: DEFAULT_CHUNK_SIZE,
    chunkOverlap: DEFAULT_CHUNK_OVERLAP,
  }),
  js: RecursiveCharacterTextSplitter.fromLanguage('js', {
    chunkSize: DEFAULT_CHUNK_SIZE,
    chunkOverlap: DEFAULT_CHUNK_OVERLAP,
  }),
  py: RecursiveCharacterTextSplitter.fromLanguage('python', {
    chunkSize: DEFAULT_CHUNK_SIZE,
    chunkOverlap: DEFAULT_CHUNK_OVERLAP,
  }),
  md: RecursiveCharacterTextSplitter.fromLanguage('markdown', {
    chunkSize: DEFAULT_CHUNK_SIZE,
    chunkOverlap: DEFAULT_CHUNK_OVERLAP,
  }),
  html: RecursiveCharacterTextSplitter.fromLanguage('html', {
    chunkSize: DEFAULT_CHUNK_SIZE,
    chunkOverlap: DEFAULT_CHUNK_OVERLAP,
  }),
  // For 'json' and 'text', we'll use the 'js' splitter as a reasonable default for structured text.
  json: RecursiveCharacterTextSplitter.fromLanguage('js', {
    // Map JSON to JS splitter
    chunkSize: DEFAULT_CHUNK_SIZE,
    chunkOverlap: DEFAULT_CHUNK_OVERLAP,
  }),
  // Other languages from LangChainLanguageCode can be added here if needed
  cpp: RecursiveCharacterTextSplitter.fromLanguage('cpp', {
    chunkSize: DEFAULT_CHUNK_SIZE,
    chunkOverlap: DEFAULT_CHUNK_OVERLAP,
  }),
  go: RecursiveCharacterTextSplitter.fromLanguage('go', {
    chunkSize: DEFAULT_CHUNK_SIZE,
    chunkOverlap: DEFAULT_CHUNK_OVERLAP,
  }),
  java: RecursiveCharacterTextSplitter.fromLanguage('java', {
    chunkSize: DEFAULT_CHUNK_SIZE,
    chunkOverlap: DEFAULT_CHUNK_OVERLAP,
  }),
  php: RecursiveCharacterTextSplitter.fromLanguage('php', {
    chunkSize: DEFAULT_CHUNK_SIZE,
    chunkOverlap: DEFAULT_CHUNK_OVERLAP,
  }),
  proto: RecursiveCharacterTextSplitter.fromLanguage('proto', {
    chunkSize: DEFAULT_CHUNK_SIZE,
    chunkOverlap: DEFAULT_CHUNK_OVERLAP,
  }),
  rst: RecursiveCharacterTextSplitter.fromLanguage('rst', {
    chunkSize: DEFAULT_CHUNK_SIZE,
    chunkOverlap: DEFAULT_CHUNK_OVERLAP,
  }),
  ruby: RecursiveCharacterTextSplitter.fromLanguage('ruby', {
    chunkSize: DEFAULT_CHUNK_SIZE,
    chunkOverlap: DEFAULT_CHUNK_OVERLAP,
  }),
  rust: RecursiveCharacterTextSplitter.fromLanguage('rust', {
    chunkSize: DEFAULT_CHUNK_SIZE,
    chunkOverlap: DEFAULT_CHUNK_OVERLAP,
  }),
  scala: RecursiveCharacterTextSplitter.fromLanguage('scala', {
    chunkSize: DEFAULT_CHUNK_SIZE,
    chunkOverlap: DEFAULT_CHUNK_OVERLAP,
  }),
  swift: RecursiveCharacterTextSplitter.fromLanguage('swift', {
    chunkSize: DEFAULT_CHUNK_SIZE,
    chunkOverlap: DEFAULT_CHUNK_OVERLAP,
  }),
  latex: RecursiveCharacterTextSplitter.fromLanguage('latex', {
    chunkSize: DEFAULT_CHUNK_SIZE,
    chunkOverlap: DEFAULT_CHUNK_OVERLAP,
  }),
  sol: RecursiveCharacterTextSplitter.fromLanguage('sol', {
    chunkSize: DEFAULT_CHUNK_SIZE,
    chunkOverlap: DEFAULT_CHUNK_OVERLAP,
  }),
};

// A generic splitter for text if language is 'text' or not specifically handled by a language-specific splitter.
const genericTextSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: DEFAULT_CHUNK_SIZE,
  chunkOverlap: DEFAULT_CHUNK_OVERLAP,
  separators: ['\n\n', '\n', ' ', ''],
});

/**
 * Splits a given code string into manageable chunks based on its language.
 */
export async function splitCodeIntoChunks(
  code: string,
  filePath: string,
  language: LangChainLanguageCode = 'js' // Default to LangChain short code
): Promise<SplitDocument[]> {
  if (!code || code.trim() === '') {
    return [];
  }

  let splitter = textSplitters[language];

  // If the language is 'text' or no specific splitter is found for the language code,
  // use the genericTextSplitter.
  if (language === 'text' || !splitter) {
    splitter = genericTextSplitter;
  }

  const documents = await splitter.createDocuments(
    [code],
    [{ filePath, language } as ChunkMetadata]
  );

  return documents.map(
    (doc) =>
      ({
        pageContent: doc.pageContent,
        metadata: doc.metadata,
      } as SplitDocument)
  );
}

/**
 * Attempts to determine the programming language (as LangChainLanguageCode) from a file path extension.
 */
export function detectLanguageFromExtension(
  filePath: string
): LangChainLanguageCode | undefined {
  const extension = filePath.split('.').pop()?.toLowerCase();
  if (!extension) return undefined;

  switch (extension) {
    case 'ts':
    case 'tsx':
      return 'ts';
    case 'js':
    case 'jsx':
      return 'js';
    case 'py':
      return 'py';
    case 'md':
    case 'mdx':
      return 'md';
    case 'html':
      return 'html';
    case 'json':
      return 'json'; // This will map to the 'js' splitter in textSplitters map
    case 'cpp':
    case 'cxx':
    case 'h':
    case 'hpp':
      return 'cpp';
    case 'go':
      return 'go';
    case 'java':
      return 'java';
    case 'php':
      return 'php';
    case 'proto':
      return 'proto';
    case 'rst':
      return 'rst';
    case 'rb':
      return 'ruby';
    case 'rs':
      return 'rust';
    case 'scala':
      return 'scala';
    case 'swift':
      return 'swift';
    case 'tex':
      return 'latex';
    case 'sol':
      return 'sol';
    default:
      return 'text'; // Default to generic 'text' for unknown extensions
  }
}
