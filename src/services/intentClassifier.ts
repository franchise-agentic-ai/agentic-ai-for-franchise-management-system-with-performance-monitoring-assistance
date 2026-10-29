/**
 * Intelligent Conversation Intent Classifier & Natural Conversation Engine
 * for FranchiseOps AI.
 * 
 * Accurately categorizes queries before triggering business tools or telemetry:
 * 1. CASUAL_CHAT — Greetings, thanks, jokes, small talk, social conversation
 * 2. GREETING_OR_INTRODUCTION — "Who are you?", "What can you do?", platform intros
 * 3. BUSINESS_QUERY — Direct factual questions about sales, revenue, inventory, stockouts, staff, outlets
 * 4. BUSINESS_ANALYSIS — Requests for deep reports, comparisons, root causes, recommendations
 * 5. SUPPORT_REQUEST — Complaints, operational issues, ticket creation requests
 * 6. FOLLOW_UP — Context-dependent queries ("Why?", "How about that?", "Tell me more")
 * 
 * Supports English, Telugu, Hindi, and Tamil (Native + Transliterated scripts).
 */

import { SupportedLanguage } from './multilingualAssistantService';
import { ConversationTurn } from './businessAgentOrchestrator';

export type ConversationIntent = 
  | 'CASUAL_CHAT'
  | 'BUSINESS_QUERY'
  | 'BUSINESS_ANALYSIS'
  | 'SUPPORT_REQUEST'
  | 'FOLLOW_UP'
  | 'GREETING_OR_INTRODUCTION';

export interface IntentClassificationResult {
  intent: ConversationIntent;
  subType?: string;
  detectedLanguage: SupportedLanguage;
  confidence: number;
  isFollowUpCandidate: boolean;
  targetDomain?: 'sales' | 'inventory' | 'staff' | 'marketing' | 'audit' | 'general';
}

/**
 * Normalizes text for intent matching (trims, strips excessive punctuation, lowercases).
 */
