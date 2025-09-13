import { type NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET(request: NextRequest) {
    try {
        if (!process.env.GOOGLE_AI_API_KEY) {
            throw new Error(
                "GOOGLE_AI_API_KEY environment variable is not set"
            );
        }

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

        // Test AI service with a simple prompt
        const result = await model.generateContent(
            "Test connection. Reply with 'OK'."
        );
        const response = await result.response;
        const text = response.text();

        if (!text) {
            throw new Error("No response from AI service");
        }

        return NextResponse.json({
            status: "healthy",
            service: "up",
            aiProvider: "Google Gemini",
            modelVersion: "1.0-pro",
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("AI health check failed:", error);
        return NextResponse.json(
            {
                status: "error",
                service: "degraded",
                aiProvider: "Google Gemini",
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: new Date().toISOString(),
            },
            { status: 503 }
        );
    }
}

// HEAD request for lightweight checks
export async function HEAD(request: NextRequest) {
    return new Response(null, { status: 200 });
}
