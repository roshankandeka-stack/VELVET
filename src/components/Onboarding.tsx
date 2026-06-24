import React, { useState } from "react";
import { Profile, Gender, RelationshipGoal } from "../types";
import { Heart, Sparkles, Camera, Shield, ArrowRight, User } from "lucide-react";

interface OnboardingProps {
  onComplete: (profile: Profile) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<number>(24);
  const [gender, setGender] = useState<Gender>("Female");
  const [targetGender, setTargetGender] = useState<Gender | "All font-sans">("Male");
  const [location, setLocation] = useState<string>("Austin, TX");
  const [biography, setBiography] = useState<string>("");
  const [relationshipGoal, setRelationshipGoal] = useState<RelationshipGoal>("Serious Relationship");
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [prompt1, setPrompt1] = useState<string>("");
  const [prompt2, setPrompt2] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string>(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80"
  );
  const [isGeneratingBio, setIsGeneratingBio] = useState<boolean>(false);

  const AVATARS = [
    { name: "Sleek portrait", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80" },
    { name: "Casual creative", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80" },
    { name: "Urban style", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80" },
    { name: "Elegant look", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80" }
  ];

  const COMMON_HOBBIES = [
    "Pottery", "Climbing", "Cooking", "Tacos", "Barista", "Jazz", "Running", 
    "Record Stores", "Houseplants", "Museums", "Roller Skating", "Thrifting"
  ];

  const toggleHobby = (hobby: string) => {
    if (hobbies.includes(hobby)) {
      setHobbies(hobbies.filter(h => h !== hobby));
    } else {
      setHobbies([...hobbies, hobby]);
    }
  };

  const handleSuggestBio = async () => {
    if (hobbies.length === 0) {
      alert("Please select a few hobbies first to help our AI write your bio!");
      return;
    }
    setIsGeneratingBio(true);
    try {
      const res = await fetch("/api/ai/generate-profile-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hobbies, relationshipGoal, currentBio: biography }),
      });
      const data = await res.json();
      setBiography(data.result || data.bio || "");
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const handleFinish = () => {
    if (!name.trim()) {
      alert("Please enter your name to start matching!");
      return;
    }

    let score = 20;
    if (biography) score += 30;
    if (hobbies.length > 0) score += 20;
    if (prompt1) score += 15;
    if (prompt2) score += 15;

    const userProfile: Profile = {
      id: "user_me",
      name,
      age: Number(age),
      gender,
      location,
      distance: 0,
      biography: biography || "Exploring the city and seeking raw, beautiful human connections.",
      prompts: [
        {
          id: "ideal_date",
          question: "My idea of a perfect first date is...",
          answer: prompt1 || "A trial clay wheel session, followed by slow acoustic jazz."
        },
        {
          id: "get_along",
          question: "We'll get along if...",
          answer: prompt2 || "You appreciate typographical precision, curated coffee beans, and high-quality vinyl."
        }
      ],
      photoUrl,
      albumPhotos: [photoUrl],
      verified: false,
      verificationStatus: "unverified",
      hobbies: hobbies.length > 0 ? hobbies : ["Jazz", "Espresso", "Climbing"],
      completesProfile: Math.min(score, 100),
      relationshipGoal
    };

    onComplete(userProfile);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F4] flex items-center justify-center p-4 selection:bg-[#D48166] selection:text-black">
      <div className="w-full max-w-lg bg-[#0E0E0E] shadow-2xl rounded-3xl overflow-hidden border border-white/5 transition-all">
        
        {/* Header Ribbon in Sophisticated Terracotta Gradient */}
        <div className="bg-[#111111] border-b border-white/5 px-8 py-6 text-center relative">
          <div className="absolute top-4 right-4 bg-[#D48166]/20 text-[#D48166] px-3 py-1 rounded-full text-[10px] font-mono border border-[#D48166]/30 uppercase tracking-widest font-bold">
            Step {step} of 4
          </div>
          <div className="flex justify-center items-center gap-3 mb-1">
            <div className="w-7 h-7 bg-gradient-to-tr from-[#D48166] to-[#E94057] rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white font-serif uppercase italic">
              VELVET<span className="text-[#D48166] font-normal font-sans">.</span>
            </h1>
          </div>
          <p className="text-white/40 text-[10px] uppercase tracking-widest">Premium Personal Discovery & Security Systems</p>
        </div>

        {/* Form Content */}
        <div className="p-8">
          
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-2">
                <h2 className="text-lg font-serif font-bold italic text-white">Let's build your identity</h2>
                <p className="text-white/50 text-xs">Fill in your true details with architectural precision</p>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2">My First Name</label>
                <input
                  type="text"
                  placeholder="John"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#111111] border border-white/10 rounded-xl text-[#F5F5F4] focus:ring-1 focus:ring-[#D48166] focus:outline-none transition-all placeholder:text-white/20 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2">My Age</label>
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-[#111111] border border-white/10 rounded-xl text-[#F5F5F4] focus:ring-1 focus:ring-[#D48166] focus:outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 bg-[#111111] border border-white/10 rounded-xl text-[#F5F5F4] focus:ring-1 focus:ring-[#D48166] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2">My Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full px-4 py-3 bg-[#111111] border border-white/10 rounded-xl text-[#F5F5F4] focus:ring-1 focus:ring-[#D48166] focus:outline-none"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2">Swiping Preference</label>
                  <select
                    value={targetGender.replace(" font-sans", "")}
                    onChange={(e) => setTargetGender(e.target.value as Gender | "All")}
                    className="w-full px-4 py-3 bg-[#111111] border border-white/10 rounded-xl text-[#F5F5F4] focus:ring-1 focus:ring-[#D48166] focus:outline-none"
                  >
                    <option value="Female">Women</option>
                    <option value="Male">Men</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="All">Everyone</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!name.trim()) alert("Please write your name first!");
                  else setStep(2);
                }}
                className="w-full py-3.5 bg-gradient-to-r from-[#D48166] to-[#E94057] text-white rounded-xl font-bold tracking-wider uppercase text-xs hover:opacity-90 shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Choose Gallery Photo <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-2">
                <h2 className="text-lg font-serif font-bold italic text-white">Select Portrait Image</h2>
                <p className="text-white/50 text-xs">Aesthetic profile pictures make your impression unforgettable</p>
              </div>

              <div className="flex justify-center flex-col items-center gap-4">
                <div className="w-36 h-36 rounded-2xl overflow-hidden border-2 border-[#D48166] shadow-[0_8px_30px_rgb(212,129,102,0.15)] relative group bg-neutral-950">
                  <img
                    src={photoUrl}
                    alt="Active portrait"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="w-full">
                  <label className="block text-[9px] uppercase tracking-widest text-white/40 font-bold mb-1 text-center">Custom Portrait Image URL</label>
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#111111] border border-white/10 rounded-lg text-center font-mono text-white/70 focus:outline-none focus:ring-1 focus:ring-[#D48166]"
                  />
                </div>
              </div>

              <div>
                <span className="block text-[10px] uppercase tracking-widest text-[#D48166]/95 font-bold mb-2 text-center font-mono">Or select a Velvet preset avatar</span>
                <div className="grid grid-cols-4 gap-2">
                  {AVATARS.map((av, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setPhotoUrl(av.url)}
                      className={`h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        photoUrl === av.url ? "border-[#D48166] scale-105" : "border-white/5 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={av.url}
                        alt={av.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 bg-[#111111] border border-white/5 rounded-xl font-bold uppercase tracking-wider text-[10px] text-white/60 hover:text-white transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-2/3 py-3 bg-gradient-to-r from-[#D48166] to-[#E94057] text-white rounded-xl font-bold uppercase tracking-wider text-[10px] hover:opacity-90 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  Configure Lifestyle <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-serif font-bold italic text-white font-sans">Relationship Intensity</h2>
                <p className="text-white/50 text-xs">Match based on true romantic and personal frequencies</p>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2">My Relationship Intent</label>
                <select
                  value={relationshipGoal}
                  onChange={(e) => setRelationshipGoal(e.target.value as RelationshipGoal)}
                  className="w-full px-4 py-3 bg-[#111111] border border-white/10 rounded-xl text-white focus:ring-1 focus:ring-[#D48166] focus:outline-none"
                >
                  <option value="Serious Relationship font-sans">Serious Relationship</option>
                  <option value="Marriage / Life Partner">Marriage / Life Partner</option>
                  <option value="Casual Dating">Casual Dating</option>
                  <option value="New Friends / Networking">New Friends / Networking</option>
                  <option value="Open to Anything">Open to Anything</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2">Interests & Hobbies (Choose at least 3)</label>
                <div className="flex flex-wrap gap-1.5 p-2 border border-white/5 rounded-xl bg-neutral-950/40">
                  {COMMON_HOBBIES.map((hb) => {
                    const selected = hobbies.includes(hb);
                    return (
                      <button
                        key={hb}
                        type="button"
                        onClick={() => toggleHobby(hb)}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                          selected
                            ? "bg-[#D48166] text-black font-semibold shadow-md scale-102"
                            : "bg-white/5 border border-white/5 text-white/60 hover:text-white hover:border-white/10"
                        }`}
                      >
                        {selected ? "✓ " : ""}
                        {hb}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 py-3 bg-[#111111] border border-white/5 rounded-xl font-bold uppercase tracking-wider text-[10px] text-white/60 hover:text-white transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (hobbies.length < 3) {
                      alert("Please select at least 3 hobbies to calibrate your Velvet matching index!");
                    } else {
                      setStep(4);
                    }
                  }}
                  className="w-2/3 py-3 bg-gradient-to-r from-[#D48166] to-[#E94057] text-white rounded-xl font-bold uppercase tracking-wider text-[10px] hover:opacity-90 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  Calibrate Prompts <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-lg font-serif font-bold italic text-white">Bio & Conversation Starters</h2>
                <p className="text-white/50 text-xs">Let our AI Wingman maximize your charisma score</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] uppercase tracking-wider text-white/40 font-bold">About Me Biography</label>
                  <button
                    type="button"
                    onClick={handleSuggestBio}
                    disabled={isGeneratingBio}
                    className="text-[10px] font-bold text-[#D48166] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-[#D48166] fill-[#D48166]/20" />
                    {isGeneratingBio ? "AI Calibrating..." : "Auto-Enhance Bio"}
                  </button>
                </div>
                <textarea
                  rows={2}
                  placeholder="e.g. Vintage typewriter collector who loves deep-groove jazz vinyls and siphoning single-origin coffee on cozy Sunday mornings..."
                  value={biography}
                  onChange={(e) => setBiography(e.target.value)}
                  className="w-full px-4 py-3 bg-[#111111] border border-white/10 rounded-xl text-white focus:ring-1 focus:ring-[#D48166] focus:outline-none placeholder:text-white/10 text-sm"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <span className="block text-[8px] uppercase tracking-widest text-[#D48166]/80 font-bold mb-1">Prompt Block 1</span>
                  <div className="bg-[#111111] px-3 py-1.5 rounded-lg border border-white/5 text-[10px] font-medium text-white/50 mb-1 font-serif italic">
                    📖 My idea of a perfect first date is...
                  </div>
                  <input
                    type="text"
                    placeholder="Wallowing in paint at a dynamic art studio, and discussing layout design."
                    value={prompt1}
                    onChange={(e) => setPrompt1(e.target.value)}
                    className="w-full px-3 py-2 bg-[#111111] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D48166]"
                  />
                </div>

                <div>
                  <span className="block text-[8px] uppercase tracking-widest text-[#D48166]/80 font-bold mb-1">Prompt Block 2</span>
                  <div className="bg-[#111111] px-3 py-1.5 rounded-lg border border-white/5 text-[10px] font-medium text-white/50 mb-1 font-serif italic">
                    💡 We'll get along if...
                  </div>
                  <input
                    type="text"
                    placeholder="You value typography pairings, high sarcasm, and good coffee beans."
                    value={prompt2}
                    onChange={(e) => setPrompt2(e.target.value)}
                    className="w-full px-3 py-2 bg-[#111111] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D48166]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-1/3 py-3 bg-[#111111] border border-white/5 rounded-xl font-bold uppercase tracking-wider text-[10px] text-white/60 hover:text-white transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  className="w-2/3 py-3 bg-[#D48166] hover:bg-[#c27258] text-black rounded-xl font-bold uppercase tracking-wider text-[10px] shadow-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-black fill-black" /> Complete Calibration
                </button>
              </div>
            </div>
          )}

          {/* Secure validation notice */}
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-1.5 text-white/30 text-[10px]">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Biometric Liveness Match & Anti-Harassment Scanner Initialized</span>
          </div>

        </div>

      </div>
    </div>
  );
}
