import os
import uuid
import random
from datetime import datetime
from flask import Flask, render_template_string, jsonify, request, session

# Initialize Flask application
app = Flask(__name__)
# Generate a secret key for session persistence
app.secret_key = os.getenv("FLASK_SECRET_KEY", "velvet_secret_vault_9921_key")

# Try importing the new google-genai SDK for real AI assistance
try:
    from google import genai
    from google.genai import types
    HAS_GENAI_SDK = True
except ImportError:
    HAS_GENAI_SDK = False

# Lazy-initialized Gemini client safe getter
def get_gemini_client():
    if not HAS_GENAI_SDK:
        return None
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    try:
        # Client automatically loads GEMINI_API_KEY from environment variables
        return genai.Client()
    except Exception as e:
        print(f"Error initializing Google GenAI Client: {e}")
        return None

# ==========================================
# SEED INTERACTIVE DATA & PROFILES
# ==========================================

MOCK_PARTNERS = [
    {
        "id": "p1",
        "name": "Maya Patel",
        "age": 26,
        "gender": "Female",
        "location": "Austin, TX",
        "distance": 4.2,
        "biography": "Full-stack designer by day, pottery enthusiast and rock climber by weekend. Looking for someone to explore hidden natural springs and argue about typography with me.",
        "prompts": [
            {
                "id": "date",
                "question": "My idea of a perfect first date is...",
                "answer": "Getting messy at a pottery wheel trial class, followed by late-night street tacos and dynamic debates about vinyl records."
            },
            {
                "id": "vibe",
                "question": "We'll get along if...",
                "answer": "You are curious, have a high sarcasm tolerance, and think the book is always better than the movie."
            }
        ],
        "photoUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80",
        "verified": True,
        "hobbies": ["Pottery", "Climbing", "Graphic Design", "Vinyls", "Tacos"],
        "completesProfile": 95,
        "relationshipGoal": "Serious Relationship"
    },
    {
        "id": "p2",
        "name": "Liam Henderson",
        "age": 28,
        "gender": "Male",
        "location": "Austin, TX",
        "distance": 2.8,
        "biography": "Specialty coffee roaster and amateur indie musician. I spend way too much time perfecting my barista pour-overs and playing guitar with my golden retriever, Barnaby.",
        "prompts": [
            {
                "id": "weird",
                "question": "The weirdest thing about me is...",
                "answer": "I can immediately identify the roast profile of a bean just by smelling the dry grounds blindfolded."
            },
            {
                "id": "sunday",
                "question": "My typical Sunday morning is...",
                "answer": "Spinning an old jazz record, making a slow siphon brew, and taking Barnaby to the neighborhood off-leash park."
            }
        ],
        "photoUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80",
        "verified": True,
        "hobbies": ["Barista", "Acoustic Guitar", "Jazz", "Golden Retrievers", "Record Stores"],
        "completesProfile": 90,
        "relationshipGoal": "Serious Relationship"
    },
    {
        "id": "p3",
        "name": "Jordan Alvarez",
        "age": 25,
        "gender": "Non-binary",
        "location": "South Austin, TX",
        "distance": 6.5,
        "biography": "Plant parent of thirty-two leafy green children, local museum docent, and absolute roller skating maniac. Let's do a picnic at the botanical gardens!",
        "prompts": [
            {
                "id": "change_mind",
                "question": "Change my mind about...",
                "answer": "Pineapple absolutely belongs on Neapolitan brick-oven pizza, and you can't convince me otherwise."
            },
            {
                "id": "proud",
                "question": "I'm strangely proud of...",
                "answer": "Keeping my fiddle-leaf fig alive and blooming through consecutive hot summers."
            }
        ],
        "photoUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
        "verified": False,
        "hobbies": ["Houseplants", "Museums", "Roller Skating", "Thrifting", "Picnics"],
        "completesProfile": 85,
        "relationshipGoal": "Casual Dating"
    },
    {
        "id": "p4",
        "name": "Chloe Chen",
        "age": 31,
        "gender": "Female",
        "location": "West Lake Hills, TX",
        "distance": 8.1,
        "biography": "Executive chef at a modern culinary startup. Obsessed with fermentation experiments, hot sauce curation, and long gravel bike rides along scenic roads.",
        "prompts": [
            {
                "id": "key_to_heart",
                "question": "The key to my heart is...",
                "answer": "A perfectly balanced homemade craft cocktail and willingness to try spicy, fermented kimchi from scratch."
            },
            {
                "id": "fact",
                "question": "Unpopular opinion...",
                "answer": "Expensive upscale fine-dining is rarely as comforting as a local dim sum joint with old cart service."
            }
        ],
        "photoUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
        "verified": True,
        "hobbies": ["Cooking", "Fermentation", "Gravel Biking", "Hot Sauce", "Dim Sum"],
        "completesProfile": 100,
        "relationshipGoal": "Marriage / Life Partner"
    },
    {
        "id": "p5",
        "name": "Ethan Thorne",
        "age": 29,
        "gender": "Male",
        "location": "Downtown Austin, TX",
        "distance": 1.5,
        "biography": "Digital entrepreneur, board game marathoner, and amateur triathlete. Always training or learning something ridiculous. Let me teach you how to dominate in Settlers of Catan.",
        "prompts": [
            {
                "id": "date",
                "question": "My idea of a perfect first date is...",
                "answer": "A competitive board game café night followed by an evening run under the skyline lights."
            },
            {
                "id": "skills",
                "question": "My useless super power is...",
                "answer": "I can name any country's capital within exactly two seconds of seeing its physical outline."
            }
        ],
        "photoUrl": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80",
        "verified": False,
        "hobbies": ["Board Games", "Triathlon", "Catan", "Tech Startups", "Running"],
        "completesProfile": 80,
        "relationshipGoal": "Open to Anything"
    }
]

SAFETY_QUIZZES = [
    {
        "id": "sq1",
        "question": "You meet someone incredible on the app and they request your personal phone number or home address after just 3 messages. What is the safest response?",
        "options": [
            "Give them your direct number to continue, they seem extremely interested and reliable.",
            "Suggest keeping the conversation inside our chat room first where safety scanners protect you.",
            "Give them a fake address to test their interest rates.",
            "Ignore them completely and report them to local emergency services immediately."
        ],
        "correctAnswerIndex": 1,
        "explanation": "Keeping dialogue on the app preserves security protections (like our AI safety monitors). Legitimate matches will fully respect your boundaries."
    },
    {
        "id": "sq2",
        "question": "Before meeting a match in person for the first time, which action is highly recommended for dating safety?",
        "options": [
            "Ask them to pick you up directly from your apartment to save transit costs.",
            "Meet in a quiet, secluded park at night so you can hear each other clearly.",
            "Set your meetup in a public space, coordinate your own rides, and use Date Sharing to alert trusted contacts.",
            "Avoid telling any friends so you don't face any peer pressure."
        ],
        "correctAnswerIndex": 2,
        "explanation": "Always arrange public meetups, self-transport, and share dates with a trust contact. These steps secure control over your environmental safety."
    },
    {
        "id": "sq3",
        "question": "A match claims they are caught in an urgent financial bind or need help paying for a transit ticket to meet you, requesting a cash transfer. What should you do?",
        "options": [
            "Send a small loan immediately as a sweet gesture of trust and love.",
            "Ask them to send photo verification holding a sign before wire transferring the funds.",
            "Long-press a message to instantly File a Report and BLOCK them, as financial requests represent scam-level signals.",
            "Ignore it but keep swiping and chatting about other topics to see if they bring it up again."
        ],
        "correctAnswerIndex": 2,
        "explanation": "Never send money or share bank info with a match under any pretense. Wire requests are major scam violations and should be blocked and reported immediately."
    }
]

ICEBREAKERS = [
    "What is the most memorable travel spot you've ever discovered?",
    "What was your absolute favorite hobby as a kid?",
    "Recommend me a song that instantly improves your mood!",
    "Are you a coffee scientist, tea connoisseur, or energy drink lover?",
    "If you had to win a trivia quiz on one specific hobby, what would it be?"
]

# ==========================================
# AUTO-GENERATED BOT CONVERSATION SYSTEMS
# ==========================================

BOT_REPLIES = {
    "p1": [
        "Your message is beautifully coded! 🎨 Speaking of typography, are you a clean sans-serif type of soul or do you have a soft spot for editorial modern serifs?",
        "That sounds fascinating! Have you ever tried pottery yourself, or would you rather be the creative consultant while I get clay all over my hands? 🍶",
        "Let's make this official. Coffee and climbing or tacos and typography first? Choose wisely! 😉"
    ],
    "p2": [
        "Nice! Barnaby approves of your vibe. 🐶 Usually, I roast high-density Ethiopian beans on my free days. What is your go-to morning caffeine routine?",
        "Sounds perfect. I'm actually writing an indie track right now that needs some lyrics. Care to contribute some lines?",
        "We should definitely check out the local records shop downtown sometime soon."
    ],
    "p3": [
        "Yes! Plant parents unite. 🌱 Actually, my botanical garden picnic plan is legendary. I bring homemade raspberry tarts and we catalog wild ferns.",
        "Pineapple pizza is the ultimate test of open-mindedness! Glad we are on the same side of culinary history.",
        "Roller skating is all about balance. Don't worry, I promise to catch you if you trip!"
    ],
    "p4": [
        "Haha, upscale dining misses the warmth completely. Give me comfortable street dim sum any day of the week! 🥟",
        "My latest kimchi batch has been fermenting for exactly 14 days and it is deliciously spicy! Up for a taste test challenge?",
        "Let's bike around the West Lake loops and recover with a cold beverage!"
    ],
    "p5": [
        "Catan is serious business! 🎲 I've seen friendships dissolve over sheep-for-wheat micro trades. Are you an aggressive road-builder or do you horde development cards?",
        "That's exceptionally cool! Let's schedule a date at the local game library.",
        "Always up for a competitive run under the downtown lamps!"
    ]
}