function normalizeQuery(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[?!.,;:~`"'/\\()[\]{}]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Classifies the user message into one of the 6 core intents.
 */
export function classifyConversationIntent(
  query: string,
  history: ConversationTurn[] = [],
  activeLang: SupportedLanguage = 'en'
): IntentClassificationResult {
  const q = normalizeQuery(query);
  const rawLower = query.toLowerCase().trim();

  // --------------------------------------------------------------------------
  // 1. FOLLOW_UP DETECTION (Check if message depends on previous context)
  // --------------------------------------------------------------------------
  // Follow-up queries are usually short, referential, or elliptical questions
  const hasHistory = history.length > 0;
  const lastTurn = hasHistory ? history[history.length - 1] : null;
  const recentTurns = hasHistory ? history.slice(-4) : [];
  const hadRecentBusinessQuery = recentTurns.some(t => 
    t.intent && !['CASUAL_CHAT', 'GREETING_OR_INTRODUCTION'].includes(t.intent)
  );

  const followUpEllipticalRegex = /^(why|why is that|why so|how come|what about it|what about that|how about that|tell me more|explain more|more details|what else|and then|what caused this|what is the reason|how so|can you elaborate)\b/i;
  const followUpLanguageSpecific = 
    q === 'why' || q === 'why?' ||
    q === 'ఎందుకు' || q === 'ఎందుకు?' || q === 'enduku' ||
    q === 'क्यों' || q === 'क्यों?' || q === 'kyun' || q === 'kyu' ||
    q === 'ஏன்' || q === 'ஏன்?' || q === 'yen';

  const isReferentialFollowUp = 
    q.startsWith('why ') || 
    q.startsWith('how about ') || 
    q.startsWith('what about ') ||
    q.includes('spend on it') ||
    q.includes('running in') ||
    q.includes('staff there') ||
    q.includes('how is the staff there');

  if (hadRecentBusinessQuery && (followUpEllipticalRegex.test(q) || followUpLanguageSpecific || (isReferentialFollowUp && q.length < 50))) {
    return {
      intent: 'FOLLOW_UP',
      subType: 'contextual_follow_up',
      detectedLanguage: activeLang,
      confidence: 0.95,
      isFollowUpCandidate: true,
    };
  }

  // --------------------------------------------------------------------------
  // 2. SUPPORT REQUEST DETECTION
  // --------------------------------------------------------------------------
  const supportPatterns = [
    'raise ticket', 'raise a ticket', 'support ticket', 'create ticket', 'open ticket',
    'file ticket', 'submit ticket', 'complaint', 'raise complaint', 'file a complaint',
    'issue with pos', 'pos machine down', 'payment failed', 'system down', 'help desk',
    'contact support', 'talk to support', 'reach support', 'customer support',
    // Multilingual
    'டிக்கெட்', 'புகார்', 'ஆதரவு டிக்கெட்', 'டிக்கெட் பதிவு', 'ticket eppadi', 'complaint eppadi',
    'టికెట్', 'ఫిర్యాదు', 'సపోర్ట్ టికెట్', 'టికెట్ ఎలా', 'complaint ela',
    'टिकट', 'शिकायत', 'सपोर्ट टिकट', 'शिकायत दर्ज', 'ticket kaise', 'shikayat kaise'
  ];

  const isSupportRequest = supportPatterns.some(p => q.includes(p));
  if (isSupportRequest) {
    return {
      intent: 'SUPPORT_REQUEST',
      subType: 'ticket_or_complaint',
      detectedLanguage: activeLang,
      confidence: 0.95,
      isFollowUpCandidate: false,
    };
  }

  // --------------------------------------------------------------------------
  // 3. GREETING_OR_INTRODUCTION ("Who are you?", "What can you do?")
  // --------------------------------------------------------------------------
  const introPatterns = [
    'who are you', 'what are you', 'tell me about yourself', 'introduce yourself',
    'what can you do', 'what do you do', 'what is franchiseops', 'what is this platform',
    'what does franchiseops do', 'what is your purpose', 'what are your features',
    'how can you help me', 'how does this work', 'how can you help my business',
    // Multilingual
    'யார் நீங்கள்', 'நீங்கள் யார்', 'இந்த தளம் என்ன செய்கிறது', 'நீங்கள் என்ன செய்வீர்கள்', 'enna seiyum',
    'మీరు ఎవరు', 'ఈ ప్లాట్‌ఫామ్ ఏమి చేస్తుంది', 'మీరు ఏమి చేయగలరు', 'evaru nuvvu', 'enti idi',
    'आप कौन हैं', 'तुम कौन हो', 'यह प्लेटफ़ॉर्म क्या करता है', 'आप क्या कर सकते हैं', 'kya karte ho'
  ];

  const isIntro = introPatterns.some(p => q === p || q.includes(p));
  if (isIntro) {
    return {
      intent: 'GREETING_OR_INTRODUCTION',
      subType: 'system_introduction',
      detectedLanguage: activeLang,
      confidence: 0.95,
      isFollowUpCandidate: false,
    };
  }

  // --------------------------------------------------------------------------
  // 4. CASUAL_CHAT (Greetings, jokes, small talk, thanks, social chat)
  // --------------------------------------------------------------------------
  // Pure greetings
  const pureGreetings = [
    'hi', 'hello', 'hey', 'heyy', 'hiya', 'hola', 'howdy', 'greetings',
    'good morning', 'good afternoon', 'good evening', 'good day',
    'namaste', 'namaskar', 'namaskaram', 'vanakkam', 'pranam',
    'வணக்கம்', 'ஹலோ', 'హలో', 'నమస్కారం', 'నమస్తే', 'नमस्ते', 'नमस्कार', 'प्रणाम'
  ];

  // Well-wishes & small talk
  const smallTalkQueries = [
    'how are you', 'how are you doing', 'how r u', 'how are u', 'how is it going',
    'hows it going', "how's it going", 'whats up', "what's up", 'wassup',
    'what are you doing', 'what r u doing', 'how is your day', 'how was your day',
    'are you doing well', 'hope you are doing well', 'hope you are well',
    'you ok', 'are you ok', 'are you ready',
    // Multilingual
    'எப்படி இருக்கிறீர்கள்', 'எப்படி இருக்கீங்க', 'epadi irukinga', 'eppadi irukinga',
    'ఎలా ఉన్నారు', 'ఎలా ఉన్నావు', 'బాగున్నారా', 'ela unnaru', 'ela unnav', 'bagunnara',
    'आप कैसे हैं', 'तुम कैसे हो', 'क्या हाल है', 'सब ठीक', 'kaise ho', 'kaise hain'
  ];

  // Thanks & acknowledgments
  const gratitudeQueries = [
    'thank you', 'thanks', 'thx', 'thank u', 'thanks a lot', 'thank you so much',
    'many thanks', 'appreciate it', 'much appreciated', 'grateful',
    // Multilingual
    'நன்றி', 'மிக்க நன்றி', 'nandri',
    'ధన్యవాదాలు', 'చాలా ధన్యవాదాలు', 'dhanyavadalu', 'dhanyavadhamulu',
    'धन्यवाद', 'बहुत धन्यवाद', 'शुक्रिया', 'dhanyawad', 'dhanyavad', 'shukriya'
  ];

  // Positive feedback / compliments
  const feedbackQueries = [
    'nice', 'good', 'cool', 'awesome', 'great', 'super', 'superb', 'wonderful',
    'fantastic', 'perfect', 'well done', 'good job', 'impressive', 'neat', 'amazing',
    'romba nalla', 'bagundi', 'bahut badhiya', 'shandar'
  ];

  // Humor / jokes
  const jokeQueries = [
    'tell me a joke', 'joke', 'say a joke', 'make me laugh', 'do you know a joke',
    'tell a joke', 'any jokes', 'funny', 'say something funny',
    'ஒரு ஜோக் சொல்லுங்க', 'ఒక జోక్ చెప్పు', 'कोई चुटकुला सुनाओ', 'एक जोक सुनाओ'
  ];

  // Goodbyes
  const goodbyeQueries = [
    'bye', 'goodbye', 'bye bye', 'cya', 'see you', 'see ya', 'see you later',
    'good night', 'have a good day', 'take care', 'talk to you later', 'catch you later',
    // Multilingual
    'போய் வருகிறேன்', 'விடைபெறுகிறேன்', 'selavu', 'veedkolu', 'alvida', 'phir milenge'
  ];

  // Casual general chatter
  const casualChatterQueries = [
    'who made you', 'who created you', 'are you human', 'are you a robot', 'are you ai',
    'do you eat', 'do you like biryani', 'whats your favorite food', 'favorite color',
    'what time is it', 'how old are you', 'where do you live', 'haha', 'hahaha', 'lol',
    'ok', 'okay', 'got it', 'understood', 'sure', 'alright', 'fine', 'yes', 'no'
  ];

  const isExactCasual = 
    pureGreetings.includes(q) || 
    smallTalkQueries.some(s => q === s || q.startsWith(s + ' ') || q.endsWith(' ' + s)) ||
    gratitudeQueries.some(g => q === g || q.startsWith(g + ' ') || q.endsWith(' ' + g)) ||
    feedbackQueries.includes(q) ||
    jokeQueries.some(j => q.includes(j)) ||
    goodbyeQueries.includes(q) ||
    casualChatterQueries.includes(q);

  // If message contains business keywords, it's NOT casual chat!
  const hasBusinessTerms = 
    q.includes('revenue') || q.includes('sale') || q.includes('sales') || q.includes('profit') ||
    q.includes('stock') || q.includes('inventory') || q.includes('stockout') || q.includes('supplier') ||
    q.includes('staff') || q.includes('attendance') || q.includes('employee') || q.includes('chef') ||
    q.includes('outlet') || q.includes('branch') || q.includes('store') || q.includes('audit') ||
    q.includes('compliance') || q.includes('marketing') || q.includes('campaign') || q.includes('roi') ||
    q.includes('cac') || q.includes('underperform') || q.includes('performance') ||
    // Multilingual business
    q.includes('வருவாய்') || q.includes('விற்பனை') || q.includes('சரக்கு') || q.includes('ஊழியர்') ||
    q.includes('ఆదాయం') || q.includes('అమ్మకాలు') || q.includes('సరుకు') || q.includes('సిబ్బంది') ||
    q.includes('रेवेन्यू') || q.includes('बिक्री') || q.includes('स्टॉक') || q.includes('कर्मचारी');

  if (isExactCasual && !hasBusinessTerms) {
    let subType = 'small_talk';
    if (pureGreetings.includes(q)) subType = 'greeting';
    else if (smallTalkQueries.some(s => q.includes(s))) subType = 'how_are_you';
    else if (gratitudeQueries.some(g => q.includes(g))) subType = 'thanks';
    else if (feedbackQueries.includes(q)) subType = 'compliment';
    else if (jokeQueries.some(j => q.includes(j))) subType = 'joke';
    else if (goodbyeQueries.includes(q)) subType = 'goodbye';

    return {
      intent: 'CASUAL_CHAT',
      subType,
      detectedLanguage: activeLang,
      confidence: 0.98,
      isFollowUpCandidate: false,
    };
  }

  // --------------------------------------------------------------------------
  // 5. BUSINESS_ANALYSIS (Deep reports, multi-metric comparisons, trends)
  // --------------------------------------------------------------------------
  const analysisIndicators = [
    'analyze', 'analysis', 'evaluate', 'full report', 'detailed report', 'comprehensive',
    'breakdown', 'trend', 'trends', 'deep dive', 'root cause', 'why are sales',
    'suggest improvements', 'recommendations for', 'compare workforce and marketing',
    'compare channels', 'channel comparison', 'strategic review', 'diagnose', 'diagnosis',
    'மாதாந்திர பகுப்பாய்வு', 'முழு அறிக்கை', 'విశ్లేషణ', 'పూర్తి నివేదిక', 'विश्लेषण', 'विस्तृत रिपोर्ट'
  ];

  const isAnalysis = analysisIndicators.some(ind => q.includes(ind)) && hasBusinessTerms;
  if (isAnalysis) {
    return {
      intent: 'BUSINESS_ANALYSIS',
      subType: 'in_depth_analysis',
      detectedLanguage: activeLang,
      confidence: 0.92,
      isFollowUpCandidate: false,
      targetDomain: q.includes('sales') || q.includes('revenue') ? 'sales' :
                    q.includes('staff') || q.includes('workforce') ? 'staff' :
                    q.includes('marketing') ? 'marketing' : 'general'
    };
  }

  // --------------------------------------------------------------------------
  // 6. BUSINESS_QUERY (Factual questions about specific operational metrics)
  // --------------------------------------------------------------------------
  if (hasBusinessTerms) {
    let domain: 'sales' | 'inventory' | 'staff' | 'marketing' | 'audit' | 'general' = 'general';
    if (q.includes('revenue') || q.includes('sale') || q.includes('sales') || q.includes('விற்பனை') || q.includes('అమ్మకాలు') || q.includes('बिक्री')) {
      domain = 'sales';
    } else if (q.includes('stock') || q.includes('inventory') || q.includes('stockout') || q.includes('சரக்கு') || q.includes('సరుకు')) {
      domain = 'inventory';
    } else if (q.includes('staff') || q.includes('attendance') || q.includes('chef') || q.includes('employee') || q.includes('ஊழியர்') || q.includes('సిబ్బంది') || q.includes('स्टाफ')) {
      domain = 'staff';
    } else if (q.includes('campaign') || q.includes('marketing') || q.includes('roi') || q.includes('cac')) {
      domain = 'marketing';
    } else if (q.includes('audit') || q.includes('compliance') || q.includes('violation')) {
      domain = 'audit';
    }

    return {
      intent: 'BUSINESS_QUERY',
      subType: 'factual_operational_query',
      detectedLanguage: activeLang,
      confidence: 0.95,
      isFollowUpCandidate: false,
      targetDomain: domain
    };
  }

  // Default fallback: If very short query (< 4 words) with no business terms, treat as casual chat
  const wordCount = q.split(' ').filter(Boolean).length;
  if (wordCount <= 3 && !hasBusinessTerms) {
    return {
      intent: 'CASUAL_CHAT',
      subType: 'short_greeting_or_phrase',
      detectedLanguage: activeLang,
      confidence: 0.85,
      isFollowUpCandidate: false,
    };
  }

  // Otherwise, default to BUSINESS_QUERY with general domain
  return {
    intent: 'BUSINESS_QUERY',
    subType: 'general_business_query',
    detectedLanguage: activeLang,
    confidence: 0.75,
    isFollowUpCandidate: false,
    targetDomain: 'general'
  };
}

/**
 * Natural casual replies tailored by language and sub-type.
 * Keeps answers 1-2 sentences, friendly, and completely free of business telemetry.
 */
export function generateCasualReply(
  query: string,
  lang: SupportedLanguage = 'en',
  subType: string = 'small_talk'
): string {
  const q = normalizeQuery(query);

  // 1. GREETINGS ("Hi", "Hello", "Good morning")
  if (subType === 'greeting' || q === 'hi' || q === 'hello' || q === 'hey') {
    if (q.includes('morning')) {
      if (lang === 'ta') return 'காலை வணக்கம்! ☀️ உங்கள் நாள் சிறப்பாக அமையட்டும்.';
      if (lang === 'te') return 'శుభోదయం! ☀️ మీ రోజు ఉల్లాసంగా సాగాలని కోరుకుంటున్నాను.';
      if (lang === 'hi') return 'सुप्रभात! ☀️ आशा है आपका दिन बहुत अच्छा रहे।';
      return "Good morning! ☀️ Hope you're having a great day.";
    }
    if (q.includes('evening')) {
      if (lang === 'ta') return 'மாலை வணக்கம்! 🌆 இன்று உங்களுக்கு நான் எவ்வாறு உதவ முடியும்?';
      if (lang === 'te') return 'శుభ సాయంత్రం! 🌆 ఈ రోజు నేను మీకు ఎలా సహాయపడగలను?';
      if (lang === 'hi') return 'शुभ संध्या! 🌆 आज मैं आपकी किस प्रकार सहायता कर सकता हूँ?';
      return "Good evening! 🌆 How can I help you today?";
    }
    if (lang === 'ta') return 'வணக்கம்! 👋 இன்று உங்களுக்கு நான் எவ்வாறு உதவ முடியும்?';
    if (lang === 'te') return 'హలో! 👋 ఈ రోజు నేను మీకు ఎలా సహాయపడగలను?';
    if (lang === 'hi') return 'नमस्ते! 👋 आज मैं आपकी किस प्रकार सहायता कर सकता हूँ?';
    return "Hi! 👋 How can I help you today?";
  }

  // 2. WELL-WISHES ("How are you?")
  if (subType === 'how_are_you' || q.includes('how are you') || q.includes('kaise ho') || q.includes('ela unnaru') || q.includes('epadi irukinga')) {
    if (lang === 'ta') return 'நான் நலமாக இருக்கிறேன், கேட்டதற்கு நன்றி! 😊 நீங்கள் எப்படி இருக்கிறீர்கள்?';
    if (lang === 'te') return 'నేను బాగున్నాను, అడిగినందుకు ధన్యవాదాలు! 😊 మీరు ఎలా ఉన్నారు?';
    if (lang === 'hi') return 'मैं बिल्कुल ठीक हूँ, पूछने के लिए धन्यवाद! 😊 आप कैसे हैं?';
    return "I'm doing well, thanks for asking! 😊 How are you?";
  }

  // 3. GRATITUDE ("Thank you", "Thanks")
  if (subType === 'thanks' || q.includes('thank') || q.includes('thanks') || q.includes('nandri') || q.includes('dhanyavad') || q.includes('shukriya')) {
    if (lang === 'ta') return 'மகிழ்ச்சி! உங்களுக்கு உதவ முடிந்ததில் சந்தோஷம். 😊';
    if (lang === 'te') return 'ధన్యవాదాలు! మీకు సహాయపడినందుకు సంతోషం. 😊';
    if (lang === 'hi') return 'आपका स्वागत है! 😊 किसी भी समय सहायता के लिए पूछें।';
    return "You're welcome! 😊";
  }

  // 4. POSITIVE FEEDBACK ("Nice", "Cool", "Awesome")
  if (subType === 'compliment' || ['nice', 'cool', 'awesome', 'great', 'super'].includes(q)) {
    if (lang === 'ta') return 'மிக்க மகிழ்ச்சி! பிடித்ததில் சந்தோஷம். 😊';
    if (lang === 'te') return 'సంతోషం! మీకు నచ్చినందుకు ఆనందంగా ఉంది. 😊';
    if (lang === 'hi') return 'बहुत बढ़िया! खुशी हुई कि आपको पसंद आया। 😊';
    return "Glad you like it! 😊";
  }

  // 5. JOKES ("Tell me a joke")
  if (subType === 'joke' || q.includes('joke') || q.includes('funny')) {
    const jokes = [
      "Why did the spreadsheet go to therapy? It had too many unresolved issues! 😄",
      "Why don't eggs tell jokes? They'd crack each other up! 🥚😄",
      "Why did the computer catch a cold? Because it left its Windows open! 💻😄"
    ];
    const joke = jokes[Math.floor(Math.random() * jokes.length)];

    if (lang === 'ta') return 'கம்ப்யூட்டர் ஏன் குளிரில் நடுங்கியது தெரியுமா? விண்டோஸ் (Windows) கதவை திறந்து வச்சிட்டாங்க! 💻😄';
    if (lang === 'te') return 'స్ప్రెడ్‌షీట్ ఎందుకు డాక్టర్ దగ్గరికి వెళ్ళిందో తెలుసా? దానికి చాలా అన్‌రిసాల్వ్డ్ ఇష్యూస్ ఉన్నాయి! 📊😄';
    if (lang === 'hi') return 'कंप्यूटर को सर्दी क्यों लग गई? क्योंकि उसकी Windows खुली रह गई थी! 💻😄';
    return joke;
  }

  // 6. GOODBYE ("Bye", "See you")
  if (subType === 'goodbye' || q.includes('bye') || q.includes('see you')) {
    if (lang === 'ta') return 'விடைபெறுகிறேன்! 👋 உங்கள் நாள் சிறப்பாக அமையட்டும்!';
    if (lang === 'te') return 'వీడ్కోలు! 👋 మీ రోజు శుభప్రదంగా సాగాలని కోరుకుంటున్నాను!';
    if (lang === 'hi') return 'अलविदा! 👋 आपका दिन बहुत शुभ और सफल रहे!';
    return "Goodbye! 👋 Have a great day!";
  }

  // 7. "WHAT ARE YOU DOING?"
  if (q.includes('what are you doing') || q.includes('kya kar rahe ho') || q.includes('em chestunnav')) {
    if (lang === 'ta') return 'நான் தயாராக இருக்கிறேன்! உங்கள் மனதில் என்ன இருக்கிறது?';
    if (lang === 'te') return 'నేను సిద్ధంగా ఉన్నాను! మీ మనసులో ఏముందో చెప్పండి.';
    if (lang === 'hi') return 'मैं यहाँ तैयार हूँ! आपके मन में क्या विचार है?';
    return "I'm here and ready to help! What's on your mind?";
  }

  // 8. GENERAL CASUAL DEFAULT
  if (lang === 'ta') return 'நான் உங்களுக்கு உதவ எப்போதும் தயாராக உள்ளேன்! நீங்கள் என்ன தெரிந்துகொள்ள விரும்புகிறீர்கள்?';
  if (lang === 'te') return 'నేను మీకు సహాయం చేయడానికి సిద్ధంగా ఉన్నాను! మీరు ఏమి తెలుసుకోవాలనుకుంటున్నారు?';
  if (lang === 'hi') return 'मैं आपकी सहायता के लिए तैयार हूँ! आप क्या जानना चाहते हैं?';
  return "I'm here and happy to chat! How can I assist you?";
}

/**
 * Clean 1-2 sentence introduction about FranchiseOps AI.
 * Free of telemetry dumps or unsolicited dashboards.
 */
export function generateIntroductionReply(lang: SupportedLanguage = 'en'): string {
  if (lang === 'ta') {
    return "நான் FranchiseOps AI, உங்கள் ஃபிரான்சைஸ் செயல்பாடுகள், விற்பனை நுண்ணறிவு, சரக்கு இருப்பு மற்றும் ஊழியர்களை நிர்வகிக்க உதவும் ஸ்மார்ட் AI உதவியாளர்.";
  }
  if (lang === 'te') {
    return "నేను FranchiseOps AI, మీ ఫ్రాంచైజ్ ఆపరేషన్స్, సేల్స్ ఇన్సైట్స్, ఇన్వెంటరీ మరియు సిబ్బంది పర్యవేక్షణలో సహాయపడే స్మార్ట్ AI అసిస్టెంట్‌ని.";
  }
  if (lang === 'hi') {
    return "मैं FranchiseOps AI हूँ, आपकी फ्रैंचाइज़ी ऑपरेशंस, सेल्स इनसाइट्स, इन्वेंट्री और स्टाफ मैनेजमेंट में सहायता करने वाला स्मार्ट AI असिस्टेंट।";
  }
  return "I'm FranchiseOps AI, your assistant for franchise operations, performance insights, inventory, staffing, and support.";
}

/**
 * Support ticket guidance message and action trigger.
 */
export function generateSupportGuidance(lang: SupportedLanguage = 'en'): {
  answer: string;
  suggestedAction: { label: string; actionType: string };
} {
  let answer = "I can help you raise a support ticket right away. Click the button below to submit your details or tell me what happened.";
  let label = "🎫 Raise Support Ticket";

  if (lang === 'ta') {
    answer = "நான் உடனடியாக ஆதரவு அல்லது புகார் டிக்கெட் பதிவு செய்ய உதவுகிறேன். கீழே உள்ள பொத்தானை கிளிக் செய்து விவரங்களை உள்ளிடவும்.";
    label = "🎫 ஆதரவு டிக்கெட் பதிவு செய்க";
  } else if (lang === 'te') {
    answer = "నేను వెంటనే సపోర్ట్ లేదా ఫిర్యాదు టికెట్ నమోదు చేయడంలో సహాయపడతాను. కింద ఉన్న బటన్‌ను క్లిక్ చేసి వివరాలను సమర్పించండి.";
    label = "🎫 సపోర్ట్ టికెట్ నమోదు చేయండి";
  } else if (lang === 'hi') {
    answer = "मैं तुरंत सपोर्ट या शिकायत टिकट दर्ज करने में आपकी मदद कर सकता हूँ। अपना विवरण दर्ज करने के लिए नीचे दिए गए बटन पर क्लिक करें।";
    label = "🎫 सपोर्ट टिकट दर्ज करें";
  }

  return {
    answer,
    suggestedAction: {
      label,
      actionType: 'open_ticket_modal'
    }
  };
}
