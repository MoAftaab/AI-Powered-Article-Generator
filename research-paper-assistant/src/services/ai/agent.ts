import { apiService } from '../api';
import type { 
  SuggestionType, 
  OutlineSection, 
  WritingImprovement, 
  WritingAspect,
  Citation,
  PaperFormat 
} from '../../types/common';

class ResearchAgent {
  /**
   * Analyzes a paragraph of text and returns writing suggestions
   */
  async analyzeParagraph(text: string): Promise<SuggestionType[]> {
    try {
      const { suggestions } = await apiService.analyzeParagraph(text);
      return suggestions.map(suggestion => ({
        type: suggestion.type as SuggestionType['type'],
        content: suggestion.content,
        severity: suggestion.severity,
        section: text.substring(0, 50), // First 50 chars as context
        position: text.indexOf(suggestion.content)
      }));
    } catch (error) {
      console.error('Error analyzing paragraph:', error);
      return [];
    }
  }

  /**
   * Generates title based on topic and keywords
   */
  async generateTitle(topic: string, keywords: string[]): Promise<string> {
    try {
      return await apiService.generateTitle(topic, keywords);
    } catch (error) {
      console.error('Error generating title:', error);
      throw new Error('Failed to generate title');
    }
  }

  /**
   * Generates content based on a title and main points
   */
  async generateAbstract(title: string, mainPoints: string[]): Promise<string> {
    try {
      return await apiService.generateAbstract(title, mainPoints);
    } catch (error) {
      console.error('Error generating content:', error);
      throw new Error('Failed to generate content');
    }
  }

  /**
   * Generates an outline with section descriptions
   */
  async generateOutline(title: string, keywords: string[]): Promise<OutlineSection[]> {
    try {
      const { sections } = await apiService.generateOutline(title, keywords);
      return sections;
    } catch (error) {
      console.error('Error generating outline:', error);
      return [];
    }
  }

  /**
   * Improves writing style and clarity
   */
  async improveWriting(text: string, aspect: WritingAspect = 'clarity'): Promise<WritingImprovement> {
    try {
      const result = await apiService.improveWriting(text, aspect);
      return {
        ...result,
        suggestions: result.changes.map((change, index) => ({
          type: 'style',
          content: change,
          severity: 'medium',
          section: text.substring(0, 50),
          position: index
        }))
      };
    } catch (error) {
      console.error('Error improving writing:', error);
      throw new Error('Failed to improve writing');
    }
  }

  /**
   * Suggests relevant citations based on text content
   */
  async suggestCitations(text: string): Promise<Citation[]> {
    try {
      const response = await apiService.post<{ citations: Citation[] }>('/ai/citations', { text });
      return response.citations.map(citation => ({
        ...citation,
        citationText: `${citation.authors.join(', ')} (${citation.year}). ${citation.title}.${
          citation.journal ? ` ${citation.journal}.` : ''
        }`,
        id: `${citation.doi || citation.url || citation.title}-${citation.year}`
      }));
    } catch (error) {
      console.error('Error suggesting citations:', error);
      return [];
    }
  }

  /**
   * Validates document formatting according to specified style guide
   */
  async validateFormatting(content: string, style: PaperFormat = 'IEEE'): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    try {
      const response = await apiService.post<{
        isValid: boolean;
        issues: string[];
      }>('/ai/validate-format', {
        content,
        style
      });
      return response;
    } catch (error) {
      console.error('Error validating formatting:', error);
      return {
        isValid: false,
        issues: ['Failed to validate formatting']
      };
    }
  }
}

export const researchAgent = new ResearchAgent();
