import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const MODEL_NAME = "gemini-1.0-pro";

export async function generateProductDescription(productData: {
    name: string;
    type: string;
    tenure: number;
    annualYield: number;
    riskLevel: string;
    minInvestment?: number;
}) {
    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const prompt = `Generate a compelling and professional investment product description for the following details:
      
Product Name: ${productData.name}
Investment Type: ${productData.type}
Tenure: ${productData.tenure} months
Annual Yield: ${productData.annualYield}%
Risk Level: ${productData.riskLevel}
Min Investment: ₹${
            productData.minInvestment?.toLocaleString() || "Not specified"
        }

Create a description that:
- Highlights the key benefits and features
- Explains the investment opportunity clearly
- Mentions the risk level appropriately
- Is engaging but professional
- Is 2-3 paragraphs long
- Uses Indian Rupee context

Make it sound attractive to potential investors while being honest about risks.`;

        const result = await model.generateContent(prompt);

        const response = await result.response;
        return response.text() || "Unable to generate description";
    } catch (error) {
        console.error("Error generating product description:", error);
        return `${
            productData.name
        } is a ${productData.type.toLowerCase()} investment opportunity offering ${
            productData.annualYield
        }% annual returns over ${
            productData.tenure
        } months. This ${productData.riskLevel.toLowerCase()} risk investment provides a structured approach to wealth building with professional management and transparent reporting.`;
    }
}

export async function generateInvestmentRecommendations(userProfile: {
    totalInvestment: number;
    riskTolerance: string;
    investmentGoals: string[];
}) {
    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const prompt = `As an AI investment advisor, provide personalized investment recommendations for a user with:
      
Current Portfolio Value: ₹${userProfile.totalInvestment.toLocaleString()}
Risk Tolerance: ${userProfile.riskTolerance}
Investment Goals: ${userProfile.investmentGoals.join(", ")}

Provide:
1. 3-4 specific investment recommendations
2. Portfolio diversification advice
3. Risk management tips
4. Market outlook considerations

Keep recommendations practical and suitable for Indian markets. Format as clear, actionable advice.`;

        const result = await model.generateContent(prompt);

        const response = await result.response;
        return response.text() || "Unable to generate recommendations";
    } catch (error) {
        console.error("Error generating recommendations:", error);
        return "Based on your portfolio, consider diversifying across different asset classes. Focus on a balanced mix of equity and debt instruments aligned with your risk tolerance.";
    }
}

export async function generatePortfolioAnalysis(portfolioData: {
    totalValue: number;
    investments: Array<{
        name: string;
        amount: number;
        returns: number;
        type: string;
    }>;
}) {
    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const prompt = `Analyze this investment portfolio and provide insights:

Total Portfolio Value: ₹${portfolioData.totalValue.toLocaleString()}

Investments:
${portfolioData.investments
    .map(
        (inv) =>
            `- ${inv.name} (${inv.type})
   Amount: ₹${inv.amount.toLocaleString()}
   Returns: ${inv.returns}%`
    )
    .join("\n")}

Please provide:
1. Portfolio diversification analysis
2. Risk assessment
3. Performance evaluation
4. Recommendations for optimization

Format the analysis in clear sections with actionable insights.`;

        const result = await model.generateContent(prompt);

        const response = await result.response;
        return response.text() || "Unable to generate analysis";
    } catch (error) {
        console.error("Error generating portfolio analysis:", error);
        return "Your portfolio shows a balanced approach to investing. Consider reviewing your asset allocation periodically and rebalancing based on market conditions and your investment goals.";
    }
}
