#!/usr/bin/env python3
"""
rose_system.py

A complete Python implementation simulating the "Special Rose / Super Like"
interaction and limit system for a modern, sophisticated dating ecosystem.

This script demonstrates:
1. Object-Oriented design for Profiles, Matches, and the Dating Engine.
2. Free User vs. Premium/VIP Limits (Roses and Swipes capped vs. unlimited).
3. Receiving & Sending Highlights (Visual markers indicating Rose attachment).
4. Earning Roses by completing dating cyber-security compliance quizzes.
5. Interactive Terminal Sandbox to test swiping, matches, and upgrades.
"""

import uuid
import random
from typing import List, Dict, Optional, Tuple


class Profile:
    def __init__(self, name: str, age: int, biography: str, hobbies: List[str], is_verified: bool = False):
        self.id = str(uuid.uuid4())[:8]
        self.name = name
        self.age = age
        self.biography = biography
        self.hobbies = hobbies
        self.is_verified = is_verified
        
        # Connection Flags
        self.super_liked = False
        self.sent_rose = False
        self.sent_rose_to_me = False


class Message:
    def __init__(self, sender_name: str, text: str, timestamp: str):
        self.sender_name = sender_name
        self.text = text
        self.timestamp = timestamp


class Match:
    def __init__(self, partner: Profile, active_rose: bool = False, active_super_like: bool = False):
        self.id = f"m_{partner.id}_{int(random.random() * 1000)}"
        self.partner = partner
        self.active_rose = active_rose
        self.active_super_like = active_super_like
        self.messages: List[Message] = []
        
        # Initiate first icebreaker based on connection type
        if active_rose:
            text = f"Hi! 🌹 I sent you a Rose because your bio really caught my eye! Let's chat."
        elif active_super_like:
            text = f"Hey there! ★ That's a Super Like from me. Hope we can match vibes!"
        else:
            text = f"Hello! Thanks for the match! What are your typical weekend hobbies?"
            
        self.messages.append(Message(sender_name="System", text=text, timestamp="Just Now"))


class SafetyQuizQuestion:
    def __init__(self, question: str, options: List[str], correct_idx: int, explanation: str):
        self.question = question
        self.options = options
        self.correct_idx = correct_idx
        self.explanation = explanation


class DatingEngine:
    def __init__(self, user_name: str):
        # Current User State
        self.user_name = user_name
        self.is_premium = False
        self.credits = 340
        self.roses_count = 1  # Standard 1 free Rose daily allowance
        self.swipes_count = 0
        self.max_free_swipes = 5
        
        # Matches Inbox
        self.matches: List[Match] = []
        
        # Simulated database of potential partners
        self.discovery_feed: List[Profile] = [
            Profile(
                name="Maya Patel", 
                age=26, 
                biography="Full-stack designer by day, pottery enthusiast and rock climber.",
                hobbies=["Pottery", "Climbing", "Design", "Vinyls"],
                is_verified=True
            ),
            Profile(
                name="Liam Henderson", 
                age=28, 
                biography="Indie musician and slow siphon barista.",
                hobbies=["Barista", "Guitar", "Jazz", "Dogs"],
                is_verified=True
            ),
            Profile(
                name="Jordan Alvarez", 
                age=25, 
                biography="Plant parent of 32 leafy green children and roller skating maniac.",
                hobbies=["Thrifting", " Skating", "Houseplants"],
                is_verified=False
            ),
            Profile(
                name="Chloe Chen", 
                age=31, 
                biography="Executive chef, obsessed with hot sauce curation and scenic biking.",
                hobbies=["Cooking", "Cycling", "Hot Sauce", "Ferments"],
                is_verified=True
            )
        ]
        
        # Prepulate one incoming Rose from Maya as simulated received highlight!
        self.discovery_feed[0].sent_rose_to_me = True
        self.matches.append(Match(partner=self.discovery_feed[0], active_rose=True))
        self.matches[0].messages.append(Message(
            sender_name="Maya Patel",
            text="Hi! 🌹 I sent you a premium Rose because I loved your description of London coffee! Want to get matcha?",
            timestamp="2m ago"
        ))
        
        # Safety Center Quizzes
        self.quizzes: List[SafetyQuizQuestion] = [
            SafetyQuizQuestion(
                question="A match asks to move conversation immediately to an unverified third-party app with cryptic URLs. What should you do?",
                options=[
                    "Send them your number immediately",
                    "Decline and flag the conversation using built-in Safety shields",
                    "Click the link to verify if it's safe"
                ],
                correct_idx=1,
                explanation="Always stay within Velvet security-scanning channels initially. Unverified links are primary attack vectors."
            ),
            SafetyQuizQuestion(
                question="What is the safest approach when scheduling an in-person meeting date?",
                options=[
                    "Go to their private residence on the first meetup",
                    "Choose a busy public space and register date details in Velvet Date Share Scheduler tool",
                    "Keep details secret so friends don't tease you"
                ],
                correct_idx=1,
                explanation="Meeting in public and utilizing our safe contacts scheduler guarantees priority security nets."
            )
        ]
        self.quiz_index = 0

    def toggle_premium(self) -> str:
        self.is_premium = not self.is_premium
        if self.is_premium:
            self.roses_count = 5
            return "★ Velvet VIP membership unlocked! Roses refilled and limit caps lifted."
        else:
            self.roses_count = 1
            return "Downgraded to free subscriber tier. Standard limitations and 24h counters active."

    def swipe_dislike(self, partner: Profile):
        print(f"\n[-] Passed on {partner.name}. Let's find your perfect alignment!")

    def swipe_like(self, partner: Profile) -> Tuple[bool, str]:
        # Handle regular swipes limit for free tier
        if not self.is_premium and self.swipes_count >= self.max_free_swipes:
            return False, "❌ Daily swipe limit reached! Unlock Velvet VIP or spend 50 credits to load more."
        
        self.swipes_count += 1
        
        # Regular likes have a standard 60% simulated compatibility feedback
        is_match = random.random() > 0.40
        if is_match:
            new_match = Match(partner=partner)
            self.matches.append(new_match)
            return True, f"✨ Match Achieved! You and {partner.name} reciprocal liked each other."
        return False, f"Liked {partner.name}. Swipe logged."

    def send_rose(self, partner: Profile) -> Tuple[bool, str]:
        # Limited in quantity for free users
        if not self.is_premium and self.roses_count <= 0:
            return False, "🌹 Out of Roses! Complete Velvet Quizzes to earn free Rose tokens or upgrade to Velvet VIP."
        
        if not self.is_premium:
            self.roses_count -= 1
            
        partner.sent_rose = True
        
        # Rose guarantees immediate connection matching!
        new_match = Match(partner=partner, active_rose=True)
        self.matches.append(new_match)
        
        return True, f"🌹 Rose connection delivered successfully! {partner.name} flagged with instant priority highlight."

    def answer_quiz(self, user_ans_idx: int) -> Tuple[bool, str]:
        if self.quiz_index >= len(self.quizzes):
            return False, "All security quizzes finished! Come back tomorrow for more training modules."
            
        quiz = self.quizzes[self.quiz_index]
        if user_ans_idx == quiz.correct_idx:
            self.credits += 25
            self.roses_count += 1
            feedback = f"✅ Correct! Awarded +25 Coins & +1 Special Rose 🌹\n💡 Explanation: {quiz.explanation}"
            self.quiz_index = (self.quiz_index + 1) % len(self.quizzes)
            return True, feedback
        else:
            return False, f"❌ Incorrect. Review dating security policies.\n💡 Hint: {quiz.explanation}"


