export const electionPrepSteps = [
  {
    id: 1,
    phase: "Registration",
    scenario:
      "You just turned 18 and elections are in 2 weeks. You realize you haven't registered to vote yet. What do you do first?",
    options: [
      {
        text: "Go directly to the polling station on election day",
        correct: false,
        feedback:
          "You won't be allowed to cast a regular ballot without prior registration. You'd need a provisional ballot, which may not be counted.",
      },
      {
        text: "Register as a voter through your state's online portal",
        correct: true,
        feedback:
          "Over 60% of voters now use online portals to register. It's the fastest method if you have a valid state ID.",
      },
      {
        text: "Wait for the government to automatically register you",
        correct: false,
        feedback:
          "Only a few states have automatic voter registration. In most places, you must actively register yourself.",
      },
    ],
    explanation:
      "Voter registration is a prerequisite to casting a ballot in most jurisdictions. Online registration is the fastest and most reliable method available today.",
    didYouKnow:
      "Over 60% of voters now use online portals to update their registration details. It's often the fastest method if you have a valid state ID.",
    pitfall:
      "Missing the registration deadline by even one day can result in needing to cast a provisional ballot, which requires additional verification steps.",
  },
  {
    id: 2,
    phase: "Registration",
    scenario:
      "The general election is exactly 30 days away. You realize you haven't updated your voter registration since you moved last year. How do you proceed?",
    options: [
      {
        text: "Visit your state's Secretary of State website to update your address online",
        correct: true,
        feedback:
          "Online address updates are instant and give you a digital confirmation receipt. Your registration is pending review immediately.",
      },
      {
        text: "Drive to your old polling station and vote there anyway",
        correct: false,
        feedback:
          "Voting at the wrong precinct could invalidate your ballot or force you into a provisional vote that may not be counted.",
      },
      {
        text: "Call the local party office and ask them to handle it",
        correct: false,
        feedback:
          "Political parties cannot update your registration for you. Only you or authorized election officials can make those changes.",
      },
    ],
    explanation:
      "Keeping your voter registration current ensures your ballot is counted. Address mismatches are one of the top reasons ballots are rejected.",
    didYouKnow:
      "Online registration reduces administrative errors caused by manual data entry of paper forms and lowers the cost of election administration.",
    pitfall:
      "Address mismatches between your registration and your ID can lead to your ballot being flagged or rejected entirely.",
  },
  {
    id: 3,
    phase: "Campaigning",
    scenario:
      "Campaign season is in full swing. A candidate's ad claims their opponent voted to 'defund schools.' You want to verify this claim before forming an opinion. What do you do?",
    options: [
      {
        text: "Share the ad on social media to get others' opinions",
        correct: false,
        feedback:
          "Sharing unverified claims amplifies misinformation. Always verify before you share.",
      },
      {
        text: "Check the candidate's official voting record on a nonpartisan source",
        correct: true,
        feedback:
          "Nonpartisan sources like GovTrack, VoteSmart, or your state legislature's website provide factual voting records without spin.",
      },
      {
        text: "Assume the ad is true because it came from a major campaign",
        correct: false,
        feedback:
          "Campaign ads are designed to persuade, not inform. Major campaigns routinely use misleading framing.",
      },
    ],
    explanation:
      "Media literacy is critical during election season. Always cross-reference campaign claims with nonpartisan, fact-based sources.",
    didYouKnow:
      "According to research, political ads are fact-checked at a rate of less than 5%. The burden of verification falls on the voter.",
    pitfall:
      "Sharing misinformation—even unknowingly—contributes to voter confusion and can suppress turnout in targeted communities.",
  },
  {
    id: 4,
    phase: "Campaigning",
    scenario:
      "A friend forwards you a viral message claiming that the election date has been moved to the following week. The message looks official. What should you do?",
    options: [
      {
        text: "Forward it to your family group chat so they know",
        correct: false,
        feedback:
          "Forwarding unverified information about election dates is a form of voter suppression, even if unintentional.",
      },
      {
        text: "Ignore it completely and don't vote",
        correct: false,
        feedback:
          "Ignoring the situation doesn't help. You should verify the date and ensure you vote on the correct day.",
      },
      {
        text: "Verify the date through your state election commission's official website",
        correct: true,
        feedback:
          "Official election commission websites are the only authoritative source for election dates, polling locations, and voting procedures.",
      },
    ],
    explanation:
      "Election disinformation often targets dates, locations, and eligibility rules. Always verify through official government channels.",
    didYouKnow:
      "Spreading false election date information is a federal offense under election interference laws in many jurisdictions.",
    pitfall:
      "Fake election date messages surge in the final 72 hours before an election, targeting communities with historically lower voter turnout.",
  },
  {
    id: 5,
    phase: "Voting",
    scenario:
      "It's Election Day. You arrive at your polling station and the line is extremely long. Your lunch break ends in 45 minutes. What do you do?",
    options: [
      {
        text: "Leave and plan to come back after work, hoping the line is shorter",
        correct: false,
        feedback:
          "Polls may close before you return, and evening lines can be even longer. Many people who leave don't come back.",
      },
      {
        text: "Stay in line — by law, if you're in line before polls close, you can vote",
        correct: true,
        feedback:
          "Federal and state laws protect your right to vote if you're in line before the official closing time. Your employer may also be required to give you time off.",
      },
      {
        text: "Give up and skip voting this election",
        correct: false,
        feedback:
          "Every vote matters. Local elections are often decided by razor-thin margins — sometimes fewer than 100 votes.",
      },
    ],
    explanation:
      "Voter protection laws ensure that anyone in line before polls close can cast their ballot. Know your rights before you go.",
    didYouKnow:
      "In the 2020 election, some voters waited over 5 hours in line. All of them who stayed were allowed to vote.",
    pitfall:
      "Leaving the line and not returning is one of the top reasons eligible voters fail to cast their ballot.",
  },
  {
    id: 6,
    phase: "Voting",
    scenario:
      "You're at the voting booth and the ballot includes several candidates you don't recognize for local offices. What's the best approach?",
    options: [
      {
        text: "Skip those races and only vote for the candidates you know",
        correct: false,
        feedback:
          "Undervoting (leaving races blank) means others decide for you. Local officials affect your daily life the most.",
      },
      {
        text: "Pull out your phone and research candidates right there in the booth",
        correct: false,
        feedback:
          "Using phones in voting booths is prohibited or discouraged in most jurisdictions to prevent voter coercion and ballot photography.",
      },
      {
        text: "Prepare a personal voter guide before Election Day with your choices for every race",
        correct: true,
        feedback:
          "Bringing a pre-made cheat sheet or using sample ballots beforehand ensures you can vote confidently and quickly.",
      },
    ],
    explanation:
      "Down-ballot races have enormous impact on local governance. Preparing a voter guide before election day is a best practice for informed voting.",
    didYouKnow:
      "Local officials — like school board members and county commissioners — make decisions that affect your daily life far more than federal officials.",
    pitfall:
      "Studies show that up to 40% of voters skip down-ballot races, effectively letting a smaller group of voters decide local governance.",
  },
  {
    id: 7,
    phase: "Counting",
    scenario:
      "Election results are being announced, but your preferred candidate is trailing. You see claims online that the election was rigged. What should you do?",
    options: [
      {
        text: "Share the rigged election claims to raise awareness",
        correct: false,
        feedback:
          "Sharing unverified fraud claims undermines trust in the electoral process. Wait for official statements and audits.",
      },
      {
        text: "Wait for official results and the certification process to complete",
        correct: true,
        feedback:
          "Elections have built-in verification layers: audits, recounts, and certification. The process is designed to catch and correct errors.",
      },
      {
        text: "Refuse to accept the results and organize a protest immediately",
        correct: false,
        feedback:
          "Peaceful protest is a right, but acting before results are certified is premature. Trust the verification process first.",
      },
    ],
    explanation:
      "Modern elections include multiple layers of verification, including audits and recounts. Patience and trust in the process are crucial.",
    didYouKnow:
      "Most election results aren't officially certified until weeks after election day. Preliminary results are projections, not final counts.",
    pitfall:
      "Premature claims of fraud before audits are complete have historically led to decreased trust in future elections.",
  },
  {
    id: 8,
    phase: "Results",
    scenario:
      "The election is over and a new representative has been elected for your district. What's the most effective way to stay engaged after the election?",
    options: [
      {
        text: "Forget about politics until the next election cycle",
        correct: false,
        feedback:
          "Democracy doesn't end on election day. Ongoing engagement is how elected officials are held accountable.",
      },
      {
        text: "Follow your representative's voting record and attend town halls",
        correct: true,
        feedback:
          "Tracking your representative's actions and attending public meetings ensures they remain accountable to their constituents.",
      },
      {
        text: "Only pay attention if something controversial happens",
        correct: false,
        feedback:
          "Reactive engagement means you miss the quiet policy decisions that often have the biggest long-term impact on your community.",
      },
    ],
    explanation:
      "Post-election civic engagement — attending town halls, tracking votes, contacting representatives — is the foundation of a functioning democracy.",
    didYouKnow:
      "Representatives who receive more constituent contact tend to be more responsive to their district's needs in legislative votes.",
    pitfall:
      "Voter engagement drops by over 70% between election cycles, allowing special interest groups to dominate the policy conversation.",
  },
];
