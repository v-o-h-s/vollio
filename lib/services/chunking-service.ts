import { v4 as uuidv4 } from 'uuid';

export interface ChunkingOptions {
  chunkSize?: number; // in tokens
  chunkOverlap?: number; // in tokens
  preserveStructure?: boolean;
  respectSentenceBoundaries?: boolean;
  respectParagraphBoundaries?: boolean;
}

export interface TextChunk {
  id: string;
  content: string;
  startIndex: number;
  endIndex: number;
  tokenCount: number;
  metadata: {
    chunkIndex: number;
    hasOverlap: boolean;
    contentType: 'paragraph' | 'heading' | 'list' | 'table' | 'caption';
    structuralElements: string[];
  };
}

export interface ChunkingResult {
  chunks: TextChunk[];
  totalTokens: number;
  averageChunkSize: number;
  overlapRatio: number;
}

export class ChunkingService {
  private static readonly DEFAULT_OPTIONS: Required<ChunkingOptions> = {
    chunkSize: 400,
    chunkOverlap: 50,
    preserveStructure: true,
    respectSentenceBoundaries: true,
    respectParagraphBoundaries: true
  };

  // Syncfusion-specific text patterns
  private static readonly SYNCFUSION_PATTERNS = {
    // Common Syncfusion PDF viewer artifacts
    pageNumbers: /^Page \d+ of \d+$/gm,
    watermarks: /Syncfusion|Essential PDF|Demo Version/gi,
    viewerUI: /Zoom|Print|Download|Search/gi,
    // PDF.js style text layer artifacts
    textLayer: /textLayer|annotationLayer/gi
  };

  /**
   * Create semantic chunks from text with intelligent boundaries
   */
  createChunks(text: string, options: ChunkingOptions = {}): ChunkingResult {
    const config = { ...ChunkingService.DEFAULT_OPTIONS, ...options };
    
    // Clean Syncfusion-specific artifacts first
    const cleanedText = this.cleanSyncfusionArtifacts(text);
    
    // Preprocess text to identify structural elements
    const structuredText = this.identifyStructuralElements(cleanedText);
    
    // Split into semantic units
    const semanticUnits = this.splitIntoSemanticUnits(structuredText, config);
    
    // Group units into chunks
    const chunks = this.groupIntoChunks(semanticUnits, config);
    
    // Calculate statistics
    const totalTokens = chunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0);
    const averageChunkSize = chunks.length > 0 ? totalTokens / chunks.length : 0;
    const overlapRatio = this.calculateOverlapRatio(chunks, config.chunkOverlap);
    
