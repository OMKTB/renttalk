const CORS = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Methods":"POST,OPTIONS","Content-Type":"application/json"};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return {statusCode:200,headers:CORS,body:""};
  if (event.httpMethod !== "POST") return {statusCode:405,headers:CORS,body:"{}"};

  try {
    const { profile, freeText, problems, positive, region, incomeSource, depositIssue, conditionRating, landlordRating } = JSON.parse(event.body);

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_KEY || "", "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        messages: [{
          role: "user",
          content: `UK housing researcher. Create 4 personalised follow-up questions for this renter:

PROFILE: ${profile}
CHALLENGES: "${freeText}"
PROBLEMS: ${(problems||[]).join(", ")}
${positive ? "POSITIVES: " + positive : ""}
DEPOSIT: ${depositIssue || "none"}, CONDITION: ${conditionRating}/10, LANDLORD: ${landlordRating}/10

Generate questions SPECIFIC to their demographic, region (${region}), income source (${incomeSource}), and problems. Reference local context — councils, transport, universities, market conditions. Each question must be DIFFERENT and address a different aspect.

Return ONLY JSON array: [{"id":"ai1","q":"question text","o":["option1","option2","option3","option4"]},{"id":"ai2",...},{"id":"ai3",...},{"id":"ai4",...}]`
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
