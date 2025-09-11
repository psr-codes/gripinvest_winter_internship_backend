import OpenAI from "openai"

const openaiClient = new OpenAI({
  apiKey:
    "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",
})

export async function generateProductDescription(productData: {
  name: string
  type: string
  tenure: number
  annualYield: number
  riskLevel: string
  minInvestment?: number
}) {
  try {
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Generate a compelling and professional investment product description for the following details:
      
Product Name: ${productData.name}
Investment Type: ${productData.type}
Tenure: ${productData.tenure} months
Annual Yield: ${productData.annualYield}%
Risk Level: ${productData.riskLevel}
Min Investment: ₹${productData.minInvestment?.toLocaleString() || "Not specified"}

Create a description that:
- Highlights the key benefits and features
- Explains the investment opportunity clearly
- Mentions the risk level appropriately
- Is engaging but professional
- Is 2-3 paragraphs long
- Uses Indian Rupee context

Make it sound attractive to potential investors while being honest about risks.`,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    return response.choices[0]?.message?.content || "Unable to generate description"
  } catch (error) {
    console.error("Error generating product description:", error)
    return `${productData.name} is a ${productData.type.toLowerCase()} investment opportunity offering ${productData.annualYield}% annual returns over ${productData.tenure} months. This ${productData.riskLevel.toLowerCase()} risk investment provides a structured approach to wealth building with professional management and transparent reporting.`
  }
}

export async function generateInvestmentRecommendations(userProfile: {
  totalInvestment: number
  riskTolerance: string
  investmentGoals: string[]
}) {
  try {
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `As an AI investment advisor, provide personalized investment recommendations for a user with:
      
Current Portfolio Value: ₹${userProfile.totalInvestment.toLocaleString()}
Risk Tolerance: ${userProfile.riskTolerance}
Investment Goals: ${userProfile.investmentGoals.join(", ")}

Provide:
1. 3-4 specific investment recommendations
2. Portfolio diversification advice
3. Risk management tips
4. Market outlook considerations

Keep recommendations practical and suitable for Indian markets. Format as clear, actionable advice.`,
        },
      ],
      max_tokens: 600,
      temperature: 0.7,
    })

    return response.choices[0]?.message?.content || "Unable to generate recommendations"
  } catch (error) {
    console.error("Error generating recommendations:", error)
    return "Based on your portfolio, consider diversifying across different asset classes. Focus on a balanced mix of equity and debt instruments aligned with your risk tolerance."
  }
}

export async function generatePortfolioAnalysis(portfolioData: {
  totalValue: number
  investments: Array<{
    name: string
    amount: number
    returns: number
    type: string
  }>
}) {
  try {
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Analyze this investment portfolio and provide insights:

Total Portfolio Value: ₹${portfolioData.totalValue.toLocaleString()}
Number of Investments: ${portfolioData.investments.length}

Investment Breakdown:
${portfolioData.investments
  .map(
    (inv) =>
      `- ${inv.name}: ₹${inv.amount.toLocaleString()} (${inv.returns > 0 ? "+" : ""}${inv.returns.toFixed(1)}% returns)`,
  )
  .join("\n")}

Provide:
1. Portfolio performance analysis
2. Diversification assessment
3. Risk evaluation
4. Improvement suggestions
5. Market positioning

Keep analysis concise but insightful, focusing on actionable recommendations.`,
        },
      ],
      max_tokens: 600,
      temperature: 0.7,
    })

    return response.choices[0]?.message?.content || "Unable to generate analysis"
  } catch (error) {
    console.error("Error generating portfolio analysis:", error)
    return "Your portfolio shows a balanced approach to investing. Consider reviewing your asset allocation periodically and rebalancing based on market conditions and your investment goals."
  }
}
