/**
 * Server-side summaries for Gemini — keep in sync with `src/data/packs/registry.js` ids.
 */
export const PACK_BRIEFS = {
  "election-prep": {
    theme:
      "U.S.-style voter lifecycle: registration, verifying campaign claims, election day norms, ballot handling, trusting certification, staying engaged afterward.",
    learningGoals: [
      "Register and update voter info before deadlines",
      "Verify information with official and nonpartisan sources",
      "Know in-line voting rights and down-ballot preparation",
      "Avoid spreading election misinformation",
    ],
    maxTurns: 10,
    tone: "Second-person immersive civic education. Practical, neutral, accurate. Encourage verifying with official election websites.",
  },
  "local-civic": {
    theme:
      "Local democracy: zoning feedback, FOIA-ish public records intuition, commissions, participatory budgeting vibes, petitions.",
    learningGoals: [
      "Understand how local bodies differ from federal elections",
      "Use public notices and agendas",
      "Participate effectively in hearings and petitions",
    ],
    maxTurns: 10,
    tone: "Grounded municipal civics scenarios. Neutral, pragmatic, cite reading agendas and clerk offices — not invented legal citations.",
  },
  "misinformation-lab": {
    theme:
      "Rapid-response drills against hoaxes about dates, ballots, turnout, AI-generated impersonation.",
    learningGoals: [
      "Pause-verify-share protocol",
      "Recognize coercion and ballot secrecy myths",
      "Use primary sources for procedural facts",
    ],
    maxTurns: 12,
    tone: "Tense but responsible. Emphasize safety, official sources, and not amplifying dubious claims.",
  },
};
