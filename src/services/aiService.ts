import { GoogleGenAI, Type } from "@google/genai";
import { collection, addDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Agent, Document, Policy, AuditLog } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface ValidationResult {
  riskScore: number;
  complianceStatus: 'COMPLIANT' | 'VIOLATION' | 'WARNING';
  details: string;
}

export async function analyzeRisk(prompt: string, policies: Policy[]): Promise<ValidationResult> {
  const activePolicies = policies.filter(p => p.isActive);
  if (activePolicies.length === 0) {
    return { riskScore: 0, complianceStatus: 'COMPLIANT', details: 'No active policies' };
  }

  const policyText = activePolicies.map(p => `- ${p.name}: ${p.rules.join(', ')}`).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following user prompt against the security policies provided.
      
Policies:
${policyText}

User Prompt:
"${prompt}"

Return a JSON object with:
- riskScore (0-100)
- complianceStatus (COMPLIANT, VIOLATION, WARNING)
- details (A short explanation of why this status was chosen)`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.NUMBER },
            complianceStatus: { type: Type.STRING },
            details: { type: Type.STRING },
          },
          required: ["riskScore", "complianceStatus", "details"],
        },
      },
    });

    return JSON.parse(response.text || '{}') as ValidationResult;
  } catch (error) {
    console.error("Risk analysis failed:", error);
    return { riskScore: 50, complianceStatus: 'WARNING', details: 'Risk analysis engine timed out' };
  }
}

export async function executeAgent(
  projectId: string,
  agent: Agent,
  prompt: string,
  userId: string
): Promise<string> {
  // 1. Fetch relevant documents for context (RAG)
  const docsRef = collection(db, `projects/${projectId}/documents`);
  const docsSnap = await getDocs(docsRef);
  const context = docsSnap.docs.map(d => d.data() as Document).map(d => d.content).join('\n\n---\n\n');

  // 2. Fetch policies
  const policiesRef = collection(db, `projects/${projectId}/policies`);
  const policiesSnap = await getDocs(policiesRef);
  const policies = policiesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Policy));

  // 3. Analyze Risk FIRST
  const validation = await analyzeRisk(prompt, policies);

  // If critical violation, we might want to block, but for now we follow through and log
  const systemInstruction = `
${agent.systemInstruction}

CONTEXT FROM KNOWLEDGE BASE:
${context}

GOVERNANCE STATUS: ${validation.complianceStatus} (Risk Score: ${validation.riskScore})
GOVERNANCE DETAILS: ${validation.details}

If the status is VIOLATION, respond by explaining that the request violates security protocols. 
Otherwise, answer based on the context provided.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    const resultText = response.text || "I was unable to process that request due to a neural connection error.";

    // 4. Log the audit event
    await addDoc(collection(db, `projects/${projectId}/audit_logs`), {
      projectId,
      agentId: agent.id,
      userId,
      prompt,
      response: resultText,
      riskScore: validation.riskScore,
      complianceStatus: validation.complianceStatus,
      hallucinationDetected: false, // Placeholder for future enhancement
      validationDetails: validation.details,
      createdAt: serverTimestamp(),
    });

    return resultText;
  } catch (error) {
    console.error("Agent execution failed:", error);
    throw error;
  }
}
