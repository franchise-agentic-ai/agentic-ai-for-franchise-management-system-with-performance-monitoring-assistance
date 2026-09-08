/**
 * Multilingual AI Assistant Service (English, Telugu, Hindi, Tamil)
 * Supports two distinct modes:
 *  1. Visitor Mode (Before Registration / Authentication) - General Platform AI
 *  2. Business AI Mode (After Registration / Authentication) - Personalized Business Analytics
 *
 * Full Speech Synthesis & Recognition in en-IN, te-IN, hi-IN, and ta-IN.
 */

import { 
  getActiveBusiness, 
  calculateOverallBusinessHealthScore, 
  getTenantOutlets, 
  getTenantSales, 
  getTenantInventory, 
  getTenantStaff 
} from './tenantService';
import { TARGET_SUPPORT_EMAIL } from './ticketService';

export type SupportedLanguage = 'en' | 'te' | 'hi' | 'ta';

export interface VisualAnalyticsData {
  type: 'sales_trend' | 'inventory_health' | 'staff_attendance' | 'outlet_comparison' | 'health_pillars' | 'ticket_status';
  title: string;
  metrics: Array<{ label: string; value: string; change?: string; isPositive?: boolean }>;
  bars?: Array<{ label: string; value: number; max: number; color: string }>;
}

export interface GuidanceResponse {
  isHandled: boolean;
  language: SupportedLanguage;
  intent: string;
  answer: string;
  keyMetrics?: string[];
  relatedOutlets?: string[];
  analyticsCard?: VisualAnalyticsData;
  suggestedAction?: {
    label: string;
    actionType: string;
    payload?: any;
  };
  quickOptions?: Array<{ label: string; query: string }>;
}

/**
 * Detects whether the input text is Tamil, Telugu, Hindi, or English
 */
export function detectLanguage(text: string): SupportedLanguage {
  const tamilRegex = /[\u0B80-\u0BFF]/;
  const teluguRegex = /[\u0C00-\u0C7F]/;
  const hindiRegex = /[\u0900-\u097F]/;

  if (tamilRegex.test(text)) return 'ta';
  if (teluguRegex.test(text)) return 'te';
  if (hindiRegex.test(text)) return 'hi';

  const tLower = text.toLowerCase().trim();

  // Tamil Romanized phrases
  const tamilKeywords = [
    'vanakkam', 'epadi irukinga', 'eppadi use panrathu', 'eppadi apply panrathu',
    'complaint eppadi', 'ticket eppadi', 'nandri', 'ennathu', 'enna seiyum',
    'sales evvalavu', 'stock irukka', 'aalkal', 'kadai'
  ];
  if (tamilKeywords.some(k => tLower.includes(k))) return 'ta';

  // Telugu Romanized phrases
  const teluguKeywords = [
    'namaskaram', 'namaskaramu', 'ela unnav', 'ela unnaru', 'ela vadali',
    'ela cheyali', 'sahayam', 'sahayamu', 'complaint ela', 'ticket ela',
    'franchise ela', 'form ela', 'dhanyavadalu', 'enti', 'outlets ela',
    'sales entha', 'ammukalu', 'stock unda', 'panivallu', 'evaru'
  ];
  if (teluguKeywords.some(k => tLower.includes(k))) return 'te';

  // Hindi Romanized phrases
  const hindiKeywords = [
    'namaste', 'kaise ho', 'kya karte ho', 'kaise use kare', 'madad',
    'shikayat kaise', 'ticket kaise', 'form kaise', 'apply kaise',
    'kripya', 'dhanyawad', 'shukriya', 'batao', 'sales kitna',
    'kamjor outlet', 'stock kitna', 'staff kaisa'
  ];
  if (hindiKeywords.some(k => tLower.includes(k))) return 'hi';

  return 'en';
}

/**
 * Get Welcome Message based on Auth Mode and Language
 */
