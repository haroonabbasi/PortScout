import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, MessageSquare, Loader2 } from 'lucide-react';
import { PortInfo } from '../types';

interface GeminiAdvisorProps {
  occupiedPorts: PortInfo[];
}

const GeminiAdvisor: React.FC<GeminiAdvisorProps> = ({ occupiedPorts }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleAnalyze = async () => {
    if (!process.env.API_KEY) {
        setAnalysis("API Key not found in environment. Please configure it.");
        return;
    }

    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = "gemini-2.5-flash";
      
      const portSummary = occupiedPorts.map(p => `${p.port} (${p.service})`).join(', ');
      
      const prompt = `
        I am a DevOps engineer managing a local development environment.
        Here is a list of currently occupied ports on my machine: ${portSummary}.
        
        Please analyze this list and provide:
        1. Identification of standard services (e.g., usually 5432 is Postgres).
        2. Potential conflicts if I were to install a standard MERN stack or LAMP stack now.
        3. Recommend a block of 5 free ports I should use for a new microservices project to avoid these collisions.
        
        Keep the response concise and formatted with Markdown.
      `;

      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
      });

      setAnalysis(response.text);
    } catch (error) {
      setAnalysis("Error connecting to Gemini. Please try again later.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-indigo-900/50 rounded-xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles className="w-24 h-24 text-indigo-500" />
      </div>

      <div className="relative z-10">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          Gemini Port Advisor
        </h2>
        
        <p className="text-gray-400 mb-6 text-sm max-w-2xl">
          Use AI to analyze your current port usage, identify potential conflicts with standard services, and recommend an optimal port strategy for your new deployments.
        </p>

        {!analysis && (
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
            Analyze Configuration
          </button>
        )}

        {analysis && (
          <div className="bg-gray-950/50 rounded-lg p-6 border border-gray-800 animate-in fade-in duration-500">
             <div className="prose prose-invert prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
             </div>
             <button 
                onClick={() => setAnalysis(null)}
                className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 underline"
             >
                Clear Analysis
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeminiAdvisor;