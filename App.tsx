import React, { useState, useEffect, useRef } from "react";
import Onboarding from "./components/Onboarding";
import { Profile, Match, Message, SafetyQuiz, RelationshipGoal, Gender } from "./types";
import { MOCK_PARTNERS, SAFETY_QUIZZES, ICEBREAKERS } from "./data";
import { 
  Heart, Sparkles, User, Camera, Shield, ArrowRight, X, MessageSquare, Send, 
  MapPin, Sliders, Zap, Bell, Check, Flag, Trash2, Award, Phone, RefreshCw, 
  Volume2, Mic, Star, CheckCircle2, AlertTriangle, AlertCircle, HelpCircle, 
  Share2, ShieldCheck, ChevronRight, Lock
} from "lucide-react";

export default function App() {
  // Onboarding & user state
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);
  
  // Custom states
  const [partners, setPartners] = useState<Profile[]>(MOCK_PARTNERS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [credits, setCredits] = useState<number>(340);
  const [isPremium, setIsPremium] = useState<boolean>(true);
  
  // Custom sidebar and popup tab states
  // "discover" | "matches" | "safety" | "profile"
  const [activeTab, setActiveTab] = useState<"discover" | "matches" | "safety" | "profile">("discover");

  // Interaction / Discovery Filter settings
  const [distanceFilter, setDistanceFilter] = useState<number>(15);
  const [intentFilter, setIntentFilter] = useState<RelationshipGoal | "All">("All");
  const [genderFilter, setGenderFilter] = useState<Gender | "All">("All");

  // Discovery Limits tracker
  const [swipesCount, setSwipesCount] = useState<number>(8);
  const [maxSwipes, setMaxSwipes] = useState<number>(20);

  // Chat inputs & states
  const [messageInput, setMessageInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  
  // AI wingman feedback states
  const [wingmanResult, setWingmanResult] = useState<string>(
    "Ask Chloe Chen about her gravel biking route or her favorite fermented hot sauce recipe! Or select a button below to activate customized AI advices."
  );
  const [isWingmanLoading, setIsWingmanLoading] = useState<boolean>(false);
  const [wingmanCustomPrompt, setWingmanCustomPrompt] = useState<string>("");

  // Quiz states (Dating safety quizzes)
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizCorrectAnswered, setQuizCorrectAnswered] = useState<boolean | null>(null);
  const [quizHistory, setQuizHistory] = useState<{ [key: string]: boolean }>({});

  // Verification request simulations
  const [verificationFeedback, setVerificationFeedback] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Boost features
  const [boostActive, setBoostActive] = useState<boolean>(false);
  const [boostTimeLeft, setBoostTimeLeft] = useState<number>(0);

  // Date Plan Share Wizard
  const [showDateWizard, setShowDateWizard] = useState<boolean>(false);
  const [dateVenue, setDateVenue] = useState<string>("");
  const [dateScheduleStr, setDateScheduleStr] = useState<string>("");
  const [trustedContactNum, setTrustedContactNum] = useState<string>("");

  // System alert / Notifications dropdown simulation
  const [notifications, setNotifications] = useState<string[]>([
    "Elena matched with you! Wave hello 👋",
    "Welcome to Velvet VIP. Boost your profile for extra stars!"
  ]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  // Interactive Match Popup
  const [matchPopupPartner, setMatchPopupPartner] = useState<Profile | null>(null);

  // Interactive Coin Store Modal
  const [showCoinStore, setShowCoinStore] = useState<boolean>(false);

  // Interactive Report / Harassment Scanner Alert Modal
  const [scannedWarning, setScannedWarning] = useState<string | null>(null);
  const [flaggedMessageId, setFlaggedMessageId] = useState<string | null>(null);

  // Simulated Voice note recording
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [recordedVoiceDur, setRecordedVoiceDur] = useState<string | null>(null);

  // Media sender template visualizer
  const [showMediaSender, setShowMediaSender] = useState<boolean>(false);

  // Predefined cool date scenery images to simulate media sharing
  const PRESET_GIFS_AND_PHOTOS = [
    { name: "Beautiful Coffee Spot", url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&auto=format&fit=crop&q=80" },
    { name: "Clay Pottery Studio", url: "https://images.unsplash.com/photo-1565192647048-f997ee879ab8?w=300&auto=format&fit=crop&q=80" },
    { name: "Skyline Picnic Scene", url: "https://images.unsplash.com/photo-1526218626217-dc65a29bb444?w=300&auto=format&fit=crop&q=80" },
    { name: "Jazz Vinyl Record", url: "https://images.unsplash.com/photo-1484755560615-a4c647f39101?w=300&auto=format&fit=crop&q=80" }
  ];

  // Tick for Simulated Boost Clock
  useEffect(() => {
    let interval: any;
    if (boostActive && boostTimeLeft > 0) {
      interval = setInterval(() => {
        setBoostTimeLeft(prev => {
          if (prev <= 1) {
            setBoostActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [boostActive, boostTimeLeft]);

  // Quick initial simulated matching to prepopulate chat list with reciprocal messages
  useEffect(() => {
    const defaultMatches: Match[] = [
      {
        id: "m_maya",
        partner: MOCK_PARTNERS[0], // Maya
        likesEachOther: true,
        unreadCount: 1,
        lastActive: "2 min ago",
        messages: [
          {
            id: "msg_1",
            matchId: "m_maya",
            senderId: "p1",
            senderName: "Maya Patel",
            text: "Hi Alex! That siphoning coffee thing in London is awesome. Let's debate typography over cold brews next Tuesday?",
            timestamp: "11:50 AM"
          }
        ]
      },
      {
        id: "m_liam",
        partner: MOCK_PARTNERS[1], // Liam
        likesEachOther: true,
        unreadCount: 0,
        lastActive: "1 hour ago",
        messages: [
          {
            id: "msg_2",
            matchId: "m_liam",
            senderId: "p2",
            senderName: "Liam Henderson",
            text: "Hey Alex, nice tags! Barnaby says hello too. 🐶 Play any acoustic guitar?",
            timestamp: "9:15 AM"
          }
        ]
      }
    ];
    setMatches(defaultMatches);
  }, []);

  // Filter partners based on state sliders and intent choices
  const filteredPartners = partners.filter((p, index) => {
    // Distance
    if (p.distance > distanceFilter) return false;
    // Gender
    if (genderFilter !== "All" && p.gender !== genderFilter) return false;
    // Intent
    if (intentFilter !== "All" && p.relationshipGoal !== intentFilter) return false;
    
    return true;
  });

  // Current active discovery partner from list
  const currentPartner = filteredPartners[currentIndex] || null;

  // Swipe handlers
  const handleLike = (isSuperLike: boolean = false) => {
    if (!currentUserProfile) return;
    if (swipesCount >= maxSwipes && !isPremium) {
      alert("You have reached your daily swipe limit! Upgrade to Velvet VIP or spend 50 credits to get 20 more swipes.");
      return;
    }

    setSwipesCount(prev => prev + 1);

    if (currentPartner) {
      // 75% chance of returning a match in sandbox mode to facilitate immediate rich chats!
      const isMatch = Math.random() > 0.25 || isSuperLike;
      
      if (isMatch) {
        // Create match
        const newMatchId = `m_${currentPartner.id}_${Date.now()}`;
        const newMatch: Match = {
          id: newMatchId,
          partner: { ...currentPartner, superLiked: isSuperLike },
          likesEachOther: true,
          unreadCount: 0,
          lastActive: "Just now",
          messages: [
            {
              id: `msg_init_${Date.now()}`,
              matchId: newMatchId,
              senderId: currentPartner.id,
              senderName: currentPartner.name,
              text: `Thanks for the ${isSuperLike ? "Super Like! ★ " : "Like! ♥ "} I hope we have great things to talk about! What's your usual Sunday routine?`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };

        // Add to matches
        setMatches(prev => [newMatch, ...prev]);
        setMatchPopupPartner(currentPartner);
        setActiveMatchId(newMatchId);
        setActiveTab("matches"); // Automatically open chats!
        
        // Add new match notification
        setNotifications(prev => [
          `You matched with ${currentPartner.name}! ✨`,
          ...prev
        ]);
      }
    }

    // Move to next card
    if (currentIndex < filteredPartners.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Recycle the list so the sandbox never runs completely empty
      setCurrentIndex(0);
    }
  };

  const handleDislike = () => {
    setSwipesCount(prev => prev + 1);
    if (currentIndex < filteredPartners.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  // Safe AI message analysis - "Are You sure?" warning prompt triggers beautifully
  const handleSendMessage = async (customText?: string, customMedia?: string, customVoice?: string) => {
    const textToSend = customText || messageInput;
    if (!textToSend.trim() && !customMedia && !customVoice && !recordedVoiceDur) return;
    if (!activeMatchId) return;

    const userMsgText = textToSend;
    const mediaUrlToSend = customMedia;
    const voiceDurToSend = customVoice || (recordedVoiceDur ? recordedVoiceDur : undefined);

    // Clear main inputs immediately for dynamic feedback
    setMessageInput("");
    setRecordedVoiceDur(null);

    // Initial message creation
    const generatedMsgId = `mmsg_${Date.now()}`;
    const userMessage: Message = {
      id: generatedMsgId,
      matchId: activeMatchId,
      senderId: "user_me",
      senderName: currentUserProfile?.name || "Me",
      text: userMsgText,
      mediaUrl: mediaUrlToSend,
      voiceDuration: voiceDurToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Append to conversation
    setMatches(prev => prev.map(m => {
      if (m.id === activeMatchId) {
        return {
          ...m,
          messages: [...m.messages, userMessage]
        };
      }
      return m;
    }));

    // Trigger AI Harassment and toxicity check in backend asynchronously
    if (userMsgText && userMsgText.trim().length > 2) {
      try {
        const checkRes = await fetch("/api/ai/moderate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: userMsgText }),
        });
        const assessment = await checkRes.json();
        
        if (assessment && assessment.safe === false) {
          // Message generated safety scanner flags! Pop up the warning
          setScannedWarning(assessment.reason || "The message was flagged for aggressive language. Let's aim to represent high values of compassion.");
          setFlaggedMessageId(generatedMsgId);
        }
      } catch (err) {
        console.warn("Moderation API failed gracefully. fallback active.", err);
      }
    }

    // Simulate match reply with a short delay
    setIsTyping(true);
    setTimeout(async () => {
      setIsTyping(false);
      const activeMatch = matches.find(m => m.id === activeMatchId);
      if (!activeMatch) return;

      let partnerResponseText = "That is so fascinating. Let's plan a concrete day to explore!";
      
      // Attempt to pick a smart answer context by scanning the text user sent
      const normalizedUserText = userMsgText.toLowerCase();
      if (normalizedUserText.includes("date") || normalizedUserText.includes("meet") || normalizedUserText.includes("tuesday") || normalizedUserText.includes("coffee")) {
        partnerResponseText = `I would absolutely love that! Check out the 'Dating safety shield' icon or use our "Secure Date Sharing Wizard" below to share the plan with emergency contacts!`;
      } else if (normalizedUserText.includes("hello") || normalizedUserText.includes("hey") || normalizedUserText.includes("hi")) {
        partnerResponseText = `Hey beautiful! I'm enjoying a very quiet weekend. Do you prefer vinyl records or climbing trails?`;
      } else if (mediaUrlToSend) {
        partnerResponseText = "Wow, that looks stunning! 📸 Where is that exactly? I need to put that on my weekend bucket list.";
      } else if (voiceDurToSend) {
        partnerResponseText = "Loved hearing your voice note! 🎙️ Truly makes communication feel much more authentic rather than typing lists of text.";
      }

      const receivedMsg: Message = {
        id: `mmsg_partner_${Date.now()}`,
        matchId: activeMatchId,
        senderId: activeMatch.partner.id,
        senderName: activeMatch.partner.name,
        text: partnerResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMatches(prev => prev.map(m => {
        if (m.id === activeMatchId) {
          return {
            ...m,
            messages: [...m.messages, receivedMsg],
            lastActive: "Just now"
          };
        }
        return m;
      }));
    }, 2800);
  };

  // Submit report or discard toxic flagged message
  const handleResolveFlaggedMsg = (keepMsg: boolean) => {
    if (!keepMsg && flaggedMessageId && activeMatchId) {
      // Remove message from feed
      setMatches(prev => prev.map(m => {
        if (m.id === activeMatchId) {
          return {
            ...m,
            messages: m.messages.filter(msg => msg.id !== flaggedMessageId)
          };
        }
        return m;
      }));
    }
    setScannedWarning(null);
    setFlaggedMessageId(null);
  };

  // Block or report complete profile
  const handleBlockPartner = (partnerId: string) => {
    alert("This contact has been successfully blocked, and completely scrubbed from your matching queue. Safe choice!");
    // Close match
    setActiveMatchId(null);
    setMatches(prev => prev.filter(m => m.partner.id !== partnerId));
  };

  // AI Wingman dynamic call triggers
  const handleTriggerWingman = async (command: string) => {
    const activeMatch = matches.find(m => m.id === activeMatchId);
    if (!activeMatch) {
      alert("Please select a live chat match first so your Wingman has context!");
      return;
    }

    setIsWingmanLoading(true);
    setWingmanResult("Wingman is reading user vibe frequencies and consulting Gemini AI...");

    try {
      const activeHistory = activeMatch.messages.map(m => ({
        sender: m.senderId === "user_me" ? "Me" : m.senderName,
        text: m.text
      }));

      const res = await fetch("/api/ai/wingman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command,
          partnerBio: `Name: ${activeMatch.partner.name}. Target Goal: ${activeMatch.partner.relationshipGoal}. Biogaphy: ${activeMatch.partner.biography}. Hobbies: ${activeMatch.partner.hobbies.join(", ")}`,
          chatHistory: activeHistory,
          originalPrompt: wingmanCustomPrompt
        }),
      });

      const data = await res.json();
      setWingmanResult(data.response || "No response received. Play safe!");
      setWingmanCustomPrompt("");
    } catch (e) {
      console.error(e);
      setWingmanResult("Oops! Your wingman is temporarily offline. Give high-energy, friendly openers based on shared hobbies!");
    } finally {
      setIsWingmanLoading(false);
    }
  };

  // Photo selfie simulation verify trigger
  const handleVerifySelfie = async () => {
    setIsVerifying(true);
    setVerificationFeedback("Awaiting passive biometric and face likeness AI validation...");
    try {
      const res = await fetch("/api/ai/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profilePicture: currentUserProfile?.photoUrl }),
      });
      const data = await res.json();
      
      setVerificationFeedback(data.feedback || "Approved!");
      if (currentUserProfile) {
        setCurrentUserProfile({
          ...currentUserProfile,
          verified: true,
          verificationStatus: "verified"
        });
      }
    } catch (e) {
      console.error(e);
      setVerificationFeedback("Selfie approved! Matching servers calibrated.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Share Date details wizard submit
  const handleConfirmDateSharing = () => {
    if (!dateVenue || !dateScheduleStr || !trustedContactNum) {
      alert("Please fill out complete fields (venue, schedule, contact) to formulate proper date receipts!");
      return;
    }

    const dateDetails = {
      location: dateVenue,
      time: dateScheduleStr,
      contacts: [trustedContactNum]
    };

    setMatches(prev => prev.map(m => {
      if (m.id === activeMatchId) {
        // Also write a system receipt message inside chat
        const receiptMsg: Message = {
          id: `share_receipt_${Date.now()}`,
          matchId: m.id,
          senderId: "system_shield",
          senderName: "Velvet Shield",
          text: `🛡️ DATE SHARING SCHEDULER ACTIVE: Real-time meet details at "${dateVenue}" scheduled for ${dateScheduleStr} have been successfully broadcasted & paired with emergency contact: [${trustedContactNum}]. Security system running active location feedback scans.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        return {
          ...m,
          dateShared: dateDetails,
          messages: [...m.messages, receiptMsg]
        };
      }
      return m;
    }));

    alert("Awesome! Date details shared with your trusted safe contact dynamically.");
    setShowDateWizard(false);
    setDateVenue("");
    setTrustedContactNum("");
  };

  // Coins checkout quick handler
  const buyCreditsPack = (amount: number, costDollars: number) => {
    setCredits(prev => prev + amount);
    alert(`Success! You loaded ${amount} Velvet credits!`);
    setShowCoinStore(false);
  };

  // Super Boost Activator
  const activateProfileBoost = () => {
    if (credits < 100) {
      alert("Insufficient credits. Please load more credits!");
      setShowCoinStore(true);
      return;
    }
    setCredits(prev => prev - 100);
    setBoostActive(true);
    setBoostTimeLeft(1800); // 30 minutes in seconds
    alert("✨ PROFILE BOOST INITIATED! You are now prominently featured first in nearby users search queue for 30 minutes!");
  };

  // Quiz helper submissions
  const handleAnswerQuizOption = (optionIndex: number) => {
    setSelectedQuizOption(optionIndex);
    const quiz = SAFETY_QUIZZES[currentQuizIndex];
    const isCorrect = optionIndex === quiz.correctAnswerIndex;
    setQuizCorrectAnswered(isCorrect);
    
    if (isCorrect) {
      setQuizScore(prev => prev + 10);
      setCredits(prev => prev + 25); // reward user with free premium app credits!
    }

    setQuizHistory({
      ...quizHistory,
      [quiz.id]: isCorrect
    });
  };

  const handleNextQuiz = () => {
    setSelectedQuizOption(null);
    setQuizCorrectAnswered(null);
    if (currentQuizIndex < SAFETY_QUIZZES.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      setCurrentQuizIndex(0); // Loop back
    }
  };

  // Simulated Voice Note audio clickers
  const toggleRecordVoice = () => {
    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      setRecordedVoiceDur("0:14");
    } else {
      setIsRecordingVoice(true);
      setRecordedVoiceDur(null);
    }
  };

  // Show customized icebreaker questions
  const quickFillIcebreaker = (phrase: string) => {
    setMessageInput(phrase);
  };

  // Let user complete onboarding first
  if (!currentUserProfile) {
    return (
      <Onboarding 
        onComplete={(newProfile) => {
          setCurrentUserProfile(newProfile);
        }} 
      />
    );
  }

  // Active match data
  const currentActiveMatch = matches.find(m => m.id === activeMatchId) || null;

  return (
    <div className="w-full min-h-screen bg-[#0A0A0A] text-[#F5F5F4] flex flex-col font-sans select-none overflow-x-hidden selection:bg-[#D48166] selection:text-black">
      
      {/* Top Navigation Bar perfectly styled with gradient logo & dark theme headers */}
      <header className="h-16 border-b border-white/5 px-4 md:px-8 flex items-center justify-between bg-[#0E0E0E] shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-[#D48166] to-[#E94057] rounded-lg shadow-md flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-serif uppercase italic">
            VELVET<span className="text-[#D48166] font-normal font-sans">.</span>
          </span>
          
          {/* Active Boost indicator with countdown */}
          {boostActive && (
            <div className="hidden lg:flex items-center gap-1.5 bg-[#D48166]/10 border border-[#D48166]/30 px-2.5 py-1 rounded-full text-[10px] text-[#D48166] animate-pulse">
              <Zap className="w-3.5 h-3.5 fill-[#D48166]" />
              <span className="font-mono font-bold uppercase tracking-wider">
                Boost active: {Math.floor(boostTimeLeft / 60)}:{(boostTimeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

        {/* Mid View tab Switcher */}
        <div className="flex bg-[#111111]/90 rounded-xl p-1 border border-white/5 text-xs select-none">
          <button 
            type="button"
            onClick={() => { setActiveTab("discover"); }}
            className={`cursor-pointer px-4 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "discover" ? "bg-[#D48166] text-black font-bold" : "text-white/60 hover:text-white"
            }`}
          >
            Discover
          </button>
          <button 
            type="button"
            onClick={() => { setActiveTab("matches"); }}
            className={`cursor-pointer px-4 py-1.5 rounded-lg font-medium transition-all relative ${
              activeTab === "matches" ? "bg-[#D48166] text-black font-bold" : "text-white/60 hover:text-white"
            }`}
          >
            Matches
            {matches.some(m => m.unreadCount > 0) && (
              <span className="absolute -right-1 -top-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
          <button 
            type="button"
            onClick={() => { setActiveTab("safety"); }}
            className={`cursor-pointer px-4 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "safety" ? "bg-[#D48166] text-black font-bold" : "text-white/60 hover:text-white"
            }`}
          >
            Safety Hub
          </button>
          <button 
            type="button"
            onClick={() => { setActiveTab("profile"); }}
            className={`cursor-pointer px-4 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "profile" ? "bg-[#D48166] text-black font-bold" : "text-white/60 hover:text-white"
            }`}
          >
            Profile ({currentUserProfile.completesProfile}%)
          </button>
        </div>

        {/* User Account Credits & Subscription Indicator */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#D48166]">VIP premium active</span>
            <button 
              type="button"
              onClick={() => setShowCoinStore(true)}
              className="text-[10px] font-mono text-white/50 tracking-wider hover:text-white flex items-center justify-end gap-1"
            >
              <Zap className="w-3 h-3 text-[#D48166]" /> {credits} Credits
            </button>
          </div>

          <div 
            onClick={() => setActiveTab("profile")}
            className="w-10 h-10 rounded-full border border-[#D48166] p-0.5 cursor-pointer hover:opacity-85"
          >
            <img 
              src={currentUserProfile.photoUrl} 
              alt="My Avatar" 
              className="w-full h-full rounded-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Quick Notifications panel trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 bg-neutral-900 border border-white/5 rounded-full flex items-center justify-center text-white/70 hover:text-white relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#E94057] rounded-full border-2 border-neutral-900"></span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#0E0E0E] border border-white/10 rounded-xl p-4 shadow-2xl z-55">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#D48166]">Notifications</h4>
                  <button 
                    onClick={() => setNotifications([])}
                    className="text-[9px] text-white/40 hover:text-white underline"
                  >
                    Clear
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <p className="text-[11px] text-white/40 italic py-2">No new alerts.</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((n, i) => (
                      <div key={i} className="text-xs leading-snug text-white/70 flex gap-2">
                        <span className="text-[#D48166]">•</span>
                        <span>{n}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex overflow-hidden w-full max-w-7xl mx-auto">
        
        {/* LEFT COLUMN: Controls, Custom Filters, Limits Tracker */}
        <aside className="hidden md:flex w-72 bg-[#0E0E0E] border-r border-white/5 p-6 flex-col gap-6 overflow-y-auto shrink-0 select-none">
          <section>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4 font-bold">Discovery Filters</h3>
            
            <div className="space-y-4">
              
              {/* Distance Slider */}
              <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                <div className="flex justify-between text-[11px] text-white/50 mb-2 font-mono">
                  <span>Distance Index</span>
                  <span className="text-white">Within {distanceFilter} mi</span>
                </div>
                <input 
                  type="range" 
                  min="2" 
                  max="50" 
                  value={distanceFilter}
                  onChange={(e) => setDistanceFilter(Number(e.target.value))}
                  className="w-full accent-[#D48166] bg-neutral-800"
                />
              </div>

              {/* Match Preferences Intent Filter */}
              <div className="bg-white/5 p-3 rounded-lg border border-white/5 space-y-2">
                <span className="block text-[10px] uppercase tracking-wider text-white/40 font-bold">Target Intent</span>
                <select 
                  value={intentFilter}
                  onChange={(e) => setIntentFilter(e.target.value as RelationshipGoal | "All")}
                  className="w-full bg-[#111111] border border-white/10 rounded-md p-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="All">All intents</option>
                  <option value="Serious Relationship">Serious Relationship</option>
                  <option value="Marriage / Life Partner">Marriage / Life Partner</option>
                  <option value="Casual Dating">Casual Dating</option>
                  <option value="New Friends / Networking font-sans">New Friends / Friends</option>
                  <option value="Open to Anything">Open to Anything</option>
                </select>
              </div>

              {/* Gender Pref Selector */}
              <div className="bg-white/5 p-3 rounded-lg border border-white/5 space-y-2">
                <span className="block text-[10px] uppercase tracking-wider text-white/40 font-bold">Gender Selection</span>
                <select 
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value as Gender | "All")}
                  className="w-full bg-[#111111] border border-white/10 rounded-md p-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="All">All Genders</option>
                  <option value="Female">Women Only</option>
                  <option value="Male">Men Only</option>
                  <option value="Non-binary">Non-binary Only</option>
                </select>
              </div>

            </div>
          </section>

          {/* Verification Shield Indicator */}
          <section className="bg-neutral-950/60 p-4 rounded-xl border border-[#D48166]/20 space-y-3 shadow-md mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold font-mono text-[#D48166] uppercase tracking-wider">Safety Shield Active</span>
            </div>
            <p className="text-[10px] text-white/50 leading-relaxed">
              Biometric filters initialized. Our safety engine scans conversations to prevent harassment or bad actors.
            </p>
            
            <div className="pt-2">
              <button 
                type="button"
                onClick={() => setActiveTab("safety")}
                className="w-full py-2 bg-white/5 hover:bg-white/10 text-[10px] font-bold rounded-lg border border-white/10 transition-all uppercase tracking-wider"
              >
                Launch Safety Center
              </button>
            </div>
          </section>

          {/* Swipe Limit Display */}
          <section className="border-t border-white/5 pt-4">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3 font-mono">
              <span>Daily Interactions</span>
              <span className="text-white">{swipesCount} / {isPremium ? "∞" : maxSwipes}</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#D48166] to-[#E94057] transition-all"
                style={{ width: `${Math.min((swipesCount / maxSwipes) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-[9px] text-white/30 text-center mt-2 italic">Select quality over quantity swipe loops.</p>
          </section>
        </aside>

        {/* MID COLUMN: Multi-tab layout container representing Core discover state, active match conversation dashboard, or quizzes */}
        <section className="flex-1 bg-[#111111] flex flex-col relative overflow-hidden">
          
          {/* TAB 1: Swiping and discovery layout */}
          {activeTab === "discover" && (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              
              {currentPartner ? (
                <div className="relative w-full max-w-[390px] h-[540px] flex flex-col justify-end">
                  
                  {/* Decorative backdrop cards */}
                  <div className="absolute top-[-8px] left-4 right-4 h-full bg-white/5 rounded-3xl -z-10 border border-white/5 transform scale-95"></div>
                  <div className="absolute top-[-16px] left-8 right-8 h-full bg-white/5 rounded-3xl -z-20 border border-white/5 transform scale-90"></div>

                  {/* Primary card content */}
                  <div className="w-full h-full bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative flex flex-col">
                    
                    {/* Cover image */}
                    <div className="absolute inset-0 z-0 bg-neutral-900">
                      <img 
                        src={currentPartner.photoUrl} 
                        alt={currentPartner.name}
                        className="w-full h-full object-cover select-none"
                        referrerPolicy="no-referrer"
                      />
                      {/* Dark translucent gradient covering profile to make typography readable */}
                      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                    </div>

                    {/* Live safety, Verification Badge, distance label overlay */}
                    <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
                      {currentPartner.verified ? (
                        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/20 py-1 px-2.5 rounded-full">
                          <div className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-sans text-white">✓</div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-white">Verified Match</span>
                        </div>
                      ) : (
                        <div className="bg-black/30 backdrop-blur-md px-2 py-1 rounded-full text-[9px] text-white/60">
                          Unverified
                        </div>
                      )}

                      <div className="bg-black/55 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-[#D48166] font-mono border border-[#D48166]/20">
                        {currentPartner.distance} miles away
                      </div>
                    </div>

                    {/* User credentials details */}
                    <div className="mt-auto p-6 z-10 relative space-y-4">
                      
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <h2 className="text-2xl font-serif font-bold italic tracking-wide text-white">
                            {currentPartner.name}, {currentPartner.age}
                          </h2>
                          <p className="text-xs text-white/70 font-sans tracking-wide">
                            {currentPartner.relationshipGoal} • {currentPartner.location}
                          </p>
                        </div>
                        
                        {/* Core Match compatibility score meter */}
                        <div className="w-12 h-12 bg-gradient-to-tr from-[#D48166] to-[#E94057] rounded-full flex flex-col items-center justify-center text-black font-extrabold shadow-md border-2 border-[#0A0A0A]">
                          <span className="text-[12px] font-serif leading-none">94%</span>
                          <span className="text-[6px] tracking-tighter uppercase font-sans font-normal">Match</span>
                        </div>
                      </div>

                      {/* Prompts snippet carousel */}
                      <div className="bg-black/40 backdrop-blur-sm p-3.5 rounded-xl border border-white/5 space-y-1">
                        <span className="text-[8px] uppercase tracking-widest text-[#D48166] font-bold font-mono">
                          📖 My perfect date is...
                        </span>
                        <p className="text-xs italic text-gray-200 leading-relaxed font-sans line-clamp-3">
                          "{currentPartner.prompts[0]?.answer || currentPartner.biography}"
                        </p>
                      </div>

                      {/* Display tag chips */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {currentPartner.hobbies.slice(0, 3).map(hb => (
                          <span key={hb} className="px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-full text-[9px] text-white/50 lowercase">
                            #{hb}
                          </span>
                        ))}
                      </div>

                    </div>
                  </div>

                  {/* Core layout swiping controls */}
                  <div className="absolute -bottom-8 left-0 right-0 flex justify-center items-center gap-5 z-20">
                    {/* Dislike button */}
                    <button 
                      type="button"
                      onClick={handleDislike}
                      className="w-14 h-14 rounded-full bg-black border border-white/10 hover:border-red-500 hover:text-red-500 text-white/80 flex items-center justify-center shadow-xl transition-all hover:scale-105 cursor-pointer"
                    >
                      <X className="w-6 h-6" />
                    </button>

                    {/* Like button */}
                    <button 
                      type="button"
                      onClick={() => handleLike(false)}
                      className="w-16 h-16 rounded-full bg-[#D48166] hover:bg-[#c27258] text-black shadow-2xl flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Heart className="w-7 h-7 fill-black" />
                    </button>

                    {/* Star / Super Like is premium or costs coins */}
                    <button 
                      type="button"
                      onClick={() => {
                        if (credits < 20) {
                          alert("Super liking costs 20 credits. Please purchase a credits bundle from our premium options.");
                          setShowCoinStore(true);
                        } else {
                          setCredits(p => p - 20);
                          handleLike(true);
                        }
                      }}
                      className="w-14 h-14 rounded-full bg-black border border-white/10 hover:border-yellow-500 hover:text-yellow-400 text-white/80 flex items-center justify-center shadow-xl transition-all hover:scale-105 cursor-pointer"
                    >
                      <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                    </button>
                  </div>

                </div>
              ) : (
                <div className="text-center space-y-3 p-8 border border-white/5 rounded-2xl bg-[#0E0E0E]">
                  <RefreshCw className="w-12 h-12 text-[#D48166] animate-spin mx-auto" />
                  <h3 className="text-lg font-serif italic">Calibrating next matches...</h3>
                  <p className="text-xs text-white/50 max-w-sm">No profiles found fitting that distance index. Increase distance slider to expand discovery range!</p>
                  <button 
                    type="button"
                    onClick={() => { setDistanceFilter(40); setCurrentIndex(0); }}
                    className="px-4 py-2 bg-white/5 text-xs text-[#D48166] border border-white/10 rounded-lg hover:bg-[#D48166] hover:text-black transition-all"
                  >
                    Reset Filter range to 40 Miles
                  </button>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: Chats and real-time conversation dashboard */}
          {activeTab === "matches" && (
            <div className="flex-1 flex overflow-hidden">
              
              {/* Inbox lists nested on the left */}
              <div className="w-64 border-r border-white/5 flex flex-col bg-[#0E0E0E] text-xs shrink-0 select-none">
                <div className="p-4 border-b border-white/5">
                  <span className="block text-[9px] uppercase tracking-widest text-[#D48166] font-bold">Inbox Messages</span>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                  {matches.length === 0 ? (
                    <div className="p-4 text-center text-white/30 italic">No matches yet. Swipe on cards inside discovery!</div>
                  ) : (
                    matches.map((m) => {
                      const isActive = m.id === activeMatchId;
                      const lastMsg = m.messages[m.messages.length - 1];
                      return (
                        <div 
                          key={m.id}
                          onClick={() => {
                            setActiveMatchId(m.id);
                            // Clear unread simulates
                            m.unreadCount = 0;
                          }}
                          className={`p-4 flex gap-3 cursor-pointer transition-all ${
                            isActive ? "bg-white/5 border-l-4 border-[#D48166]" : "hover:bg-neutral-900"
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full border border-white/10 relative shrink-0">
                            <img 
                              src={m.partner.photoUrl} 
                              alt={m.partner.name} 
                              className="w-full h-full rounded-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            {m.unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0A0A0A]"></span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-white tracking-wide">{m.partner.name}</span>
                              <span className="text-[8px] text-white/30 font-mono">{m.lastActive}</span>
                            </div>
                            <p className="text-[10px] text-white/50 truncate pt-0.5">
                              {lastMsg ? lastMsg.text : "No messages yet"}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Chat history feed */}
              <div className="flex-1 flex flex-col bg-[#0B0B0B]">
                {currentActiveMatch ? (
                  <>
                    {/* Chat Header details */}
                    <div className="h-14 border-b border-white/5 px-4 flex items-center justify-between bg-[#0E0E0E]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full border border-white/15">
                          <img 
                            src={currentActiveMatch.partner.photoUrl} 
                            alt={currentActiveMatch.partner.name}
                            className="w-full h-full rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">{currentActiveMatch.partner.name}</span>
                            {currentActiveMatch.partner.verified && (
                              <span className="text-[8px] uppercase font-bold tracking-widest text-blue-400">Verified</span>
                            )}
                          </div>
                          <span className="text-[9px] text-white/40 tracking-wider font-mono">Usually replies in minutes</span>
                        </div>
                      </div>

                      {/* Flag Block options */}
                      <button 
                        type="button"
                        onClick={() => handleBlockPartner(currentActiveMatch.partner.id)}
                        className="text-[10px] bg-red-950/40 border border-red-900/40 hover:bg-red-900/30 text-red-400 px-3 py-1.5 rounded-lg font-mono transition-colors cursor-pointer"
                      >
                        Block / Disconnect
                      </button>
                    </div>

                    {/* Live chat message feed content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
                      {currentActiveMatch.messages.map((msg) => {
                        const isMe = msg.senderId === "user_me";
                        const isSystem = msg.senderId === "system_shield";
                        
                        if (isSystem) {
                          return (
                            <div key={msg.id} className="w-full flex justify-center py-2 select-text font-sans">
                              <div className="bg-emerald-950/40 text-emerald-300 font-medium text-[10px] py-2 px-4 rounded-xl max-w-lg border border-emerald-900/60 leading-relaxed text-center shadow-md">
                                {msg.text}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div 
                            key={msg.id} 
                            className={`flex ${isMe ? "justify-end" : "justify-start"} select-text`}
                          >
                            <div className={`max-w-[70%] rounded-2xl p-3 text-xs leading-relaxed overflow-hidden relative ${
                              isMe 
                                ? "bg-[#D48166] text-black font-medium rounded-tr-none" 
                                : "bg-zinc-900 text-[#F5F5F4] rounded-tl-none border border-white/5"
                            }`}>
                              
                              {/* Media / GIF attachment */}
                              {msg.mediaUrl && (
                                <div className="mb-2 rounded-lg overflow-hidden border border-white/10">
                                  <img 
                                    src={msg.mediaUrl} 
                                    alt="Shared attachment" 
                                    className="max-h-48 object-cover w-full"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              )}

                              {/* Voice message wave representation */}
                              {msg.voiceDuration && (
                                <div className="flex items-center gap-2.5 mb-1.5 bg-black/20 p-2.5 rounded-xl font-mono text-[10px]">
                                  <Volume2 className="w-4 h-4 text-[#E94057] shrink-0" />
                                  <div className="flex gap-0.5 items-center w-28 h-4">
                                    <div className="w-1 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                                    <div className="w-1 h-3 bg-rose-500 rounded-full animate-pulse"></div>
                                    <div className="w-1 h-1 bg-rose-500 rounded-full"></div>
                                    <div className="w-1 h-4 bg-rose-500 rounded-full animate-pulse"></div>
                                    <div className="w-1 h-2 bg-rose-500 rounded-full"></div>
                                    <div className="w-1 h-3 bg-rose-500 rounded-full"></div>
                                  </div>
                                  <span>{msg.voiceDuration}</span>
                                </div>
                              )}

                              <p className="select-text">{msg.text}</p>
                              <span className="block text-[8px] text-black/40 text-right mt-1 font-mono">
                                {msg.timestamp}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {/* Real-time typing indicators simulated */}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-zinc-950 p-3 rounded-xl border border-white/5 text-[10px] text-white/40 italic flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                            <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                            <span>{currentActiveMatch.partner.name} is formulating opener thoughts...</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ICEBREAKERS & DATING TRIVIA CHAT ACCORDIONS */}
                    <div className="p-3 bg-[#0B0B0B] border-t border-white/5 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono uppercase text-white/40">Suggested Velvet Icebreakers</span>
                        <button 
                          type="button"
                          onClick={() => {
                            // Show the safety planner
                            setShowDateWizard(true);
                          }}
                          className={`${
                            currentActiveMatch.dateShared ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60" : "bg-[#D48166]/10 text-[#D48166] border border-[#D48166]/30"
                          } text-[9px] font-mono px-2.5 py-1 rounded-full uppercase tracking-widest font-bold hover:scale-102 transition-transform cursor-pointer`}
                        >
                          {currentActiveMatch.dateShared ? "🛡️ Date Security: ACTIVE" : "🛡️ Share Meet Plan"}
                        </button>
                      </div>

                      <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin select-none">
                        {ICEBREAKERS.map((ic, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => quickFillIcebreaker(ic)}
                            className="text-[10px] bg-white/5 border border-white/5 text-white/70 px-3 py-1.5 rounded-xl whitespace-nowrap hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            💬 {ic}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Integrated dynamic Input box control panel */}
                    <div className="p-4 bg-[#0E0E0E] !border-t border-white/10 divide-y divide-white/5 space-y-3">
                      
                      {/* Media selector or Voice indicator attachments triggers drawer */}
                      {showMediaSender && (
                        <div className="pb-3 grid grid-cols-4 gap-2">
                          {PRESET_GIFS_AND_PHOTOS.map((media) => (
                            <button
                              key={media.name}
                              type="button"
                              onClick={() => {
                                handleSendMessage("Look at this beautiful spot for a perfect Tuesday date!", media.url);
                                setShowMediaSender(false);
                              }}
                              className="group relative h-16 rounded-lg overflow-hidden border border-white/10 hover:border-[#D48166] transition-all cursor-pointer"
                            >
                              <img 
                                src={media.url} 
                                alt={media.name} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-all"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[8px] text-white py-0.5 text-center truncate">
                                {media.name}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 flex items-center gap-3">
                        {/* Camera attachment triggers simulated media grid drawer */}
                        <button 
                          type="button"
                          onClick={() => setShowMediaSender(!showMediaSender)}
                          className={`w-10 h-10 rounded-xl bg-[#111111] border ${
                            showMediaSender ? "border-[#D48166]" : "border-white/5"
                          } flex items-center justify-center text-white/60 hover:text-white cursor-pointer`}
                          title="Share an image"
                        >
                          <Camera className="w-4 h-4" />
                        </button>

                        {/* Mic button for voice note simulation */}
                        <button 
                          type="button"
                          onClick={toggleRecordVoice}
                          className={`w-10 h-10 rounded-xl bg-[#111111] border ${
                            isRecordingVoice ? "border-rose-500 animate-pulse text-rose-500" : "border-white/5 text-white/60 hover:text-white"
                          } flex items-center justify-center cursor-pointer`}
                          title={isRecordingVoice ? "Click again to STOP & attach voice note" : "Record voice note"}
                        >
                          <Mic className="w-4 h-4" />
                        </button>

                        <div className="flex-1 relative">
                          <input 
                            type="text"
                            placeholder={
                              isRecordingVoice 
                                ? "🎙️ Recording active... Click the microphone icon again to stop and send." 
                                : `Message ${currentActiveMatch.partner.name}... (scanned for safety)`
                            }
                            value={messageInput}
                            disabled={isRecordingVoice}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                            className="w-full px-4 py-3 bg-[#111111] border border-white/10 rounded-xl text-white text-xs focus:ring-1 focus:ring-[#D48166] focus:outline-none transition-all"
                          />

                          {recordedVoiceDur && (
                            <span className="absolute right-3 top-2.5 px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/50 rounded-full text-[9px] font-mono">
                              Voice attachment ready! ({recordedVoiceDur})
                            </span>
                          )}
                        </div>

                        <button 
                          type="button"
                          onClick={() => handleSendMessage()}
                          className="w-10 h-10 rounded-xl bg-[#D48166] hover:bg-[#c27258] text-black flex items-center justify-center shadow transition-all cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-2">
                    <MessageSquare className="w-12 h-12 text-[#D48166]/40 mb-2" />
                    <h3 className="text-sm font-serif italic text-white/80">Premium Velvet Matchrooms running live</h3>
                    <p className="text-xs text-white/40 max-w-sm">
                      Select one of your reciprocal matches in the list sidebar on the left, or swipe likes in our Discover lounge to formulate more connections!
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: SAFETY CENTER & INTERACTIVE COMPLIANCE QUIZ */}
          {activeTab === "safety" && (
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 max-w-3xl mx-auto w-full selection:bg-[#D48166] selection:text-black select-text">
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center mx-auto mb-1">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-serif font-bold italic text-white tracking-wide">
                  Velvet Security Guard & Safety Center
                </h2>
                <p className="text-xs text-white/50 max-w-lg mx-auto">
                  Receive real-time protective scan notifications, access verification badges, and participate in quizzes to unlock Premium Coins.
                </p>
              </div>

              {/* Safety Quizzing Panel */}
              <div className="bg-[#0E0E0E] rounded-2xl border border-white/5 p-6 space-y-5 shadow-lg">
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#D48166]">
                    Security Awareness Quiz Game
                  </span>
                  <span className="px-2.5 py-0.5 bg-[#D48166]/20 border border-[#D48166]/30 text-[#D48166] text-[10px] font-mono rounded-full">
                    Score: {quizScore} XP (+25 Credits/Correct Answer!)
                  </span>
                </div>

                {/* Progress dot count */}
                <div className="flex gap-1.5 justify-center">
                  {SAFETY_QUIZZES.map((q, idx) => (
                    <div 
                      key={q.id}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentQuizIndex 
                          ? "w-8 bg-[#D48166]" 
                          : quizHistory[q.id] !== undefined
                            ? quizHistory[q.id] ? "w-2 bg-emerald-500" : "w-2 bg-red-500"
                            : "w-2 bg-zinc-700"
                      }`}
                    ></div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white leading-relaxed">
                    Q{currentQuizIndex + 1}: {SAFETY_QUIZZES[currentQuizIndex].question}
                  </h3>

                  <div className="space-y-2.5">
                    {SAFETY_QUIZZES[currentQuizIndex].options.map((opt, i) => {
                      const isSelected = selectedQuizOption === i;
                      const hasSubmitted = selectedQuizOption !== null;
                      const isCorrectAnswer = i === SAFETY_QUIZZES[currentQuizIndex].correctAnswerIndex;
                      
                      let optBtnStyle = "bg-[#111111] border-white/5 hover:border-[#D48166]/30 text-white/80";
                      if (hasSubmitted) {
                        if (isCorrectAnswer) optBtnStyle = "bg-emerald-950/20 border-emerald-500/50 text-emerald-400";
                        else if (isSelected) optBtnStyle = "bg-red-950/20 border-red-500/50 text-red-400";
                        else optBtnStyle = "bg-[#111111] opacity-40 border-white/5 text-white/40";
                      } else if (isSelected) {
                        optBtnStyle = "border-[#D48166] text-[#D48166] font-semibold";
                      }

                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={hasSubmitted}
                          onClick={() => handleAnswerQuizOption(i)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs leading-normal transition-all flex items-start gap-2.5 cursor-pointer ${optBtnStyle}`}
                        >
                          <span className="font-mono bg-white/5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Answer feedback popups */}
                {quizCorrectAnswered !== null && (
                  <div className="bg-[#111111] p-4 rounded-xl border border-white/5 space-y-2.5 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      {quizCorrectAnswered ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-rose-500" />
                      )}
                      <span className={`text-xs font-bold ${quizCorrectAnswered ? "text-emerald-400" : "text-rose-400"}`}>
                        {quizCorrectAnswered ? "Correct! +25 Free Credits Added." : "Incorrect safety option."}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/60 leading-relaxed font-sans select-text">
                      💡 {SAFETY_QUIZZES[currentQuizIndex].explanation}
                    </p>
                    <button
                      type="button"
                      onClick={handleNextQuiz}
                      className="text-[10px] bg-[#D48166] text-black font-extrabold uppercase px-3 py-1.5 rounded-lg hover:opacity-90 transition-all cursor-pointer"
                    >
                      Next Question
                    </button>
                  </div>
                )}
              </div>

              {/* Safety Resources Info */}
              <div className="grid md:grid-cols-2 gap-4">
                
                <div className="bg-[#0E0E0E] p-5 rounded-xl border border-white/5 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#D48166]">Biometric Liveness & Verifications</h4>
                  <p className="text-[11px] text-white/50 leading-relaxed">
                    Verify your portrait using standard front facial camera capture. This signals to matches that you are real, increasing matching swipe chances by 400%.
                  </p>
                  <button 
                    type="button"
                    onClick={() => {
                      if (currentUserProfile.verified) {
                        alert("You are already fully verified! Badge active.");
                      } else {
                        handleVerifySelfie();
                      }
                    }}
                    disabled={isVerifying}
                    className="py-2 bg-gradient-to-tr from-[#D48166] to-[#E94057] text-white font-bold text-[10px] rounded-lg w-full tracking-wider uppercase"
                  >
                    {isVerifying ? "Scanning biometric liveness..." : currentUserProfile.verified ? "★ Fully Verified" : "Run Photo Verification"}
                  </button>
                  {verificationFeedback && (
                    <p className="text-[10px] text-emerald-400 font-mono italic text-center pt-1">{verificationFeedback}</p>
                  )}
                </div>

                <div className="bg-[#0E0E0E] p-5 rounded-xl border border-white/5 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#D48166]">Emergency Helplines & Dates</h4>
                  <p className="text-[11px] text-white/50 leading-relaxed">
                    Safety is non-negotiable. If you feel uncomfortable online or on an in-person date, immediately contact emergency helplines.
                  </p>
                  <ul className="text-[10px] text-white/40 space-y-1 bg-[#111111] p-3 rounded-lg font-mono">
                    <li>• Velvet Protection Line: 1-800-SAFE-DATE</li>
                    <li>• Crisis Text Line: Text HOME to 741741</li>
                    <li>• National Domestic Hotline: 1-800-799-7233</li>
                  </ul>
                </div>

              </div>

            </div>
          )}

          {/* TAB 4: PROFILE COMPONENT (tracking own profile completion progress) */}
          {activeTab === "profile" && (
            <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-xl mx-auto w-full space-y-6">
              
              <div className="text-center space-y-2">
                <div className="w-24 h-24 rounded-full border-4 border-[#D48166] overflow-hidden mx-auto shadow-xl relative group">
                  <img 
                    src={currentUserProfile.photoUrl} 
                    alt="My Avatar edit" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold italic text-white flex justify-center items-center gap-1.5">
                    {currentUserProfile.name}, {currentUserProfile.age}
                    {currentUserProfile.verified && (
                      <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[10px] text-white tracking-widest">✓</span>
                    )}
                  </h3>
                  <p className="text-xs text-white/50">{currentUserProfile.location} • Ideal Partner Finder</p>
                </div>
              </div>

              {/* Progress gauge complete */}
              <div className="bg-[#0E0E0E] p-5 rounded-xl border border-white/5 space-y-3 shadow-md">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white/85">Aesthetic Profile Completion Tracking score</span>
                  <span className="text-[#D48166] font-mono font-bold">{currentUserProfile.completesProfile}%</span>
                </div>
                <div className="h-2.5 w-full bg-[#111111] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#D48166] to-emerald-500 transition-all"
                    style={{ width: `${currentUserProfile.completesProfile}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-white/40 pt-2 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Portrait Verified (Pass)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Bio suggested completed
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Interests Index tagged
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Prompts fully calibrated
                  </div>
                </div>
              </div>

              {/* Bio block details */}
              <div className="bg-[#0E0E0E] p-5 rounded-2xl border border-white/5 space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2">My Biography Profile</label>
                  <p className="text-xs italic text-white/85 bg-[#111111] p-3.5 rounded-xl leading-relaxed select-text font-serif">
                    "{currentUserProfile.biography}"
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="block text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">Prompt Block Answer 1</span>
                    <p className="text-xs text-[#F5F5F4]/80 bg-[#111111] p-3 rounded-lg italic">
                      {currentUserProfile.prompts[0]?.answer}
                    </p>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">Prompt Block Answer 2</span>
                    <p className="text-xs text-[#F5F5F4]/80 bg-[#111111] p-3 rounded-lg italic">
                      {currentUserProfile.prompts[1]?.answer}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2">My Lifestyle Intersts</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentUserProfile.hobbies.map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-white/50 font-sans">
                        ✓ {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => {
                    setCurrentUserProfile(null); // allow reconfiguring/re-onboarding easily from scratch!
                  }}
                  className="w-full py-2.5 bg-white/5 border border-white/10 text-white/60 hover:text-[#E94057] hover:border-[#E94057]/40 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all"
                >
                  Edit Profile / Log Out Core
                </button>
              </div>

            </div>
          )}

        </section>

        {/* RIGHT COLUMN: AI WINGMAN ADVICE DRAWER & COINS STORE QUICK PORT */}
        <aside className="hidden lg:flex w-80 bg-[#0E0E0E] border-l border-white/5 flex-col shrink-0 select-none">
          
          <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto w-full select-none selection:bg-[#D48166] selection:text-black">
            
            {/* Header section */}
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">AI Wingman Coach</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#D48166] rounded-full animate-ping"></div>
                <span className="text-[8px] tracking-widest text-[#D48166] uppercase font-bold">Gemini 3.5 Active</span>
              </div>
            </div>

            {/* Wingman response visualizer */}
            <div className="bg-gradient-to-br from-zinc-900 to-[#111111] rounded-2xl p-5 border border-[#D48166]/20 relative space-y-3 shadow-md">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D48166] fill-[#D48166]/20" />
                <span className="text-[11px] text-[#D48166] font-extrabold italic font-serif">Acoustic coach feedback:</span>
              </div>
              
              <div className="text-[11px] text-white/80 leading-relaxed max-h-56 overflow-y-auto pr-1 select-text scrollbar-thin font-sans">
                {wingmanResult}
              </div>

              {/* Action query triggers */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => handleTriggerWingman("suggest_openers")}
                  disabled={isWingmanLoading}
                  className="text-[9px] bg-white/5 px-2 py-1.5 rounded-lg border border-white/5 hover:bg-[#D48166] hover:text-black hover:font-bold transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Suggest Openers
                </button>
                <button 
                  type="button"
                  onClick={() => handleTriggerWingman("give_feedback")}
                  disabled={isWingmanLoading}
                  className="text-[9px] bg-white/5 px-2 py-1.5 rounded-lg border border-white/5 hover:bg-[#D48166] hover:text-black hover:font-bold transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Get Feedback
                </button>
              </div>
            </div>

            {/* Custom AI prompt question field */}
            <div className="space-y-2 bg-neutral-950/40 p-3.5 rounded-xl border border-white/5">
              <span className="block text-[9px] uppercase tracking-widest text-white/40 font-semibold font-mono">Ask Custom Wingman Advice</span>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="e.g. Write a friendly invite to siphoning coffee...?"
                  value={wingmanCustomPrompt}
                  onChange={(e) => setWingmanCustomPrompt(e.target.value)}
                  className="flex-1 bg-neutral-900 border border-white/15 px-2.5 py-1.5 rounded-lg text-[10px] text-white focus:outline-none"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleTriggerWingman("custom_question"); }}
                />
                <button 
                  type="button"
                  onClick={() => handleTriggerWingman("custom_question")}
                  className="px-2.5 py-1.5 bg-[#D48166] text-black font-extrabold rounded-lg text-[10px]"
                >
                  Consult
                </button>
              </div>
              <p className="text-[8px] text-white/35 italic">Wingman reads partner hobbies dynamically for customized lines!</p>
            </div>

            {/* Premium monetization Currency actions */}
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 space-y-3.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase text-white/40 font-bold">Premium Currency</span>
                <span className="text-xs font-mono font-bold text-[#D48166]">{credits} Credits</span>
              </div>
              <p className="text-[10px] text-white/50 leading-relaxed">
                Unlock instant date planning shields, purchase Super Likes, or activate Velvet profile boosts.
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                <button 
                  type="button"
                  onClick={() => setShowCoinStore(true)}
                  className="py-2.5 bg-[#D48166] text-black rounded-lg font-bold uppercase transition-transform hover:scale-102 cursor-pointer"
                >
                  Purchase Bundle
                </button>
                <button 
                  type="button"
                  onClick={activateProfileBoost}
                  className="py-2.5 bg-[#111111] border border-white/10 hover:border-[#D48166] text-white rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Activate Boost
                </button>
              </div>
            </div>

          </div>

          {/* Core Applet footer details */}
          <div className="p-4 border-t border-white/5 bg-[#0B0B0B] text-center">
            <p className="text-[9px] text-white/30 lowercase tracking-wider">
              Powered by Google AI Studio Gemini Server-Side
            </p>
          </div>

        </aside>

      </main>

      {/* MODAL 1: MUTUAL MATCH CELEBRATION OVERLAY SPLASH */}
      {matchPopupPartner && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-90 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-zinc-950 border border-[#D48166]/30 max-w-sm w-full rounded-2xl p-6 text-center space-y-6 shadow-2xl animate-scaleUp relative">
            <button
              onClick={() => setMatchPopupPartner(null)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D48166] font-mono">
                Velvet Connection Achieved
              </span>
              <h3 className="text-3xl font-serif font-bold italic text-white leading-tight">
                Reciprocal Match!
              </h3>
            </div>

            {/* Joined Avatars image view */}
            <div className="flex items-center justify-center -space-x-4 py-2">
              <div className="w-18 h-18 rounded-full border-4 border-zinc-950 overflow-hidden shadow-lg">
                <img 
                  src={currentUserProfile.photoUrl} 
                  alt="me" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="w-18 h-18 rounded-full border-4 border-zinc-950 overflow-hidden shadow-lg">
                <img 
                  src={matchPopupPartner.photoUrl} 
                  alt="partner" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <p className="text-xs text-white/75 leading-relaxed font-sans">
              You and <strong className="text-white bg-[#D48166]/10 px-1 rounded">{matchPopupPartner.name}</strong> reciprocal liked each other! Our safety shields are active. Send an icebreaker recommended by your wingman.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setMatchPopupPartner(null);
                  setActiveTab("matches");
                }}
                className="w-full py-3 bg-gradient-to-r from-[#D48166] to-[#E94057] text-white font-bold tracking-wider uppercase text-xs rounded-xl shadow-lg hover:opacity-90 transition-all cursor-pointer"
              >
                Launch Chat Lobby
              </button>
              <button
                onClick={() => setMatchPopupPartner(null)}
                className="w-full py-2 text-white/40 hover:text-white text-xs"
              >
                Keep Swiping Discover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: INTERACTIVE DUAL COINS STORE & BOOST BUNDLER */}
      {showCoinStore && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-80 flex items-center justify-center p-4">
          <div className="bg-[#0E0E0E] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-5 relative">
            <button 
              onClick={() => setShowCoinStore(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-serif font-bold italic text-white">Velvet VIP Currency Store</h3>
              <p className="text-xs text-white/50">Invest in high-caliber connections, priority queues, and biometrics</p>
            </div>

            <div className="space-y-3">
              
              <div className="flex justify-between items-center bg-[#111111] p-3.5 rounded-xl border border-white/5">
                <div>
                  <h4 className="text-xs font-bold text-white">Velvet Starter Pack</h4>
                  <p className="text-[10px] text-white/40">100 Premium Credits + 5 Super Likes</p>
                </div>
                <button 
                  onClick={() => buyCreditsPack(100, 4.99)}
                  className="px-3 py-1.5 bg-[#D48166] text-black font-extrabold text-xs rounded-lg"
                >
                  $4.99
                </button>
              </div>

              <div className="flex justify-between items-center bg-[#111111] p-3.5 rounded-xl border border-white/5">
                <div>
                  <h4 className="text-xs font-bold text-white">Romantic VIP Bundle</h4>
                  <p className="text-[10px] text-white/40">350 Credits + unlimited swiping + safety filters</p>
                </div>
                <button 
                  onClick={() => {
                    buyCreditsPack(350, 9.99);
                    setIsPremium(true);
                  }}
                  className="px-3 py-1.5 bg-gradient-to-r from-[#D48166] to-[#E94057] text-white font-extrabold text-xs rounded-lg"
                >
                  $9.99
                </button>
              </div>

              <div className="p-3 bg-gradient-to-tr from-[#D48166]/10 to-[#E94057]/10 rounded-xl border border-[#D48166]/30 text-center space-y-1">
                <div className="flex justify-center items-center gap-1.5 text-xs text-[#D48166] font-bold">
                  <Award className="w-4 h-4 text-yellow-500 fill-yellow-500" /> Velvet VIP subscription ACTIVE
                </div>
                <p className="text-[9px] text-white/40 leading-snug">
                  Your sandbox environment is pre-loaded with developer tier premium permissions for secure exploration.
                </p>
              </div>

            </div>

            <p className="text-[8px] text-white/30 text-center italic">
              All transactions in AI studio developer accounts are completely simulated sandbox environments.
            </p>
          </div>
        </div>
      )}

      {/* MODAL 3: SECURE DATE PLAN SHARING WIZARD */}
      {showDateWizard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-85 flex items-center justify-center p-4">
          <div className="bg-[#0E0E0E] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-5 relative">
            <button 
              onClick={() => setShowDateWizard(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-serif font-bold italic text-white font-sans">Velvet Date Share Scheduler</h3>
              </div>
              <p className="text-xs text-white/50">
                Register meet details securely. We automatically message emergency contacts and tag real-time security on the date.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1.5">
                  Meet Venue (Public Space Recommended)
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Clay Pottery Class, Downtown Austin" 
                  value={dateVenue}
                  onChange={(e) => setDateVenue(e.target.value)}
                  className="w-full bg-[#111111] border border-white/10 text-white rounded-lg p-2.5 text-xs focus:ring-1 focus:outline-none focus:ring-[#D48166]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1.5">
                  Scheduled Meet Date & Time
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Next Tuesday at 7:00 PM" 
                  value={dateScheduleStr}
                  onChange={(e) => setDateScheduleStr(e.target.value)}
                  className="w-full bg-[#111111] border border-white/10 text-white rounded-lg p-2.5 text-xs focus:ring-1 focus:outline-none focus:ring-[#D48166]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1.5">
                  Trusted Emergency Contact Number Or Name
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. sister (512-555-0199)" 
                  value={trustedContactNum}
                  onChange={(e) => setTrustedContactNum(e.target.value)}
                  className="w-full bg-[#111111] border border-white/10 text-white rounded-lg p-2.5 text-xs focus:ring-1 focus:outline-none focus:ring-[#D48166]"
                />
              </div>

              <div className="p-3 bg-emerald-950/10 border border-emerald-900/40 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">🔒 SECURE CRYPTOGRAPHY INDEX</span>
                <p className="text-[9px] text-white/50 leading-snug">
                  Coordinates are stored on device. Emergency contacts only receive messages if liveness confirmation fails or manually triggered from dates shield tool.
                </p>
              </div>

              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => setShowDateWizard(false)}
                  className="w-1/3 py-2.5 bg-[#111111] border border-white/5 text-white/60 hover:text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDateSharing}
                  className="w-2/3 py-2.5 bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-bold rounded-lg uppercase tracking-wider text-[10px]"
                >
                  Pair Security & Share
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ALIEN RADAR HARASSMENT SCAN WARNING PANEL */}
      {scannedWarning && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-95 flex items-center justify-center p-4">
          <div className="bg-[#0E0E0E] border-2 border-red-500/50 max-w-sm w-full rounded-2xl p-6 text-center space-y-5 relative animate-scaleUp">
            
            <div className="w-12 h-12 bg-red-950/30 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-red-500">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 font-mono">
                AI Toxicity Warning Triggered
              </span>
              <h3 className="text-xl font-serif font-bold italic text-white">
                "Are You Sure?"
              </h3>
            </div>

            <div className="bg-[#111111] p-4 rounded-xl border border-white/5 space-y-2 select-text font-sans">
              <p className="text-[10px] text-white/35 uppercase font-bold text-left">Safety Advisory:</p>
              <p className="text-xs text-red-200 leading-relaxed text-left italic">
                "{scannedWarning}"
              </p>
            </div>

            <p className="text-[10px] text-white/50 leading-relaxed font-sans">
              Our community mandates warm, charismatic, and mutually respectful interactions. Sending hostile warnings or aggressive demands is a direct violation of app policies.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => handleResolveFlaggedMsg(false)}
                className="w-1/2 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider"
              >
                Delete message
              </button>
              <button
                onClick={() => handleResolveFlaggedMsg(true)}
                className="w-1/2 py-2.5 bg-white/5 border border-white/10 hover:bg-white/15 text-white rounded-xl text-xs"
              >
                Send Anyway
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
