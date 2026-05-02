/** @typedef {{ id:number,phase:string,scenario:string,options:{text:string,correct?:boolean,feedback?:string}[],explanation?:string,didYouKnow?:string,pitfall?:string}} SimulationStep */

/** @type {SimulationStep[]} */
export const misinformationLabSteps = [
  {
    id: 14,
    phase: "Deception Drill",
    scenario:
      "A hyper-real synthetic voice voicemail 'from the Registrar' urges you not to bother voting Tuesday because precincts consolidate at midnight nonsense. Caller ID spoofed flawless.",
    options: [
      {
        text: "Forward the clip to elders 'just in case'",
        correct: false,
        feedback:
          "Deepfaked audio weaponizes familiarity — escalate through official contradiction sources only.",
      },
      {
        text: "Open your state's SOS site or call county elections using a number YOU looked up independently",
        correct: true,
        feedback:
          "Authenticate channels you initiated — never reuse callback numbers buried in voicemail.",
      },
      {
        text: "Panic and shred your mailed ballot unsolicited",
        correct: false,
        feedback:
          "Destruction without guidance jeopardizes lawful participation — verify before acting radically.",
      },
    ],
    explanation:
      "Generative fakery concentrates near Election Day audio channels; slow down, originate verification yourself.",
    didYouKnow:
      "Some jurisdictions pilot signed SMS updates — enroll only via official onboarding.",
    pitfall:
      "Emotional urgency disables skeptical pause — attackers bank on scarcity mindset.",
  },
  {
    id: 15,
    phase: "Chain Hoax",
    scenario:
      "Group chat shares a TikTok asserting mail ballots default void if envelopes lack middle initials—even though yours lacks one.",
    options: [
      {
        text: "Screenshot and blast 'potential fraud'",
        correct: false,
        feedback:
          "Second-order rumors metastasize when screenshots strip context URLs.",
      },
      {
        text: "Locate the official curing/rejection FAQs PDF posted by your locality and quote the pertinent rule",
        correct: true,
        feedback:
          "Election laws differ — PDF bulletins authored by administering bodies beat viral creators.",
      },
      {
        text: "Assume it's true and skip mailing",
        correct: false,
        feedback:
          "Disenfranchising yourself prematurely hands victory to rumor architects.",
      },
    ],
    explanation:
      "Ballot curing rules evolve — citing admin PDF snippets helps friends internalize nuances.",
    didYouKnow:
      "Neutral hotlines staffed by librarians sometimes collate SOS links hourly pre-election.",
    pitfall:
      "Conflicting advice from partisan influencers masquerading as 'lawyers'",
  },
  {
    id: 16,
    phase: "Coercion Story",
    scenario:
      "Someone offers free merch if you snap a selfie with your ballot choices visible 'for audit transparency.'",
    options: [
      {
        text: "Do it secretly—who's harmed?",
        correct: false,
        feedback:
          "Ballot secrecy exists to thwart bribery ladders; selfies become leverage tokens.",
      },
      {
        text: "Refuse publicly and cite ballot privacy norms; optionally report solicitation depending on seriousness",
        correct: true,
        feedback:
          "Protect secrecy even when incentives sparkle—integrity depends on resisting micro-coercion.",
      },
      {
        text: "Blame strangers online without evidence",
        correct: false,
        feedback:
          "Document facts first; escalating publicly without timelines can amplify chaos.",
      },
    ],
    explanation:
      "'Receipt culture' clashes with secrecy goals—understand WHY photography rules exist.",
    didYouKnow:
      "Historical vote buying targeted visible proof—modern analog is photo leaks.",
    pitfall:
      "Youth-heavy campaigns sometimes gamify selfies—verify official guidance before joining trends.",
  },
  {
    id: 17,
    phase: "Turnout Trick",
    scenario:
      "Graph asserts Gen Z turnout 'collapsed' using truncated Y-axis meme format—friend feels hopeless.",
    options: [
      {
        text: "Argue temperamentally—you feel turnout is epic",
        correct: false,
        feedback:
          "Feelings duel feelings; authoritative datasets adjudicate responsibly.",
      },
      {
        text: "Open raw releases from administering bodies/academic repositories charting longitudinal turnout",
        correct: true,
        feedback:
          "Axis truncation is an ancient trick—full series plus methodology notes restore proportionality.",
      },
      {
        text: "Do nothing—they should feel bad",
        correct: false,
        feedback:
          "Apathy spirals amplify engineered demoralization—kind counter-evidence heals.",
      },
    ],
    explanation:
      "Graph literacy overlaps civic health—teach skepticism proportional to sensational framing.",
    didYouKnow:
      "Youth turnout fluctuates materially by GOTV modality—context matters geographically.",
    pitfall:
      "Cherrypicked single precinct screenshots masquerading as national truth.",
  },
  {
    id: 18,
    phase: "Media Diet",
    scenario:
      "Podcast insists exit polls before closure are scientifically predictive 'because math.' Anxiety spikes hourly.",
    options: [
      {
        text: "Refresh rogue aggregators obsessively overnight",
        correct: false,
        feedback:
          "Sleep deprivation + sampling illiteracy births snap judgments.",
      },
      {
        text: "Review how administering bodies embargo early precinct patterns and diversify inputs",
        correct: true,
        feedback:
          "Sampling frames + release governance explain volatility—trusted explainers outperform hype DJs.",
      },
      {
        text: "Call random strangers alleging fraud prematurely",
        correct: false,
        feedback:
          "Premature fraud narratives harm workers tabulating legitimately slowly.",
      },
    ],
    explanation:
      "Statistical temperament is patriotic patience—election science communication matters.",
    didYouKnow:
      "Confidence intervals exist for a reason—watch for pundits omitting margins.",
    pitfall:
      "Horse-race serotonin addiction displaces local action opportunities.",
  },
];
