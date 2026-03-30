const CORS = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Methods":"POST,OPTIONS","Content-Type":"application/json"};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return {statusCode:200,headers:CORS,body:""};
  if (event.httpMethod !== "POST") return {statusCode:405,headers:CORS,body:"{}"};

  try {
    const body = JSON.parse(event.body);
    const { profile, freeText, problems, positive, region, incomeSource, 
            depositIssue, conditionRating, landlordRating, sentiment, commonProblems, avgRating } = body;

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_KEY || "", "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 900,
        messages: [{
          role: "user",
          content: `You are a UK housing researcher creating personalised survey follow-up questions.

RESPONDENT PROFILE: ${profile}
THEIR CHALLENGES: "${freeText}"
${positive ? "POSITIVE ASPECTS: " + positive : "No positives mentioned"}
IDENTIFIED PROBLEMS: ${(problems||[]).join(", ")}
SENTIMENT: ${sentiment || "mixed"} (${sentiment === "positive" ? "their experience has been good — explore what works and how to improve" : sentiment === "negative" ? "they're struggling — but still include options for any bright spots" : "mixed experience — explore both sides"})
DEPOSIT: ${depositIssue || "not mentioned"}, CONDITION: ${conditionRating}/10, LANDLORD: ${landlordRating}/10
COMMON PROBLEMS IN ${region}: ${(commonProblems||[]).join(", ") || "unknown"}
AVERAGE REGIONAL RATING: ${avgRating || "unknown"}/10

RULES:
- Generate exactly 4 follow-up questions
- Each question MUST be different from the others — different topic, different angle
- Every question MUST include at least one positive option and one negative option
- Questions should be specific to ${region} and the respondent's demographic
- Reference local context: councils, transport, universities, employers, housing market
- Maintain NEUTRAL tone — don't assume everything is bad
- If sentiment is positive, ask what makes it work and how to preserve/improve it
- If sentiment is negative, still offer positive answer choices — maybe something is okay
- If they're a student: ask about term-time vs summer, uni accommodation, post-grad plans
- If on benefits: ask about LHA gaps, council waiting lists, UC housing element
- If non-UK: ask about documentation, discrimination, cultural adjustment

Return ONLY valid JSON: [{"id":"ai1","q":"question","o":["negative option","moderate option","positive option","neutral option"]},...]`
        }]
      })
    });

    if (!r.ok) throw new Error("API " + r.status);
    const data = await r.json();
    const txt = data.content?.filter(c => c.type === "text").map(c => c.text).join("");
    const questions = JSON.parse(txt.replace(/```json|```/g, "").trim());
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ questions }) };
  } catch (e) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message }) };
  }
};
