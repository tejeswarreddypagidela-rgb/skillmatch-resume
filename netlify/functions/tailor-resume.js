// Serverless function -- the only part of SkillMatch that talks to a network.
// Holds ANTHROPIC_API_KEY server-side (set as a Netlify environment variable,
// never shipped to the browser) and calls Claude to rewrite a resume against
// a specific job description. Everything else in this app stays 100% local;
// this endpoint is the one deliberate exception, and the UI discloses it.

const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic();

const MAX_INPUT_LENGTH = 20000;

const SYSTEM_PROMPT = `You are an expert resume writer. You rewrite resumes to better match a specific job description while staying strictly truthful to the candidate's real experience.

Rules:
- Never invent employers, job titles, dates, degrees, or skills/technologies the candidate has not mentioned.
- You MAY rephrase, reorder, tighten, and emphasize existing experience using terminology that mirrors the job description, and you MAY surface a skill the resume already demonstrates but doesn't name explicitly (e.g. resume mentions "built REST endpoints" and the JD wants "API design" -> you can add the phrase "API design").
- Do NOT add any of the job's missing/required skills unless the resume text already provides real evidence the candidate has that skill.
- Prefer strong action verbs and quantified outcomes only when the original resume already contains the underlying facts to quantify -- never fabricate numbers.
- Preserve the resume's real structure (same jobs, same order) -- this is a tailoring pass, not a rewrite from scratch.
- Output the complete tailored resume as plain text, ready to use.`;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const { resumeText, jobDescription, jobRole, missingSkills } = payload;

  if (typeof resumeText !== "string" || typeof jobDescription !== "string" || !resumeText.trim() || !jobDescription.trim()) {
    return { statusCode: 400, body: JSON.stringify({ error: "resumeText and jobDescription are required" }) };
  }
  if (resumeText.length > MAX_INPUT_LENGTH || jobDescription.length > MAX_INPUT_LENGTH) {
    return { statusCode: 400, body: JSON.stringify({ error: "Input too long" }) };
  }

  const missingList = Array.isArray(missingSkills) && missingSkills.length ? missingSkills.join(", ") : "none detected";

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Job Role: ${jobRole || "(not specified)"}

Job Description:
${jobDescription}

Skills this JD asks for that the current resume does NOT clearly demonstrate (do not fabricate these -- only weave them in if the resume text genuinely already shows evidence):
${missingList}

Current resume:
${resumeText}

Rewrite this resume to be better tailored to this job description, following the system rules exactly.`,
        },
      ],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              tailoredResume: { type: "string", description: "The full rewritten resume as plain text" },
              changes: {
                type: "array",
                items: { type: "string" },
                description: "3-6 short bullet points describing what was changed and why",
              },
            },
            required: ["tailoredResume", "changes"],
            additionalProperties: false,
          },
        },
      },
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock) {
      return { statusCode: 502, body: JSON.stringify({ error: "No response from model" }) };
    }

    const parsed = JSON.parse(textBlock.text);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    };
  } catch (err) {
    console.error("tailor-resume error:", err);
    return { statusCode: 502, body: JSON.stringify({ error: "Failed to tailor resume. Please try again." }) };
  }
};
