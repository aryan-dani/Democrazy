import {
  scenarioPackCatalog,
  scenarioPacks,
  loadPackSteps,
  countScenariosAcrossPacks,
  longestPackScenarioCount,
} from "./packs/registry.js";

export {
  scenarioPackCatalog,
  scenarioPacks,
  loadPackSteps,
  countScenariosAcrossPacks,
  longestPackScenarioCount,
};

export function getLandingHeroStats() {
  return {
    scenarios: countScenariosAcrossPacks(scenarioPackCatalog),
    quizzes: quizQuestions.length,
    timelineStages: timelineStages.length,
    packs: scenarioPackCatalog.length,
  };
}

export const quizQuestions = [
  {
    id: 1,
    question: "What document is primarily required for voter ID verification at the polls?",
    options: [
      { text: "A library card", correct: false },
      { text: "A valid, state-issued photo ID", correct: true },
      { text: "A utility bill from any year", correct: false },
      { text: "A social media profile printout", correct: false },
    ],
    explanation:
      "A valid, state-issued photo ID is the primary document required to verify your identity at the polls in most jurisdictions.",
  },
  {
    id: 2,
    question: "What is the minimum voting age in the United States?",
    options: [
      { text: "16 years old", correct: false },
      { text: "18 years old", correct: true },
      { text: "21 years old", correct: false },
      { text: "There is no minimum age", correct: false },
    ],
    explanation:
      "The 26th Amendment to the U.S. Constitution, ratified in 1971, set the minimum voting age at 18 for all federal and state elections.",
  },
  {
    id: 3,
    question: "Which body is responsible for managing federal elections in the U.S.?",
    options: [
      { text: "The Supreme Court", correct: false },
      { text: "The Federal Election Commission (FEC)", correct: true },
      { text: "The Department of Defense", correct: false },
      { text: "The President's Cabinet", correct: false },
    ],
    explanation:
      "The FEC is an independent regulatory agency that administers and enforces federal campaign finance laws, overseeing the integrity of federal elections.",
  },
  {
    id: 4,
    question: "What happens if you are in line when the polls officially close?",
    options: [
      { text: "You are turned away and cannot vote", correct: false },
      { text: "You must return the next day", correct: false },
      { text: "You are legally allowed to stay and cast your vote", correct: true },
      { text: "Your vote is counted as provisional only", correct: false },
    ],
    explanation:
      "If you are in line before polls close, you are protected by law to stay in line and cast your ballot. This is a fundamental voter protection.",
  },
  {
    id: 5,
    question: "What is a 'down-ballot' race?",
    options: [
      { text: "A race that only happens during midterm elections", correct: false },
      {
        text: "Elections for local and state offices listed below the presidential race on the ballot",
        correct: true,
      },
      { text: "A special election called by the governor", correct: false },
      { text: "A runoff election between two candidates", correct: false },
    ],
    explanation:
      "Down-ballot races refer to elections for local and state offices that appear below the top-of-ticket races. These officials often have the most direct impact on your daily life.",
  },
  {
    id: 6,
    question: "What is the safest first step before sharing sensational election screenshots?",
    options: [
      { text: "Share immediately with 'could be fake' disclaimers", correct: false },
      {
        text: "Trace the screenshot to primary sources published by administrators",
        correct: true,
      },
      { text: "DM it to election officials anonymously without context", correct: false },
      { text: "Crop out timestamps so it spreads faster", correct: false },
    ],
    explanation:
      "Election misinformation thrives on cropped context. Showing the originating URL, timestamps, or official confirmations keeps your network anchored to reality.",
  },
  {
    id: 7,
    question: "Why do local governments publish meeting agendas ahead of hearings?",
    options: [
      { text: "To hide deliberations behind PDF paywalls", correct: false },
      { text: "To notify residents what can legally be debated that night", correct: true },
      { text: "To confuse journalists with jargon", correct: false },
      { text: "Agendas never matter because votes are scripted", correct: false },
    ],
    explanation:
      "Agendas tether public comment periods to specific statutes or ordinances, helping residents gather facts and coordinate testimony.",
  },
  {
    id: 8,
    question: "When should someone consider casting a provisional ballot?",
    options: [
      {
        text: "Whenever they dislike the registrar's tone",
        correct: false,
      },
      {
        text: "If eligibility uncertainty exists but election workers offer a contingency path while researching records",
        correct: true,
      },
      {
        text: "Only when voting by mail domestically without postage",
        correct: false,
      },
      { text: "Never — provisional ballots aren't real", correct: false },
    ],
    explanation:
      "Provisional ballots protect voters facing address or ID discrepancies while officials verify lawful participation under state rules.",
  },
];

export const timelineStages = [
  {
    id: 1,
    title: "Announcement",
    icon: "campaign",
    quickExample:
      "Election offices publish calendars and deadlines so voters know where to verify registration.",
    description:
      "The electoral commission officially declares the election dates, guidelines, and registration periods.",
    status: "completed",
    details: [
      "Election date is formally set",
      "Voter registration period opens",
      "Candidate filing deadlines announced",
      "Polling station locations published",
    ],
  },
  {
    id: 2,
    title: "Campaigning",
    icon: "groups",
    quickExample: "You compare claims using primary sources rather than resharing clipped videos.",
    description:
      "Candidates present their platforms to the public. Rallies, debates, and public discourse take center stage.",
    status: "active",
    details: [
      "Candidates hold rallies and town halls",
      "Televised debates are scheduled",
      "Campaign ads run across all media",
      "Voters research candidate platforms",
    ],
  },
  {
    id: 3,
    title: "Voting",
    icon: "how_to_vote",
    quickExample: "You bring acceptable ID where required or use mail/early voting where offered.",
    description:
      "Citizens cast their ballots at designated polling stations or via mail-in voting.",
    status: "upcoming",
    details: [
      "Early voting period begins",
      "Mail-in ballots are distributed",
      "Election Day voting at polling stations",
      "Accessibility accommodations provided",
    ],
  },
  {
    id: 4,
    title: "Counting",
    icon: "calculate",
    quickExample: "Observe that bipartisan teams often verify ballots to reduce doubt in results.",
    description:
      "Ballots are secured, verified, and tabulated by election officials under strict oversight.",
    status: "upcoming",
    details: [
      "Ballots transported under security",
      "Bipartisan counting teams verify",
      "Mail-in ballots processed and counted",
      "Preliminary results announced",
    ],
  },
  {
    id: 5,
    title: "Results",
    icon: "emoji_events",
    quickExample:
      "Certification happens publicly; losers concede transitions while audits continue behind the scenes.",
    description:
      "Official winners are announced and preparations for the transition of power begin.",
    status: "upcoming",
    details: [
      "Official certification of results",
      "Winners formally declared",
      "Transition planning begins",
      "Inauguration date confirmed",
    ],
  },
];
