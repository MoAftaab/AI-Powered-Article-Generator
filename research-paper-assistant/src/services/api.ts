import type { 
  RequestBody,
  GeneratedPaper,
  Citation,
  SuggestionType,
  OutlineSection,
  WritingAspect,
  PaperFormat
} from '../types/common';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  }

  async post<T>(endpoint: string, body: RequestBody): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // Generate complete research paper
  async generatePaper(topic: string): Promise<GeneratedPaper> {
    const prompt = `Generate a comprehensive research paper on "${topic}" with the following structure and requirements:
    
    - Abstract (approximately 250 words): A concise summary of the research
    - Introduction (approximately 350 words): Background and research objectives
    - Literature Review (approximately 450 words): Comprehensive review of existing research
    - Methodology (approximately 500 words): Include detailed methodology with tables and figures where appropriate
    - Results: Present findings with supporting data
    - Discussion: Analyze results in context of existing literature
    - Conclusion: Summarize key findings and implications
    - References: Include relevant academic citations
    
    Please ensure proper academic formatting, spacing, and professional presentation.`;

    const response = await this.post<{ success: boolean, paper: GeneratedPaper }>('/generate-paper', {
      topic,
      prompt
    });
    
    return response.paper;
  }

  // Fetch citations for a topic
  async fetchCitations(topic: string): Promise<Citation[]> {
    const response = await this.post<{ citations: Citation[] }>('/fetch-citations', {
      topic,
    });
    return response.citations;
  }

  // Format paper according to citation style
  async formatPaper(paper: GeneratedPaper, style: PaperFormat): Promise<string> {
    const response = await this.post<{ formattedPaper: string }>('/format-paper', {
      paper,
      style,
    });
    return response.formattedPaper;
  }

  // AI Endpoints
  async generateTitle(topic: string, keywords: string[]): Promise<string> {
    const response = await this.post<{ title: string }>('/ai/generate-title', {
      topic,
      keywords,
    });
    return response.title;
  }

  async generateAbstract(title: string, mainPoints: string[]): Promise<string> {
    const response = await this.post<{ abstract: string }>('/ai/generate-abstract', {
      title,
      mainPoints,
    });
    return response.abstract;
  }

  async analyzeParagraph(content: string): Promise<{
    suggestions: SuggestionType[];
  }> {
    const response = await this.post<{
      suggestions: SuggestionType[];
    }>('/ai/analyze', { content });
    return response;
  }

  async generateOutline(title: string, keywords: string[]): Promise<{
    sections: OutlineSection[];
  }> {
    const response = await this.post<{
      sections: OutlineSection[];
    }>('/ai/generate-outline', { title, keywords });
    return response;
  }

  async improveWriting(
    text: string,
    aspect: WritingAspect,
    context?: {
      sectionTitle?: string;
      paperTitle?: string;
      abstract?: string;
    }
  ): Promise<{
    improved: string;
    changes: string[];
  }> {
    const response = await this.post<{
      improved: string;
      changes: string[];
    }>('/api/ai/improve-writing', {
      prompt: text,
      aspect,
      context
    });
    return response;
  }
}

export const apiService = new ApiService();