# Initialization of user session state variables
def init_session():
    if "user" not in session:
        session["user"] = {
            "name": "Alex",
            "age": 27,
            "gender": "Male",
            "relationshipGoal": "Serious Relationship",
            "hobbies": ["Design", "Vinyls", "Filter Coffee"],
            "verified": False,
            "completesProfile": 70,
            "distanceFilter": 15,
            "intentFilter": "All",
            "genderFilter": "All",
            "credits": 340,
            "isPremium": False,
            "rosesCount": 1,
            "swipesCount": 0,
            "maxSwipes": 10,
            "score": 0,
            "quizIndex": 0
        }
    
    if "matches" not in session:
        # Prepopulate with Maya Patel who has sent a beautiful Crimson Rose!
        session["matches"] = [
            {
                "id": "m_maya",
                "partner": {
                    "id": "p1",
                    "name": "Maya Patel",
                    "age": 26,
                    "gender": "Female",
                    "location": "Austin, TX",
                    "distance": 4.2,
                    "biography": "Full-stack designer by day, pottery enthusiast and rock climber by weekend.",
                    "photoUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80",
                    "verified": True,
                    "sentRoseToMe": True,
                    "sentRose": False
                },
                "unread": True,
                "lastActive": "Just now",
                "messages": [
                    {
                        "id": "msg_initial",
                        "senderId": "p1",
                        "senderName": "Maya Patel",
                        "text": "Hi Alex! 🌹 I sent you a Special Crimson Rose because your bio on London coffee styles inAustin is super cool. Let's debate typography over some slow siphon coffee next week?",
                        "timestamp": datetime.now().strftime("%I:%M %p")
                    }
                ]
            }
        ]

    if "passed_ids" not in session:
        session["passed_ids"] = []

# ==========================================
# PY-WEB FLASK VIEWS & ROUTING APIS
# ==========================================

@app.route("/")
def main_index():
    init_session()
    return render_template_string(HTML_PAGE_TEMPLATE, user=session["user"], current_year=datetime.now().year)

@app.route("/api/session/reset", methods=["POST"])
def reset_session():
    session.clear()
    init_session()
    return jsonify({"status": "success", "user": session["user"], "matches": session["matches"]})

@app.route("/api/profiles", methods=["GET"])
def get_discovery_profiles():
    init_session()
    user = session["user"]
    passed = session["passed_ids"]
    matched_partner_ids = [m["partner"]["id"] for m in session["matches"]]
    
    filtered = []
    for p in MOCK_PARTNERS:
        if p["id"] in passed or p["id"] in matched_partner_ids:
            continue
        
        # Apply gender filter
        if user["genderFilter"] != "All" and p["gender"] != user["genderFilter"]:
            continue
        
        # Apply relation goal filter
        if user["intentFilter"] != "All" and p["relationshipGoal"] != user["intentFilter"]:
            continue
        
        # Apply distance filter
        if p["distance"] > user["distanceFilter"]:
            continue
            
        filtered.append(p)
        
    return jsonify({"profiles": filtered})

@app.route("/api/swipe", methods=["POST"])
def swipe_partner():
    init_session()
    data = request.json or {}
    partner_id = data.get("partner_id")
    action = data.get("action")  # "like", "dislike", "rose", "superlike"
    
    user = session["user"]
    passed = session["passed_ids"]
    matches = session["matches"]
    
    partner = next((p for p in MOCK_PARTNERS if p["id"] == partner_id), None)
    if not partner:
        return jsonify({"success": False, "error": "Partner not found"}), 404
        
    if action == "dislike":
        passed.append(partner_id)
        session["passed_ids"] = passed
        session.modified = True
        return jsonify({"success": True, "action": "disliked"})
        
    # Check swipe tokens
    if action == "like":
        if not user["isPremium"] and user["swipesCount"] >= user["maxSwipes"]:
            return jsonify({
                "success": False, 
                "limitReached": True,
                "message": "You have met your daily swipe quota! Unlock Velvet VIP or spend 50 credits to get 20 more swipes immediately."
            })
        user["swipesCount"] += 1
        
    elif action == "rose":
        if not user["isPremium"] and user["rosesCount"] <= 0:
            return jsonify({
                "success": False,
                "limitReached": True,
                "message": "You have ran out of Special Roses! Solve our Cyber-Security Awareness Quizzes to earn free Rose tokens or upgrade to Velvet VIP!"
            })
        if not user["isPremium"]:
            user["rosesCount"] -= 1
            
    # Simulate match generation: Roses and Superlikes are 100% matched instantly, ordinary likes are 75%
    is_match = action in ["rose", "superlike"] or (random.random() > 0.25)
    
    result = {"success": True, "matched": False}
    
    if is_match:
        new_match_id = f"m_{partner['id']}_{str(uuid.uuid4())[:6]}"
        prompt_text = ""
        if action == "rose":
            prompt_text = f"Oh wow! Thank you so much for the Crimson Rose 🌹! It made my afternoon and highlighted your profile. What's your usual Sunday morning vibe?"
        elif action == "superlike":
            prompt_text = f"★ Oh a Super Like! Thanks! I'm super excited to chat. What's the best weekend hobby on your list?"
        else:
            prompt_text = f"Hey! Thanks for the standard swipe like! ♥ How's your Austin afternoon going?"
            
        new_match = {
            "id": new_match_id,
            "partner": {
                **partner,
                "sentRose": (action == "rose"),
                "superLiked": (action == "superlike"),
                "sentRoseToMe": False
            },
            "unread": True,
            "lastActive": "Just now",
            "messages": [
                {
                    "id": f"msg_sc_{str(uuid.uuid4())[:4]}",
                    "senderId": partner["id"],
                    "senderName": partner["name"],
                    "text": prompt_text,
                    "timestamp": datetime.now().strftime("%I:%M %p")
                }
            ]
        }
        matches.insert(0, new_match)
        session["matches"] = matches
        result["matched"] = True
        result["match"] = new_match
        
    session["user"] = user
    session.modified = True
    return jsonify(result)

@app.route("/api/message/send", methods=["POST"])
def send_message():
    init_session()
    data = request.json or {}
    match_id = data.get("match_id")
    text = data.get("text")
    media_url = data.get("media_url", "")
    voice_dur = data.get("voice_duration", "")
    
    matches = session["matches"]
    user = session["user"]
    
    match_index = next((i for i, m in enumerate(matches) if m["id"] == match_id), None)
    if match_index is None:
        return jsonify({"success": False, "error": "Match conversation empty"}), 404
        
    current_match = matches[match_index]
    partner_id = current_match["partner"]["id"]
    partner_name = current_match["partner"]["name"]
    
    # AI HARASSMENT SCANNER IN PYTHON (Express-Equivalent Safety moderation endpoint!)
    moderation_reason = ""
    is_safe = True
    
    client = get_gemini_client()
    if client and text:
        try:
            # Recreate identical system safety verification logic
            prompt = f"""Analyze this chat message for potential safety violations on a cordial dating app (Velvet). Look for:
- Harassment or overt threats
- Explicit un-consented financial wire/scam tricks
- Severe hate speech / abuse
Message: "{text}"
Reply strictly in JSON format with fields:
"safe": boolean,
"reason": string (brief warning to show the user if safe is false, e.g. "Please keep boundaries cordial or protect accounts")"""
            
            response = client.models.generateContent(
                model="gemini-3.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1
                )
            )
            import json
            safety_data = json.loads(response.text.strip())
            is_safe = safety_data.get("safe", True)
            moderation_reason = safety_data.get("reason", "")
        except Exception as e:
            print(f"Flask background safety scanner fallback: {e}")
            
    # Quick regex checks for offline validation if Gemini is not hooked
    if not client and text:
        vulgar_words = ["money", "cashapp", "wire", "password", "idiot", "dumb", "jerk"]
        for word in vulgar_words:
            if word in text.lower():
                is_safe = False
                moderation_reason = f"Safety scan flagged suspicious keywords ('{word}'). Be mindful of safety rules!"
                break

    # Add the user's message
    user_msg_id = f"msg_u_{str(uuid.uuid4())[:4]}"
    content_display = text
    if media_url:
        content_display = f"📷 Image shared: {media_url}"
    elif voice_dur:
        content_display = f"🎤 Sent a Voice Memo ({voice_dur})"
        
    user_message = {
        "id": user_msg_id,
        "senderId": "user_me",
        "senderName": user["name"],
        "text": content_display,
        "timestamp": datetime.now().strftime("%I:%M %p"),
        "scanned": True,
        "safe": is_safe,
        "reason": moderation_reason
    }
    
    current_match["messages"].append(user_message)
    current_match["lastActive"] = "Just now"
    current_match["unread"] = False
    
    # Generate automatic responsive reply from the bot if the message was safe!
    bot_reply_msg = None
    if is_safe:
        answers = BOT_REPLIES.get(partner_id, [
            "That's so awesome! Tell me more about your design inspirations or favorite spots in Austin!",
            "I totally agree. Let's capture this mood on a cozy meetup!",
            "Haha, you have a really sweet way of expressing yourself. 🌹 What are you listening to right now?"
        ])
        
        # Decide reply index or pick random
        reply_idx = len([m for m in current_match["messages"] if m["senderId"] == partner_id]) % len(answers)
        bot_text = answers[reply_idx]
        
        bot_reply_msg = {
            "id": f"msg_b_{str(uuid.uuid4())[:4]}",
            "senderId": partner_id,
            "senderName": partner_name,
            "text": bot_text,
            "timestamp": datetime.now().strftime("%I:%M %p")
        }
        current_match["messages"].append(bot_reply_msg)
    
    # Commit modifications to matches feed
    session["matches"] = matches
    session.modified = True
    
    return jsonify({
        "success": True, 
        "user_message": user_message, 
        "bot_reply": bot_reply_msg,
        "flagged": not is_safe,
        "reason": moderation_reason
    })

@app.route("/api/ai/wingman", methods=["POST"])
def fetch_wingman():
    init_session()
    data = request.json or {}
    bio = data.get("biography", "")
    feed = data.get("chat_history", [])
    command = data.get("command", "suggest_openers")
    custom_q = data.get("custom_question", "")
    
    client = get_gemini_client()
    if not client:
        # Charming simulated dating coach response
        if command == "suggest_openers":
            lines = [
                f"1. 🎨 'That pottery setup sounds messy and brilliant! What is the biggest clay catastrophe you've had?'",
                f"2. 'Since you love slow-siphons, how do you feel aboutAustin's secret spring meetups?'",
                f"3. 'Argue about typography? It's on! But only if we do it with a record spinning in the background.'"
            ]
            return jsonify({
                "tip": "\n".join(lines),
                "offline": True
            })
        elif command == "give_feedback":
            return jsonify({
                "tip": "💡 *Wingman Tip:* Keep the flow light and ask open-ended questions. Your shared interests in acoustic sounds, vinyls, and design is an instant green flag!",
                "offline": True
            })
        else:
            return jsonify({
                "tip": f"💡 *Wingman tip on your query:* '{custom_q or 'Dating smarts'}'. Focus on genuine curiosity and safe, friendly vibes designed around active listening!",
                "offline": True
            })
            
    # Generate actual live prompt using Gemini Client
    try:
        user_prompt = ""
        system_instruction = "You are an affectionate, witty, and highly helpful online Dating Coach and Wingman advisor named Velvet Coach."
        
        if command == "suggest_openers":
            user_prompt = f"Provide 3 fun, charismatic and custom opener lines for a match with this bio:\n\"{bio}\"\nhandle as a crisp layout."
        elif command == "give_feedback":
            user_prompt = f"Review the following chat messages:\n{feed}\nMatch bio: \"{bio}\"\nProvide 1 direct critique and suggest 2 witty follow-up text options."
        else:
            user_prompt = f"Answer this specific dating question: \"{custom_q}\" considering this partner-bio: \"{bio}\""
            
        response = client.models.generateContent(
            model="gemini-3.5-flash",
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7
            )
        )
        return jsonify({"tip": response.text, "offline": False})
    except Exception as e:
        return jsonify({"tip": f"AI Coach is currently styling his hair! Error: {e}", "offline": True})