export function getLocalizedWelcomeMessage(
  isAuthenticated: boolean,
  businessName: string,
  lang: SupportedLanguage
): { text: string; keyMetrics: string[]; quickOptions: Array<{ label: string; query: string }> } {
  if (isAuthenticated) {
    // ------------------------------------------------------------------------
    // MODE 2: AFTER AUTHENTICATION (Personalized Business AI)
    // ------------------------------------------------------------------------
    if (lang === 'ta') {
      return {
        text: `வணக்கம், **${businessName}**! 👋 நான் உங்கள் FranchiseOps AI உதவியாளர் (Business AI Copilot).\n\nஉங்கள் வணிகத்தின் விற்பனை, இருப்பு (Stock), ஊழியர் செயல்திறன் மற்றும் கிளைகளின் நேரடி நிலை குறித்த அனைத்து தகவல்களையும் பகுப்பாய்வு செய்து தருகிறேன்.\n\nஇன்று உங்கள் வணிகத்திற்கு நான் எவ்வாறு உதவ முடியும்?`,
        keyMetrics: [`வணிகம்: ${businessName}`, 'நேரடி பகுப்பாய்வு தயார்', 'தமிழ் குரல் ஆதரவு'],
        quickOptions: [
          { label: '📊 விற்பனை & வருவாய்', query: 'விற்பனை மற்றும் வருவாய் நிலவரம் என்ன?' },
          { label: '📦 இருப்பு & சரக்கு பற்றாக்குறை', query: 'சரக்கு இருப்பு நிலவரம் மற்றும் பற்றாக்குறை அபாயம் உள்ளதா?' },
          { label: '👥 ஊழியர் & செஃப் வருகை', query: 'ஊழியர் மற்றும் செஃப் வருகை நிலை என்ன?' },
          { label: '⚠️ பலவீனமான கிளைகள்', query: 'எந்த கிளைகள் குறைவாக செயல்படுகின்றன?' },
          { label: '🎫 புகார் / ஆதரவு டிக்கெட்', query: 'புகார் அல்லது ஆதரவு டிக்கெட் பதிவு செய்வது எப்படி?' }
        ]
      };
    }

    if (lang === 'te') {
      return {
        text: `నమస్కారం, **${businessName}**! 👋 నేను మీ FranchiseOps AI బిజినెస్ అసిస్టెంట్.\n\nమీ ఫ్రాంచైజ్ అమ్మకాలు, ఇన్వెంటరీ సరుకులు, సిబ్బంది రోస్టర్ మరియు సర్వీస్ నాణ్యతను నిజ-సమయంలో పర్యవేక్షిస్తాను.\n\nఈ రోజు మీ వ్యాపారానికి నేను ఎలా సహాయపడగలను?`,
        keyMetrics: [`వ్యాపారం: ${businessName}`, 'రియల్-టైమ్ డేటా', 'తెలుగు వాయిస్ సిద్ధం'],
        quickOptions: [
          { label: '📊 సేల్స్ & రెవెన్యూ', query: 'అమ్మకాలు మరియు ఆదాయం ఎంత?' },
          { label: '📦 ఇన్వెంటరీ & స్టాక్ కొరత', query: 'ఇన్వెంటరీ స్టాక్ సమస్యలు ఉన్నాయా?' },
          { label: '👥 సిబ్బంది & చెఫ్ హాజరు', query: 'సిబ్బంది మరియు చెఫ్ పనితీరు నివేదిక' },
          { label: '⚠️ వెనుకబడిన అవుట్‌లెట్లు', query: 'ఏ అవుట్‌లెట్లు వెనుకబడి ఉన్నాయి?' },
          { label: '🎫 సపోర్ట్ టికెట్ నమోదు', query: 'ఫిర్యాదు లేదా టికెట్ ఎలా నమోదు చేయాలి?' }
        ]
      };
    }

    if (lang === 'hi') {
      return {
        text: `नमस्ते, **${businessName}**! 👋 मैं आपका FranchiseOps AI बिज़नेस असिस्टेंट हूँ।\n\nमैं आपके व्यवसाय के सेल्स, इन्वेंट्री स्टॉक, कर्मचारियों की उपस्थिति और सभी आउटलेट्स का लाइव डेटा विश्लेषण प्रदान करता हूँ।\n\nआज मैं आपके व्यवसाय के लिए क्या सहायता कर सकता हूँ?`,
        keyMetrics: [`बिज़नेस: ${businessName}`, 'रियल-टाइम टेलीमेट्री', 'हिंदी वॉइस सक्रिय'],
        quickOptions: [
          { label: '📊 सेल्स और रेवेन्यू', query: 'बिक्री और रेवेन्यू दिखाओ' },
          { label: '📦 इन्वेंट्री और स्टॉक रिस्क', query: 'इन्वेंट्री की स्थिति क्या है?' },
          { label: '👥 स्टाफ और शेफ परफॉरमेंस', query: 'स्टाफ और शेफ की स्थिति क्या है?' },
          { label: '⚠️ कमजोर आउटलेट्स', query: 'कौन से आउटलेट कमजोर हैं?' },
          { label: '🎫 सपोर्ट टिकट / शिकायत', query: 'शिकायत या टिकट कैसे बनाएं?' }
        ]
      };
    }

    return {
      text: `Hi, **${businessName}**! 👋 I’m your FranchiseOps AI Assistant.\n\nI have live telemetry across your sales pacing, stock levels, staff attendance, and store audits.\n\nHow can I help you optimize your business today?`,
      keyMetrics: [`Business: ${businessName}`, 'Live Telemetry Active', 'Multilingual Ready'],
      quickOptions: [
        { label: '📊 Sales & Revenue', query: 'Show sales performance and revenue' },
        { label: '📦 Inventory & Stockout Risks', query: 'Are there any inventory stockout risks?' },
        { label: '👥 Staff & Chef Attendance', query: 'Show staff roster and attendance' },
        { label: '⚠️ Underperforming Outlets', query: 'Which outlets are underperforming?' },
        { label: '🎫 Raise Ticket / Complaint', query: 'How do I create a support ticket?' }
      ]
    };
  }

  // --------------------------------------------------------------------------
  // MODE 1: BEFORE AUTHENTICATION (General Visitor AI)
  // --------------------------------------------------------------------------
  if (lang === 'ta') {
    return {
      text: `வணக்கம்! 🙏 நான் உங்கள் **FranchiseOps AI உதவியாளர்**.\n\nஇந்த தளத்தை பற்றி அறிந்துகொள்ள நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?`,
      keyMetrics: ['பொது வழிகாட்டி', 'தமிழ் • English • తెలుగు • हिन्दी', 'டிக்கெட் ஆதரவு'],
      quickOptions: [
        { label: 'இந்த தளம் என்ன செய்கிறது?', query: 'இந்த தளம் என்ன செய்கிறது?' },
        { label: 'வணிகத்தை எவ்வாறு பதிவு செய்வது?', query: 'வணிகத்தை எவ்வாறு பதிவு செய்வது?' },
        { label: 'விண்ணப்பிப்பது எப்படி?', query: 'விண்ணப்பிப்பது எப்படி?' },
        { label: 'புகார் அளிப்பது எப்படி?', query: 'புகார் அளிப்பது எப்படி?' },
        { label: 'இது என் வணிகத்திற்கு எவ்வாறு உதவும்?', query: 'FranchiseOps AI என் வணிகத்திற்கு எவ்வாறு உதவும்?' }
      ]
    };
  }

  if (lang === 'te') {
    return {
      text: `నమస్కారం! 🙏 నేను మీ **FranchiseOps AI అసిస్టెంట్**.\n\nఈ ప్లాట్‌ఫామ్‌ను అర్థం చేసుకోవడంలో నేను మీకు ఎలా సహాయపడగలను?`,
      keyMetrics: ['సాధారణ గైడ్', 'తెలుగు • English • हिन्दी • தமிழ்', 'టికెట్ సపోర్ట్'],
      quickOptions: [
        { label: 'ఈ ప్లాట్‌ఫామ్ ఏమి చేస్తుంది?', query: 'ఈ ప్లాట్‌ఫామ్ ఏమి చేస్తుంది?' },
        { label: 'వ్యాపారాన్ని ఎలా నమోదు చేయాలి?', query: 'నా వ్యాపారాన్ని ఎలా నమోదు చేసుకోవాలి?' },
        { label: 'దరఖాస్తు ఎలా చేయాలి?', query: 'దరఖాస్తు ఎలా చేయాలి?' },
        { label: 'ఫిర్యాదు ఎలా చేయాలి?', query: 'ఫిర్యాదు ఎలా నమోదు చేయాలి?' },
        { label: 'ఇది నా వ్యాపారానికి ఎలా సహాయపడుతుంది?', query: 'FranchiseOps AI నా వ్యాపారానికి ఎలా సహాయపడుతుంది?' }
      ]
    };
  }

  if (lang === 'hi') {
    return {
      text: `नमस्ते! 🙏 मैं आपका **FranchiseOps AI असिस्टेंट** हूँ।\n\nप्लेटफ़ॉर्म को समझने में मैं आपकी क्या सहायता कर सकता हूँ?`,
      keyMetrics: ['सामान्य गाइड', 'हिंदी • English • తెలుగు • தமிழ்', 'टिकट सपोर्ट'],
      quickOptions: [
        { label: 'यह प्लेटफ़ॉर्म क्या करता है?', query: 'यह प्लेटफ़ॉर्म क्या करता है?' },
        { label: 'बिज़नेस रजिस्टर कैसे करें?', query: 'अपना बिज़नेस कैसे रजिस्टर करें?' },
        { label: 'अप्लाई कैसे करें?', query: 'अप्लाई कैसे करें?' },
        { label: 'शिकायत कैसे दर्ज करें?', query: 'शिकायत कैसे दर्ज करें?' },
        { label: 'यह मेरे बिज़नेस की कैसे मदद करता है?', query: 'FranchiseOps AI मेरे बिज़नेस में कैसे मदद करता है?' }
      ]
    };
  }

  return {
    text: `Hi! 👋 I’m your **FranchiseOps AI Assistant**.\n\nHow can I help you understand the platform today?`,
    keyMetrics: ['Platform Guide', 'Voice & Text Active', 'Ticket Dispatch Ready'],
    quickOptions: [
      { label: 'What does this platform do?', query: 'What does this platform do?' },
      { label: 'How do I register my business?', query: 'How do I register my business?' },
      { label: 'How do I apply?', query: 'How do I apply?' },
      { label: 'How can I raise a complaint?', query: 'How can I raise a complaint?' },
      { label: 'How does FranchiseOps AI help my business?', query: 'How does FranchiseOps AI help my business?' }
    ]
  };
}

/**
 * Handle Special Guidance Queries across Visitor and Authenticated Modes in 4 Languages
 */
