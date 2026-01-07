
import { GoogleGenAI, Type } from "@google/genai";
import { Observation } from "../types";

export const analyzeObservation = async (observation: Observation): Promise<{ analysis: string, severity: 'low' | 'medium' | 'high' }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    As a Lead Safety Auditor and Corporate Communications Specialist, evaluate this field data from ${observation.location}:
    Category: ${observation.category}
    Operational Area: ${observation.subCategory}
    Status: ${observation.isSafe ? 'COMPLIANT' : 'NON-COMPLIANT / RISK DETECTED'}
    Field Narrative: ${observation.comments}
    Remediation Actions: ${observation.correctiveAction || "None specified"}
    
    TASK:
    Generate a highly formal, corporate-grade safety insight. 
    Transform the language into sophisticated technical prose. 
    
    EXAMPLE ELEVATION:
    - If "Pest activity" is mentioned, use phrasing like "Potential vectors for infestation were assessed and mitigated."
    - If "Cross-contamination" is mentioned, use "Critical control points for microbial transfer were evaluated for integrity."
    - If "Pollution" is mentioned, refer to it as "Environmental stewardship protocols and discharge mitigation."

    The output 'analysis' must be 1-2 sentences of professional, high-standard prose suitable for executive summaries.
    Classify 'severity' (low, medium, high) based on the threat to operational continuity and personnel welfare.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            severity: { 
              type: Type.STRING,
              description: "Must be 'low', 'medium', or 'high'"
            }
          },
          required: ["analysis", "severity"]
        }
      }
    });

    const jsonStr = response.text?.trim() || '{}';
    const result = JSON.parse(jsonStr);
    
    return {
      analysis: result.analysis || "Audit protocol finalized. Integrity standards verified.",
      severity: (result.severity as 'low' | 'medium' | 'high') || (observation.isSafe ? 'low' : 'medium')
    };
  } catch (error) {
    console.error("Audit Intelligence Protocol Failure:", error);
    return {
      analysis: "Intelligence protocol offline. Manual verification of safety telemetry required per corporate standards.",
      severity: observation.isSafe ? 'low' : 'medium'
    };
  }
};