@app.route("/api/ai/bio-suggest", methods=["POST"])
def get_bio_suggestion():
    init_session()
    data = request.json or {}
    hobbies = data.get("hobbies", [])
    goal = data.get("relationshipGoal", "")
    current_bio = data.get("current_bio", "")
    
    client = get_gemini_client()
    if not client:
        fallback_bio = f"Coeval explorer of Austin. When I'm not balancing complex tasks, you can find me deep into {', '.join(hobbies) if hobbies else 'craft vinyls and design aesthetics'}. Seeking a {goal or 'Serious Connection'}!"
        return jsonify({"result": fallback_bio, "offline": True})
        
    try:
        prompt = f"""Write an exciting, magnetic dating bio (about 3 sentences, extremely charismatic) for a profile with:
Hobbies: {', '.join(hobbies)}
Dating Intent: {goal}
Draft: "{current_bio}"
Ensure the copy feels human, charming, and polished."""
        
        response = client.models.generateContent(
            model="gemini-3.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.8)
        )
        return jsonify({"result": response.text.strip(), "offline": False})
    except Exception as e:
        return jsonify({"result": "Sipping cold brew, rock climbing, and debating typeface layouts.", "offline": True})

@app.route("/api/quiz/answer", methods=["POST"])
def answer_quiz():
    init_session()
    data = request.json or {}
    option_idx = data.get("option_index")
    
    user = session["user"]
    quiz_idx = user["quizIndex"]
    
    if quiz_idx >= len(SAFETY_QUIZZES):
        return jsonify({"success": False, "message": "All modules completed!"})
        
    quiz = SAFETY_QUIZZES[quiz_idx]
    is_correct = (option_idx == quiz["correctAnswerIndex"])
    
    feedback_text = ""
    if is_correct:
        user["credits"] += 25
        user["score"] += 10
        user["rosesCount"] += 1  # Reward custom special Rose!
        feedback_text = f"✅ Spectacular! You answered correctly.\nAwarded: +25 Credits, +10 Safety Points, and +1 Special Rose 🌹!\n💡 Explanation: {quiz['explanation']}"
    else:
        feedback_text = f"❌ Incorrect, but keep trying!\n💡 Hint: {quiz['explanation']}"
        
    # Advance to next quiz in list (wrap-around)
    user["quizIndex"] = (quiz_idx + 1) % len(SAFETY_QUIZZES)
    session["user"] = user
    session.modified = True
    
    return jsonify({
        "success": True, 
        "correct": is_correct, 
        "feedback": feedback_text, 
        "user": user
    })

@app.route("/api/user/update", methods=["POST"])
def update_user_profile():
    init_session()
    data = request.json or {}
    user = session["user"]
    
    for key in ["name", "age", "relationshipGoal", "genderFilter", "intentFilter", "distanceFilter", "isPremium"]:
        if key in data:
            user[key] = data[key]
            
    if data.get("isPremium"):
        user["rosesCount"] = 5  # Gift starting roses
        
    session["user"] = user
    session.modified = True
    return jsonify({"success": True, "user": session["user"]})

# ==========================================
# GORGEOUS HIGH-FIDELITY WEB INTERFACE
# ==========================================

HTML_PAGE_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Velvet • Elite Dating Sim</title>
    <!-- Tailwind CSS 4 via modern CDN -->
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
    <!-- Google Fonts for premium typography pairing -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,700;1,400;1,600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #050505;
            color: #F5F5F5;
            overflow-x: hidden;
        }
        .serif-font {
            font-family: 'Playfair Display', serif;
        }
        .mono-font {
            font-family: 'JetBrains Mono', monospace;
        }
        /* Custom subtle ambient glow */
        .glow-crimson {
            box-shadow: 0 0 25px -5px rgba(233, 64, 87, 0.25);
        }
        /* Scrollbar aesthetics */
        ::-webkit-scrollbar {
            width: 4px;
        }
        ::-webkit-scrollbar-track {
            background: #0D0D0D;
        }
        ::-webkit-scrollbar-thumb {
            background: #262626;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #e94057;
        }
    </style>