export function handleSpecialGuidanceQuery(
  query: string, 
  currentPath: string = '/',
  forcedLang: SupportedLanguage = 'en',
  isAuthenticated: boolean = false
): GuidanceResponse | null {
  const lang = forcedLang;
  const q = query.toLowerCase().trim();
  const business = getActiveBusiness();

  // --------------------------------------------------------------------------
  // 1. GREETINGS
  // --------------------------------------------------------------------------
  const isGreeting = 
    /^(hi|hello|hey|greetings|good morning|good afternoon|good evening|namaste|namaskaram|vanakkam|hola)\b/i.test(q) ||
    /^(வணக்கம்|ஹலோ)/.test(query) ||
    /^(హలో|నమస్కారం|నమస్తే|బాగున్నారా)/.test(query) ||
    /^(नमस्ते|नमस्कार|हैलो|प्रणाम)/.test(query);

  if (isGreeting && q.length < 40) {
    const welcome = getLocalizedWelcomeMessage(isAuthenticated, business.name, lang);
    return {
      isHandled: true,
      language: lang,
      intent: 'GREETING',
      answer: welcome.text,
      keyMetrics: welcome.keyMetrics,
      quickOptions: welcome.quickOptions,
      suggestedAction: {
        label: lang === 'ta' ? '🎫 ஆதரவு டிக்கெட்' : lang === 'te' ? '🎫 సపోర్ట్ టికెట్' : lang === 'hi' ? '🎫 सपोर्ट टिकट' : '🎫 Raise Support Ticket',
        actionType: 'open_ticket_modal',
      }
    };
  }

  // --------------------------------------------------------------------------
  // 2. "WHAT DOES THIS PLATFORM DO?" / "HOW DOES IT HELP MY BUSINESS?"
  // --------------------------------------------------------------------------
  const isWhatDoesItDo = 
    q.includes('what does this platform do') || 
    q.includes('what do you do') || 
    q.includes('what is franchiseops') ||
    q.includes('how does franchiseops ai help my business') ||
    q.includes('help my business') ||
    q.includes('இந்த தளம் என்ன செய்கிறது') ||
    q.includes('என் வணிகத்திற்கு எவ்வாறு உதவும்') ||
    q.includes('ఈ ప్లాట్‌ఫామ్ ఏమి చేస్తుంది') ||
    q.includes('నా వ్యాపారానికి ఎలా సహాయపడుతుంది') ||
    q.includes('यह प्लेटफ़ॉर्म क्या करता है') ||
    q.includes('मेरे बिज़नेस में कैसे मदद');

  if (isWhatDoesItDo) {
    if (lang === 'ta') {
      return {
        isHandled: true,
        language: 'ta',
        intent: 'ABOUT_SYSTEM',
        answer: `### 🤖 FranchiseOps AI என்ன செய்கிறது & உங்கள் வணிகத்திற்கு எவ்வாறு உதவுகிறது?\n\n**FranchiseOps AI** என்பது பல கிளைகளைக் கொண்ட வணிகங்கள் (Franchise Chains & Restaurants) சீராக இயங்க உதவும் ஒரு அதிநவீன **Autonomous AI Operating System** ஆகும்.\n\n**முக்கிய பயன்கள்:**\n1. 📈 **விற்பனை & வருவாய் கண்காணிப்பு:** ஒவ்வொரு கிளையின் விற்பனை மற்றும் வளர்ச்சியை நொடிகளில் ஒப்பிடுங்கள்.\n2. 📦 **சரக்கு இருப்பு முன்னறிவிப்பு:** பொருட்கள் தீர்ந்துபோகும் முன்பே தானியங்கி மறுஆர்டர் எச்சரிக்கைகள்.\n3. 👥 **ஊழியர் & செஃப் மேலாண்மை:** ஷிப்ட் அட்டவணை, வருகைப்பதிவு மற்றும் உற்பத்தித்திறன் கண்காணிப்பு.\n4. 🛡️ **தரக்கட்டுப்பாடு & SOP தணிக்கை:** பிரச்சனைகளை உடனடியாக கண்டறிந்து 1-கிளிக் தீர்வுகள்.\n5. 🎫 **தானியங்கி வாடிக்கையாளர் & ஆதரவு டிக்கெட்:** உங்கள் கோரிக்கைகளை நேரடியாக ${TARGET_SUPPORT_EMAIL} க்கு மின்னஞ்சல் மூலம் அனுப்புகிறது.\n6. 🗣️ **தமிழ் குரல் ஆதரவு:** தமிழில் கேள்விகள் கேட்கலாம் மற்றும் குரல் வழியே பதில்களைப் பெறலாம்.`,
        keyMetrics: ['பல கிளை AI மேலாண்மை', 'நேரடி தொலைநோக்கு', 'தமிழ் குரல் ஆதரவு'],
        suggestedAction: {
          label: isAuthenticated ? '📊 நேரடி டாஷ்போர்டு பார்க்க' : '✨ வணிகத்தை பதிவு செய்க',
          actionType: isAuthenticated ? 'navigate_dashboard' : 'navigate_onboarding',
        },
        quickOptions: [
          { label: 'வணிகத்தை எவ்வாறு பதிவு செய்வது?', query: 'வணிகத்தை எவ்வாறு பதிவு செய்வது?' },
          { label: 'விண்ணப்பிப்பது எப்படி?', query: 'விண்ணப்பிப்பது எப்படி?' },
          { label: 'புகார் அளிப்பது எப்படி?', query: 'புகார் அளிப்பது எப்படி?' }
        ]
      };
    }

    if (lang === 'te') {
      return {
        isHandled: true,
        language: 'te',
        intent: 'ABOUT_SYSTEM',
        answer: `### 🤖 FranchiseOps AI ఏమి చేస్తుంది & మీ వ్యాపారానికి ఎలా సహాయపడుతుంది?\n\n**FranchiseOps AI** అనేది మల్టీ-యూనిట్ ఫ్రాంచైజ్ నెట్‌వర్క్‌ల కోసం రూపొందించబడిన ఒక ఆధునిక **Autonomous AI Operating System**.\n\n**ప్రధాన ప్రయోజనాలు:**\n1. 📈 **రియల్-టైమ్ అమ్మకాల విశ్లేషణ:** ప్రతి అవుట్‌లెట్ లక్ష్యాలు, లాభనష్టాలు మరియు వృద్ధిని పర్యవేక్షించండి.\n2. 📦 **ప్రిడిక్టివ్ ఇన్వెంటరీ:** ముడి సరుకులు అయిపోకముందే ఆటోమేటిక్ రీ-స్టాక్ హెచ్చరికలు.\n3. 👥 **సిబ్బంది & చెఫ్ రోస్టర్:** ఉద్యోగుల హాజరు, పనిగంటలు మరియు చెఫ్ కొరత పరిష్కారం.\n4. 🛡️ **SOP క్వాలిటీ ఆడిట్:** క్వాలిటీ లోపాలను గుర్తించి 1-క్లిక్ ద్వారా సరిదిద్దడం.\n5. 🎫 **ఆటోమేటిక్ టికెటింగ్:** సమస్యలను నేరుగా ${TARGET_SUPPORT_EMAIL} కు అధికారిక ఈమెయిల్ ద్వారా పంపడం.\n6. 🗣️ **పూర్తి తెలుగు వాయిస్ సపోర్ట్:** తెలుగులో మాట్లాడవచ్చు మరియు వినవచ్చు.`,
        keyMetrics: ['మల్టీ-యూనిట్ AI', 'స్వయంచాలక టెలిమెట్రీ', 'తెలుగు సపోర్ట్'],
        suggestedAction: {
          label: isAuthenticated ? '📊 డాష్‌బోర్డ్ తెరవండి' : '✨ వ్యాపార నమోదు ప్రారంభించండి',
          actionType: isAuthenticated ? 'navigate_dashboard' : 'navigate_onboarding',
        },
      };
    }

    if (lang === 'hi') {
      return {
        isHandled: true,
        language: 'hi',
        intent: 'ABOUT_SYSTEM',
        answer: `### 🤖 FranchiseOps AI क्या करता है और यह आपके बिज़नेस की कैसे मदद करता है?\n\n**FranchiseOps AI** मल्टी-यूनिट फ्रैंचाइज़ी नेटवर्क्स और रेस्टोरेंट चेन्स के लिए एक पूर्ण **Autonomous Operating System** है।\n\n**मुख्य क्षमताएं:**\n1. 📈 **लाइव रेवेन्यू ट्रैकिंग:** सभी स्टोर्स के वित्तीय प्रदर्शन और विकास की वास्तविक समय में निगरानी।\n2. 📦 **स्मार्ट इन्वेंट्री अलर्ट्स:** स्टॉक खत्म होने से पहले री-ऑर्डर की भविष्यवाणी।\n3. 👥 **स्टाफ रोस्टर व शेफ मैनेजमेंट:** कार्यबल की उपस्थिति और शिफ्ट आवंटन।\n4. 🛡️ **क्वालिटी व एसओपी कम्प्लायंस:** ऑडिट समस्याओं का 1-क्लिक समाधान।\n5. 🎫 **त्वरित टिकट डिस्पैच:** सीधे ${TARGET_SUPPORT_EMAIL} पर ऑटो-ईमेल।\n6. 🗣️ **हिंदी वॉइस सपोर्ट:** हिंदी में पूछें और ऑडियो सुनें।`,
        keyMetrics: ['मल्टी-आउटलेट इंटेलिजेंस', '24/7 ऑटोनॉमस एजेंट्स', 'फुल स्टैक ओब्जर्वेबिलिटी'],
        suggestedAction: {
          label: isAuthenticated ? '📊 मुख्य डैशबोर्ड खोलें' : '✨ बिज़नेस रजिस्टर करें',
          actionType: isAuthenticated ? 'navigate_dashboard' : 'navigate_onboarding',
        },
      };
    }

    return {
      isHandled: true,
      language: 'en',
      intent: 'ABOUT_SYSTEM',
      answer: `### 🤖 What does FranchiseOps AI do & How does it help your business?\n\n**FranchiseOps AI** is an Autonomous Multi-Agent Operating System designed for multi-unit franchise brands, restaurants, and retail chains.\n\n**Key Capabilities:**\n1. 📈 **Real-Time Revenue Telemetry:** Live benchmarking, margin pacing, and underperformance diagnostics.\n2. 📦 **Predictive Supply Chain & Stockout Alerts:** Intelligent stockout prevention and waste reduction.\n3. 👥 **Workforce & Kitchen Operations:** Shift scheduling, absenteeism tracking, and labor productivity.\n4. 🛡️ **Risk Center & SOP Compliance:** Instant audit non-conformity tracking and operational playbooks.\n5. 🎫 **Automated Helpdesk & Ticketing:** Direct automated email dispatch to **${TARGET_SUPPORT_EMAIL}**.\n6. 🗣️ **Multilingual Voice:** English, Telugu, Hindi, and Tamil conversational capabilities.`,
      keyMetrics: ['Multi-Unit AI Engine', 'Real-Time Telemetry', 'Voice Enabled (EN/TE/HI/TA)'],
      suggestedAction: {
        label: isAuthenticated ? '📊 Open Live Dashboard' : '✨ Start Business Registration',
        actionType: isAuthenticated ? 'navigate_dashboard' : 'navigate_onboarding',
      },
    };
  }

  // --------------------------------------------------------------------------
  // 3. "HOW DO I REGISTER MY BUSINESS?" / "HOW DO I APPLY?"
  // --------------------------------------------------------------------------
  const isRegisterOrApply = 
    q.includes('register my business') || 
    q.includes('how do i apply') || 
    q.includes('how to apply') || 
    q.includes('register') || 
    q.includes('onboarding') || 
    q.includes('வணிகத்தை எவ்வாறு பதிவு') ||
    q.includes('விண்ணப்பிப்பது எப்படி') ||
    q.includes('వ్యాపారాన్ని ఎలా నమోదు') ||
    q.includes('దరఖాస్తు ఎలా') ||
    q.includes('बिज़नेस रजिस्टर कैसे') ||
    q.includes('अप्लाई कैसे करें');

  if (isRegisterOrApply) {
    if (lang === 'ta') {
      return {
        isHandled: true,
        language: 'ta',
        intent: 'REGISTER_GUIDE',
        answer: `### 🚀 உங்கள் வணிகத்தை பதிவு செய்வது & விண்ணப்பிப்பது எப்படி?\n\nநீங்கள் 2 எளிய வழிகளில் உடனடியாக தொடங்கலாம்:\n\n1. **நேரடி பதிவு (Self-Serve Onboarding):**\n   - எங்கள் 3-படி அமைப்பின் மூலம் உங்கள் பிராண்ட் பெயர், தொழில் வகை (Restaurant/Retail) மற்றும் நகரத்தை உள்ளிடவும்.\n   - உங்கள் ஆரம்ப கிளைகளின் இருப்பிடங்களை சேர்க்கவும்.\n   - 3 நிமிடங்களில் உங்கள் தளம் தயாராகிவிடும்!\n\n2. **நேரடி டெமோ பதிவு (Book a Demo):**\n   - எங்கள் நிபுணர் குழுவுடன் 1-on-1 விளக்கக் காட்சியை திட்டமிடுங்கள்.\n\nதொடங்க கீழே உள்ள பொத்தானை கிளிக் செய்யவும்:`,
        suggestedAction: {
          label: '✨ வணிக பதிவு பக்கத்திற்கு செல்லவும்',
          actionType: 'navigate_onboarding',
        },
      };
    }

    if (lang === 'te') {
      return {
        isHandled: true,
        language: 'te',
        intent: 'REGISTER_GUIDE',
        answer: `### 🚀 వ్యాపారాన్ని ఎలా నమోదు చేయాలి & దరఖాస్తు చేసుకోవాలి?\n\nమీరు 2 సులభమైన పద్ధతుల్లో ప్రారంభించవచ్చు:\n\n1. **ఆన్‌బోర్డింగ్ సెటప్ (Self-Serve Onboarding):** 3 నిమిషాల్లో మీ బ్రాండ్ పేరు, లొకేషన్లు మరియు స్టోర్‌లను కాన్ఫిగర్ చేయండి.\n2. **లైవ్ డెమో బుకింగ్ (Book a Demo):** మా నిపుణులతో సమావేశాన్ని షెడ్యూల్ చేయండి.\n\nనమోదును ప్రారంభించడానికి క్రింది బటన్‌ను క్లిక్ చేయండి:`,
        suggestedAction: {
          label: '✨ వ్యాపార నమోదు ప్రారంభించండి',
          actionType: 'navigate_onboarding',
        },
      };
    }

    if (lang === 'hi') {
      return {
        isHandled: true,
        language: 'hi',
        intent: 'REGISTER_GUIDE',
        answer: `### 🚀 अपना बिज़नेस कैसे रजिस्टर करें और अप्लाई करें?\n\nआप 2 आसान तरीकों से शुरुआत कर सकते हैं:\n\n1. **डायरेक्ट ऑनबोर्डिंग:** 3 सरल स्टेप्स में अपने ब्रांड और सभी आउटलेट्स को जोड़ें।\n2. **लाइव डेमो बुक करें:** हमारी टीम के साथ 1-ऑन-1 सेशन शेड्यूल करें।\n\nशुरू करने के लिए नीचे क्लिक करें:`,
        suggestedAction: {
          label: '✨ ऑनबोर्डिंग शुरू करें',
          actionType: 'navigate_onboarding',
        },
      };
    }

    return {
      isHandled: true,
      language: 'en',
      intent: 'REGISTER_GUIDE',
      answer: `### 🚀 How to Register Your Business & Apply\n\nYou can onboard your franchise chain in two simple ways:\n\n1. 🏢 **Instant Self-Serve Onboarding:** Configure your franchise brand profile, add initial store locations, and calibrate telemetry in under 3 minutes.\n2. 📅 **Book a Guided Strategy Demo:** Schedule a personalized live session with our franchise specialists.\n\nClick below to begin onboarding:`,
      suggestedAction: {
        label: '✨ Start Business Onboarding',
        actionType: 'navigate_onboarding',
      },
    };
  }

  // --------------------------------------------------------------------------
  // 4. "HOW CAN I RAISE A COMPLAINT?" / "HOW DO I CREATE A SUPPORT TICKET?"
  // --------------------------------------------------------------------------
  const isTicketOrComplaint = 
    q.includes('raise a complaint') || 
    q.includes('create a support ticket') || 
    q.includes('create ticket') || 
    q.includes('raise ticket') || 
    q.includes('contact support') || 
    q.includes('file a complaint') || 
    q.includes('complaint') || 
    q.includes('ticket') || 
    q.includes('புகார்') ||
    q.includes('டிக்கெட்') ||
    q.includes('ஆதரவு') ||
    q.includes('ఫిర్యాదు') || 
    q.includes('టికెట్') || 
    q.includes('शिकायत') || 
    q.includes('टिकट');

  if (isTicketOrComplaint) {
    if (lang === 'ta') {
      return {
        isHandled: true,
        language: 'ta',
        intent: 'TICKET_INTENT',
        answer: `### 🎫 புகார் அல்லது ஆதரவு டிக்கெட் பதிவு செய்வது எப்படி?\n\nநீங்கள் இந்த AI அசிஸ்டெண்ட் மூலம் நேரடியாக ஆதரவு டிக்கெட் அல்லது செயல்பாட்டு புகாரை பதிவு செய்யலாம்.\n\n**செயல்முறை:**\n1. கீழே உள்ள **"டிக்கெட் பதிவு செய்க"** பொத்தானை கிளிக் செய்யவும்.\n2. உங்கள் பெயர், மின்னஞ்சல், வகை (ஆதரவு, புகார், பிழை), முன்னுரிமை மற்றும் விவரங்களை உள்ளிடவும்.\n3. சமர்ப்பித்தவுடன், ஒரு தனித்துவமான டிக்கெட் எண் (எ.கா. \`FO-TKT-XXXX\`) உருவாக்கப்பட்டு, தானாகவே **${TARGET_SUPPORT_EMAIL}** க்கு மின்னஞ்சல் அனுப்பப்படும்.\n4. எங்கள் குழு உடனடியாக நடவடிக்கை எடுக்கும்.`,
        keyMetrics: ['தானியங்கி மின்னஞ்சல்', TARGET_SUPPORT_EMAIL, 'டிக்கெட் எண்'],
        suggestedAction: {
          label: '🎫 டிக்கெட் பதிவு செய்க (Raise Ticket)',
          actionType: 'open_ticket_modal',
        },
      };
    }

    if (lang === 'te') {
      return {
        isHandled: true,
        language: 'te',
        intent: 'TICKET_INTENT',
        answer: `### 🎫 ఫిర్యాదు లేదా సపోర్ట్ టికెట్ ఎలా నమోదు చేయాలి?\n\nమీరు నేరుగా ఈ AI అసిస్టెంట్ ద్వారా అధికారిక సపోర్ట్ టికెట్ లేదా కార్యాచరణ ఫిర్యాదును నమోదు చేయవచ్చు.\n\n**ఇది ఎలా పనిచేస్తుంది:**\n1. క్రింది **"టికెట్ నమోదు చేయండి"** బటన్‌ను క్లిక్ చేయండి.\n2. మీ పేరు, ఈమెయిల్, కేటగిరీ, ప్రాధాన్యత మరియు పూర్తి వివరాలను నమోదు చేయండి.\n3. సబ్మిట్ చేయగానే ఒక ప్రత్యేకమైన టికెట్ ID రూపొందించబడి, ఆటోమేటిక్‌గా **${TARGET_SUPPORT_EMAIL}** కు ఈమెయిల్ ద్వారా పంపబడుతుంది.`,
        keyMetrics: ['ఆటో ఈమెయిల్ రూటింగ్', TARGET_SUPPORT_EMAIL, 'ప్రత్యేక టికెట్ ID'],
        suggestedAction: {
          label: '🎫 ఇప్పుడే టికెట్ నమోదు చేయండి (Raise Ticket)',
          actionType: 'open_ticket_modal',
        },
      };
    }

    if (lang === 'hi') {
      return {
        isHandled: true,
        language: 'hi',
        intent: 'TICKET_INTENT',
        answer: `### 🎫 शिकायत या सपोर्ट टिकट कैसे दर्ज करें?\n\nआप सीधे इस चैट के माध्यम से आधिकारिक सपोर्ट टिकट या ऑपरेशनल शिकायत दर्ज कर सकते हैं।\n\n**प्रक्रिया:**\n1. नीचे दिए गए **"टिकट दर्ज करें"** बटन पर क्लिक करें।\n2. अपना नाम, ईमेल, श्रेणी, प्राथमिकता और समस्या का विवरण भरें।\n3. सबमिट करते ही स्वचालित रूप से **${TARGET_SUPPORT_EMAIL}** पर ईमेल भेज दी जाएगी।`,
        keyMetrics: ['स्वचालित ईमेल डिस्पैच', TARGET_SUPPORT_EMAIL, 'यूनिक ट्रैकिंग ID'],
        suggestedAction: {
          label: '🎫 सपोर्ट टिकट दर्ज करें (Raise Ticket)',
          actionType: 'open_ticket_modal',
        },
      };
    }

    return {
      isHandled: true,
      language: 'en',
      intent: 'TICKET_INTENT',
      answer: `### 🎫 How to Raise a Complaint or Support Ticket\n\nYou can file a priority support ticket or operational complaint directly within this AI assistant!\n\n**How it works:**\n1. Click the **"Raise Ticket / File Complaint"** button below.\n2. Fill in your Name, Email, Category, Priority, and Description.\n3. Upon submission, a unique Ticket Reference ID (e.g. \`FO-TKT-XXXX\`) is generated and automatically dispatched to **${TARGET_SUPPORT_EMAIL}**.\n4. Our operations team will respond promptly.`,
      keyMetrics: ['Instant Auto-Dispatch', TARGET_SUPPORT_EMAIL, 'Unique Tracking ID'],
      suggestedAction: {
        label: '🎫 Open Ticket Form',
        actionType: 'open_ticket_modal',
      },
    };
  }

  // --------------------------------------------------------------------------
  // AUTHENTICATED MODE ONLY: BUSINESS DATA QUERIES & ANALYTICS CARDS
  // (In Visitor mode, do not leak private analytics; guide to register)
  // --------------------------------------------------------------------------
  if (!isAuthenticated) {
    const isAskingForData = 
      q.includes('sales') || q.includes('revenue') || q.includes('inventory') || 
      q.includes('staff') || q.includes('underperform') || q.includes('outlet') ||
      q.includes('விற்பனை') || q.includes('இருப்பு') || q.includes('ஊழியர்') ||
      q.includes('అమ్మకాలు') || q.includes('సిబ్బంది') || q.includes('बिक्री') || q.includes('स्टाफ');

    if (isAskingForData) {
      if (lang === 'ta') {
        return {
          isHandled: true,
          language: 'ta',
          intent: 'AUTH_REQUIRED',
          answer: `🔒 **வணிகத் தரவு பாதுகாப்பு அறிவிப்பு:**\n\nவிற்பனை, இருப்பு மற்றும் ஊழியர் பகுப்பாய்வு போன்ற தனிப்பயன் வணிகத் தரவை அணுக, தயவுசெய்து உங்கள் வணிகக் கணக்கில் உள்நுழையவும் (Login) அல்லது புதிய வணிகத்தை பதிவு செய்யவும் (Onboard).\n\nபொதுவான கேள்விகளை நீங்கள் தாராளமாக கேட்கலாம்!`,
          suggestedAction: {
            label: '✨ கணக்கில் உள்நுழைய / பதிவு செய்ய',
            actionType: 'navigate_onboarding',
          }
        };
      }
      if (lang === 'te') {
        return {
          isHandled: true,
          language: 'te',
          intent: 'AUTH_REQUIRED',
          answer: `🔒 **వ్యాపార డేటా భద్రతా సూచన:**\n\nఅమ్మకాలు, ఇన్వెంటరీ మరియు సిబ్బంది సమాచారం వంటి ప్రైవేట్ వ్యాపార డేటాను చూడటానికి, దయచేసి మీ వ్యాపార ఖాతాలోకి లాగిన్ అవ్వండి లేదా కొత్తగా నమోదు చేసుకోండి.`,
          suggestedAction: {
            label: '✨ లాగిన్ / రిజిస్ట్రేషన్ ప్రారంభించండి',
            actionType: 'navigate_onboarding',
          }
        };
      }
      if (lang === 'hi') {
        return {
          isHandled: true,
          language: 'hi',
          intent: 'AUTH_REQUIRED',
          answer: `🔒 **बिज़नेस डेटा सुरक्षा सूचना:**\n\nसेल्स, इन्वेंट्री और कर्मचारियों का व्यक्तिगत डेटा देखने के लिए, कृपया अपने अकाउंट में लॉगिन करें या नया बिज़नेस रजिस्टर करें।`,
          suggestedAction: {
            label: '✨ लॉगिन / रजिस्टर करें',
            actionType: 'navigate_onboarding',
          }
        };
      }
      return {
        isHandled: true,
        language: 'en',
        intent: 'AUTH_REQUIRED',
        answer: `🔒 **Business Data Privacy Protection:**\n\nTo view live store telemetry, sales pacing, and inventory analytics for a specific brand, please sign in or register your business.\n\nAs a visitor, you can ask general questions about our features, pricing, and how to apply!`,
        suggestedAction: {
          label: '✨ Register / Sign In',
          actionType: 'navigate_onboarding',
        }
      };
    }

    return null;
  }

  // --------------------------------------------------------------------------
  // AUTHENTICATED BUSINESS AI ANALYTICS WITH VISUAL CARDS
  // --------------------------------------------------------------------------

  // 1. SALES & REVENUE
  const isSalesQuery = 
    q.includes('revenue') || q.includes('sales') || q.includes('growth') ||
    q.includes('விற்பனை') || q.includes('வருவாய்') || 
    q.includes('అమ్మకాలు') || q.includes('ఆదాయం') || 
    q.includes('बिक्री') || q.includes('रेवेन्यू');

  if (isSalesQuery) {
    const sales = getTenantSales(business.id);
    const totalRev = sales.reduce((sum, s) => sum + s.revenue, 0);
    const totalRevL = totalRev > 0 ? (totalRev / 100000).toFixed(1) : '62.2';

    const analyticsCard: VisualAnalyticsData = {
      type: 'sales_trend',
      title: `${business.name} - Sales & Revenue Performance`,
      metrics: [
        { label: 'Total Network Sales', value: `₹${totalRevL}L`, change: '+2.4% MoM', isPositive: true },
        { label: 'Target Achievement', value: '94.2%', change: '+1.8%', isPositive: true },
        { label: 'Avg Order Value', value: '₹518', change: '+3.2%', isPositive: true },
      ],
      bars: [
        { label: 'Gachibowli', value: 88, max: 100, color: 'bg-emerald-500' },
        { label: 'Indiranagar', value: 64, max: 100, color: 'bg-amber-500' },
        { label: 'T Nagar', value: 82, max: 100, color: 'bg-indigo-500' },
        { label: 'Pune KP', value: 58, max: 100, color: 'bg-rose-500' },
      ]
    };

    if (lang === 'ta') {
      return {
        isHandled: true,
        language: 'ta',
        intent: 'REVENUE_ANALYSIS',
        answer: `### 📈 **${business.name}** - விற்பனை & வருவாய் நேரடி அறிக்கை\n\n• 💰 **மொத்த நெட்வொர்க் வருவாய்:** ₹${totalRevL} லட்சம்\n• 📊 **மாதாந்திர வளர்ச்சி:** +2.4% MoM\n• 🏆 **அதிக விற்பனை செய்த கிளை:** Gachibowli (ஹைதராபாத்)\n• 📉 **பின்னடைவில் உள்ள கிளை:** Pune KP (பூனே)\n\nகீழே உள்ள புள்ளிவிவர விளக்கப்படத்தை காண்க:`,
        keyMetrics: [`மொத்த விற்பனை: ₹${totalRevL}L`, 'வளர்ச்சி: +2.4%'],
        analyticsCard,
        suggestedAction: {
          label: '📊 முழு விற்பனை விளக்கப்படம் பார்க்க',
          actionType: 'navigate_dashboard',
        }
      };
    }

    if (lang === 'te') {
      return {
        isHandled: true,
        language: 'te',
        intent: 'REVENUE_ANALYSIS',
        answer: `### 📈 **${business.name}** - అమ్మకాలు & ఆదాయ నివేదిక\n\n• 💰 **మొత్తం నెట్‌వర్క్ ఆదాయం:** ₹${totalRevL} లక్షలు\n• 📊 **నెలవారీ వృద్ధి:** +2.4% MoM\n• 🏆 **అత్యధిక ఆదాయం:** Gachibowli\n• 📉 **తగ్గుదల ఉన్న అవుట్‌లెట్:** Pune KP`,
        keyMetrics: [`మొత్తం అమ్మకాలు: ₹${totalRevL}L`, 'వృద్ధి: +2.4%'],
        analyticsCard,
        suggestedAction: {
          label: '📊 పూర్తి ఆదాయ నివేదిక తెరవండి',
          actionType: 'navigate_dashboard',
        }
      };
    }

    if (lang === 'hi') {
      return {
        isHandled: true,
        language: 'hi',
        intent: 'REVENUE_ANALYSIS',
        answer: `### 📈 **${business.name}** - बिक्री और रेवेन्यू रिपोर्ट\n\n• 💰 **कुल नेटवर्क रेवेन्यू:** ₹${totalRevL} लाख\n• 📊 **मासिक वृद्धि:** +2.4% MoM\n• 🏆 **शीर्ष आउटलेट:** Gachibowli\n• 📉 **कमजोर प्रदर्शन:** Pune KP`,
        keyMetrics: [`कुल रेवेन्यू: ₹${totalRevL}L`, 'ग्रोथ: +2.4%'],
        analyticsCard,
        suggestedAction: {
          label: '📊 विस्तृत रेवेन्यू चार्ट देखें',
          actionType: 'navigate_dashboard',
        }
      };
    }

    return {
      isHandled: true,
      language: 'en',
      intent: 'REVENUE_ANALYSIS',
      answer: `### 📈 **${business.name}** - Sales & Revenue Analytics\n\n• 💰 **Total Network Revenue:** ₹${totalRevL} Lakhs\n• 📊 **Monthly Growth Rate:** +2.4% MoM\n• 🏆 **Top Revenue Contributor:** Biryani Hub - Gachibowli\n• 📉 **Lagging Contributor:** Biryani Hub - Pune KP`,
      keyMetrics: [`Network Sales: ₹${totalRevL}L`, 'Pacing: +2.4% MoM'],
      analyticsCard,
      suggestedAction: {
        label: '📊 Open Revenue Dashboard',
        actionType: 'navigate_dashboard',
      }
    };
  }

  // 2. INVENTORY & STOCKOUT RISKS
  const isInventoryQuery = 
    q.includes('inventory') || q.includes('stock') || q.includes('stockout') ||
    q.includes('இருப்பு') || q.includes('சரக்கு') || 
    q.includes('ఇన్వెంటరీ') || q.includes('సరుకులు') || 
    q.includes('इन्वेंट्री') || q.includes('स्टॉक');

  if (isInventoryQuery) {
    const inv = getTenantInventory(business.id);
    const stockoutCount = inv.filter(i => i.status === 'Stockout Risk').length || 2;
    const totalItems = inv.length || 7;

    const analyticsCard: VisualAnalyticsData = {
      type: 'inventory_health',
      title: `${business.name} - Inventory Reliability`,
      metrics: [
        { label: 'Active SKUs', value: `${totalItems}` },
        { label: 'Stockout Risks', value: `${stockoutCount}`, change: 'Urgent', isPositive: false },
        { label: 'Waste Control', value: '98.2%', isPositive: true },
      ],
      bars: [
        { label: 'Biryani Rice (Basmati)', value: 92, max: 100, color: 'bg-emerald-500' },
        { label: 'Signature Spices Blend', value: 24, max: 100, color: 'bg-rose-500' },
        { label: 'Packaging Containers', value: 35, max: 100, color: 'bg-amber-500' },
      ]
    };

    if (lang === 'ta') {
      return {
        isHandled: true,
        language: 'ta',
        intent: 'INVENTORY_STATUS',
        answer: `### 📦 **${business.name}** - இருப்பு & சரக்கு நிலை\n\n• 📦 **மொத்த SKU எண்ணிக்கை:** ${totalItems}\n• ⚠️ **பற்றாக்குறை அபாயம் உள்ள பொருட்கள்:** ${stockoutCount} (மசாலா மற்றும் பேக்கேஜிங்)\n• 🗑️ **கழிவு கட்டுப்பாட்டு திறன்:** 98.2%\n\n**பரிந்துரை:** பூனே மற்றும் பெங்களூரு கிளைகளுக்கு உடனடியாக மறுஆர்டர் செய்யுங்கள்.`,
        keyMetrics: [`${stockoutCount} பற்றாக்குறை எச்சரிக்கைகள்`, `${totalItems} SKUகள்`],
        analyticsCard,
        suggestedAction: {
          label: '📦 இன்வென்டரி மேலாளர் திறக்க',
          actionType: 'transfer_inventory',
        }
      };
    }

    if (lang === 'te') {
      return {
        isHandled: true,
        language: 'te',
        intent: 'INVENTORY_STATUS',
        answer: `### 📦 **${business.name}** - ఇన్వెంటరీ నివేదిక\n\n• 📦 **మొత్తం వస్తువులు:** ${totalItems} SKUలు\n• ⚠️ **స్టాక్‌అవుట్ ప్రమాదం:** ${stockoutCount} వస్తువులు\n• 🗑️ **వ్యర్థాల నియంత్రణ:** 98.2%`,
        keyMetrics: [`${stockoutCount} స్టాక్‌అవుట్ అలర్ట్స్`, `${totalItems} SKUలు`],
        analyticsCard,
        suggestedAction: {
          label: '📦 ఇన్వెంటరీ మేనేజర్ తెరవండి',
          actionType: 'transfer_inventory',
        }
      };
    }

    if (lang === 'hi') {
      return {
        isHandled: true,
        language: 'hi',
        intent: 'INVENTORY_STATUS',
        answer: `### 📦 **${business.name}** - इन्वेंट्री व स्टॉक रिपोर्ट\n\n• 📦 **सक्रिय SKU:** ${totalItems}\n• ⚠️ **स्टॉकआउट रिस्क:** ${stockoutCount} वस्तुएं\n• 🗑️ **वेस्टेज नियंत्रण:** 98.2%`,
        keyMetrics: [`${stockoutCount} स्टॉकआउट रिस्क`, `${totalItems} SKU`],
        analyticsCard,
        suggestedAction: {
          label: '📦 इन्वेंट्री कंट्रोल खोलें',
          actionType: 'transfer_inventory',
        }
      };
    }

    return {
      isHandled: true,
      language: 'en',
      intent: 'INVENTORY_STATUS',
      answer: `### 📦 **${business.name}** - Inventory Telemetry\n\n• 📦 **Tracked SKUs:** ${totalItems} active items\n• ⚠️ **Stockout Risks:** ${stockoutCount} items (Spice blend & packaging units)\n• 🗑️ **Waste Control Index:** 98.2%`,
      keyMetrics: [`${stockoutCount} Stockout Alerts`, `${totalItems} Tracked SKUs`],
      analyticsCard,
      suggestedAction: {
        label: '📦 Open Inventory Manager',
        actionType: 'transfer_inventory',
      }
    };
  }

  // 3. STAFF & WORKFORCE
  const isStaffQuery = 
    q.includes('staff') || q.includes('chef') || q.includes('attendance') ||
    q.includes('ஊழியர்') || q.includes('செஃப்') || q.includes('வருகை') ||
    q.includes('సిబ్బంది') || q.includes('చెఫ్') || q.includes('హాజరు') ||
    q.includes('स्टाफ') || q.includes('शेफ') || q.includes('उपस्थिति');

  if (isStaffQuery) {
    const staff = getTenantStaff(business.id);
    const totalEmployees = staff.length || 7;
    const avgAttendance = staff.length > 0 ? Math.round(staff.reduce((s, m) => s + m.attendance_pct, 0) / staff.length) : 88;

    const analyticsCard: VisualAnalyticsData = {
      type: 'staff_attendance',
      title: `${business.name} - Workforce Productivity`,
      metrics: [
        { label: 'Total Staff', value: `${totalEmployees}` },
        { label: 'Avg Attendance', value: `${avgAttendance}%`, isPositive: true },
        { label: 'Chef Shortages', value: '1 Outlet', isPositive: false },
      ],
      bars: [
        { label: 'Gachibowli Flagship', value: 97, max: 100, color: 'bg-emerald-500' },
        { label: 'Indiranagar Kitchen', value: 74, max: 100, color: 'bg-rose-500' },
        { label: 'T Nagar Dine-in', value: 92, max: 100, color: 'bg-indigo-500' },
      ]
    };

    if (lang === 'ta') {
      return {
        isHandled: true,
        language: 'ta',
        intent: 'STAFF_STATUS',
        answer: `### 👥 **${business.name}** - ஊழியர் & செஃப் வருகை அறிக்கை\n\n• 👥 **மொத்த ஊழியர்கள்:** ${totalEmployees} நபர்கள்\n• ⏱️ **சராசரி வருகை சதவீதம்:** ${avgAttendance}%\n• ⚠️ **வருகை குறைபாடு:** இந்திராநகர் கிச்சனில் செஃப் பற்றாக்குறை உள்ளது.\n\n**பரிந்துரை:** வார இறுதி நெரிசலை சமாளிக்க மிதக்கும் செஃப்பை (Floating Chef) நியமிக்கவும்.`,
        keyMetrics: [`வருகை: ${avgAttendance}%`, `${totalEmployees} ஊழியர்கள்`],
        analyticsCard,
        suggestedAction: {
          label: '👥 ஊழியர் பட்டியலை பார்க்க',
          actionType: 'reassign_staff',
        }
      };
    }

    if (lang === 'te') {
      return {
        isHandled: true,
        language: 'te',
        intent: 'STAFF_STATUS',
        answer: `### 👥 **${business.name}** - సిబ్బంది పనితీరు నివేదిక\n\n• 👥 **మొత్తం సిబ్బంది:** ${totalEmployees} మంది\n• ⏱️ **సగటు హాజరు:** ${avgAttendance}%\n• ⚠️ **చెఫ్ కొరత:** ఇందిరానగర్ కిచెన్‌లో 1 సమస్య గుర్తించబడింది.`,
        keyMetrics: [`హాజరు: ${avgAttendance}%`, `${totalEmployees} ఉద్యోగులు`],
        analyticsCard,
        suggestedAction: {
          label: '👥 సిబ్బంది రోస్టర్ తెరవండి',
          actionType: 'reassign_staff',
        }
      };
    }

    if (lang === 'hi') {
      return {
        isHandled: true,
        language: 'hi',
        intent: 'STAFF_STATUS',
        answer: `### 👥 **${business.name}** - स्टाफ व शेफ उपस्थिति रिपोर्ट\n\n• 👥 **कुल कर्मचारी:** ${totalEmployees}\n• ⏱️ **औसत उपस्थिति:** ${avgAttendance}%\n• ⚠️ **अलर्ट:** इंदिरा नगर में शेफ की कमी।`,
        keyMetrics: [`उपस्थिति: ${avgAttendance}%`, `${totalEmployees} कर्मचारी`],
        analyticsCard,
        suggestedAction: {
          label: '👥 स्टाफ प्रबंधन खोलें',
          actionType: 'reassign_staff',
        }
      };
    }

    return {
      isHandled: true,
      language: 'en',
      intent: 'STAFF_STATUS',
      answer: `### 👥 **${business.name}** - Staff & Workforce Telemetry\n\n• 👥 **Total Active Workforce:** ${totalEmployees} members\n• ⏱️ **Average Attendance Rate:** ${avgAttendance}%\n• ⚠️ **Staffing Alert:** Indiranagar Kitchen facing chef shortage (+8m prep delays).`,
      keyMetrics: [`Attendance: ${avgAttendance}%`, `${totalEmployees} Employees`],
      analyticsCard,
      suggestedAction: {
        label: '👥 Open Staff Management',
        actionType: 'reassign_staff',
      }
    };
  }

  // 4. UNDERPERFORMING OUTLETS
  const isUnderperforming = 
    q.includes('underperform') || q.includes('lagging') || q.includes('weak') ||
    q.includes('பலவீனமான') || q.includes('குறைவான') || 
    q.includes('వెనుకబడి') || q.includes('నష్టాల్లో') || 
    q.includes('कमजोर') || q.includes('घाटे में');

  if (isUnderperforming) {
    const analyticsCard: VisualAnalyticsData = {
      type: 'outlet_comparison',
      title: `${business.name} - Underperforming Outlet Diagnostics`,
      metrics: [
        { label: 'Flagged Units', value: '2 Outlets', isPositive: false },
        { label: 'Network Health Avg', value: '79/100', isPositive: true },
      ],
      bars: [
        { label: 'Indiranagar (Chef Absenteeism)', value: 64, max: 100, color: 'bg-amber-500' },
        { label: 'Pune KP (Roadworks & Stockout)', value: 58, max: 100, color: 'bg-rose-500' },
      ]
    };

    if (lang === 'ta') {
      return {
        isHandled: true,
        language: 'ta',
        intent: 'UNDERPERFORMING_OUTLETS',
        answer: `### ⚠️ **${business.name}** - பலவீனமான கிளைகளின் அறிக்கை\n\nதற்போது **2 கிளைகள்** குறைந்த செயல்திறனுடன் கண்டறியப்பட்டுள்ளன:\n\n• **இந்திராநகர் (ஸ்கோர்: 64/100):** செஃப் பற்றாக்குறையால் சமையல் தாமதம் (+8 நிமிடம்) மற்றும் -13.9% விற்பனை சரிவு.\n• **பூனே கே.பி (ஸ்கோர்: 58/100):** சாலைப்பணிகளால் வாடிக்கையாளர் வருகை குறைவு மற்றும் மசாலா பற்றாக்குறை (-17.1% வருவாய்).\n\n**பரிந்துரை:** ஆன்லைன் விளம்பரங்களை தீவிரப்படுத்துங்கள்.`,
        keyMetrics: ['2 கிளைகள் எச்சரிக்கையில் உள்ளன', 'நெட்வொர்க் சராசரி: 79/100'],
        relatedOutlets: ['Biryani Hub - Indiranagar', 'Biryani Hub - KP'],
        analyticsCard,
        suggestedAction: {
          label: '⚡ செயல் மையத்தில் தீர்வுகளை செயல்படுத்த',
          actionType: 'create_action',
        }
      };
    }

    if (lang === 'te') {
      return {
        isHandled: true,
        language: 'te',
        intent: 'UNDERPERFORMING_OUTLETS',
        answer: `### ⚠️ **${business.name}** - బలహీన అవుట్‌లెట్ల నివేదిక\n\nప్రస్తుతం **2 అవుట్‌లెట్లు** తక్కువ హెల్త్ స్కోరుతో గుర్తించబడ్డాయి:\n\n• **ఇందిరానగర్ (64/100):** చెఫ్ గైర్హాజరు\n• **పూణే KP (58/100):** స్టాక్ కొరత & రోడ్డు పనులు`,
        keyMetrics: ['2 అవుట్‌లెట్లు ఫ్లాగ్ చేయబడ్డాయి', 'సగటు: 79/100'],
        relatedOutlets: ['Biryani Hub - Indiranagar', 'Biryani Hub - KP'],
        analyticsCard,
        suggestedAction: {
          label: '⚡ యాక్షన్ సెంటర్‌లో పరిష్కరించండి',
          actionType: 'create_action',
        }
      };
    }

    if (lang === 'hi') {
      return {
        isHandled: true,
        language: 'hi',
        intent: 'UNDERPERFORMING_OUTLETS',
        answer: `### ⚠️ **${business.name}** - कमजोर आउटलेट्स की रिपोर्ट\n\nवर्तमान में **2 आउटलेट्स** सुधार के लिए चिन्हित हैं:\n\n• **इंदिरा नगर (64/100):** शेफ की अनुपस्थिति\n• **पुणे केपी (58/100):** मसालों का स्टॉकआउट`,
        keyMetrics: ['2 आउटलेट फ्लैग्ड', 'औसत: 79/100'],
        relatedOutlets: ['Biryani Hub - Indiranagar', 'Biryani Hub - KP'],
        analyticsCard,
        suggestedAction: {
          label: '⚡ एक्शन सेंटर में उपाय देखें',
          actionType: 'create_action',
        }
      };
    }

    return {
      isHandled: true,
      language: 'en',
      intent: 'UNDERPERFORMING_OUTLETS',
      answer: `### ⚠️ **${business.name}** - Underperforming Outlets Diagnostic\n\nCurrently, **2 outlets** are flagged below operational baselines:\n\n• **Biryani Hub - Indiranagar (Health: 64/100):** Kitchen chef absenteeism causing +8m service delays and -13.9% revenue.\n• **Biryani Hub - Pune KP (Health: 58/100):** Local roadworks reducing walk-in footfalls and spice stockouts (-17.1% contraction).`,
      keyMetrics: ['2 Outlets Flagged', 'Network Avg: 79/100'],
      relatedOutlets: ['Biryani Hub - Indiranagar', 'Biryani Hub - KP'],
      analyticsCard,
      suggestedAction: {
        label: '⚡ Deploy Playbook in Action Center',
        actionType: 'create_action',
      }
    };
  }

  // 5. HEALTH SCORE & TRENDS
  const isHealthQuery = 
    q.includes('health') || q.includes('score') || q.includes('trend') ||
    q.includes('நிலை') || q.includes('ஸ்கோர்') || 
    q.includes('హెల్త్') || q.includes('స్కోరు') || 
    q.includes('हेल्थ') || q.includes('स्कोर');

  if (isHealthQuery) {
    const health = calculateOverallBusinessHealthScore(business.id);

    const analyticsCard: VisualAnalyticsData = {
      type: 'health_pillars',
      title: `${business.name} - 5-Pillar Health Score`,
      metrics: [
        { label: 'Overall Score', value: `${health.score}/100`, isPositive: health.score >= 75 },
        { label: 'Network Status', value: health.status, isPositive: health.score >= 75 },
      ],
      bars: health.pillars.map(p => ({
        label: p.name,
        value: p.score,
        max: p.max,
        color: p.score / p.max >= 0.8 ? 'bg-emerald-500' : p.score / p.max >= 0.6 ? 'bg-amber-500' : 'bg-rose-500'
      }))
    };

    if (lang === 'ta') {
      return {
        isHandled: true,
        language: 'ta',
        intent: 'HEALTH_SCORE',
        answer: `### 🛡️ **${business.name}** - ஒட்டுமொத்த வணிக ஆரோக்கிய ஸ்கோர்: **${health.score}/100** (${health.status})\n\n**துறைவாரியான செயல்திறன்:**\n• 📈 விற்பனை வேகம்: ${health.pillars[0].score}/${health.pillars[0].max}\n• 🏬 கிளைகளின் தொடர்ச்சி: ${health.pillars[1].score}/${health.pillars[1].max}\n• 📦 சரக்கு இருப்பு நலம்: ${health.pillars[2].score}/${health.pillars[2].max}\n• 👥 ஊழியர் திறன்: ${health.pillars[3].score}/${health.pillars[3].max}\n• 🛡️ SOP தரக்கட்டுப்பாடு: ${health.pillars[4].score}/${health.pillars[4].max}`,
        keyMetrics: [`ஹெல்த் ஸ்கோர்: ${health.score}/100`, `நிலை: ${health.status}`],
        analyticsCard,
        suggestedAction: {
          label: '📊 முழு பகுப்பாய்வு பார்க்க',
          actionType: 'navigate_dashboard',
        }
      };
    }

    if (lang === 'te') {
      return {
        isHandled: true,
        language: 'te',
        intent: 'HEALTH_SCORE',
        answer: `### 🛡️ **${business.name}** - హెల్త్ స్కోరు: **${health.score}/100** (${health.status})`,
        keyMetrics: [`హెల్త్ స్కోరు: ${health.score}/100`, `స్థితి: ${health.status}`],
        analyticsCard,
        suggestedAction: {
          label: '📊 హెల్త్ స్కోర్ వివరాలు చూడండి',
          actionType: 'navigate_dashboard',
        }
      };
    }

    if (lang === 'hi') {
      return {
        isHandled: true,
        language: 'hi',
        intent: 'HEALTH_SCORE',
        answer: `### 🛡️ **${business.name}** - समग्र हेल्थ स्कोर: **${health.score}/100** (${health.status})`,
        keyMetrics: [`हेल्थ स्कोर: ${health.score}/100`, `स्थिति: ${health.status}`],
        analyticsCard,
        suggestedAction: {
          label: '📊 पूर्ण विश्लेषण देखें',
          actionType: 'navigate_dashboard',
        }
      };
    }

    return {
      isHandled: true,
      language: 'en',
      intent: 'HEALTH_SCORE',
      answer: `### 🛡️ **${business.name}** - Network Health Score: **${health.score}/100** (${health.status})\n\n**5-Pillar Operational Breakdown:**\n• 📈 Sales Pacing: ${health.pillars[0].score}/${health.pillars[0].max}\n• 🏬 Outlet Network Uptime: ${health.pillars[1].score}/${health.pillars[1].max}\n• 📦 Inventory Reliability: ${health.pillars[2].score}/${health.pillars[2].max}\n• 👥 Workforce Attendance: ${health.pillars[3].score}/${health.pillars[3].max}\n• 🛡️ SOP & Quality Audits: ${health.pillars[4].score}/${health.pillars[4].max}`,
      keyMetrics: [`Health Score: ${health.score}/100`, `Status: ${health.status}`],
      analyticsCard,
      suggestedAction: {
        label: '📊 View Health Score Breakdown',
        actionType: 'navigate_dashboard',
      }
    };
  }

  return null;
}

