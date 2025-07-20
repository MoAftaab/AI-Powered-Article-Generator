import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();

// ✅ Correct CORS middleware setup
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Gemini API client
const geminiClient = axios.create({
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/models/',
  headers: { 'Content-Type': 'application/json' }
});

const gemini = {
  chat: {
    completions: {
      create: async (params) => {
        const model = 'gemini-2.5-flash';
        const apiKey = process.env.GEMINI_API_KEY;
        const url = `${model}:generateContent?key=${apiKey}`;

        const contents = params.messages.map(msg => ({
          role: msg.role === 'system' ? 'user' : msg.role,
          parts: [{ text: msg.content }]
        }));

        const response = await geminiClient.post(url, { contents });

        return {
          choices: [{
            message: {
              content: response.data.candidates[0].content.parts[0].text
            }
          }]
        };
      }
    }
  }
};

const PAPER_SECTIONS = [
  'Abstract', 'Introduction', 'Literature Review', 'Methodology',
  'Results', 'Discussion', 'Conclusion', 'References'
];

// Generate paper
app.post('/generate-paper', async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    const response = await gemini.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert academic writer. Generate a complete research paper with the following sections: Abstract, Introduction, Literature Review, Methodology, Results, Discussion, Conclusion, and References. Use formal academic language and maintain coherence between sections."
        },
        {
          role: "user",
          content: `Generate a complete research paper about: ${topic}. Include all sections.`
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    const content = response.choices[0].message.content;
    const sections = {};

    let currentSection = '';
    let currentContent = [];

    content.split('\n').forEach(line => {
      const sectionMatch = PAPER_SECTIONS.find(title =>
        line.toLowerCase().includes(title.toLowerCase()) &&
        line.length < title.length + 10
      );

      if (sectionMatch) {
        if (currentSection) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        currentSection = sectionMatch;
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      }
    });

    if (currentSection) {
      sections[currentSection] = currentContent.join('\n').trim();
    }

    res.json({ success: true, paper: sections });
  } catch (error) {
    console.error('Error generating paper:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate paper' });
  }
});

// Fetch citations
app.post('/fetch-citations', async (req, res) => {
  try {
    const { topic } = req.body;

    const response = await gemini.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a research librarian. Generate accurate and relevant academic citations for the given topic. Include full citation details and ensure proper academic formatting."
        },
        {
          role: "user",
          content: `Generate 10 relevant academic citations for research on: ${topic}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const citations = response.choices[0].message.content
      .split('\n')
      .filter(citation => citation.trim())
      .map(citation => {
        const yearMatch = citation.match(/\((\d{4})\)/);
        return {
          text: citation,
          type: 'article',
          year: yearMatch ? yearMatch[1] : '',
          authors: citation.split('(')[0].trim(),
          title: citation.split(').')[1]?.split('.')[0]?.trim() || '',
        };
      });

    res.json({ citations });
  } catch (error) {
    console.error('Error fetching citations:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch citations' });
  }
});

// Format paper
app.post('/format-paper', async (req, res) => {
  try {
    const { paper, style } = req.body;

    const response = await gemini.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert in academic writing and citation styles. Format the given research paper according to ${style} style guidelines.`
        },
        {
          role: "user",
          content: `Format this paper in ${style} style:\n\n${JSON.stringify(paper)}`
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const formattedPaper = response.choices[0].message.content;
    res.json({ formattedPaper });
  } catch (error) {
    console.error('Error formatting paper:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to format paper' });
  }
});

// Improve writing
app.post('/api/ai/improve-writing', async (req, res) => {
  try {
    const { prompt, text, aspect, context } = req.body;
    const contentToImprove = prompt || text;

    if (!contentToImprove || !aspect) {
      return res.status(400).json({ error: 'Content to improve and writing aspect are required' });
    }

    const { sectionTitle, paperTitle, abstract } = context || {};

    const systemPrompt = `You are an expert academic writer working on ${paperTitle ? `a paper titled "${paperTitle}"` : 'a research paper'}.
${abstract ? `The paper's abstract: "${abstract}"` : ''}
${sectionTitle ? `Currently working on: ${sectionTitle}` : ''}`;

    const response = await gemini.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Improve this academic writing:\n\n${contentToImprove}` }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const improvedText = response.choices[0].message.content;
    res.json({
      improved: improvedText,
      changes: [aspect]
    });
  } catch (error) {
    console.error('Error improving writing:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to improve writing' });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