</head>
<body class="bg-[#050505] text-neutral-200">

    <!-- Screen Wrapper -->
    <div id="app" class="min-h-screen flex flex-col md:flex-row max-w-7xl mx-auto border-x border-neutral-900/60 shadow-2xl relative">

        <!-- ==========================================
             LEFT SIDEBAR PANEL
             ========================================== -->
        <aside class="w-full md:w-80 bg-[#0A0A0A] border-b md:border-b-0 md:border-r border-neutral-900 flex flex-col justify-between shrink-0 z-30">
            <!-- Top brand header -->
            <div class="p-6 border-b border-neutral-900/60">
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-2.5">
                        <span class="text-xl">🌹</span>
                        <h1 class="text-xl font-medium tracking-[0.25em] text-white serif-font italic">VELVET</h1>
                    </div>
                    <span class="bg-red-500/10 text-[#E94057] text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/20 uppercase tracking-widest mono-font" id="premiumBadge">
                        Free Member
                    </span>
                </div>
                
                <!-- Quick user bio indicator -->
                <div class="mt-6 flex items-center gap-3.5 bg-neutral-900/45 p-3 rounded-xl border border-neutral-900">
                    <div class="w-10 h-10 rounded-full bg-[#E94057]/15 flex items-center justify-center text-md font-bold text-white relative">
                        A
                        <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0A0A0A] hidden" id="userVerificationTick"></span>
                    </div>
                    <div class="truncate">
                        <h3 class="text-xs font-bold text-white flex items-center gap-1.5 leading-none">
                            <span id="labelUserName">Alex</span>, <span id="labelUserAge">27</span>
                        </h3>
                        <p class="text-[10px] text-neutral-400 mt-1 truncate">Austin, Texas</p>
                    </div>
                </div>
            </div>

            <!-- Navigation Links -->
            <nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                <button onclick="switchTab('discover')" id="nav-discover" class="w-full flex items-center justify-between px-4 py-3 rounded-xl text-neutral-300 bg-neutral-900/40 text-xs font-medium border border-[#E94057]/10 transition-all">
                    <span class="flex items-center gap-3">🎴 Discover Cards</span>
                    <span class="text-xs bg-neutral-900 px-2 py-0.5 rounded text-neutral-400 font-mono" id="discoveryBadgeCount">Loader</span>
                </button>
                
                <button onclick="switchTab('matches')" id="nav-matches" class="w-full flex items-center justify-between px-4 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900/20 text-xs font-medium transition-all">
                    <span class="flex items-center gap-3">💬 Matches & Chats</span>
                    <span class="w-2.5 h-2.5 bg-[#E94057] rounded-full animate-pulse" id="unreadDot"></span>
                </button>
                
                <button onclick="switchTab('safety')" id="nav-safety" class="w-full flex items-center justify-between px-4 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900/20 text-xs font-medium transition-all">
                    <span class="flex items-center gap-3">🛡️ Safe Dates Quiz</span>
                    <span class="text-[9px] bg-[#E94057]/10 text-[#E94057] font-bold px-1.5 py-0.5 rounded" id="safetyScoreBadge">+25 Coins</span>
                </button>
                
                <button onclick="switchTab('profile')" id="nav-profile" class="w-full flex items-center justify-between px-4 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900/20 text-xs font-medium transition-all">
                    <span class="flex items-center gap-3">👤 Edit Profile Settings</span>
                </button>
            </nav>

            <!-- Bottom Limits and Shop Gauges -->
            <div class="p-4 border-t border-neutral-900 space-y-4">
                <!-- Swipe limits gauge -->
                <div class="space-y-1.5">
                    <div class="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-neutral-500 font-mono">
                        <span>Likes Counter</span>
                        <span id="swipeCounterText">0 / 10 limit</span>
                    </div>
                    <div class="w-full bg-neutral-950 h-1.5 rounded-full overflow-hidden border border-neutral-900">
                        <div class="bg-[#E94057] h-full transition-all" style="width: 30%" id="swipeRangeBar"></div>
                    </div>
                </div>

                <!-- Rose Limits -->
                <div class="space-y-2 pt-2 border-t border-neutral-900/60">
                    <div class="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[#E94057] font-mono">
                        <span>Special Roses 🌹</span>
                        <span class="font-bold" id="roseLimitText">1 / 1 Available</span>
                    </div>
                    <p class="text-[9px] text-neutral-400 italic leading-snug">
                        Roses highlight you in the feed and guarantee first-line prioritized contact lobbies. Earn coins & roses inside Safety dates!
                    </p>
                </div>

                <!-- Balance state & Reset -->
                <div class="bg-neutral-950 border border-neutral-900/80 p-3 rounded-xl flex items-center justify-between">
                    <div>
                        <p class="text-[8px] uppercase tracking-wider text-neutral-500 font-mono">My Account Store</p>
                        <h4 class="text-xs font-extrabold text-[#D48166] mt-0.5 font-mono" id="creditsText">340 Velvet Coins</h4>
                    </div>
                    <button onclick="toggleCoinStore()" class="bg-[#E94057] hover:bg-rose-600 text-black text-[9px] font-black uppercase px-2 py-1.5 rounded transition">
                        Get VIP
                    </button>
                </div>

                <button onclick="resetSandbox()" class="w-full border border-neutral-900 hover:border-neutral-800 text-[10px] text-neutral-500 hover:text-neutral-300 py-1.5 rounded uppercase tracking-wider mono-font text-center">
                    Reset Sandbox Data
                </button>
            </div>
        </aside>

        <!-- ==========================================
             MAIN CONTAINER STAGE
             ========================================== -->
        <main class="flex-1 bg-[#050505] flex flex-col justify-between relative overflow-hidden">
            
            <!-- Dynamic Notification banner -->
            <div id="alertBanner" class="absolute top-2 left-4 right-4 bg-red-950/90 border border-red-500/35 p-3 rounded-xl shadow-xl flex items-start gap-2.5 z-50 text-[11px] leading-relaxed hidden">
                <span class="text-amber-500 text-sm">🚨</span>
                <div class="flex-1">
                    <h5 class="font-bold text-white">Velvet Harassment Scanner Flag</h5>
                    <p class="text-neutral-300 mt-0.5" id="alertBannerText"></p>
                </div>
                <button onclick="closeAlarm()" class="text-neutral-400 hover:text-white px-1 font-mono text-xs">X</button>
            </div>

            <!-- TOP GLOBAL BAR -->
            <div class="h-14 border-b border-neutral-900/60 px-6 flex items-center justify-between bg-[#070707] shrink-0">
                <div class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span class="text-[10px] tracking-wider font-mono text-neutral-400 uppercase">Velvet Sandbox Server active</span>
                </div>
                <!-- Mini actions -->
                <div class="flex items-center gap-3">
                    <button onclick="openVerificationModal()" class="flex items-center gap-1.5 bg-[#D48166]/10 hover:bg-[#D48166]/20 border border-[#D48166]/30 px-3 py-1 rounded-full text-[10px] text-[#D48166] font-mono transition">
                        ✔️ Verify Profile Bio
                    </button>
                </div>
            </div>

            <!-- ==========================================
                 TAB CONTENT: DISCOVER CARD SWIPING
                 ========================================== -->
            <div id="tab-discover" class="tab-content flex-1 flex flex-col justify-center items-center p-6 relative">
                <!-- Stack Wrapper -->
                <div class="w-full max-w-sm flex flex-col items-center justify-center relative">
                    
                    <!-- EMPTY AREA IF FEED FINISHED -->
                    <div id="emptyFeed" class="hidden text-center py-16 space-y-4">
                        <div class="text-4xl animate-bounce">📦</div>
                        <h3 class="text-md font-serif italic text-white">Feed completely recycled!</h3>
                        <p class="text-xs text-neutral-400 max-w-xs leading-relaxed">
                            No more compatible partners match your active configuration. Click below to expand your criteria or reset the sandbox simulation.
                        </p>
                        <button onclick="resetSandbox()" class="bg-[#E94057] text-black font-extrabold text-xs px-5 py-2.5 rounded-xl uppercase tracking-widest hover:scale-105 transition-all">
                            Refresh Feed Profiles
                        </button>
                    </div>

                    <!-- ACTIVE PROFILE CARD DECK -->
                    <div id="cardDeck" class="w-full aspect-[3/4.2] bg-[#0F0F10] border border-neutral-900/80 rounded-2xl overflow-hidden relative shadow-2xl flex flex-col justify-end p-6 select-none cursor-pointer transition-all hover:scale-[1.01] hover:shadow-cyan-950/20">
                        
                        <!-- Floating Background Image -->
                        <img id="cardImage" src="" class="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0" alt="Partner">
                        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 z-10 pointer-events-none"></div>

                        <!-- Badge Top Details -->
                        <div class="absolute top-4 left-4 right-4 flex justify-between items-start z-20 pointer-events-none">
                            <span class="bg-black/60 text-white/90 text-[9px] font-mono font-bold px-2.5 py-1 rounded-full backdrop-blur-md border border-white/5" id="cardDistance">
                                4.2 miles away
                            </span>
                            <span class="bg-red-600 border border-red-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full hidden" id="receivedRoseTab">
                                Sent You 🌹
                            </span>
                        </div>

                        <!-- Content Details overlay -->
                        <div class="z-20 space-y-3.5 relative pointer-events-none">
                            <div class="space-y-1">
                                <div class="flex items-center gap-2">
                                    <h2 class="text-xl font-serif text-white flex items-center gap-1.5" id="cardNameAge">
                                        Maya Patel, 26
                                    </h2>
                                    <span class="text-sky-400" id="cardVerifiedBadge">🔹</span>
                                </div>
                                <p class="text-[10px] uppercase font-mono tracking-widest text-[#D48166]" id="cardGoal">
                                    Serious Relationship
                                </p>
                            </div>

                            <!-- Bio description snippet -->
                            <p class="text-xs text-neutral-300 leading-relaxed max-w-xs line-clamp-3" id="cardBio">
                                Full-stack designer by day, pottery enthusiast and rock climber.
                            </p>

                            <!-- Tags items list -->
                            <div class="flex flex-wrap gap-1.5 pt-1" id="cardHobbies">
                                <!-- Dynamically injected hobbies -->
                            </div>

                            <!-- Swipe custom prompt box highlight -->
                            <div class="bg-neutral-950/85 border border-white/5 p-3 rounded-xl space-y-1 backdrop-blur-md mt-2" id="cardPromptContainer">
                                <p class="text-[9px] uppercase tracking-wider text-[#D48166] font-mono leading-none" id="cardPromptQuestion">My idea of a perfect first date...</p>
                                <p class="text-[11px] text-white leading-snug italic" id="cardPromptAnswer">Getting messy at a pottery wheel trial class</p>
                            </div>
                        </div>

                    </div>

                    <!-- SWIPING BUTTON TRIGGERS -->
                    <div id="deckControls" class="flex justify-center items-center gap-3.5 mt-8 w-full z-20">
                        <!-- DISLIKE -->
                        <button onclick="registerSwipe('dislike')" class="w-12 h-12 rounded-full bg-[#0A0A0A] border border-neutral-900 hover:border-red-500 hover:text-red-500 text-neutral-400 flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95" title="Pass">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>

                        <!-- CRIMSON ROSE SPECIAL indicator -->
                        <button onclick="registerSwipe('rose')" class="w-14 h-14 rounded-full bg-[#1A0B10] border border-red-500/40 hover:border-red-500 text-[#E94057] flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 relative" title="Crimson Rose">
                            <span class="text-xl">🌹</span>
                            <span class="absolute -top-1.5 -right-1.5 bg-[#E94057] text-black text-[9px] font-black font-mono w-5 h-5 flex items-center justify-center rounded-full border border-black animate-pulse" id="roseButtonCounter">1</span>
                        </button>

                        <!-- COMPATIBLE LIKE -->
                        <button onclick="registerSwipe('like')" class="w-16 h-16 rounded-full bg-[#D48166] hover:bg-[#c27258] text-black shadow-2xl flex items-center justify-center hover:scale-[1.08] active:scale-95" title="Like">
                            <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        </button>

                        <!-- SUPER LIKE -->
                        <button onclick="registerSwipe('superlike')" class="w-12 h-12 rounded-full bg-[#0A0A0A] border border-neutral-900 hover:border-amber-400 hover:text-amber-400 text-neutral-400 flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95" title="Super Like">
                            <svg class="w-4 h-4 fill-amber-400 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                        </button>
                    </div>

                </div>
            </div>

            <!-- ==========================================
                 TAB CONTENT: MATCHES & CHAT LOBBIES
                 ========================================== -->
            <div id="tab-matches" class="tab-content flex-1 hidden flex flex-col md:flex-row h-full overflow-hidden">
                
                <!-- Chat partners listings sidebar -->
                <div class="w-full md:w-64 bg-[#080809] border-r border-neutral-900 flex flex-col h-full shrink-0">
                    <div class="p-4 border-b border-neutral-905">
                        <p class="text-[9px] uppercase tracking-widest font-mono text-neutral-500">Reciprocal Chats</p>
                    </div>
                    <div class="flex-1 overflow-y-auto space-y-0.5 py-2" id="inboxList">
                        <!-- Chat tabs dynamic insertions -->
                    </div>
                </div>

                <!-- Chat active message viewport -->
                <div class="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
                    
                    <!-- Middle feed pane -->
                    <div class="flex-1 flex flex-col h-full bg-[#050505]">
                        <div id="noActiveChat" class="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
                            <span class="text-4xl text-neutral-700">💬</span>
                            <h3 class="text-sm font-serif italic text-neutral-400">Select an Inbox alignment to date</h3>
                            <p class="text-[10px] text-neutral-500 max-w-xs text-center font-mono">
                                Crimson-styled matches represent Special Rose priorities that stand atop your pipeline.
                            </p>
                        </div>

                        <div id="activeChatPane" class="flex-1 flex flex-col h-full hidden overflow-hidden">
                            <!-- Chat lobby detail banner details -->
                            <div class="p-4 border-b border-neutral-900 bg-[#070708] flex items-center justify-between shrink-0">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-full border border-neutral-800 overflow-hidden" id="chatPartnerRing">
                                        <img src="" id="chatPartnerAvatar" class="w-full h-full object-cover" alt="partner">
                                    </div>
                                    <div>
                                        <h4 class="text-xs font-bold text-white leading-none" id="chatPartnerName">Maya Patel</h4>
                                        <span class="text-[8px] uppercase tracking-widest font-mono text-[#D48166]" id="chatPartnerGoal">Serious Relationship</span>
                                    </div>
                                </div>
                                <span class="text-[8px] bg-sky-400/10 text-sky-400 px-2.0 py-0.5 rounded font-bold uppercase tracking-wider" id="chatPartnerBadge">Verified</span>
                            </div>

                            <!-- Crimson special indicator highlight header -->
                            <div id="crimsonRoseContactHeader" class="bg-gradient-to-r from-red-950/45 via-rose-950/20 to-red-950/40 border-b border-red-500/10 p-3 text-center space-y-0.5 shrink-0 hidden">
                                <p class="text-[10px] text-red-200 font-bold serif-font italic">Highlighted Special Rose Connection Active 🌹</p>
                                <p class="text-[9px] text-neutral-400 max-w-md mx-auto leading-normal">
                                    This date has priority delivery alignment. Reply creatively to build a highly optimized match flow!
                                </p>
                            </div>

                            <!-- Chat feed -->
                            <div class="flex-1 overflow-y-auto p-4 space-y-3" id="messageFeed">
                                <!-- Messages injected -->
                            </div>

                            <!-- Inline suggested icebreakers -->
                            <div class="p-2 bg-neutral-950 border-t border-neutral-900/60 overflow-x-auto whitespace-nowrap flex gap-1.5 shrink-0" id="icebreakerBar">
                                <!-- Seed icebreakers buttons -->
                            </div>

                            <!-- Interaction Input area -->
                            <div class="p-3 border-t border-neutral-900 bg-[#070708] space-y-2 shrink-0">
                                <div class="flex items-center gap-2">
                                    <!-- Send Media icon simulator -->
                                    <button onclick="simulatePhotoShare()" class="p-1.5 hover:bg-neutral-900 rounded text-neutral-400 hover:text-white" title="Share Date Scenery Image">
                                        📷
                                    </button>
                                    <button onclick="simulateVoiceMemo()" class="p-1.5 hover:bg-neutral-900 rounded text-neutral-400 hover:text-white" title="Simulate Voice Note Memo">
                                        🎤
                                    </button>
                                    <input type="text" id="chatTextInput" class="flex-1 bg-neutral-950 border border-neutral-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#E94057]" placeholder="Send supportive and cordial messages...">
                                    <button onclick="transmitMessage()" class="bg-[#E94057] text-black font-black py-2 px-4 rounded-xl text-xs uppercase cursor-pointer">
                                        Send
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- Left panel Wingman dating coach floating widget -->
                    <div id="activeChatCoachPanel" class="w-full lg:w-72 bg-[#09090A] border-t lg:border-t-0 lg:border-l border-neutral-900 h-full hidden flex flex-col overflow-hidden shrink-0">
                        <div class="p-4 border-b border-neutral-900/60">
                            <h3 class="text-xs font-bold uppercase tracking-widest text-[#D48166] font-mono flex items-center gap-2">
                                <span>🧠</span> AI Dating Coach Wingman
                            </h3>
                            <p class="text-[9px] text-neutral-400 mt-0.5 leading-normal">
                                Evaluate match temperature or suggest opening text sequences.
                            </p>
                        </div>
                        
                        <div class="flex-1 overflow-y-auto p-4 space-y-4">
                            <div class="bg-neutral-950 border border-neutral-900 p-3.5 rounded-xl space-y-2">
                                <p class="text-[9px] uppercase font-mono tracking-widest text-neutral-500 leading-none">Wingman Insights output</p>
                                <p class="text-xs text-neutral-300 leading-relaxed font-serif italic" id="wingmanOutputBox">
                                    Activate your AI dating wingman coach to receive fully personalized date-matching secrets.
                                </p>
                            </div>

                            <!-- Buttons instructions -->
                            <div class="space-y-2 pt-1 border-t border-neutral-900/60">
                                <button onclick="triggerWingmanCoach('suggest_openers')" class="w-full bg-[#D48166]/10 hover:bg-[#D48166]/20 border border-[#D48166]/40 text-xs text-[#D48166] py-2 rounded-lg transition text-left px-3.5 font-medium">
                                    👉 Generate 3 Icebreaker Openers
                                </button>
                                <button onclick="triggerWingmanCoach('give_feedback')" class="w-full bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-xs text-white py-2 rounded-lg transition text-left px-3.5 font-medium">
                                    📊 Evaluate Current Chat Temperature
                                </button>
                            </div>

                            <!-- Custom coach queries -->
                            <div class="space-y-2">
                                <label class="text-[10px] uppercase font-mono tracking-widest text-neutral-500 block">Ask Custom Coach Advice</label>
                                <textarea id="customWingmanPrompt" class="w-full bg-neutral-950 border border-neutral-900 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D48166]" placeholder="Should I ask them to climbing?..." rows="3"></textarea>
                                <button onclick="triggerWingmanCoach('custom_question')" class="w-full bg-[#E94057] text-black font-extrabold text-[10px] py-2 rounded-lg uppercase tracking-wider transition">
                                    Retrieve AI Tips
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            <!-- ==========================================
                 TAB CONTENT: SAFETY QUIZ CENTRE
                 ========================================== -->
            <div id="tab-safety" class="tab-content flex-1 p-6 hidden overflow-y-auto space-y-6">
                <div class="max-w-2xl mx-auto space-y-6">
                    <div class="text-center space-y-1.5 max-w-md mx-auto py-4">
                        <span class="text-3xl">🛡️</span>
                        <h2 class="text-xl font-serif italic text-white text-center">Safety Awareness Compliance</h2>
                        <p class="text-xs text-neutral-400 leading-relaxed">
                            Velvet prioritizes safety. Participate in scenario-based cybersecurity modules to secure dating safe badges and earn coins + special Rose indicators!
                        </p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Score panel widget -->
                        <div class="bg-neutral-950 p-5 rounded-2xl border border-neutral-900 space-y-3">
                            <h4 class="text-[9px] uppercase font-mono tracking-widest text-neutral-500">Security Ranking Stats</h4>
                            <div>
                                <h3 class="text-3xl font-extrabold font-mono text-[#D4166] text-white" id="safetyRankingScore">0 pts</h3>
                                <p class="text-[11px] text-[#D48166]" id="safetyTierLabel">Basic Safety Level Badge (Unverified)</p>
                            </div>
                            <p class="text-[10px] text-neutral-400 leading-normal">
                                Earn +10 safety scoring points for each module correctly answered. Once you scale past 20, you unlock the automated "Bio Verified" tick badge.
                            </p>
                        </div>

                        <!-- Rewards metrics -->
                        <div class="bg-gradient-to-br from-[#1c0f11] to-[#0A0A0A] p-5 rounded-2xl border border-red-500/15 space-y-3">
                            <h4 class="text-[9px] uppercase font-mono tracking-widest text-neutral-500">Active Rewards Multipliers</h4>
                            <div class="space-y-1.5">
                                <p class="text-xs text-white font-bold">💎 +25 Velvet Coins per quiz</p>
                                <p class="text-xs text-white font-bold">🌹 +1 Special Crimson Rose per quiz</p>
                                <p class="text-xs text-neutral-400">Prizes are wired to your account immediately upon correct answer validation.</p>
                            </div>
                        </div>
                    </div>

                    <!-- ACTIVE QUIZ CARD CONTAINER -->
                    <div class="bg-[#0A0A0B] border border-neutral-900 rounded-2xl overflow-hidden shadow-xl">
                        <div class="p-4 bg-neutral-950 border-b border-neutral-900 flex justify-between items-center">
                            <span class="text-[11px] uppercase tracking-wider font-mono text-[#D48166]">Compliance Assessment Block</span>
                            <span class="text-xs text-neutral-400 font-mono" id="quizProgressCount">Question 1 of 3</span>
                        </div>
                        
                        <div class="p-6 space-y-6">
                            <!-- Question Text -->
                            <h3 class="text-sm font-serif italic text-white" id="quizQuestionText">
                                Loading safety question...
                            </h3>

                            <!-- Rendered Options list buttons -->
                            <div class="space-y-2.5" id="quizOptionsContainer">
                                <!-- Options dynamically updated -->
                            </div>

                            <!-- Quiz Feedback Box -->
                            <div id="quizFeedbackBox" class="bg-neutral-900 border border-neutral-800 p-4 rounded-xl leading-relaxed text-xs text-neutral-300 hidden">
                                <!-- Explanatory text feedback -->
                            </div>
                        </div>
                    </div>

                    <!-- DATE GENERATOR SAFETY WIZARD (DATE PLAN SHARE) -->
                    <div class="bg-[#0A0A0B] border border-neutral-900 rounded-2xl p-6 space-y-4">
                        <div class="flex items-center gap-2.5">
                            <span class="text-lg">📅</span>
                            <div>
                                <h3 class="text-xs font-bold text-white uppercase tracking-widest font-mono">Simulate Date-Plan Safe Share</h3>
                                <p class="text-xs text-neutral-400 leading-snug">Notify your trusted contacts with location address and scheduled meeting calendars.</p>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div class="space-y-1.5">
                                <label class="text-[10px] uppercase font-mono tracking-wider text-neutral-500">Date Venue Name</label>
                                <input type="text" id="dateShareVenue" class="w-full bg-neutral-950 border border-neutral-900 text-xs rounded-xl p-3" placeholder="Street Tacos & Pottery trial class">
                            </div>
                            <div class="space-y-1.5">
                                <label class="text-[10px] uppercase font-mono tracking-wider text-neutral-500">Scheduled Calendar Time</label>
                                <input type="text" id="dateShareSchedule" class="w-full bg-neutral-950 border border-neutral-900 text-xs rounded-xl p-3" placeholder="Tuesday 7:30 PM">
                            </div>
                        </div>

                        <div class="space-y-1.5">
                            <label class="text-[10px] uppercase font-mono tracking-wider text-neutral-500">Trusted Buddy Mobile Number</label>
                            <input type="text" id="dateShareContact" class="w-full bg-neutral-950 border border-neutral-900 text-xs rounded-xl p-2.5" placeholder="512-555-0199">
                        </div>

                        <button onclick="distributeDateShield()" class="bg-[#D48166] text-black text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded-xl transition">
                            🔊 Share Encrypted Dates Guard
                        </button>
                    </div>

                </div>
            </div>

            <!-- ==========================================
                 TAB CONTENT: PROFILE SETTINGS OPTIONS
                 ========================================== -->
            <div id="tab-profile" class="tab-content flex-1 p-6 hidden overflow-y-auto space-y-6">
                <div class="max-w-md mx-auto space-y-6">
                    <div class="text-center space-y-1 py-4">
                        <span class="text-3xl">👤</span>
                        <h2 class="text-lg font-serif italic text-white">Velvet Profile Manager</h2>
                        <p class="text-xs text-neutral-400">Modify dynamic parameters and test client-side matching tiers.</p>
                    </div>

                    <!-- Personal Information block -->
                    <div class="bg-[#0A0A0B] border border-neutral-900 rounded-2xl p-6 space-y-4">
                        <h3 class="text-xs font-bold uppercase tracking-widest text-[#D48166] font-mono">Personal Metrics</h3>
                        
                        <div class="grid grid-cols-2 gap-3">
                            <div class="space-y-1.5">
                                <label class="text-[10px] uppercase font-mono tracking-wider text-neutral-500">My Name</label>
                                <input type="text" id="setUserName" class="w-full bg-neutral-950 border border-neutral-900 text-xs rounded-xl p-3 text-white" value="Alex">
                            </div>
                            <div class="space-y-1.5">
                                <label class="text-[10px] uppercase font-mono tracking-wider text-neutral-500">My Age</label>
                                <input type="number" id="setUserAge" class="w-full bg-neutral-950 border border-neutral-900 text-xs rounded-xl p-3 text-white" value="27">
                            </div>
                        </div>

                        <div class="space-y-1.5">
                            <label class="text-[10px] uppercase font-mono tracking-wider text-neutral-500">Relation Preference</label>
                            <select id="setUserGoal" class="w-full bg-neutral-950 border border-neutral-900 text-xs rounded-xl p-3 text-white">
                                <option value="Serious Relationship" selected>Serious Relationship</option>
                                <option value="Casual Dating">Casual Dating</option>
                                <option value="Marriage / Life Partner">Marriage / Life Partner</option>
                                <option value="Open to Anything">Open to Anything</option>
                            </select>
                        </div>

                        <!-- Simulated dynamic bio suggestions! -->
                        <div class="space-y-2">
                            <label class="text-[10px] uppercase font-mono tracking-wider text-neutral-500 flex justify-between">
                                <span>My Intro Biography</span>
                                <button onclick="simulateBioSuggestion()" class="text-[#D48166] hover:underline normal-case font-bold">✨ Suggest AI Bio</button>
                            </label>
                            <textarea id="setBiography" class="w-full bg-neutral-950 border border-neutral-900 text-xs rounded-xl p-3 text-white" rows="3">Enjoying Austin weather, tasting fine pottery aesthetics, and hunting secret coffee siphons.</textarea>
                        </div>
                    </div>

                    <!-- Preferences slider filters -->
                    <div class="bg-[#0A0A0B] border border-neutral-900 rounded-2xl p-6 space-y-4">
                        <h3 class="text-xs font-bold text-white uppercase tracking-widest font-mono">Discovery Alignments</h3>
                        
                        <div class="space-y-1.5">
                            <label class="text-[10px] uppercase font-mono tracking-wider text-neutral-500 flex justify-between">
                                <span>Interested In Gender</span>
                            </label>
                            <select id="setGenderFilter" class="w-full bg-neutral-950 border border-neutral-900 text-xs rounded-xl p-3 text-white" onchange="applyFilters()">
                                <option value="All">All Genders</option>
                                <option value="Female">Female</option>
                                <option value="Male">Male</option>
                                <option value="Non-binary">Non-binary</option>
                            </select>
                        </div>

                        <div class="space-y-1.5">
                            <label class="text-[10px] uppercase font-mono tracking-wider text-neutral-500 flex justify-between">
                                <span>Relationship Intent Filter</span>
                            </label>
                            <select id="setIntentFilter" class="w-full bg-neutral-950 border border-neutral-900 text-xs rounded-xl p-3 text-white" onchange="applyFilters()">
                                <option value="All" selected>All Intentions</option>
                                <option value="Serious Relationship">Serious Relationship</option>
                                <option value="Casual Dating">Casual Dating</option>
                                <option value="Marriage / Life Partner">Marriage/Life Partner</option>
                                <option value="Open to Anything">Open to Anything</option>
                            </select>
                        </div>

                        <div class="space-y-2">
                            <div class="flex justify-between items-center text-[10px] uppercase font-mono tracking-widest text-neutral-500">
                                <span>Max Range Distance</span>
                                <span id="distLabel">15 miles</span>
                            </div>
                            <input type="range" id="setDistanceFilter" min="2" max="50" value="15" class="w-full accent-[#E94057]" oninput="updateDistanceLabel(this.value)" onchange="applyFilters()">
                        </div>
                    </div>

                    <!-- Save profile button -->
                    <button onclick="commitProfileUpdates()" class="w-full bg-[#E94057] text-black font-black uppercase text-xs py-3.5 rounded-2xl tracking-widest hover:scale-[1.01] transition-all">
                        💾 Commit Settings Changes
                    </button>
                </div>
            </div>

            <!-- FOOTER COPYRIGHT PANEL -->
            <footer class="h-10 border-t border-neutral-900 bg-[#040405] flex items-center justify-center text-[9px] text-[#D48166]/40 leading-none shrink-0 font-mono">
                VELVET CONTEXTUAL SYSTEM v2.56-PYTH | © {{ current_year }} INC. ALL RIGHTS RESERVED
            </footer>

        </main>

    </div>

    <!-- ==========================================
         POPUP DIALOG: COIN STORE & VIP UPGRADE
         ========================================== -->
    <div id="coinStoreModal" class="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 shadow-2xl hidden">
        <div class="w-full max-w-sm bg-[#0E0E10] border border-neutral-800 rounded-2xl overflow-hidden p-6 space-y-4">
            <div class="text-center space-y-1.5">
                <span class="text-3xl">🪙</span>
                <h3 class="text-md font-serif italic text-white">Velvet VIP Currency Exchange</h3>
                <p class="text-xs text-neutral-400">Unlock infinite matching, refreshed Roses, and special tags!</p>
            </div>

            <div class="space-y-2 pt-2">
                <button onclick="activateMembership(true)" class="w-full bg-gradient-to-r from-yellow-600 to-[#D48166] text-black font-extrabold text-xs py-3 rounded-xl uppercase tracking-widest hover:scale-[1.02] transition">
                    Unlock Velvet VIP Bundle (Unlimited 🌹)
                </button>
                
                <button onclick="refillCredits(100)" class="w-full bg-neutral-900 hover:bg-neutral-850 text-white text-xs py-3 rounded-xl border border-neutral-800 transition">
                    Purchase +100 Velvet Coins (Spent: $4.99)
                </button>
            </div>

            <button onclick="toggleCoinStore()" class="w-full border border-neutral-800 text-[10px] text-neutral-400 py-2 rounded-lg hover:text-white uppercase tracking-widest mono-font">
                Dismiss Market
            </button>
        </div>
    </div>

    <!-- ==========================================
         POPUP DIALOG: INTUITIVE PHOTO VERIFICATION
         ========================================== -->
    <div id="verificationModal" class="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 shadow-2xl hidden">
        <div class="w-full max-w-sm bg-[#0E0E10] border border-neutral-800 rounded-2xl overflow-hidden p-6 space-y-4">
            <div class="text-center space-y-1.5">
                <span class="text-3xl">🤳</span>
                <h3 class="text-md font-serif italic text-white">Live Picture Alignment Verification</h3>
                <p class="text-[11px] text-neutral-400">Align your face inside the prompt circle. Real Gemini API maps facial attributes on unverified links to verify identities.</p>
            </div>

            <!-- Alignment simulation box -->
            <div class="w-48 h-48 rounded-full border-2 border-dashed border-[#E94057] mx-auto overflow-hidden flex items-center justify-center bg-black/40 relative">
                <div class="absolute inset-4 rounded-full border border-white/10 flex items-center justify-center">
                    <span class="text-xs font-mono text-neutral-500" id="verifyBoxText">Align Face</span>
                </div>
                <img id="verifySimulatedSelfie" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80" class="w-full h-full object-cover hidden">
            </div>

            <div class="space-y-2">
                <div id="verifyFeedProgress" class="text-center font-mono text-[9px] text-neutral-400">Step 1: Capture Verification Selfie</div>
                <button onclick="runVerificationScan()" id="verifyActionBtn" class="w-full bg-[#E94057] text-black font-extrabold text-xs py-3 rounded-xl uppercase tracking-widest transition">
                    📸 Capture and Process
                </button>
            </div>

            <button onclick="toggleVerificationModal()" class="w-full border border-neutral-800 text-[10px] text-neutral-400 py-2 rounded-lg hover:text-white uppercase tracking-widest mono-font">
                Cancel
            </button>
        </div>
    </div>

    <!-- ==========================================
         CLIENT APPLICATION JAVASCRIPT STATE ENGINE
         ========================================== -->
    <script>
        // Global variables mimicking React hooks
        let activeTab = "discover";
        let stateUser = {
            name: "Alex",
            age: 27,
            credits: 340,
            isPremium: false,
            rosesCount: 1,
            swipesCount: 0,
            maxSwipes: 10,
            score: 0,
            verified: false
        };
        let activeProfiles = [];
        let activeProfileIndex = 0;
        let activeMatches = [];
        let currentlySelectedMatchId = null;

        // On Load initializers
        window.addEventListener("DOMContentLoaded", () => {
            fetchProfiles();
            syncUserData();
        });

        function syncUserData() {
            // Display user details across view elements
            document.getElementById("labelUserName").innerText = stateUser.name;
            document.getElementById("labelUserAge").innerText = stateUser.age;
            document.getElementById("setUserName").value = stateUser.name;
            document.getElementById("setUserAge").value = stateUser.age;
            document.getElementById("creditsText").innerText = `${stateUser.credits} Velvet Coins`;
            
            // Render limit caps
            const maxVal = stateUser.isPremium ? "Unlimited ∞" : `${stateUser.maxSwipes} limit`;
            const countVal = stateUser.isPremium ? "Unlimited" : stateUser.swipesCount;
            document.getElementById("swipeCounterText").innerText = `${countVal} / ${maxVal}`;
            
            const rawPct = stateUser.isPremium ? 100 : Math.min((stateUser.swipesCount / stateUser.maxSwipes) * 100, 100);
            document.getElementById("swipeRangeBar").style.width = `${rawPct}%`;
            
            // Special roses limits text
            const roseLim = stateUser.isPremium ? "VIP Unlimited ∞" : `${stateUser.rosesCount} / 1 Available`;
            document.getElementById("roseLimitText").innerText = roseLim;
            document.getElementById("roseButtonCounter").innerText = stateUser.isPremium ? "∞" : stateUser.rosesCount;

            // Premium Visuals badges
            const cardBadge = document.getElementById("premiumBadge");
            if (stateUser.isPremium) {
                cardBadge.innerText = "Velvet VIP ★";
                cardBadge.className = "bg-yellow-500/10 text-yellow-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-yellow-500/20 uppercase tracking-widest mono-font animate-pulse";
            } else {
                cardBadge.innerText = "Free Member";
                cardBadge.className = "bg-red-500/10 text-[#E94057] text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/20 uppercase tracking-widest mono-font";
            }

            // Real-time verify status checkbox indicator
            if (stateUser.verified) {
                document.getElementById("userVerificationTick").classList.remove("hidden");
            } else {
                document.getElementById("userVerificationTick").classList.add("hidden");
            }

            // Render current safety tracking details
            document.getElementById("safetyRankingScore").innerText = `${stateUser.score} pts`;
            const tierLabel = document.getElementById("safetyTierLabel");
            if (stateUser.score >= 20) {
                tierLabel.innerText = "Verified Identity Level Badge ✔️";
                tierLabel.className = "text-xs text-sky-400 font-bold";
                stateUser.verified = true;
            } else {
                tierLabel.innerText = "Basic Safety Level Badge (Unverified)";
                tierLabel.className = "text-xs text-[#D48166]";
            }
        }

        // ==========================================
        // PROFILES FETCHING & DECK RENDERING
        // ==========================================

        async function fetchProfiles() {
            try {
                const res = await fetch("/api/profiles");
                const data = await res.json();
                activeProfiles = data.profiles || [];
                activeProfileIndex = 0;
                renderActiveProfileCard();
                
                // Update navigation badge counter
                document.getElementById("discoveryBadgeCount").innerText = activeProfiles.length;
            } catch(e) {
                console.error("Error fetching alignment profiles:", e);
            }
        }

        function renderActiveProfileCard() {
            const deck = document.getElementById("cardDeck");
            const controls = document.getElementById("deckControls");
            const empty = document.getElementById("emptyFeed");

            if (activeProfileIndex >= activeProfiles.length) {
                deck.classList.add("hidden");
                controls.classList.add("hidden");
                empty.classList.remove("hidden");
                return;
            }

            deck.classList.remove("hidden");
            controls.classList.remove("hidden");
            empty.classList.add("hidden");

            const p = activeProfiles[activeProfileIndex];

            document.getElementById("cardImage").src = p.photoUrl;
            document.getElementById("cardDistance").innerText = `${p.distance} miles away`;
            document.getElementById("cardNameAge").innerHTML = `${p.name}, ${p.age}`;
            document.getElementById("cardGoal").innerText = p.relationshipGoal;
            document.getElementById("cardBio").innerText = p.biography;
            
            // Set verify tick
            document.getElementById("cardVerifiedBadge").style.display = p.verified ? "inline-block" : "none";

            // Render special Rose badge if Maya
            if (p.id === "p1") {
                document.getElementById("receivedRoseTab").classList.remove("hidden");
            } else {
                document.getElementById("receivedRoseTab").classList.add("hidden");
            }

            // Injected hobbies List
            const hCont = document.getElementById("cardHobbies");
            hCont.innerHTML = "";
            p.hobbies.forEach(h => {
                const el = document.createElement("span");
                el.className = "bg-neutral-900/90 text-white/80 border border-neutral-800 text-[9px] px-2.5 py-0.5 rounded-full font-mono font-medium";
                el.innerText = h;
                hCont.appendChild(el);
            });

            // Prompts
            const prompt = p.prompts && p.prompts[0];
            if (prompt) {
                document.getElementById("cardPromptContainer").classList.remove("hidden");
                document.getElementById("cardPromptQuestion").innerText = prompt.question;
                document.getElementById("cardPromptAnswer").innerText = prompt.answer;
            } else {
                document.getElementById("cardPromptContainer").classList.add("hidden");
            }
        }

        async function registerSwipe(actionStr) {
            const p = activeProfiles[activeProfileIndex];
            if (!p) return;

            // Trigger quick aesthetic slide effect
            const deck = document.getElementById("cardDeck");
            let animClass = "translate-x-full opacity-0";
            if (actionStr === "dislike") animClass = "-translate-x-full opacity-0";
            else if (actionStr === "rose") animClass = "-translate-y-full rotate-6 opacity-0";

            deck.style.transition = "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)";
            deck.style.transform = (actionStr === "dislike") ? "translateX(-150%) rotate(-12deg)" : "translateX(150%) rotate(12deg)";
            deck.style.opacity = "0";

            setTimeout(async () => {
                try {
                    const res = await fetch("/api/swipe", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({partner_id: p.id, action: actionStr})
                    });
                    const resJson = await res.json();
                    
                    if (!resJson.success) {
                        alert(resJson.message);
                        if (resJson.limitReached) {
                            toggleCoinStore();
                        }
                    } else {
                        if (resJson.matched) {
                            alert(`✨ Match Established! You matched with ${p.name}! Wave hello in your active matches lobby.`);
                            fetchInboxLogs(); 
                            switchTab("matches");
                            openChatLobby(resJson.match.id);
                        }
                        
                        activeProfileIndex++;
                        stateUser.swipesCount++;
                        if (actionStr === "rose" && !stateUser.isPremium) {
                            stateUser.rosesCount = Math.max(stateUser.rosesCount - 1, 0);
                        }
                        syncUserData();
                        renderActiveProfileCard();
                    }
                } catch(err) {
                    console.error("Transmission swipe failure:", err);
                } finally {
                    deck.style.transition = "none";
                    deck.style.transform = "none";
                    deck.style.opacity = "1";
                }
            }, 250);
        }

        // ==========================================
        // MATCHES INBOX LOGICS
        // ==========================================

        let activeMatches = [
            {
                "id": "m_maya",
                "partner": {
                    "id": "p1",
                    "name": "Maya Patel",
                    "age": 26,
                    "gender": "Female",
                    "location": "Austin, TX",
                    "distance": 4.2,
                    "biography": "Full-stack designer by day, pottery enthusiast and rock climber by weekend.",
                    "photoUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80",
                    "verified": true,
                    "sentRoseToMe": true,
                    "sentRose": false
                },
                "unread": true,
                "lastActive": "Just now",
                "messages": [
                    {
                        "id": "msg_initial",
                        "senderId": "p1",
                        "senderName": "Maya Patel",
                        "text": "Hi Alex! 🌹 I sent you a Special Crimson Rose because your bio on London coffee styles in Austin is super cool. Let's debate typography over some slow siphon coffee next week?",
                        "timestamp": "11:51 AM"
                    }
                ]
            }
        ];

        // Global quiz index helper
        let currentQuizData = SAFETY_QUIZZES[0];

        function fetchInboxLogs() {
            renderMatchesInbox();
        }

        function renderMatchesInbox() {
            const listCont = document.getElementById("inboxList");
            listCont.innerHTML = "";
            
            let hasUnread = false;

            activeMatches.forEach(m => {
                if (m.unread) hasUnread = true;
                const isSelected = m.id === currentlySelectedMatchId;
                const lastMsg = m.messages[m.messages.length - 1];
                const msgText = lastMsg ? lastMsg.text : "No messages yet";
                const hasRose = m.partner.sentRoseToMe || m.partner.sentRose;
                
                const item = document.createElement("div");
                item.onclick = () => openChatLobby(m.id);
                
                // Beautiful conditional tailwind classes for Rose matches highlight
                item.className = `p-4 flex gap-3 cursor-pointer transition-all relative border-b border-neutral-900/40 ${
                    isSelected 
                        ? hasRose ? "bg-[#1E0D10] border-l-4 border-red-500" : "bg-neutral-900/60 border-l-4 border-[#D48166]"
                        : hasRose ? "bg-red-950/5 hover:bg-red-950/15 border-l-2 border-red-950/40" : "hover:bg-neutral-900/30"
                }`;

                item.innerHTML = `
                    <div class="w-10 h-10 rounded-full shrink-0 relative ${hasRose ? "ring-2 ring-red-500/50 p-0.5" : "border border-neutral-800"}">
                        <img src="${m.partner.photoUrl}" class="w-full h-full object-cover rounded-full">
                        ${m.unread ? '<span class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#0A0A0A]"></span>' : ''}
                    </div>
                    <div class="flex-1 min-w-0 pr-4">
                        <div class="flex justify-between items-center">
                            <span class="font-bold text-xs text-white truncate">${m.partner.name}</span>
                            <span class="text-[8px] text-neutral-500 font-mono">${m.lastActive}</span>
                        </div>
                        <p class="text-[10px] text-neutral-400 truncate mt-0.5">${msgText}</p>
                    </div>
                    ${hasRose ? '<span class="absolute right-2 top-2 bg-red-600/10 text-red-400 text-[8px] font-black px-1.5 py-0.5 rounded-full scale-90">🌹 Priority</span>' : ''}
                `;
                listCont.appendChild(item);
            });

            document.getElementById("unreadDot").style.display = hasUnread ? "block" : "none";
        }

        function openChatLobby(matchId) {
            currentlySelectedMatchId = matchId;
            const m = activeMatches.find(x => x.id === matchId);
            if (!m) return;

            m.unread = false; // clear unread simulated click
            renderMatchesInbox();

            document.getElementById("noActiveChat").classList.add("hidden");
            document.getElementById("activeChatPane").classList.remove("hidden");
            document.getElementById("activeChatCoachPanel").classList.remove("hidden");

            // Update header details
            document.getElementById("chatPartnerAvatar").src = m.partner.photoUrl;
            document.getElementById("chatPartnerName").innerText = m.partner.name;
            document.getElementById("chatPartnerGoal").innerText = m.partner.relationshipGoal;
            
            // Custom rose special connection banners
            const isRose = m.partner.sentRoseToMe || m.partner.sentRose;
            const hCont = document.getElementById("crimsonRoseContactHeader");
            if (isRose) {
                hCont.classList.remove("hidden");
                document.getElementById("chatPartnerBadge").innerText = "🌹 Crimson Priority";
                document.getElementById("chatPartnerBadge").className = "text-[8px] bg-red-500/20 text-red-300 px-2.5 py-0.5 rounded font-black uppercase tracking-wider";
            } else {
                hCont.classList.add("hidden");
                document.getElementById("chatPartnerBadge").innerText = "Verified ✔️";
                document.getElementById("chatPartnerBadge").className = "text-[8px] bg-sky-400/10 text-sky-400 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider";
            }

            renderMessageBubbles();
            renderIcebreakerPrompts();
            triggerWingmanCoach("suggest_openers"); // load openers tip implicitly for the profile
        }

        function renderMessageBubbles() {
            const m = activeMatches.find(x => x.id === currentlySelectedMatchId);
            if (!m) return;

            const feed = document.getElementById("messageFeed");
            feed.innerHTML = "";

            m.messages.forEach(msg => {
                const isMe = msg.senderId === "user_me";
                const isSafe = msg.safe !== false;
                
                const box = document.createElement("div");
                box.className = `flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1 w-full`;

                let innerHtml = "";
                if (!isSafe) {
                    // Security threat report card styling
                    innerHtml = `
                        <div class="max-w-xs bg-red-950/90 border border-red-500/35 p-3.5 rounded-2xl text-left shadow-lg">
                            <div class="flex items-center gap-1.5 text-xs text-red-400 font-bold mb-1">
                                <span>⚠️</span> AI Scanned Safety Flagged
                            </div>
                            <p class="text-[10px] text-red-200">${msg.reason || 'Message blocked due to potential cybersecurity scam terms.'}</p>
                            <p class="text-[9px] text-neutral-500 italic mt-2.5">Flagged messages do not deliver to partner boxes. Please keep chats cordial.</p>
                        </div>
                    `;
                } else {
                    innerHtml = `
                        <div class="max-w-xs p-3 rounded-2xl text-xs leading-normal shadow-md ${
                            isMe 
                                ? 'bg-[#E94057] text-white rounded-br-none' 
                                : 'bg-neutral-900 border border-neutral-800 text-white rounded-bl-none'
                        }">
                            <p>${msg.text}</p>
                        </div>
                        <span class="text-[8px] text-neutral-500 font-mono px-1.5">${msg.timestamp}</span>
                    `;
                }

                box.innerHTML = innerHtml;
                feed.appendChild(box);
            });

            // Fluid auto scroll bottom
            feed.scrollTop = feed.scrollHeight;
        }

        function renderIcebreakerPrompts() {
            const bar = document.getElementById("icebreakerBar");
            bar.innerHTML = "";
            ICEBREAKERS.slice(0, 3).forEach(b => {
                const button = document.createElement("button");
                button.onclick = () => {
                    document.getElementById("chatTextInput").value = b;
                };
                button.className = "bg-neutral-900 hover:bg-neutral-850 text-neutral-300 font-medium px-3.5 py-1.5 rounded-full border border-neutral-800 text-[10px] shrink-0 transition";
                button.innerText = b;
                bar.appendChild(button);
            });
        }

        async function transmitMessage() {
            const input = document.getElementById("chatTextInput");
            const text = input.value.trim();
            if (!text || !currentlySelectedMatchId) return;

            input.value = ""; // clear early

            try {
                const res = await fetch("/api/message/send", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        match_id: currentlySelectedMatchId,
                        text: text
                    })
                });
                const data = await res.json();
                
                const m = activeMatches.find(x => x.id === currentlySelectedMatchId);
                if (m) {
                    m.messages.push(data.user_message);
                    if (data.bot_reply) {
                        m.messages.push(data.bot_reply);
                    }
                    if (data.flagged) {
                        // Show warning flag modal / notification alert
                        triggerSystemAlarm(data.reason);
                    }
                    renderMessageBubbles();
                    renderMatchesInbox();
                }
            } catch(e) {
                console.error("Transmitting text failed:", e);
            }
        }

        function triggerSystemAlarm(textReason) {
            document.getElementById("alertBannerText").innerText = textReason;
            document.getElementById("alertBanner").classList.remove("hidden");
            // Auto close after 8 seconds
            setTimeout(closeAlarm, 8000);
        }

        function closeAlarm() {
            document.getElementById("alertBanner").classList.add("hidden");
        }

        // ==========================================
        // DATING SHIELD & SIMULATOR HELPERS
        // ==========================================

        function simulatePhotoShare() {
            const presetPhotos = [
                "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1565192647048-f997ee879ab8?w=300&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1526218626217-dc65a29bb444?w=300&auto=format&fit=crop&q=80"
            ];
            const randImg = presetPhotos[Math.floor(Math.random() * presetPhotos.length)];
            
            // Send direct fetch API image
            fetch("/api/message/send", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    match_id: currentlySelectedMatchId,
                    media_url: randImg
                })
            }).then(r => r.json()).then(data => {
                const m = activeMatches.find(x => x.id === currentlySelectedMatchId);
                if (m) {
                    m.messages.push(data.user_message);
                    if (data.bot_reply) m.messages.push(data.bot_reply);
                    renderMessageBubbles();
                }
            });
        }

        function simulateVoiceMemo() {
            fetch("/api/message/send", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    match_id: currentlySelectedMatchId,
                    voice_duration: "0:14 sec"
                })
            }).then(r => r.json()).then(data => {
                const m = activeMatches.find(x => x.id === currentlySelectedMatchId);
                if (m) {
                    m.messages.push(data.user_message);
                    if (data.bot_reply) m.messages.push(data.bot_reply);
                    renderMessageBubbles();
                }
            });
        }

        // ==========================================
        // AI COACH WINGMAN REQUESTS
        // ==========================================

        async function triggerWingmanCoach(cmd) {
            const m = activeMatches.find(x => x.id === currentlySelectedMatchId);
            if (!m) return;
            
            const box = document.getElementById("wingmanOutputBox");
            box.innerText = "Consulting dating databases... 🧠⚡";
            
            const customQuery = document.getElementById("customWingmanPrompt").value;
            if (cmd === "custom_question") {
                document.getElementById("customWingmanPrompt").value = "";
            }

            try {
                const res = await fetch("/api/ai/wingman", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        biography: m.partner.biography,
                        chat_history: JSON.stringify(m.messages),
                        command: cmd,
                        custom_question: customQuery
                    })
                });
                const d = await res.json();
                box.innerHTML = `<span class="italic text-white">${d.tip}</span>`;
            } catch(e) {
                box.innerText = "AI Coach suffered offline error trying to connect. Try again after config.";
            }
        }

        // ==========================================
        // SECURITY QUIZ CENTER CONSOLE
        // ==========================================

        function renderSafetyQuizBox() {
            const q = SAFETY_QUIZZES[stateUser.quizIndex];
            currentQuizData = q;
            
            document.getElementById("quizProgressCount").innerText = `Question ${stateUser.quizIndex + 1} of 3`;
            document.getElementById("quizQuestionText").innerText = q.question;
            
            const cont = document.getElementById("quizOptionsContainer");
            cont.innerHTML = "";
            
            // Hide feedback box initially for new question
            document.getElementById("quizFeedbackBox").classList.add("hidden");

            q.options.forEach((opt, idx) => {
                const b = document.createElement("button");
                b.onclick = () => submitQuizAnswer(idx);
                b.className = "w-full bg-[#111] hover:bg-[#161618] border border-neutral-900/60 p-3.5 rounded-xl text-left text-xs text-neutral-200 hover:text-white transition cursor-pointer";
                b.innerText = opt;
                cont.appendChild(b);
            });
        }

        async function submitQuizAnswer(idx) {
            try {
                const res = await fetch("/api/quiz/answer", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({option_index: idx})
                });
                const data = await res.json();
                
                // Update local stats from output payload
                stateUser.credits = data.user.credits;
                stateUser.score = data.user.score;
                stateUser.rosesCount = data.user.rosesCount;
                stateUser.quizIndex = data.user.quizIndex;
                
                const fBox = document.getElementById("quizFeedbackBox");
                fBox.innerText = data.feedback;
                fBox.classList.remove("hidden");
                
                syncUserData();

                // Load next question in deck after small delay
                setTimeout(() => {
                    renderSafetyQuizBox();
                }, 4000);

            } catch(e) {
                console.error("Quiz submission issue:", e);
            }
        }

        function distributeDateShield() {
            const venue = document.getElementById("dateShareVenue").value;
            const sched = document.getElementById("dateShareSchedule").value;
            const buddy = document.getElementById("dateShareContact").value;

            if (!venue || !sched || !buddy) {
                alert("Please satisfy all date coordinates fields first.");
                return;
            }

            alert(`🛡️ Safe Date Registered!\nSent encrypted details to trusted contact ${buddy}:\n📍 Venue: ${venue}\n📅 Time: ${sched}`);
            document.getElementById("dateShareVenue").value = "";
            document.getElementById("dateShareSchedule").value = "";
            document.getElementById("dateShareContact").value = "";
        }

        // ==========================================
        // ONBOARDING & PROFILE PARAMETERS SAVE
        // ==========================================

        function updateDistanceLabel(val) {
            document.getElementById("distLabel").innerText = `${val} miles`;
        }

        async function applyFilters() {
            const range = document.getElementById("setDistanceFilter").value;
            const gen = document.getElementById("setGenderFilter").value;
            const intent = document.getElementById("setIntentFilter").value;

            try {
                await fetch("/api/user/update", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        distanceFilter: parseInt(range),
                        genderFilter: gen,
                        intentFilter: intent
                    })
                });
                fetchProfiles();
            } catch(e) {}
        }

        async function commitProfileUpdates() {
            const name = document.getElementById("setUserName").value;
            const age = parseInt(document.getElementById("setUserAge").value);
            const goal = document.getElementById("setUserGoal").value;
            const bio = document.getElementById("setBiography").value;

            try {
                const res = await fetch("/api/user/update", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        name: name,
                        age: age,
                        relationshipGoal: goal,
                        biography: bio
                    })
                });
                const d = await res.json();
                stateUser = d.user;
                syncUserData();
                alert("Profile credentials committed successfully!");
            } catch(e) {
                alert("Committed update network error.");
            }
        }

        async function simulateBioSuggestion() {
            try {
                const res = await fetch("/api/ai/bio-suggest", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        hobbies: ["Pottery", "Rock Climbing", "Design"],
                        relationshipGoal: document.getElementById("setUserGoal").value,
                        current_bio: document.getElementById("setBiography").value
                    })
                });
                const d = await res.json();
                document.getElementById("setBiography").value = d.result;
            } catch(e) {}
        }

        // ==========================================
        // PHOTO VERIFICATION CONTROL
        // ==========================================

        function openVerificationModal() {
            document.getElementById("verificationModal").classList.remove("hidden");
            document.getElementById("verifySimulatedSelfie").classList.add("hidden");
            document.getElementById("verifyBoxText").classList.remove("hidden");
            document.getElementById("verifyFeedProgress").innerText = "Step 1: Capture Verification Selfie";
            document.getElementById("verifyActionBtn").innerText = "📸 Capture and Process";
        }

        function toggleVerificationModal() {
            document.getElementById("verificationModal").classList.add("hidden");
        }

        function runVerificationScan() {
            const img = document.getElementById("verifySimulatedSelfie");
            const boxT = document.getElementById("verifyBoxText");
            const progress = document.getElementById("verifyFeedProgress");
            const btn = document.getElementById("verifyActionBtn");

            boxT.classList.add("hidden");
            img.classList.remove("hidden");
            progress.innerText = "Analyzing facial geometry... 🎚️";
            btn.disabled = true;

            setTimeout(() => {
                stateUser.verified = true;
                stateUser.score += 20; // boost score to satisfy tick badge
                syncUserData();
                progress.innerText = "Assessment Complete: APPROVED ✔️";
                alert("Profile verified! Your profile photo matches our liveness databases. The 'Verified' badge tick has been successfully attached to your identity card.");
                toggleVerificationModal();
                btn.disabled = false;
            }, 2500);
        }

        // ==========================================
        // WALLET SHOP MODAL PERK
        // ==========================================

        function toggleCoinStore() {
            const el = document.getElementById("coinStoreModal");
            el.classList.contains("hidden") ? el.classList.remove("hidden") : el.classList.add("hidden");
        }

        async function activateMembership(flag) {
            try {
                const res = await fetch("/api/user/update", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({isPremium: flag})
                });
                const d = await res.json();
                stateUser = d.user;
                syncUserData();
                toggleCoinStore();
                alert("Velvet VIP Membership successfully unlocked! Infinite Roses & swipes active.");
            } catch(e) {}
        }

        function refillCredits(num) {
            stateUser.credits += num;
            syncUserData();
            toggleCoinStore();
            alert(`Purshased +${num} Coins! Happy swiping.`);
        }

        // ==========================================
        // GLOBAL ROUTING MECHANISMS
        // ==========================================

        function switchTab(tabId) {
            activeTab = tabId;
            
            // Hide all tab containers
            document.querySelectorAll(".tab-content").forEach(el => el.classList.add("hidden"));
            // Show active tab
            document.getElementById(`tab-${tabId}`).classList.remove("hidden");

            // Remove active styles from nav links
            document.querySelectorAll("nav button").forEach(b => {
                b.className = "w-full flex items-center justify-between px-4 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900/20 text-xs font-medium transition-all";
            });

            // Set active class
            const activeBtn = document.getElementById(`nav-${tabId}`);
            if (activeBtn) {
                activeBtn.className = "w-full flex items-center justify-between px-4 py-3 rounded-xl text-neutral-300 bg-neutral-900/40 text-xs font-medium border border-[#E94057]/10 transition-all";
            }

            // Perform context loaders
            if (tabId === "matches") {
                fetchInboxLogs();
            } else if (tabId === "safety") {
                renderSafetyQuizBox();
            } else if (tabId === "discover") {
                fetchProfiles();
            }
        }

        async function resetSandbox() {
            if (!confirm("Reset all matching algorithms limits and reseed Austin partners database?")) return;
            try {
                const res = await fetch("/api/session/reset", {method: "POST"});
                const data = await res.json();
                stateUser = data.user;
                activeMatches = data.matches;
                currentlySelectedMatchId = null;
                
                // Reset tab
                switchTab("discover");
                syncUserData();
                fetchProfiles();
                alert("Sandbox resynced successfully!");
            } catch(e) {}
        }
    </script>
</body>
</html>
"""

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000, debug=True)