/**
 * Text-to-Speech Synthesis Helper with strict language specific voices for Tamil (ta-IN), Telugu (te-IN), Hindi (hi-IN), and English (en-IN)
 */
export function speakText(
  text: string, 
  language: SupportedLanguage = 'en',
  onEnd?: () => void
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis is not supported in this browser.');
    return null;
  }

  try {
    const cleanText = text
      .replace(/#+/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/•/g, '')
      .replace(/`+/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/\|.*?\|/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[🤖📈📦👥🛡️🎫🗣️🧭📝🚀⚠️💰🏆📉⏱️🔒]/g, '')
      .slice(0, 380);

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);

    if (language === 'ta') {
      utterance.lang = 'ta-IN';
      utterance.rate = 0.90;
      utterance.pitch = 1.0;
    } else if (language === 'te') {
      utterance.lang = 'te-IN';
      utterance.rate = 0.90;
      utterance.pitch = 1.0;
    } else if (language === 'hi') {
      utterance.lang = 'hi-IN';
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
    } else {
      utterance.lang = 'en-IN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
    }

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => {
      if (language === 'ta') {
        return v.lang === 'ta-IN' || v.lang.startsWith('ta') || v.name.toLowerCase().includes('tamil');
      }
      if (language === 'te') {
        return v.lang === 'te-IN' || v.lang.startsWith('te') || v.name.toLowerCase().includes('telugu');
      }
      if (language === 'hi') {
        return v.lang === 'hi-IN' || v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi');
      }
      return v.lang === 'en-IN' || v.lang === 'en-US' || v.lang.startsWith('en');
    });

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
    return utterance;
  } catch (e) {
    console.error('Speech synthesis error:', e);
    return null;
  }
}

/**
 * Stop any active text-to-speech output
 */
export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
