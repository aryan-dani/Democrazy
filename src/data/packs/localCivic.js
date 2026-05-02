/** @typedef {{ id:number,phase:string,scenario:string,options:{text:string,correct?:boolean,feedback?:string}[],explanation?:string,didYouKnow?:string,pitfall?:string}} SimulationStep */

/** @type {SimulationStep[]} */
export const localCivicSteps = [
  {
    id: 9,
    phase: "Public Comment",
    scenario:
      "Your city proposes a zoning change that could reshape your neighborhood park. You're given 2 minutes at a council meeting tonight. What's the smartest way to participate?",
    options: [
      {
        text: "Skip the agenda and talk about unrelated national politics",
        correct: false,
        feedback:
          "Public meetings are time-boxed — stay on-topic and cite how the ordinance affects neighbors you represent (even if that's just yourself).",
      },
      {
        text: "Read the posted agenda, reference the specific ordinance, and summarize your stance with concrete concerns",
        correct: true,
        feedback:
          "Agenda-linked comments are actionable and more likely to be recorded for staff follow-up.",
      },
      {
        text: "Only sign an online petition and never verify it was officially submitted",
        correct: false,
        feedback:
          "Petitions matter, but they aren't a substitute for understanding the ordinance and verifying what's actually on file.",
      },
    ],
    explanation:
      "Local decisions move on agendas, drafts, and public comment windows. Naming the ordinance and your stake shows you understood the proposal.",
    didYouKnow:
      "Minutes and recordings of public hearings are typically public documents you can revisit later.",
    pitfall:
      "Council bodies often legally must limit discussion to agenda items — going off-topic can get your time cut.",
  },
  {
    id: 10,
    phase: "Open Records",
    scenario:
      "You want emails between a commissioner and a developer about a sweetheart deal rumor. You're told 'it's classified.' What's your move?",
    options: [
      {
        text: "Accept the secrecy and circulate the rumor on social instead",
        correct: false,
        feedback:
          "Vague secrecy claims amplify gossip. Institutions have formal processes to ask for accountable records.",
      },
      {
        text: "Submit a written records request referencing the statutes your jurisdiction uses",
        correct: true,
        feedback:
          "Sunshine/public records laws outline timelines and exemptions — submitting a polite, specific request is the authoritative path.",
      },
      {
        text: "Call the nightly news anonymously and exaggerate quotes",
        correct: false,
        feedback:
          "Escalating through media sometimes helps, but it still helps to have documents grounded in factual requests.",
      },
    ],
    explanation:
      "Public records regimes exist so residents can inspect how decisions are influenced. Procedures vary — follow your clerk's instructions diligently.",
    didYouKnow:
      "Fees for copies or redactions are common; narrowing your request lowers cost and turnaround time.",
    pitfall:
      "Assuming verbal denials equal final answers — appeal processes often exist.",
  },
  {
    id: 11,
    phase: "Committees",
    scenario:
      "A parks advisory commission is debating trail lighting. Seats are stacked with sports boosters — you rarely hike at night but care about equitable access.",
    options: [
      {
        text: "Do nothing — commissions are ceremonial anyway",
        correct: false,
        feedback:
          "Advisory bodies often shape staff recommendations councils vote on later. Showing up reshapes agendas.",
      },
      {
        text: "Attend anyway, amplify safety data for underserved routes, propose pilot lighting with community feedback milestones",
        correct: true,
        feedback:
          "Bringing equitable examples and phased pilots converts feelings into workable policy language.",
      },
      {
        text: "Shut down debate by shouting down other members",
        correct: false,
        feedback:
          "Decorum rules preserve your ability to lodge formal dissent on the record diplomatically.",
      },
    ],
    explanation:
      "Commissions marry expertise and constituency stories. Showing up repeatedly signals sustained priority.",
    didYouKnow:
      "Some bodies stream meetings — lurk first if you're nervous.",
    pitfall:
      "Letting a single-interest bloc appear unanimous when silent residents disagree quietly.",
  },
  {
    id: 12,
    phase: "Participatory Budgeting",
    scenario:
      "Your county experiments with letting residents prioritize $250k worth of civic mini-grants via ranked votes. Outreach is thin in immigrant-heavy precincts.",
    options: [
      {
        text: "Rank only your block's alley repair and ignore bridging outreach",
        correct: false,
        feedback:
          "Participatory processes lose legitimacy without broad participation — bridging matters.",
      },
      {
        text: "Co-host multilingual explainer flyers with civic orgs plus office hours translating the ballot workbook",
        correct: true,
        feedback:
          "Design justice means removing language and trust barriers BEFORE voting closes.",
      },
      {
        text: "Game the tally by forging duplicate ballots",
        correct: false,
        feedback:
          "Election integrity concepts apply analogously — fraud erodes institutional trust catastrophically.",
      },
    ],
    explanation:
      "Budgeting demos show democracies can distribute voice beyond ballots if inclusion is intentional.",
    didYouKnow:
      "Hybrid online + kiosk voting helps workers with irregular shifts.",
    pitfall:
      "Assuming 'open to all' without proactive translation still excludes.",
  },
  {
    id: 13,
    phase: "Charter Reform",
    scenario:
      "Activists circulate a ballot measure simplifying ranked-choice adoption for mayor. Signature gatherers bombard you downtown.",
    options: [
      {
        text: "Sign immediately because stickers look official",
        correct: false,
        feedback:
          "Verify petition language filed with elections officials BEFORE signing — skim summaries can mislead.",
      },
      {
        text: "Read the certified ballot title plus fiscal impact analyst note, debate tradeoffs at a community forum",
        correct: true,
        feedback:
          "Direct democracy still demands homework — summaries omit implementation edges.",
      },
      {
        text: "Vandalize opposing yard signs illegally",
        correct: false,
        feedback:
          "Coercion sabotages legitimacy even if frustrations run hot.",
      },
    ],
    explanation:
      "Ballot initiatives compress complex governance changes — cross-check proponents AND opponents.",
    didYouKnow:
      "Courts occasionally remove measures with misleading descriptions — verify latest filings.",
    pitfall:
      "Single-issue zeal can blind voters to unintended administrative burdens.",
  },
];