def run_terminal_sandbox():
    print("=" * 60)
    print("           VELVET DATING ECOSYSTEM: SIMULATION PLATFORM")
    print("=" * 60)
    engine = DatingEngine(user_name="Alex")
    
    current_idx = 1  # Maya is already matched initially, pick Liam/Jordan/Chloe
    
    while True:
        print("\n" + "-" * 55)
        print(f" MEMBER: {engine.user_name} | STATUS: {'VELVET VIP ★' if engine.is_premium else 'FREE MEMBERSHIP'}")
        print(f" BALANCE: {engine.credits} Credits | ROSES AVAILABLE: {engine.roses_count} 🌹")
        print(f" DAILY SWIPES: {engine.swipes_count} / {engine.max_free_swipes if not engine.is_premium else 'Unlimited ∞'}")
        print("-" * 55)
        
        # Display current card if feed is running
        partner = engine.discovery_feed[current_idx] if current_idx < len(engine.discovery_feed) else None
        
        if partner:
            print("\n>>> ACTIVE DISCOVERY CARD:")
            badge = " [🌹 SENT YOU A ROSE]" if partner.sent_rose_to_me else ""
            print(f"     Name: {partner.name}, {partner.age} {badge}")
            print(f"     Bio:  \"{partner.biography}\"")
            print(f"     Hobbies: {', '.join(partner.hobbies)}")
        else:
            print("\n>>> Discovery Feed finished! Recycling profiles to facilitate sandbox testing.")
            current_idx = 1
            continue
            
        print("\nOPTIONS MENU:")
        print("  [1] Send regular Like (♥)")
        print("  [2] Send Crimson Rose (🌹) - Special priority connection!")
        print("  [3] Dislike & Pass (X)")
        print("  [4] View Inbox Matches (Shows Highlighted Rose markers)")
        print("  [5] Safety compliance quiz (Solve to EARN free Roses & credits)")
        print("  [6] Toggle Velvet VIP / Free Status (Test limits)")
        print("  [0] Exit")
        
        choice = input("\nSelect command: ").strip()
        
        if choice == "1":
            success, msg = engine.swipe_like(partner)
            print(f"\n{msg}")
            if success or "Swipe logged" in msg:
                current_idx += 1
        elif choice == "2":
            success, msg = engine.send_rose(partner)
            print(f"\n{msg}")
            if success:
                current_idx += 1
        elif choice == "3":
            engine.swipe_dislike(partner)
            current_idx += 1
        elif choice == "4":
            print("\n" + "=" * 50)
            print("                INBOX CHAT LOBBIES")
            print("" + "=" * 50)
            if not engine.matches:
                print("Your inbox is empty. Swiping on discover feed creates matches!")
            for idx, m in enumerate(engine.matches):
                tag = ""
                if m.active_rose:
                    tag = " [🌹 ROSE CONNECTION - HIGHLIGHTED ACTIVE]"
                elif m.active_super_like:
                    tag = " [★ SUPER LIKED]"
                print(f"  {idx + 1}. {m.partner.name}, {m.partner.age}{tag}")
                print(f"     Last Message: \"{m.messages[-1].text}\"")
                print("-" * 50)
            input("\nPress Enter to return to feed...")
        elif choice == "5":
            if engine.quiz_index < len(engine.quizzes):
                q = engine.quizzes[engine.quiz_index]
                print(f"\n[SECURITY AWARENESS QUIZ]")
                print(f"Q: {q.question}")
                for o_idx, opt in enumerate(q.options):
                    print(f"   [{o_idx + 1}] {opt}")
                ans = input("\nSelect answer (1-3): ").strip()
                if ans in ["1", "2", "3"]:
                    success, feedback = engine.answer_quiz(int(ans) - 1)
                    print(f"\n{feedback}")
                else:
                    print("\nInvalid choice.")
            else:
                print("\nYou have completed all security quizzes for today!")
            input("\nPress Enter to return to feed...")
        elif choice == "6":
            feedback = engine.toggle_premium()
            print(f"\n{feedback}")
            input("\nPress Enter to return to feed...")
        elif choice == "0":
            print("\nSafe dating! Exiting simulation platform.")
            break
        else:
            print("\nInvalid option.")


if __name__ == "__main__":
    run_terminal_sandbox()
