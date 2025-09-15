import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const MODEL_NAME = "gemini-1.5-flash"; // Updated to current available model

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

export async function generateInvestmentRecommendations(
    user: {
        id: string;
        email: string;
        first_name?: string;
        last_name?: string;
        age?: number;
        risk_appetite?: string;
        total_balance?: number;
    },
    portfolioData?: {
        totalInvestment: number;
        investments: Array<{
            name: string;
            amount: number;
            type: string;
            annual_yield?: number;
        }>;
    }
) {
    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const userInfo = `
User Profile:
- Name: ${user.first_name || "User"} ${user.last_name || ""}
- Age: ${user.age || "Not specified"}
- Risk Appetite: ${user.risk_appetite || "moderate"}
- Current Balance: ₹${(user.total_balance || 0).toLocaleString()}`;

        const portfolioInfo = portfolioData
            ? `
Current Portfolio:
- Total Investment: ₹${portfolioData.totalInvestment.toLocaleString()}
- Number of investments: ${portfolioData.investments.length}
- Investment breakdown:
${portfolioData.investments
    .map(
        (inv) =>
            `  • ${inv.name} (${inv.type}): ₹${inv.amount.toLocaleString()} ${
                inv.annual_yield ? `@ ${inv.annual_yield}% yield` : ""
            }`
    )
    .join("\n")}`
            : "\nCurrent Portfolio: No active investments";

        const prompt = `As an AI investment advisor, provide personalized investment recommendations for this user:
${userInfo}${portfolioInfo}

Please provide exactly 3-4 specific investment recommendations in the following format:

* **[Investment Product Name]**: [Detailed description of the investment, why it's suitable, expected returns, and risk factors. Include specific fund names or investment options where applicable.]

* **[Investment Product Name]**: [Detailed description of the investment, why it's suitable, expected returns, and risk factors. Include specific fund names or investment options where applicable.]

* **[Investment Product Name]**: [Detailed description of the investment, why it's suitable, expected returns, and risk factors. Include specific fund names or investment options where applicable.]

* **[Investment Product Name]**: [Detailed description of the investment, why it's suitable, expected returns, and risk factors. Include specific fund names or investment options where applicable.]

Guidelines:
- Focus on specific investment products available in Indian markets
- Consider the user's age (${
            user.age || "young adult"
        }) for long-term vs short-term strategies
- Match recommendations to their ${
            user.risk_appetite || "moderate"
        } risk appetite
- Include specific fund names, ETFs, or investment options where possible
- Each recommendation should be at least 50 words with actionable details
- Do not include preambles, headers, or general advice - only the bullet-pointed recommendations`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return (
            response.text() || "Unable to generate personalized recommendations"
        );
    } catch (error) {
        console.error("Error generating recommendations:", error);
        return `Based on your ${
            user.risk_appetite || "moderate"
        } risk appetite and current profile, consider diversifying across different asset classes. Focus on a balanced mix of equity and debt instruments. Given your age${
            user.age ? ` of ${user.age}` : ""
        }, consider ${
            user.age && user.age < 35 ? "growth-oriented" : "balanced"
        } investment strategies.`;
    }
}

export async function generatePortfolioAnalysis(
    user: {
        id: string;
        email: string;
        first_name?: string;
        last_name?: string;
        age?: number;
        risk_appetite?: string;
        total_balance?: number;
    },
    portfolioData: {
        totalValue: number;
        investments: Array<{
            name: string;
            amount: number;
            returns?: number;
            type: string;
            annual_yield?: number;
            investment_products?: {
                name: string;
                investment_type: string;
                risk_level: string;
                annual_yield: number;
            };
        }>;
    }
) {
    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const userInfo = `
Investor Profile:
- Name: ${user.first_name || "User"} ${user.last_name || ""}
- Age: ${user.age || "Not specified"}
- Risk Appetite: ${user.risk_appetite || "moderate"}
- Total Balance: ₹${(user.total_balance || 0).toLocaleString()}`;

        const prompt = `Analyze this investment portfolio and provide comprehensive insights:
${userInfo}

Portfolio Analysis:
Total Portfolio Value: ₹${portfolioData.totalValue.toLocaleString()}

Investment Details:
${portfolioData.investments
    .map((inv) => {
        const product = inv.investment_products;
        return `- ${inv.name} (${product?.investment_type || inv.type})
   Amount: ₹${inv.amount.toLocaleString()}
   Expected Yield: ${product?.annual_yield || inv.annual_yield || "N/A"}%
   Risk Level: ${product?.risk_level || "Not specified"}
   ${inv.returns ? `Current Returns: ${inv.returns}%` : ""}`;
    })
    .join("\n")}

Please provide a detailed analysis including:
1. Portfolio diversification assessment considering the user's age and risk appetite
2. Risk-return analysis and alignment with user's risk tolerance
3. Performance evaluation of current investments
4. Asset allocation recommendations based on user profile
5. Specific suggestions for portfolio optimization
6. Age-appropriate investment strategy recommendations

Consider the user's profile and provide personalized insights formatted in clear sections with actionable recommendations.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return (
            response.text() ||
            "Unable to generate comprehensive portfolio analysis"
        );
    } catch (error) {
        console.error("Error generating portfolio analysis:", error);
        return `Portfolio Analysis for ${
            user.first_name || "User"
        }: Your current portfolio of ₹${portfolioData.totalValue.toLocaleString()} shows ${
            portfolioData.investments.length
        } active investments. Based on your ${
            user.risk_appetite || "moderate"
        } risk appetite${
            user.age ? ` and age of ${user.age}` : ""
        }, consider reviewing your asset allocation periodically and rebalancing based on market conditions and your investment goals. Focus on maintaining diversification across different asset classes.`;
    }
}
