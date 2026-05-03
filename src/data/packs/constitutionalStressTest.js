/** @typedef {{ id:number,phase:string,scenario:string,options:{text:string,correct?:boolean,feedback?:string}[],explanation?:string,didYouKnow?:string,pitfall?:string}} SimulationStep */

/** Scenarios stressing institutions, layered government, and how rules change across states without partisan messaging. */

/** @type {SimulationStep[]} */
export const constitutionalStressTestSteps = [
  {
    id: 1,
    phase: "Institutions",
    scenario:
      "A friend insists the presidential winner always aligns with whoever got the highest national vote share. Someone else says 'the Electoral College can diverge.' You want one accurate teaching point.",
    options: [
      {
        text: "Assume the electoral vote can differ from nationwide popular totals because electors—not raw national vote share—finalize the presidency under the Constitution.",
        correct: true,
        feedback:
          "Right framing: the Presidential election is mediated by electoral votes allocated by state outcomes; national aggregates are informative but not the legal finish line.",
      },
      {
        text: "Assert that whichever candidate leads TV popular-vote trackers on election night wins automatically nationwide.",
        correct: false,
        feedback:
          "Early national leads ignore timing of counts and differing state rules—the formal decision follows certified electors.",
      },
      {
        text: "Tell classmates to ignore precinct math because courts pick the outcome before votes are summed.",
        correct: false,
        feedback:
          "Courts adjudicate discrete disputes—they do not replace vote counting wholesale without specific legal triggers.",
      },
    ],
    explanation:
      "The Electoral College apportions influence by state contests; divergence between national plurality and electoral outcomes is uncommon but constitutionally plausible—focus learners on respecting certified timelines.",
    didYouKnow:
      "Electors formally cast votes weeks after Election Day once states certify totals—dramatic cable graphics are not certifications.",
    pitfall:
      "Confidence memes quoting partial national aggregates spread faster than state canvassing updates—tie conversation to sourcing rules.",
  },
  {
    id: 2,
    phase: "Certification",
    scenario:
      "County totals look close. A clip claims 'automatic nationwide recount triggers at 1% margins.' You're moderating peer chat responsibly.",
    options: [
      {
        text: "Note recounts & audits hinge on statutes and petitions that differ by state—even for federal offices.",
        correct: true,
        feedback:
          "Good: avoid universal rules; point peers to bipartisan canvass statements and statutes that govern retriggers.",
      },
      {
        text: "Assume the Supreme Court mandates identical recount procedures in every precinct overnight.",
        correct: false,
        feedback:
          "SCOTUS sets outer boundaries on equal protection—not a uniform nationwide recount playbook written in marble.",
      },
      {
        text: "Declare all mail ballots invalid if any batch arrives after local poll close regardless of postmark exceptions.",
        correct: false,
        feedback:
          "Mail eligibility windows are spelled out publicly—panic posts rarely capture postmark carve-outs enacted per state.",
      },
    ],
    explanation:
      "Recounts, canvasses, certifications, & court challenges weave together from local canvassing boards outward; teach peers to cite official bulletins—not anonymous threads.",
    didYouKnow:
      "Many states offer risk-limiting audits as routine quality checks even when margins look comfortable.",
    pitfall:
      "Screenshots trimmed to two decimal rows hide provisionals still under verification—stress full certification cycles.",
  },
  {
    id: 3,
    phase: "Rights & Logistics",
    scenario:
      "Outside a polling church, activists shout stump speeches inches from anxious first-time voters. The group asks what distinguishes protected speech versus intimidation near voting.",
    options: [
      {
        text: "Point to layering: First Amendment corridors exist, yet states create buffer zones banning electioneering or intimidation tactics at the door.",
        correct: true,
        feedback:
          "Balancing act: bans on disorderly intrusion near ballot access coexist with rallies farther away governed by ordinances.",
      },
      {
        text: "Insist microphones are permitted anywhere voters queue because sidewalks are purely private property.",
        correct: false,
        feedback:
          "Many queue areas mix public/private easements plus state electioneering setbacks—coordinate with poll workers if unsafe.",
      },
      {
        text: "Demand police arrest anyone wearing a slogan T-shirt statewide.",
        correct: false,
        feedback:
          "Broad clothing bans seldom track actual law absent targeted intimidation; specifics vary by locality.",
      },
    ],
    explanation:
      "Voter intimidation statutes and electioneering setbacks protect access while political expression continues beyond those lines—call officials if behavior feels coercive.",
    didYouKnow:
      "Nonpartisan Election Protection hotlines exist in many locales to escalate interference quickly.",
    pitfall:
      "Citizen 'debates' in tight queues can escalate; de-escalate by alerting poll judges rather than arguing in line.",
  },
  {
    id: 4,
    phase: "Separation",
    scenario:
      "Congress debates a hypothetical bill shortening presidential terms retroactively mid-cycle. Classmates ask whether simple majority votes can reorder White House timelines instantly.",
    options: [
      {
        text: "Explain statutes cannot rewrite fixed constitutional tenure without amendment processes—even dramatic floor speeches.",
        correct: true,
        feedback:
          "Article II + amendment paths matter; statutory theater without ratifications does not reschedule terms.",
      },
      {
        text: "Assume the House alone can reschedule inauguration by voice vote anytime.",
        correct: false,
        feedback:
          "Dates like inauguration stem from statutes informed by electoral outcomes—not casual suspension orders.",
      },
      {
        text: "Declare generals certify who holds executive power irrespective of ballots.",
        correct: false,
        feedback:
          "Civilian control means lawful civilian outcomes + statutory succession ladders—not ad hoc pronouncements.",
      },
    ],
    explanation:
      "Constitutional durations and orderly succession constrain rapid-fire tweaks; distinguishing political drama from lawful processes builds resilience to panic posts.",
    didYouKnow:
      "Congress has amended procedural dates before—but historically through statutes synchronized with electoral reality, not random rescissions.",
    pitfall:
      "Novel TikTok hypotheses about removals often skip enumerated impeachment/removal distinctions—bring conversation back to public texts.",
  },
  {
    id: 5,
    phase: "Federalism",
    scenario:
      "Election Twitter claims 'Congress picked the President last cycle because no one cracked 270.' Fact-check politely with concepts, not punditry.",
    options: [
      {
        text: "Describe contingent House votes as a rare Constitutional backup when nobody secures an electoral majority after electors.",
        correct: true,
        feedback:
          "Good—note state delegation mechanics & rarity so learners don't confuse normal plurality wins with contingency drama.",
      },
      {
        text: "Announce the Senate casually chooses presidents whenever cable maps look confusing.",
        correct: false,
        feedback:
          "Senate contingency roles differ conceptually—tie-break on VP—not automatic presidential substitutions.",
      },
      {
        text: "Guess that governors nullify ballots they dislike before electors vote.",
        correct: false,
        feedback:
          "Governors certify slates pursuant to canvassed outcomes—wholesale tossing requires lawful processes and scrutiny.",
      },
    ],
    explanation:
      "The Twelfth Amendment outlines contingent procedures; emphasizing how unlikely they remain compared to decisive elector slates wards off stochastic anxiety.",
    didYouKnow:
      "Faithless electors have faced tighter state pledges lately—study your state's oath regime when discussing contingency myths.",
    pitfall:
      "Cartoon arcs about smoke-filled contingency rooms overshadow routine certification—keep timelines transparent.",
  },
  {
    id: 6,
    phase: "Representation",
    scenario:
      "Class debate: 'Residents in DC have identical Congressional voting power.' You want academically precise shorthand.",
    options: [
      {
        text: "Contrast shadow representation: DC participates in Presidential elections via the 23rd Amendment but lacks full voting senators/reps like states.",
        correct: true,
        feedback:
          "Precise distinctions matter for advocacy vs civics quizzes—celebrate activism without misstating Constitutional seats.",
      },
      {
        text: "Claim DC ballots count toward House apportionment just like Wyoming's second senator.",
        correct: false,
        feedback:
          "Apportionment math differs—DC lacks standard Senate pair while pursuing statehood/policy debates politically.",
      },
      {
        text: "Assume territories automatically convert overnight into states after any census spike.",
        correct: false,
        feedback:
          "State admissions require Congressional pathways—statistics alone do not teleport seats.",
      },
    ],
    explanation:
      "Structural representation gaps fuel reform conversations; grounding facts empowers learners to argue policy without rewriting civics textbooks overnight.",
    didYouKnow:
      "Local charters & shadow delegations amplify voices even when Congressional seats diverge—a nuance activist explainers cite.",
    pitfall:
      "Slippery shorthand like 'everyone overseas votes the same US way' overlooks UOCAVA quirks—invite learners to unpack forms.",
  },
  {
    id: 7,
    phase: "Amendments",
    scenario:
      "Viral meme: 'Executive order lowers national voting age to 16 tonight.' Classmates panic—what foundational concept calms overheated group chats?",
    options: [
      {
        text: "Recall voting age thresholds flow from constitutional amendments (26th sets 18) plus state implementation—not unilateral EO tweets.",
        correct: true,
        feedback:
          "Good anchor: enumerated processes prevent surprise age jumps without coordinated ratification chatter.",
      },
      {
        text: "Encourage minors to sprint to polls citing Instagram lawyer threads alone.",
        correct: false,
        feedback:
          "Election officials rely on statutes—novel legal claims merit primary sources before anyone risks disqualification confusion.",
      },
      {
        text: "Assume federal courts casually strike whole amendments when polls tighten.",
        correct: false,
        feedback:
          "Review routes exist—but wholesale erasure narratives ignore standing, precedent, timelines.",
      },
    ],
    explanation:
      "Linking rumor control to enumerated amendment ladders helps teens recognize authority boundaries between branches and myth accounts.",
    didYouKnow:
      "Young voter preregistration rules expand access in places without altering core federal age floors—celebrate specifics.",
    pitfall:
      "Screenshots posing as EO letterhead fool fast scrollers—teach cryptographic-looking seals aren't proof absent .gov confirmations.",
  },
  {
    id: 8,
    phase: "Checks",
    scenario:
      "Judges issue a narrowly scoped injunction touching ballot curing instructions in one county. Commenters yell 'Courts overturned democracy.' Compose a temperate summary.",
    options: [
      {
        text: "Frame judicial rulings as pausing disputed instructions while emphasizing ongoing counting—not erasing ballots absent record evidence.",
        correct: true,
        feedback:
          "Helps watchers separate procedural relief from melodramatic 'all votes vanished' framings.",
      },
      {
        text: "Tweet that robes shredded every ballot statewide sight unseen.",
        correct: false,
        feedback:
          "Inflammatory shorthand accelerates stochastic threats—instruct peers to cite docket excerpts plus remedies ordered.",
      },
      {
        text: "Assume outcomes shift only when algorithms auto weight districts.",
        correct: false,
        feedback:
          "Tabulation audits trace physical & digital ballots—explain actual processes instead of phantom weighting sliders.",
      },
    ],
    explanation:
      "Judicial oversight guards rights & equal treatment; distinguishing remedies from partisan preference trains citizens to resist catastrophizing headlines.",
    didYouKnow:
      "Many counties publish cure windows publicly—students can screenshot official PDFs faster than pundit rants.",
    pitfall:
      "Nationwide extrapolation from one county injunction misleads donors & volunteers—contextual geography matters.",
  },
];
