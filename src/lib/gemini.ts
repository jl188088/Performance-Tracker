import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const analyzeWorkout = async (data: {
  distance: string;
  time: string;
  pace: string;
  cadence: string;
  heartRate: string;
  rpe: string;
  notes: string;
}) => {
  const prompt = `
    Analyze the following workout data as a professional sports scientist and running coach.
    
    INPUT DATA:
    Distance: ${data.distance} km
    Time: ${data.time}
    Pace: ${data.pace} min/km
    Cadence: ${data.cadence} spm
    Heart Rate: ${data.heartRate} bpm
    Perceived Exertion (RPE): ${data.rpe}/10
    Notes: ${data.notes}
    
    OUTPUT FORMAT (STRICT STRUCTURE):
    Always respond using the exact structure below:
    
    1. Workout Summary
    Provide a short, clear summary of the workout in human-readable form.
    
    2. Performance Analysis
    Analyze: pace consistency, endurance level, effort estimation, performance quality compared to typical standards.
    
    3. Strengths
    List what the user did well in bullet points.
    
    4. Weaknesses
    List areas that need improvement in bullet points.
    
    5. Fatigue & Recovery Estimate
    Estimate: fatigue level (Low / Medium / High), recovery time needed. Explain reasoning briefly.
    
    6. Injury Risk Score (0–100)
    Provide a numerical risk score based on: sudden workload increase, intensity, inconsistency, recovery signs. Explain the score in 1–2 sentences.
    
    7. Improvement Plan
    Give clear, actionable suggestions for the next workout: pacing advice, endurance tips, training adjustments.
    
    8. 7-Day Training Suggestion
    Generate a simple 7-day training plan based on current performance: include rest days, vary intensity, progressive overload approach.
    
    9. Athlete Profile
    Classify the user into one category such as: Beginner Runner, Endurance Builder, Speed Focused Athlete, Recreational Fitness User, Performance-Oriented Runner. Briefly justify the classification.
    
    10. Final Insight
    Give a short, powerful coaching-style takeaway sentence.
    
    BEHAVIOR RULES:
    - Be structured and professional at all times
    - Act like a sports performance AI, not a chatbot
    - Be concise but insightful
    - Do not be emotional or motivational in an exaggerated way
    - Focus on performance science, not casual fitness advice
    - Prioritize clarity and actionable insights
    - DO NOT include any introductory or concluding conversational text. Start directly with "1. Workout Summary".
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
  });

  return response.text;
};
