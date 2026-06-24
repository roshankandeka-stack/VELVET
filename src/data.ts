import { Profile, SafetyQuiz } from "./types";

export const MOCK_PARTNERS: Profile[] = [
  {
    id: "p1",
    name: "Maya Patel",
    age: 26,
    gender: "Female",
    location: "Austin, TX",
    distance: 4.2,
    biography: "Full-stack designer by day, pottery enthusiast and rock climber by weekend. Looking for someone to explore hidden natural springs and argue about typography with me.",
    prompts: [
      {
        id: "date",
        question: "My idea of a perfect first date is...",
        answer: "Getting messy at a pottery wheel trial class, followed by late-night street tacos and dynamic debates about vinyl records."
      },
      {
        id: "vibe",
        question: "We'll get along if...",
        answer: "You are curious, have a high sarcasm tolerance, and think the book is always better than the movie."
      }
    ],
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80",
    albumPhotos: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80"
    ],
    verified: true,
    verificationStatus: "verified",
    hobbies: ["Pottery", "Climbing", "Graphic Design", "Vinyls", "Tacos"],
    completesProfile: 95,
    relationshipGoal: "Serious Relationship"
  },
  {
    id: "p2",
    name: "Liam Henderson",
    age: 28,
    gender: "Male",
    location: "Austin, TX",
    distance: 2.8,
    biography: "Specialty coffee roaster and amateur indie musician. I spend way too much time perfecting my barista pour-overs and playing guitar with my golden retriever, Barnaby.",
    prompts: [
      {
        id: "weird",
        question: "The weirdest thing about me is...",
        answer: "I can immediately identify the roast profile of a bean just by smelling the dry grounds blindfolded."
      },
      {
        id: "sunday",
        question: "My typical Sunday morning is...",
        answer: "Spinning an old jazz record, making a slow siphon brew, and taking Barnaby to the neighborhood off-leash park."
      }
    ],
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80",
    albumPhotos: [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80"
    ],
    verified: true,
    verificationStatus: "verified",
    hobbies: ["Barista", "Acoustic Guitar", "Jazz", "Golden Retrievers", "Record Stores"],
    completesProfile: 90,
    relationshipGoal: "Serious Relationship"
  },
  {
    id: "p3",
    name: "Jordan Alvarez",
    age: 25,
    gender: "Non-binary",
    location: "South Austin, TX",
    distance: 6.5,
    biography: "Plant parent of thirty-two leafy green children, local museum docent, and absolute roller skating maniac. Let's do a picnic at the botanical gardens!",
    prompts: [
      {
        id: "change_mind",
        question: "Change my mind about...",
        answer: "Pineapple absolutely belongs on Neapolitan brick-oven pizza, and you can't convince me otherwise."
      },
      {
        id: "proud",
        question: "I'm strangely proud of...",
        answer: "Keeping my fiddle-leaf fig alive and blooming through consecutive hot summers."
      }
    ],
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
    albumPhotos: [
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&auto=format&fit=crop&q=80"
    ],
    verified: false,
    verificationStatus: "unverified",
    hobbies: ["Houseplants", "Museums", "Roller Skating", "Thrifting", "Picnics"],
    completesProfile: 85,
    relationshipGoal: "Casual Dating"
  },
  {
    id: "p4",
    name: "Chloe Chen",
    age: 31,
    gender: "Female",
    location: "West Lake Hills, TX",
    distance: 8.1,
    biography: "Executive chef at a modern culinary startup. Obsessed with fermentation experiments, hot sauce curation, and long gravel bike rides along scenic roads.",
    prompts: [
      {
        id: "key_to_heart",
        question: "The key to my heart is...",
        answer: "A perfectly balanced homemade craft cocktail and willingness to try spicy, fermented kimchi from scratch."
      },
      {
        id: "fact",
        question: "Unpopular opinion...",
        answer: "Expensive upscale fine-dining is rarely as comforting as a local dim sum joint with old cart service."
      }
    ],
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
    albumPhotos: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80"
    ],
    verified: true,
    verificationStatus: "verified",
    hobbies: ["Cooking", "Fermentation", "Gravel Biking", "Hot Sauce", "Dim Sum"],
    completesProfile: 100,
    relationshipGoal: "Marriage / Life Partner"
  },
  {
    id: "p5",
    name: "Ethan Thorne",
    age: 29,
    gender: "Male",
    location: "Downtown Austin, TX",
    distance: 1.5,
    biography: "Digital entrepreneur, board game marathoner, and amateur triathlete. Always training or learning something ridiculous. Let me teach you how to dominate in Settlers of Catan.",
    prompts: [
      {
        id: "date",
        question: "My idea of a perfect first date is...",
        answer: "A competitive board game café night followed by an evening run under the skyline lights."
      },
      {
        id: "skills",
        question: "My useless super power is...",
        answer: "I can name any country's capital within exactly two seconds of seeing its physical outline."
      }
    ],
    photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80",
    albumPhotos: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80"
    ],
    verified: false,
    verificationStatus: "unverified",
    hobbies: ["Board Games", "Triathlon", "Catan", "Tech Startups", "Running"],
    completesProfile: 80,
    relationshipGoal: "Open to Anything"
  },
  {
    id: "p6",
    name: "Sophia Vance",
    age: 24,
    gender: "Female",
    location: "Round Rock, TX",
    distance: 14.5,
    biography: "Creative writer, tea connoisseur, and local poetry slam host. I write sonnets on real typewriters, keep sketchbooks from every city visit, and drink way too much matcha latte.",
    prompts: [
      {
        id: "simple_pleasures",
        question: "My simple pleasure is...",
        answer: "Finding long-forgotten pressed wildflowers inside old hardcover books in vintage thrift stores."
      },
      {
        id: "dream",
        question: "Give me travel recommendations for...",
        answer: "Quiet coastal towns in northern Japan where you can hear waves while sipping hot green tea."
      }
    ],
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80",
    albumPhotos: [
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&auto=format&fit=crop&q=80"
    ],
    verified: true,
    verificationStatus: "verified",
    hobbies: ["Typewriters", "Poetry Slam", "Matcha Latte", "Drawing", "Japanese Onsen"],
    completesProfile: 95,
    relationshipGoal: "Serious Relationship"
  }
];