    return {
      chunks,
      totalTokens,
      averageChunkSize,
      overlapRatio
    };
  }

  /**
   * Clean Syncfusion PDF viewer artifacts and common PDF extraction noise
   */
  private cleanSyncfusionArtifacts(text: string): string {
    let cleaned = text;
    
    // Remove Syncfusion-specific patterns
    Object.values(ChunkingService.SYNCFUSION_PATTERNS).forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });
    
    // Remove common PDF extraction artifacts
    cleaned = cleaned
      // Remove isolated page numbers
      .replace(/^\s*\d+\s*$/gm, '')
      // Remove navigation elements
      .replace(/^(Previous|Next|First|Last|Go to page).*$/gmi, '')
      // Remove zoom controls
      .replace(/^(Zoom In|Zoom Out|Fit Width|Fit Page).*$/gmi, '')
      // Remove toolbar elements
      .replace(/^(Print|Download|Search|Bookmark).*$/gmi, '')
      // Remove excessive whitespace
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/\s{3,}/g, ' ')
      // Remove empty lines
      .replace(/^\s*$/gm, '')
      .trim();
    
    return cleaned;
  }

  /**
   * Identify structural elements in text (headings, lists, etc.)
   */
  private identifyStructuralElements(text: string): Array<{
    content: string;
    type: 'paragraph' | 'heading' | 'list' | 'table' | 'caption';
    startIndex: number;
    endIndex: number;
  }> {
    const elements: Array<{
      content: string;
      type: 'paragraph' | 'heading' | 'list' | 'table' | 'caption';
      startIndex: number;
      endIndex: number;
    }> = [];

    // Split by double newlines to identify paragraphs
    const paragraphs = text.split(/\n\s*\n/);
    let currentIndex = 0;

    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) {
        currentIndex += paragraph.length + 2; // +2 for the double newline
        continue;
      }

      const trimmed = paragraph.trim();
      const startIndex = currentIndex;
      const endIndex = currentIndex + paragraph.length;

      // Detect content type
      const type = this.detectContentType(trimmed);
      
      elements.push({
        content: trimmed,
        type,
        startIndex,
        endIndex
      });

      currentIndex = endIndex + 2; // +2 for the double newline
    }

    return elements;
  }

  /**
   * Detect content type based on text patterns
   */
  private detectContentType(text: string): 'paragraph' | 'heading' | 'list' | 'table' | 'caption' {
    const trimmed = text.trim();
    
    // Check for headings (short, often capitalized, no ending punctuation)
    if (trimmed.length < 100 && 
        /^[A-Z][^.!?]*$/.test(trimmed) && 
        !trimmed.includes('\n')) {
      return 'heading';
    }
    
    // Check for lists
    if (/^[\d\w]\.|^[-•*]/.test(trimmed) || 
        trimmed.includes('\n-') || 
        trimmed.includes('\n•') ||
        trimmed.includes('\n*') ||
        /^\d+\.\s/.test(trimmed)) {
      return 'list';
    }
    
    // Check for table-like content (multiple tabs or aligned spaces)
    if (trimmed.includes('\t') || 
        /\s{4,}/.test(trimmed) ||
        (trimmed.split('\n').length > 2 && trimmed.split('\n').every(line => /\s{2,}/.test(line)))) {
      return 'table';
    }
    
    // Check for captions
    if (/^(Figure|Table|Chart|Diagram|Image|Photo|Illustration)\s+\d+/i.test(trimmed) ||
        /^(Fig\.|Tab\.)\s*\d+/i.test(trimmed)) {
      return 'caption';
    }
    
    // Default to paragraph
    return 'paragraph';
  }

  /**
   * Split structural elements into semantic units (sentences, list items, etc.)
   */
  private splitIntoSemanticUnits(
    elements: Array<{
      content: string;
      type: 'paragraph' | 'heading' | 'list' | 'table' | 'caption';
      startIndex: number;
      endIndex: number;
    }>,
    config: Required<ChunkingOptions>
  ): Array<{
    content: string;
    type: 'paragraph' | 'heading' | 'list' | 'table' | 'caption';
    tokenCount: number;
    isStructuralBoundary: boolean;
  }> {
    const units: Array<{
      content: string;
      type: 'paragraph' | 'heading' | 'list' | 'table' | 'caption';
      tokenCount: number;
      isStructuralBoundary: boolean;
    }> = [];

    for (const element of elements) {
      if (element.type === 'heading' || element.type === 'caption') {
        // Keep headings and captions as single units
        units.push({
          content: element.content,
          type: element.type,
          tokenCount: this.estimateTokenCount(element.content),
          isStructuralBoundary: true
        });
      } else if (element.type === 'list') {
        // Split lists by items
        const listItems = this.splitListItems(element.content);
        for (const item of listItems) {
          units.push({
            content: item,
            type: 'list',
            tokenCount: this.estimateTokenCount(item),
            isStructuralBoundary: false
          });
        }
      } else if (element.type === 'table') {
        // Keep tables as single units (they're usually coherent)
        units.push({
          content: element.content,
          type: element.type,
          tokenCount: this.estimateTokenCount(element.content),
          isStructuralBoundary: true
        });
      } else {
        // Split paragraphs by sentences if respecting sentence boundaries
        if (config.respectSentenceBoundaries) {
          const sentences = this.splitIntoSentences(element.content);
          for (const sentence of sentences) {
            if (sentence.trim()) {
              units.push({
                content: sentence.trim(),
                type: 'paragraph',
                tokenCount: this.estimateTokenCount(sentence),
                isStructuralBoundary: false
              });
            }
          }
        } else {
          units.push({
            content: element.content,
            type: element.type,
            tokenCount: this.estimateTokenCount(element.content),
            isStructuralBoundary: config.respectParagraphBoundaries
          });
        }
      }
    }

    return units;
  }

  /**
   * Split list content into individual items
   */
  private splitListItems(listContent: string): string[] {
    // Split by common list patterns
    const items = listContent.split(/\n(?=[\d\w]\.|[-•*]\s)/);
    return items.filter(item => item.trim().length > 0);
  }

  /**
   * Split text into sentences
   */
  private splitIntoSentences(text: string): string[] {
    // More sophisticated sentence splitting
    return text
      .split(/(?<=[.!?])\s+(?=[A-Z])/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * Group semantic units into chunks
   */
  private groupIntoChunks(
    units: Array<{
      content: string;
      type: 'paragraph' | 'heading' | 'list' | 'table' | 'caption';
      tokenCount: number;
      isStructuralBoundary: boolean;
    }>,
    config: Required<ChunkingOptions>
  ): TextChunk[] {
    const chunks: TextChunk[] = [];
    let currentChunk: typeof units = [];
    let currentTokenCount = 0;
    let chunkIndex = 0;

    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      
      // Check if adding this unit would exceed chunk size
      if (currentTokenCount + unit.tokenCount > config.chunkSize && currentChunk.length > 0) {
        // Finalize current chunk
        chunks.push(this.createChunkFromUnits(currentChunk, chunkIndex++, false));
        
        // Start new chunk with overlap
        if (config.chunkOverlap > 0) {
          const overlapUnits = this.getOverlapUnits(currentChunk, config.chunkOverlap);
          currentChunk = overlapUnits;
          currentTokenCount = overlapUnits.reduce((sum, u) => sum + u.tokenCount, 0);
        } else {
          currentChunk = [];
          currentTokenCount = 0;
        }
      }
      
      // Add unit to current chunk
      currentChunk.push(unit);
      currentTokenCount += unit.tokenCount;
      
      // If this is a structural boundary and we have enough content, consider breaking
      if (config.preserveStructure && 
          unit.isStructuralBoundary && 
          currentTokenCount >= config.chunkSize * 0.7) {
        chunks.push(this.createChunkFromUnits(currentChunk, chunkIndex++, false));
        currentChunk = [];
        currentTokenCount = 0;
      }
    }

    // Add final chunk if it has content
    if (currentChunk.length > 0) {
      chunks.push(this.createChunkFromUnits(currentChunk, chunkIndex, false));
    }

    return chunks;
  }

  /**
   * Get units for overlap
   */
  private getOverlapUnits(
    units: Array<{
      content: string;
      type: 'paragraph' | 'heading' | 'list' | 'table' | 'caption';
      tokenCount: number;
      isStructuralBoundary: boolean;
    }>,
    overlapTokens: number
  ): typeof units {
    const overlapUnits: typeof units = [];
    let tokenCount = 0;
    
    // Start from the end and work backwards
    for (let i = units.length - 1; i >= 0 && tokenCount < overlapTokens; i--) {
      overlapUnits.unshift(units[i]);
      tokenCount += units[i].tokenCount;
    }
    
    return overlapUnits;
  }

  /**
   * Create a chunk from semantic units
   */
  private createChunkFromUnits(
    units: Array<{
      content: string;
      type: 'paragraph' | 'heading' | 'list' | 'table' | 'caption';
      tokenCount: number;
      isStructuralBoundary: boolean;
    }>,
    chunkIndex: number,
    hasOverlap: boolean
  ): TextChunk {
    const content = units.map(u => u.content).join('\n\n');
    const tokenCount = units.reduce((sum, u) => sum + u.tokenCount, 0);
    const contentTypes = [...new Set(units.map(u => u.type))];
    const primaryType = this.getPrimaryContentType(contentTypes);
    
    return {
      id: uuidv4(),
      content,
      startIndex: 0, // Would need to track this properly in a full implementation
      endIndex: content.length,
      tokenCount,
      metadata: {
        chunkIndex,
        hasOverlap,
        contentType: primaryType,
        structuralElements: contentTypes
      }
    };
  }

  /**
   * Determine primary content type from multiple types
   */
  private getPrimaryContentType(
    types: Array<'paragraph' | 'heading' | 'list' | 'table' | 'caption'>
  ): 'paragraph' | 'heading' | 'list' | 'table' | 'caption' {
    // Priority order: heading > table > list > caption > paragraph
    if (types.includes('heading')) return 'heading';
    if (types.includes('table')) return 'table';
    if (types.includes('list')) return 'list';
    if (types.includes('caption')) return 'caption';
    return 'paragraph';
  }

  /**
   * Calculate overlap ratio
   */
  private calculateOverlapRatio(chunks: TextChunk[], overlapTokens: number): number {
    if (chunks.length <= 1) return 0;
    
    const totalOverlapTokens = (chunks.length - 1) * overlapTokens;
    const totalTokens = chunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0);
    
    return totalOverlapTokens / totalTokens;
  }

  /**
   * Estimate token count (rough approximation)
   */
  private estimateTokenCount(text: string): number {
    // More accurate token estimation
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const punctuation = (text.match(/[.,!?;:()[\]{}'"]/g) || []).length;
    const numbers = (text.match(/\d+/g) || []).length;
    
    // Rough approximation: words * 1.3 + punctuation * 0.5 + numbers * 0.8
    return Math.ceil(words.length * 1.3 + punctuation * 0.5 + numbers * 0.8);
  }
}

export const chunkingService = new ChunkingService();