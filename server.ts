import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Serve static files from 'dist'
app.use(express.static(path.join(__dirname, 'dist')));

// Gemini API endpoint
app.post('/api/explain', async (req, res) => {
  try {
    const { component, topMaterial, runnerUpMaterial, topScore, runnerUpScore, weights, attribution } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not set.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `You are AutoMat AI, an expert materials scientist and mechanical engineer.
Provide a mathematically grounded, concise, and explainable AI justification for why ${topMaterial.name} (${topMaterial.grade}) is ranked #1 for a vehicle ${component} over the runner-up ${runnerUpMaterial.name} (${runnerUpMaterial.grade}) using the TOPSIS method.

Context:
- Selected Component: ${component}
- Weights applied: Strength: ${weights.strength}, Weight Reduction: ${weights.weight}, Cost: ${weights.cost}, Corrosion Resistance: ${weights.corrosion}, Wear Resistance: ${weights.wear}, Sustainability: ${weights.sustainability}
- Attribute Contributions to the Rank #1 score:
  Strength: ${attribution?.strength || 0}%, Weight Efficiency: ${attribution?.weight || 0}%, Cost Efficiency: ${attribution?.cost || 0}%, Corrosion Resistance: ${attribution?.corrosion || 0}%, Wear Resistance: ${attribution?.wear || 0}%, Sustainability: ${attribution?.sustainability || 0}%
- Rank #1 Material: ${topMaterial.name} (${topMaterial.grade}, Class: ${topMaterial.materialClass})
  Properties: Density: ${topMaterial.density} g/cm³, Yield Strength: ${topMaterial.strength} MPa, Cost Index: ${topMaterial.cost}, Corrosion: ${topMaterial.corrosion}/10, Wear: ${topMaterial.wear}/10, Sustainability: ${topMaterial.sustainability}/10, Elastic Modulus: ${topMaterial.elasticModulus} GPa, Hardness: ${topMaterial.hardness} HB.
  TOPSIS Score: ${topScore.toFixed(4)}
- Rank #2 Material (Runner-up): ${runnerUpMaterial.name} (${runnerUpMaterial.grade}, Class: ${runnerUpMaterial.materialClass})
  Properties: Density: ${runnerUpMaterial.density} g/cm³, Yield Strength: ${runnerUpMaterial.strength} MPa, Cost Index: ${runnerUpMaterial.cost}, Corrosion: ${runnerUpMaterial.corrosion}/10, Wear: ${runnerUpMaterial.wear}/10, Sustainability: ${runnerUpMaterial.sustainability}/10, Elastic Modulus: ${runnerUpMaterial.elasticModulus} GPa, Hardness: ${runnerUpMaterial.hardness} HB.
  TOPSIS Score: ${runnerUpScore.toFixed(4)}
  Confidence Gap (ΔS): ${(topScore - runnerUpScore).toFixed(4)}

Strict Constraints on Jargon & Content:
- NEVER mention: FEA, Finite Element Analysis, ANSYS, Thermodynamics, Viscoelastic analysis, FMVSS compliance, Fatigue simulation, Stress simulation, Structural synthesis, or Dynamic analysis. None of these have been computed.
- Restrict all explanations strictly to: TOPSIS scores, rank ordering, criteria weights, density, yield strength, elastic modulus, cost index, corrosion resistance, wear resistance, and sustainability index.
- Use simple, straightforward engineering language. Avoid unnecessary jargon.
- The explanation must be mathematically grounded.

Generate a structured analysis in JSON format with exactly the following 4 keys. Limit each section strictly to 3 to 4 lines:
1. "summary": (Why this material ranks first) Explain using its TOPSIS score and the active criteria weights.
2. "comparison": (Why the runner-up ranks lower) Explain using the performance difference (ΔS) and specific tradeoffs.
3. "tradeoffs": (Key compromises) Discuss compromises in terms of strength, weight, cost, corrosion, wear, and sustainability.
4. "conclusion": (Practical recommendation) State where the material would be suitable for engineering implementation.

Output only valid JSON. Do not wrap it in markdown blocks or json block formatting. Output the raw JSON string directly.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text;
    res.json(JSON.parse(text || '{}'));
  } catch (error: any) {
    console.error('Error generating explanation:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