export const SAFETY_QUIZZES: SafetyQuiz[] = [
  {
    id: "sq1",
    question: "You meet someone incredible on the app and they request your personal phone number or home address after just 3 messages. What is the safest response?",
    options: [
      "Give them your direct number to continue, they seem extremely interested and reliable.",
      "Suggest keeping the conversation inside our chat room first where safety scanners protect you.",
      "Give them a fake address to test their interest rates.",
      "Ignore them completely and report them to local emergency services immediately."
    ],
    correctAnswerIndex: 1,
    explanation: "Keeping dialogue on the app preserves security protections (like our AI safety monitors). Legitimate matches will fully respect your boundaries."
  },
  {
    id: "sq2",
    question: "Before meeting a match in person for the first time, which action is highly recommended for dating safety?",
    options: [
      "Ask them to pick you up directly from your apartment to save transit costs.",
      "Meet in a quiet, secluded park at night so you can hear each other clearly.",
      "Set your meetup in a public space, coordinate your own rides, and use Date Sharing to alert trusted contacts.",
      "Avoid telling any friends so you don't face any peer pressure."
    ],
    correctAnswerIndex: 2,
    explanation: "Always arrange public meetups, self-transport, and share dates with a trust contact. These steps secure control over your environmental safety."
  },
  {
    id: "sq3",
    question: "A match claims they are caught in an urgent financial bind or need help paying for a transit ticket to meet you, requesting a cash app transfer. What should you do?",
    options: [
      "Send a small loan immediately as a sweet gesture of trust and love.",
      "Ask them to send photo verification holding a sign before wire transferring the funds.",
      "Long-press a message to instantly File a Report and BLOCK them, as financial requests represent scam flags.",
      "Ignore it but keep swiping and chatting about other topics to see if they bring it up again."
    ],
    correctAnswerIndex: 3,
    explanation: "Never send money or share bank info with a match under any pretense. Wire requests are major scam violations and should be blocked and reported immediately."
  }
];

export const ICEBREAKERS: string[] = [
  "What is the most memorable travel spot you've ever discovered?",
  "What was your absolute favorite hobby as a kid?",
  "Recommend me a song that instantly improves your mood!",
  "Are you a coffee scientist, tea connoisseur, or energy drink lover?",
  "If you had to win a trivia quiz on one specific hobby, what would it be?"
];
