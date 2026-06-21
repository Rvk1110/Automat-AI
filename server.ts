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
    
    const prompt = `You are AutoMat AI, an expert materials scientist and automotive design engineer.
Provide a mathematically rigorous, detailed, and explainable AI justification for why ${topMaterial.name} (${topMaterial.grade}) is ranked #1 for a vehicle ${component} over the runner-up ${runnerUpMaterial.name} (${runnerUpMaterial.grade}) using the TOPSIS method.

Context:
- Selected Component: ${component}
- Weights applied: Strength: ${weights.strength}, Mass Reduction (Density): ${weights.weight}, Cost: ${weights.cost}, Corrosion Shield: ${weights.corrosion}, Wear Resistance: ${weights.wear}, Eco Sustainability: ${weights.sustainability}
- Attribute Contributions to the Rank #1 score:
  Strength: ${attribution?.strength || 0}%, Weight Efficiency: ${attribution?.weight || 0}%, Cost Efficiency: ${attribution?.cost || 0}%, Corrosion Shield: ${attribution?.corrosion || 0}%, Wear Resistance: ${attribution?.wear || 0}%, Sustainability: ${attribution?.sustainability || 0}%
- Rank #1 Material: ${topMaterial.name} (${topMaterial.grade}, Class: ${topMaterial.materialClass})
  Properties: Density: ${topMaterial.density} g/cm³, Tensile Strength: ${topMaterial.strength} MPa, Cost Score: ${topMaterial.cost}, Corrosion: ${topMaterial.corrosion}/10, Wear: ${topMaterial.wear}/10, Sustainability: ${topMaterial.sustainability}/10, Elastic Modulus: ${topMaterial.elasticModulus} GPa, Hardness: ${topMaterial.hardness} HB.
  TOPSIS Score: ${topScore.toFixed(4)}
- Rank #2 Material (Runner-up): ${runnerUpMaterial.name} (${runnerUpMaterial.grade}, Class: ${runnerUpMaterial.materialClass})
  Properties: Density: ${runnerUpMaterial.density} g/cm³, Tensile Strength: ${runnerUpMaterial.strength} MPa, Cost Score: ${runnerUpMaterial.cost}, Corrosion: ${runnerUpMaterial.corrosion}/10, Wear: ${runnerUpMaterial.wear}/10, Sustainability: ${runnerUpMaterial.sustainability}/10, Elastic Modulus: ${runnerUpMaterial.elasticModulus} GPa, Hardness: ${runnerUpMaterial.hardness} HB.
  TOPSIS Score: ${runnerUpScore.toFixed(4)}
  Confidence Gap (ΔS): ${(topScore - runnerUpScore).toFixed(4)}

Generate a structured analysis in JSON format with exactly the following 4 keys:
1. "summary": A concise technical summary (2-3 sentences) explaining why the top material was selected. Mention the component, key weights, and TOPSIS index. Mention how the strongest contributing attribute of ${attribution?.strength || 0}% strength / ${attribution?.weight || 0}% weight efficiency influenced this choice.
2. "comparison": A detailed comparison of the top material and the runner-up, highlighting the performance differential (ΔS) and why the runner-up was not chosen despite any competitive single-property advantages.
3. "tradeoffs": A balanced discussion of the trade-offs and compromises involved in selecting the top material (e.g., cost premium vs. weight savings, or density footprint), referencing mechanical limits or compliance factors.
4. "conclusion": An engineering conclusion confirming compliance with Federal Motor Vehicle Safety Standards (FMVSS) for integration in the ${component}, stating why it provides the best lifecycle/structural compromise.

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
