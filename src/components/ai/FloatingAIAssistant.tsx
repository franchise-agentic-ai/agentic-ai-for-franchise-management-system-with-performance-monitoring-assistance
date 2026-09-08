import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  RotateCcw, 
  Maximize2, 
  Zap, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Globe, 
  Check, 
  Copy, 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  Mail, 
  Ticket, 
  Radio,
  BarChart3,
  TrendingUp,
  Package,
  Users,
  Activity,
  Lock
} from 'lucide-react';
import { FranchiseOpsLogo } from '../brand/FranchiseOpsLogo';
import { getActiveBusiness, getCurrentUser } from '../../services/tenantService';
import { 
  runBusinessAgentOrchestrator, 
  clearConversationHistory, 
  AgentStructuredOutput 
} from '../../services/businessAgentOrchestrator';
import { 
  handleSpecialGuidanceQuery, 
  getLocalizedWelcomeMessage,
  speakText, 
  stopSpeaking, 
  SupportedLanguage,
  VisualAnalyticsData
} from '../../services/multilingualAssistantService';
import { 
  submitSupportTicket, 
  TARGET_SUPPORT_EMAIL, 
  SupportTicket 
} from '../../services/ticketService';
import { BusinessProfile } from '../../types';
import { cn } from '../../lib/utils';

interface FloatingChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  language?: SupportedLanguage;
  keyMetrics?: string[];
  relatedOutlets?: string[];
  toolsCalled?: string[];
  analyticsCard?: VisualAnalyticsData;
  suggestedAction?: {
    label: string;
    actionType: string;
    payload?: any;
  };
  quickOptions?: Array<{ label: string; query: string }>;
  ticketInfo?: SupportTicket;
  isAiGenerated?: boolean;
}

export function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [business, setBusiness] = useState<BusinessProfile>(getActiveBusiness());
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState('Ready');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Selected language state: 'en' | 'te' | 'hi' | 'ta'
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('en');
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Ticket / Complaint Form State
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketCategory, setTicketCategory] = useState<'Support Ticket' | 'Operational Complaint' | 'Franchise Inquiry' | 'System Bug' | 'Urgent Escalation'>('Support Ticket');
  const [ticketName, setTicketName] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketPriority, setTicketPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('High');
  const [ticketDescription, setTicketDescription] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Detect whether current session is in Authenticated Business AI mode vs Visitor mode
  const isAuthenticated = location.pathname.startsWith('/dashboard') || currentUser !== null;

  // Generate localized initial greeting message
  const createGreeting = (lang: SupportedLanguage, isAuth: boolean): FloatingChatMessage => {
    const welcome = getLocalizedWelcomeMessage(isAuth, business.name, lang);
    return {
      id: `welcome_${lang}_${isAuth ? 'auth' : 'visitor'}`,
      sender: 'assistant',
      language: lang,
      text: welcome.text,
      timestamp: lang === 'ta' ? 'இப்போது' : lang === 'te' ? 'ఇప్పుడే' : lang === 'hi' ? 'अभी' : 'Just now',
      keyMetrics: welcome.keyMetrics,
      quickOptions: welcome.quickOptions,
      suggestedAction: {
        label: lang === 'ta' ? '🎫 ஆதரவு டிக்கெட்' : lang === 'te' ? '🎫 సపోర్ట్ టికెట్' : lang === 'hi' ? '🎫 सपोर्ट टिकट' : '🎫 Raise Support Ticket',
        actionType: 'open_ticket_modal',
      }
    };
  };

  const [messages, setMessages] = useState<FloatingChatMessage[]>([createGreeting('en', isAuthenticated)]);

  // Sync active tenant and re-evaluate auth status on route changes
  useEffect(() => {
    const handleTenantChange = () => {
      const current = getActiveBusiness();
      setBusiness(current);
    };
    const handleAuthChange = () => {
      setCurrentUser(getCurrentUser());
      setBusiness(getActiveBusiness());
    };
    window.addEventListener('franchiseops_tenant_changed', handleTenantChange);
    window.addEventListener('franchiseops_auth_changed', handleAuthChange);
    return () => {
      window.removeEventListener('franchiseops_tenant_changed', handleTenantChange);
      window.removeEventListener('franchiseops_auth_changed', handleAuthChange);
    };
  }, []);

  // When route changes or auth changes, update mode seamlessly
  useEffect(() => {
    if (messages.length === 1 && messages[0].sender === 'assistant') {
      setMessages([createGreeting(selectedLang, isAuthenticated)]);
    }
  }, [location.pathname, selectedLang, business.name, currentUser]);

  // Update language switcher handler
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    stopSpeaking();
    setIsSpeaking(false);
    setSelectedLang(newLang);

    if (messages.length === 1 && messages[0].sender === 'assistant') {
      const newGreeting = createGreeting(newLang, isAuthenticated);
      setMessages([newGreeting]);
      if (isVoiceOutputEnabled && isOpen) {
        triggerVoiceResponse(newGreeting.text, newLang);
      }
    } else {
      const noticeText = newLang === 'ta'
        ? `🔄 மொழி **தமிழ்** ஆக மாற்றப்பட்டது. உங்கள் அடுத்த கேள்விகளுக்கு தமிழில் பதில்கள் வழங்கப்படும்.`
        : newLang === 'te'
        ? `🔄 భాష **తెలుగు** లోకి మార్చబడింది. మీ తదుపరి ప్రశ్నలకు తెలుగులో సమాధానాలు ఇవ్వబడతాయి.`
        : newLang === 'hi'
        ? `🔄 भाषा बदलकर **हिंदी** कर दी गई है। आपके अगले प्रश्नों के उत्तर हिंदी में दिए जाएंगे।`
        : `🔄 Language switched to **English**. Responses will now be provided in English.`;

      const switchNotice: FloatingChatMessage = {
        id: 'lang_switch_' + Date.now(),
        sender: 'assistant',
        language: newLang,
        text: noticeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, switchNotice]);
    }
  };

  // Auto-scroll chat internally
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isProcessing, isOpen, currentStep, showTicketModal]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !showTicketModal) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, showTicketModal]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (showTicketModal) {
          setShowTicketModal(false);
        } else {
          setIsOpen(false);
        }
        stopSpeaking();
        setIsSpeaking(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showTicketModal]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Isolate scroll
  const handleChatWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  // Text-to-Speech playback helper
  const triggerVoiceResponse = (text: string, lang: SupportedLanguage) => {
    if (!isVoiceOutputEnabled) return;
    setIsSpeaking(true);
    speakText(text, lang, () => {
      setIsSpeaking(false);
    });
  };

  // Web Speech API: Voice Recognition (Speech-to-Text)
  const toggleVoiceInput = () => {
    setSpeechError(null);

    if (isListening) {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        selectedLang === 'ta'
          ? 'உங்கள் உலாவியில் குரல் அறிதல் ஆதரிக்கப்படவில்லை.'
          : selectedLang === 'te' 
          ? 'మీ బ్రౌజర్‌లో వాయిస్ రికగ్నిషన్ సపోర్ట్ లేదు.'
          : selectedLang === 'hi' 
          ? 'आपके ब्राउज़र में वॉइस रिकग्निशन समर्थित नहीं है।' 
          : 'Speech recognition is not supported in this browser.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      // Select Language Code
      if (selectedLang === 'ta') {
        recognition.lang = 'ta-IN';
      } else if (selectedLang === 'te') {
        recognition.lang = 'te-IN';
      } else if (selectedLang === 'hi') {
        recognition.lang = 'hi-IN';
      } else {
        recognition.lang = 'en-IN';
      }

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputQuery(transcript);

        if (event.results[0].isFinal) {
          setIsListening(false);
          handleSend(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError(
            selectedLang === 'ta'
              ? 'மைக்ரோஃபோன் அனுமதி மறுக்கப்பட்டது.'
              : selectedLang === 'te' 
              ? 'మైక్రోఫోన్ అనుమతి నిరాకరించబడింది.' 
              : selectedLang === 'hi' 
              ? 'माइक्रोफ़ोन की अनुमति अस्वीकृत की गई।' 
              : 'Microphone permission denied.'
          );
        } else {
          setSpeechError(`Voice error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to initialize speech recognition:', err);
      setIsListening(false);
      setSpeechError('Microphone could not be started.');
    }
  };

  // Main Query Processing Logic
  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText !== undefined ? queryText : inputQuery).trim();
    if (!textToSend || isProcessing) return;

    setHasInteracted(true);
    stopSpeaking();
    setIsSpeaking(false);

    const activeLang: SupportedLanguage = selectedLang;

    const userMsg: FloatingChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      language: activeLang,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsProcessing(true);
    setCurrentStep(
      activeLang === 'ta'
        ? 'பதிலை பகுப்பாய்வு செய்கிறது...'
        : activeLang === 'te' 
        ? 'సమాధానం విశ్లేషిస్తోంది...' 
        : activeLang === 'hi' 
        ? 'विश्लेषण किया जा रहा है...' 
        : 'Analyzing question & checking telemetry...'
    );

    try {
      // 1. Check Multilingual Guidance Engine with Authentication Guard
      const specialResponse = handleSpecialGuidanceQuery(textToSend, location.pathname, activeLang, isAuthenticated);

      if (specialResponse) {
        const assistantMsg: FloatingChatMessage = {
          id: 'ast_' + Date.now(),
          sender: 'assistant',
          language: specialResponse.language,
          text: specialResponse.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          keyMetrics: specialResponse.keyMetrics,
          relatedOutlets: specialResponse.relatedOutlets,
          analyticsCard: specialResponse.analyticsCard,
          suggestedAction: specialResponse.suggestedAction,
          quickOptions: specialResponse.quickOptions,
          isAiGenerated: true,
        };

        setMessages(prev => [...prev, assistantMsg]);
        triggerVoiceResponse(specialResponse.answer, specialResponse.language);
        return;
      }

      // If user is unauthenticated and asks an arbitrary query not covered, do not leak private data
      if (!isAuthenticated) {
        const generalReplyText = activeLang === 'ta'
          ? `வணக்கம்! FranchiseOps AI என்பது உங்கள் ஃபிரான்சைஸ் நெட்வொர்க்கை நிர்வகிப்பதற்கான ஒரு ஸ்மார்ட் தளம் ஆகும். உங்கள் வணிகத்திற்கான விரிவான பகுப்பாய்வை பெற, தயவுசெய்து கணக்கில் நுழையவும் அல்லது பதிவு செய்யவும்.`
          : activeLang === 'te'
          ? `FranchiseOps AI మీ ఫ్రాంచైజ్ నెట్‌వర్క్‌ను నిర్వహించడానికి ఒక తెలివైన ఆపరేటింగ్ సిస్టమ్. మీ నిర్దిష్ట వ్యాపార విశ్లేషణను పొందడానికి, దయచేసి ఖాతాలోకి లాగిన్ అవ్వండి లేదా నమోదు చేసుకోండి.`
          : activeLang === 'hi'
          ? `FranchiseOps AI आपके मल्टी-यूनिट फ्रैंचाइज़ी व्यवसाय को संचालित करने वाला स्मार्ट प्लेटफ़ॉर्म है। अपने विशिष्ट बिज़नेस डेटा के लिए, कृपया लॉगिन या रजिस्टर करें।`
          : `FranchiseOps AI is an autonomous multi-unit operating system. To view private telemetry and custom analytics for a specific brand, please sign in or start onboarding. How can I help you understand our features?`;

        const visitorMsg: FloatingChatMessage = {
          id: 'ast_' + Date.now(),
          sender: 'assistant',
          language: activeLang,
          text: generalReplyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          keyMetrics: ['Public Visitor Mode', 'Platform Features'],
          suggestedAction: {
            label: activeLang === 'ta' ? '✨ பதிவு செய்ய' : activeLang === 'te' ? '✨ నమోదు చేసుకోండి' : activeLang === 'hi' ? '✨ रजिस्टर करें' : '✨ Start Onboarding',
            actionType: 'navigate_onboarding',
          }
        };

        setMessages(prev => [...prev, visitorMsg]);
        triggerVoiceResponse(generalReplyText, activeLang);
        return;
      }

      // 2. Authenticated Business Orchestrator Fallback
      const result: AgentStructuredOutput = await runBusinessAgentOrchestrator(
        textToSend,
        business.id,
        {
          currentPage: location.pathname,
          onStepUpdate: (step) => {
            setCurrentStep(step.step);
          }
        }
      );

      let finalText = result.answer;

      if (activeLang === 'ta' && !/[\u0B80-\u0BFF]/.test(finalText)) {
        finalText = `### 📊 பகுப்பாய்வு முடிவு\n\n${result.answer}\n\n**பரிந்துரைகள்:**\n${result.recommendations?.map(r => `• ${r}`).join('\n') || 'வளர்ச்சியை அதிகரிக்க பரிந்துரைக்கப்பட்ட உத்திகளை செயல்படுத்தவும்.'}`;
      } else if (activeLang === 'te' && !/[\u0C00-\u0C7F]/.test(finalText)) {
        finalText = `### 📊 విశ్లేషణ ఫలితం\n\n${result.answer}\n\n**సిఫార్సులు:**\n${result.recommendations?.map(r => `• ${r}`).join('\n') || 'లక్ష్యాలను సాధించడానికి కార్యాచరణ ప్రణాళికను అమలు చేయండి.'}`;
      } else if (activeLang === 'hi' && !/[\u0900-\u097F]/.test(finalText)) {
        finalText = `### 📊 विश्लेषण परिणाम\n\n${result.answer}\n\n**अनुशंसाएं:**\n${result.recommendations?.map(r => `• ${r}`).join('\n') || 'दिए गए सुझावों के अनुसार सुधारात्मक कदम उठाएं।'}`;
      }

      const assistantMsg: FloatingChatMessage = {
        id: 'ast_' + Date.now(),
        sender: 'assistant',
        language: activeLang,
        text: finalText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        keyMetrics: result.key_metrics,
        relatedOutlets: result.related_outlets,
        toolsCalled: result.tools_called,
        suggestedAction: result.suggested_action,
        isAiGenerated: result.isAiGenerated,
      };

      setMessages(prev => [...prev, assistantMsg]);
      triggerVoiceResponse(finalText, activeLang);
    } catch (err) {
      console.error('Error running AI assistant:', err);
      const errorMsgText = activeLang === 'ta'
        ? 'மன்னிக்கவும், AI சேவையுடன் இணைப்பதில் சிக்கல் ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
        : activeLang === 'te'
        ? 'క్షమించండి, అసిస్టెంట్‌తో అనుసంధానం చేయడంలో సమస్య ఏర్పడింది. దయచేసి మళ్లీ ప్రయత్నించండి.'
        : activeLang === 'hi'
        ? 'क्षमा करें, असिस्टेंट से कनेक्ट करने में समस्या हुई। कृपया पुनः प्रयास करें।'
        : 'I ran into an issue connecting with the live intelligence service. Please try again or rephrase your question.';

      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'assistant',
          language: activeLang,
          text: errorMsgText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsProcessing(false);
      setCurrentStep('Ready');
    }
  };

  const handleResetChat = () => {
    stopSpeaking();
    setIsSpeaking(false);
    clearConversationHistory(business.id);
    setMessages([createGreeting(selectedLang, isAuthenticated)]);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Action Button Handler
  const handleExecuteAction = (action?: { label: string; actionType: string; payload?: any }) => {
    if (!action) return;

    if (action.actionType === 'open_ticket_modal') {
      setShowTicketModal(true);
      return;
    }

    if (action.actionType === 'navigate_dashboard') {
      setIsOpen(false);
      navigate('/dashboard');
      return;
    }

    if (action.actionType === 'navigate_onboarding') {
      setIsOpen(false);
      navigate('/onboarding');
      return;
    }

    if (action.actionType === 'create_action' || action.actionType === 'assign_task') {
      setIsOpen(false);
      navigate('/dashboard/action-center');
    } else if (action.actionType === 'transfer_inventory' || action.actionType === 'reorder_stock') {
      setIsOpen(false);
      navigate('/dashboard/inventory');
    } else if (action.actionType === 'deploy_campaign' || action.actionType === 'marketing_promo') {
      setIsOpen(false);
      navigate('/dashboard/marketing');
    } else if (action.actionType === 'reassign_staff') {
      setIsOpen(false);
      navigate('/dashboard/staff');
    } else {
      setIsOpen(false);
      navigate('/dashboard/copilot');
    }
  };

  // Handle Support Ticket / Complaint Submission
  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim() || !ticketName.trim() || !ticketEmail.trim()) {
      return;
    }

    setIsSubmittingTicket(true);

    try {
      const { ticket } = await submitSupportTicket({
        category: ticketCategory,
        name: ticketName,
        email: ticketEmail,
        subject: ticketSubject,
        priority: ticketPriority,
        description: ticketDescription,
        currentPage: location.pathname,
      });

      setShowTicketModal(false);

      let confirmationText = '';
      let spokenConfirmation = '';

      if (selectedLang === 'ta') {
        confirmationText = `### ✅ டிக்கெட் வெற்றிகரமாக பதிவு செய்யப்பட்டது!\n\n**டிக்கெட் எண்:** \`${ticket.id}\`\n**வகை:** ${ticket.category}\n**முன்னுரிமை:** ${ticket.priority}\n**தலைப்பு:** ${ticket.subject}\n\n📨 **மின்னஞ்சல் தகவல்:** தானாகவே **${TARGET_SUPPORT_EMAIL}** க்கு அனுப்பப்பட்டது.\n\nஎங்கள் குழு விரைவில் உங்களை தொடர்பு கொள்ளும்.`;
        spokenConfirmation = `உங்கள் டிக்கெட் ${ticket.id} வெற்றிகரமாக பதிவு செய்யப்பட்டு அனுப்பப்பட்டது.`;
      } else if (selectedLang === 'te') {
        confirmationText = `### ✅ టికెట్ విజయవంతంగా నమోదు చేయబడింది!\n\n**టికెట్ ID:** \`${ticket.id}\`\n**కేటగిరీ:** ${ticket.category}\n**ప్రాధాన్యత:** ${ticket.priority}\n**విషయం:** ${ticket.subject}\n\n📨 **ఈమెయిల్ నివేదిక:** ఆటోమేటిక్‌గా **${TARGET_SUPPORT_EMAIL}** కు పంపబడింది.\n\nమా ఆపరేషన్స్ విభాగం వెంటనే దీనిని పరిశీలిస్తుంది.`;
        spokenConfirmation = `మీ టికెట్ ${ticket.id} నమోదైంది మరియు ఆపరేషన్స్ టీమ్‌కు పంపబడింది.`;
      } else if (selectedLang === 'hi') {
        confirmationText = `### ✅ टिकट सफलतापूर्वक दर्ज और भेजा गया!\n\n**टिकट ID:** \`${ticket.id}\`\n**श्रेणी:** ${ticket.category}\n**प्राथमिकता:** ${ticket.priority}\n**विषय:** ${ticket.subject}\n\n📨 **ईमेल सूचना:** स्वचालित रूप से **${TARGET_SUPPORT_EMAIL}** पर भेज दी गई है।`;
        spokenConfirmation = `आपका टिकट ${ticket.id} दर्ज हो गया है और ऑपरेशंस टीम को भेज दिया गया है।`;
      } else {
        confirmationText = `### ✅ Ticket Successfully Created & Dispatched!\n\n**Ticket ID:** \`${ticket.id}\`\n**Category:** ${ticket.category}\n**Priority:** ${ticket.priority}\n**Subject:** ${ticket.subject}\n\n📨 **Email Notification:** Formatted and automatically dispatched to **${TARGET_SUPPORT_EMAIL}**.\n\nOur operations and engineering specialists have been notified.`;
        spokenConfirmation = `Your ticket ${ticket.id} has been submitted and sent to the operations team at ${TARGET_SUPPORT_EMAIL}.`;
      }

      const confirmationMsg: FloatingChatMessage = {
        id: 'tkt_conf_' + Date.now(),
        sender: 'assistant',
        language: selectedLang,
        text: confirmationText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        keyMetrics: [`Ticket: ${ticket.id}`, `Priority: ${ticket.priority}`, `Status: Dispatched`],
        ticketInfo: ticket,
        suggestedAction: {
          label: selectedLang === 'ta' ? '📋 செயல் மையம் பார்க்க' : selectedLang === 'te' ? '📋 యాక్షన్ సెంటర్ చూడండి' : selectedLang === 'hi' ? '📋 एक्शन सेंटर देखें' : '📋 View Action Center',
          actionType: 'create_action',
        },
      };

      setMessages(prev => [...prev, confirmationMsg]);
      triggerVoiceResponse(spokenConfirmation, selectedLang);

      setTicketSubject('');
      setTicketDescription('');
    } catch (err) {
      console.error('Failed to submit ticket:', err);
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. COMPACT CHAT PANEL (Scroll-Isolated with Internal Scrolling Only)       */}
      {/* ========================================================================= */}
      {isOpen && (
        <div 
          className="fixed bottom-20 sm:bottom-24 right-3 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-[450px] md:w-[480px] h-[600px] max-h-[calc(100vh-6.5rem)] flex flex-col rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-700/80 bg-slate-900/95 backdrop-blur-xl text-slate-100 overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200 select-text"
          role="dialog"
          aria-label="FranchiseOps AI Assistant"
          onWheel={handleChatWheel}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <FranchiseOpsLogo className="w-8 h-8 drop-shadow-md" glow />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-white tracking-tight">FranchiseOps AI</span>
                  <span className={cn(
                    "px-1.5 py-0.2 rounded-full text-[9px] font-semibold border",
                    isAuthenticated 
                      ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" 
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  )}>
                    {isAuthenticated 
                      ? (selectedLang === 'ta' ? 'வணிக AI' : selectedLang === 'te' ? 'బిజినెస్ AI' : selectedLang === 'hi' ? 'बिज़नेस AI' : 'Business AI') 
                      : (selectedLang === 'ta' ? 'பொது AI' : selectedLang === 'te' ? 'జనరల్ AI' : selectedLang === 'hi' ? 'सामान्य AI' : 'Visitor AI')}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                  {isAuthenticated ? business.name : (selectedLang === 'ta' ? 'பொது வழிகாட்டி தளம்' : selectedLang === 'te' ? 'సాధారణ గైడ్ మోడ్' : selectedLang === 'hi' ? 'सामान्य प्लेटफ़ॉर्म गाइड' : 'General Platform Guide')}
                </span>
              </div>
            </div>

            {/* Header Action Icons */}
            <div className="flex items-center gap-1">
              {/* Voice Output Toggle */}
              <button
                onClick={() => {
                  if (isSpeaking) {
                    stopSpeaking();
                    setIsSpeaking(false);
                  }
                  setIsVoiceOutputEnabled(!isVoiceOutputEnabled);
                }}
                title={isVoiceOutputEnabled ? 'Voice Responses Enabled (Click to Mute)' : 'Voice Responses Muted (Click to Unmute)'}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  isVoiceOutputEnabled ? 'text-indigo-300 hover:bg-indigo-950/60' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                )}
              >
                {isSpeaking ? (
                  <Radio className="w-4 h-4 text-emerald-400 animate-spin" />
                ) : isVoiceOutputEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>

              {/* Reset Chat */}
              <button
                onClick={handleResetChat}
                title="Clear & Reset Chat"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              
              {/* Open Full Workspace if Authenticated */}
              {isAuthenticated && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/dashboard/copilot');
                  }}
                  title="Open in Full Intelligence Workspace"
                  className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-indigo-950/50 rounded-lg transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              )}

              {/* Close Panel */}
              <button
                onClick={() => {
                  stopSpeaking();
                  setIsSpeaking(false);
                  setIsOpen(false);
                }}
                title="Close AI Assistant"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub-Header: 4-Language Switcher (English, Telugu, Hindi, Tamil) & Quick Ticket Launcher */}
          <div className="px-3.5 py-1.5 bg-slate-950/90 border-b border-slate-800/60 flex items-center justify-between gap-1.5 text-[11px] shrink-0">
            {/* 4 Language Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
              <span className="text-slate-500 font-medium flex items-center gap-0.5 mr-0.5 shrink-0">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
              </span>
              {[
                { id: 'en', label: 'English' },
                { id: 'te', label: 'తెలుగు' },
                { id: 'hi', label: 'हिन्दी' },
                { id: 'ta', label: 'தமிழ்' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => handleLanguageChange(lang.id as SupportedLanguage)}
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10.5px] font-bold transition-all shrink-0',
                    selectedLang === lang.id
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm ring-1 ring-indigo-400/50'
                      : 'bg-slate-800/90 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  )}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Quick Raise Ticket Button */}
            <button
              onClick={() => setShowTicketModal(true)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 text-amber-300 text-[10px] font-semibold transition-all shrink-0"
              title="Raise a Support Ticket or Complaint"
            >
              <Ticket className="w-3 h-3" />
              <span>{selectedLang === 'ta' ? 'டிக்கெட்' : selectedLang === 'te' ? 'టికెట్' : selectedLang === 'hi' ? 'टिकट' : 'Ticket'}</span>
            </button>
          </div>

          {/* ===================================================================== */}
          {/* TICKET / COMPLAINT SUBMISSION INLINE MODAL OVERLAY                   */}
          {/* ===================================================================== */}
          {showTicketModal ? (
            <div className="flex-1 overflow-y-auto p-4 bg-slate-900/98 overscroll-contain space-y-3.5 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      {selectedLang === 'ta' ? 'ஆதரவு / புகார் டிக்கெட் பதிவு' : selectedLang === 'te' ? 'సపోర్ట్ / ఫిర్యాదు టికెట్ నమోదు' : selectedLang === 'hi' ? 'सपोर्ट / शिकायत टिकट दर्ज करें' : 'Create Support / Complaint Ticket'}
                    </h4>
                    <p className="text-[10px] text-slate-400">Directly routed to {TARGET_SUPPORT_EMAIL}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleTicketSubmit} className="space-y-3">
                {/* Category & Priority */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      {selectedLang === 'ta' ? 'டிக்கெட் வகை' : selectedLang === 'te' ? 'టికెట్ కేటగిరీ' : selectedLang === 'hi' ? 'टिकट श्रेणी' : 'Ticket Category'}
                    </label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Support Ticket">Support Ticket / ஆதரவு</option>
                      <option value="Operational Complaint">Operational Complaint / புகார்</option>
                      <option value="Franchise Inquiry">Franchise Inquiry / விசாரணை</option>
                      <option value="System Bug">System Bug / பிழை</option>
                      <option value="Urgent Escalation">Urgent Escalation / அவசரம்</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      {selectedLang === 'ta' ? 'முன்னுரிமை' : selectedLang === 'te' ? 'ప్రాధాన్యత' : selectedLang === 'hi' ? 'प्राथमिकता' : 'Priority'}
                    </label>
                    <select
                      value={ticketPriority}
                      onChange={(e) => setTicketPriority(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Low">Low / குறைவு</option>
                      <option value="Medium">Medium / நடுத்தரம்</option>
                      <option value="High">High / அதிகம்</option>
                      <option value="Urgent">Urgent / அவசரம்</option>
                    </select>
                  </div>
                </div>

                {/* Submitter Name & Email */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      {selectedLang === 'ta' ? 'உங்கள் பெயர் *' : selectedLang === 'te' ? 'మీ పేరు *' : selectedLang === 'hi' ? 'आपका नाम *' : 'Your Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={ticketName}
                      onChange={(e) => setTicketName(e.target.value)}
                      placeholder={selectedLang === 'ta' ? 'எ.கா: விஜய் குமார்' : selectedLang === 'te' ? 'ఉదా: విజయ్ కుమార్' : selectedLang === 'hi' ? 'उदा: विजय कुमार' : 'e.g. Vijay Kumar'}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      {selectedLang === 'ta' ? 'மின்னஞ்சல் *' : selectedLang === 'te' ? 'మీ ఈమెయిల్ *' : selectedLang === 'hi' ? 'आपका ईमेल *' : 'Your Email *'}
                    </label>
                    <input
                      type="email"
                      required
                      value={ticketEmail}
                      onChange={(e) => setTicketEmail(e.target.value)}
                      placeholder="vijay@example.com"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    {selectedLang === 'ta' ? 'தலைப்பு / பிரச்சனை *' : selectedLang === 'te' ? 'సమస్య విషయం *' : selectedLang === 'hi' ? 'विषय *' : 'Subject / Issue Summary *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder={
                      selectedLang === 'ta' 
                        ? 'எ.கா: சரக்கு விநியோக தாமதம் அல்லது கணினி பிழை' 
                        : selectedLang === 'te' 
                        ? 'ఉదా: డేటా సింక్ లోపం లేదా స్టాక్ సరఫరా సమస్య' 
                        : selectedLang === 'hi' 
                        ? 'उदा: डेटा सिंक समस्या या स्टॉक आपूर्ति में देरी' 
                        : 'e.g. POS data synchronization failure in Indiranagar store'
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    {selectedLang === 'ta' ? 'முழு விவரங்கள் / புகார் *' : selectedLang === 'te' ? 'పూర్తి వివరాలు / ఫిర్యాదు *' : selectedLang === 'hi' ? 'पूरा विवरण *' : 'Complaint / Request Details *'}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    placeholder={
                      selectedLang === 'ta' 
                        ? 'பிரச்சனை பற்றிய முழு விவரங்கள், பாதிக்கப்பட்ட கிளை மற்றும் தேவையான உதவியை விவரிக்கவும்...' 
                        : selectedLang === 'te' 
                        ? 'సమస్య గురించిన పూర్తి వివరాలు, ప్రభావితమైన అవుట్‌లెట్ మరియు సహాయక సమాచారం రాయండి...' 
                        : selectedLang === 'hi' 
                        ? 'समस्या का पूरा विवरण, आउटलेट का नाम और आवश्यक सहायता लिखें...' 
                        : 'Provide full details of the issue, affected outlets, error messages, or requested assistance...'
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                {/* Submission CTA buttons */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTicketModal(false)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors"
                  >
                    {selectedLang === 'ta' ? 'ரத்து செய்க' : selectedLang === 'te' ? 'రద్దు చేయండి' : selectedLang === 'hi' ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingTicket}
                    className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmittingTicket ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{selectedLang === 'ta' ? 'அனுப்புகிறது...' : selectedLang === 'te' ? 'పంపుతోంది...' : selectedLang === 'hi' ? 'भेज रहे हैं...' : 'Dispatching...'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>{selectedLang === 'ta' ? 'சமர்ப்பிக்கவும் & மின்னஞ்சல் செய்க' : selectedLang === 'te' ? 'సబ్మిట్ చేయండి & ఈమెయిల్ పంపండి' : selectedLang === 'hi' ? 'सबमिट करें और ईमेल भेजें' : 'Submit Ticket & Send Email'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* =================================================================== */
            /* SCROLLABLE CHAT MESSAGES CONTAINER (Isolated Scroll)               */
            /* =================================================================== */
            <div 
              ref={chatScrollContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 text-sm overscroll-contain scrollbar-thin scrollbar-thumb-slate-700"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex flex-col gap-1 max-w-[90%]',
                    msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                  )}
                >
                  <div
                    className={cn(
                      'p-3.5 rounded-2xl leading-relaxed text-xs sm:text-sm shadow-sm',
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-xs'
                        : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-xs'
                    )}
                  >
                    <div className="whitespace-pre-line break-words">{msg.text}</div>

                    {/* Predefined Chart / Analytics Visual Placeholders (Business AI Mode) */}
                    {msg.analyticsCard && (
                      <div className="mt-3 p-3 bg-slate-950/90 rounded-xl border border-slate-700/80 shadow-inner space-y-2.5">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                            <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{msg.analyticsCard.title}</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                            Live Telemetry
                          </span>
                        </div>

                        {/* Top KPI Metrics Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {msg.analyticsCard.metrics.map((m, idx) => (
                            <div key={idx} className="bg-slate-900 p-2 rounded-lg border border-slate-800/80 flex flex-col">
                              <span className="text-[10px] text-slate-400 truncate">{m.label}</span>
                              <div className="flex items-baseline gap-1.5 mt-0.5">
                                <span className="text-sm font-extrabold text-white">{m.value}</span>
                                {m.change && (
                                  <span className={cn(
                                    "text-[9px] font-bold",
                                    m.isPositive ? "text-emerald-400" : "text-rose-400"
                                  )}>
                                    {m.change}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Visual Progress / Chart Bars */}
                        {msg.analyticsCard.bars && msg.analyticsCard.bars.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            {msg.analyticsCard.bars.map((b, idx) => (
                              <div key={idx} className="space-y-0.5">
                                <div className="flex justify-between text-[10px] text-slate-300">
                                  <span className="truncate max-w-[200px]">{b.label}</span>
                                  <span className="font-mono text-slate-400">{b.value}/{b.max}</span>
                                </div>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className={cn("h-full rounded-full transition-all duration-500", b.color)}
                                    style={{ width: `${Math.min(100, Math.max(5, (b.value / b.max) * 100))}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Key Metrics Chips */}
                    {msg.keyMetrics && msg.keyMetrics.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex flex-wrap gap-1.5">
                        {msg.keyMetrics.map((metric, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-[10px] sm:text-[11px] rounded-md font-medium"
                          >
                            {metric}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Related Outlets Chips */}
                    {msg.relatedOutlets && msg.relatedOutlets.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-1 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-400">
                          {selectedLang === 'ta' ? 'கிளைகள்:' : selectedLang === 'te' ? 'అవుట్‌లెట్లు:' : selectedLang === 'hi' ? 'आउटलेट्स:' : 'Outlets:'}
                        </span>
                        {msg.relatedOutlets.map((outlet, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 bg-slate-900/90 border border-slate-700 rounded text-slate-300"
                          >
                            {outlet}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Suggested Action Button */}
                    {msg.suggestedAction && (
                      <div className="mt-2.5 pt-2 border-t border-slate-700/60">
                        <button
                          onClick={() => handleExecuteAction(msg.suggestedAction)}
                          className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all group"
                        >
                          <span className="flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-amber-300" />
                            {msg.suggestedAction.label}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    )}

                    {/* Quick Options Chips */}
                    {msg.quickOptions && msg.quickOptions.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex flex-wrap gap-1.5">
                        {msg.quickOptions.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(opt.query)}
                            className="px-2.5 py-1 text-[11px] bg-slate-900/90 hover:bg-indigo-900/70 hover:text-indigo-200 text-slate-300 border border-slate-700/80 rounded-full transition-all text-left"
                          >
                            ⚡ {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Message Meta Info */}
                  <div className="flex items-center gap-2 px-1 text-[10px] text-slate-500">
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'assistant' && (
                      <>
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="hover:text-slate-300 transition-colors flex items-center gap-0.5"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>

                        <button
                          onClick={() => triggerVoiceResponse(msg.text, msg.language || selectedLang)}
                          className="hover:text-indigo-300 transition-colors flex items-center gap-0.5"
                          title="Read response aloud in current language"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {/* Processing Spinner / Dynamic Reasoning Step */}
              {isProcessing && (
                <div className="mr-auto items-start max-w-[88%]">
                  <div className="p-3.5 rounded-2xl rounded-bl-xs bg-slate-800/90 border border-indigo-500/30 text-slate-300 text-xs shadow-sm flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin shrink-0" />
                    <span className="font-medium text-indigo-300 animate-pulse">{currentStep}</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Voice Listening Bar */}
          {isListening && (
            <div className="px-4 py-2 bg-indigo-950/90 border-t border-indigo-500/40 flex items-center justify-between text-xs text-indigo-200 shrink-0 animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="font-medium">
                  {selectedLang === 'ta'
                    ? 'கேட்கிறது... (தமிழில் பேசவும்)'
                    : selectedLang === 'te' 
                    ? 'వింటోంది... (తెలుగులో మాట్లాడండి)' 
                    : selectedLang === 'hi' 
                    ? 'सुन रहे हैं... (हिंदी में बोलें)' 
                    : 'Listening... (Speak in English)'}
                </span>
              </div>
              <button
                onClick={toggleVoiceInput}
                className="text-[10px] px-2 py-0.5 bg-red-500/20 text-red-300 rounded border border-red-500/30 hover:bg-red-500/30"
              >
                {selectedLang === 'ta' ? 'நிறுத்து' : selectedLang === 'te' ? 'ఆపు' : selectedLang === 'hi' ? 'रोकें' : 'Stop'}
              </button>
            </div>
          )}

          {speechError && (
            <div className="px-3 py-1 bg-red-950/80 border-t border-red-800 text-[11px] text-red-300 flex items-center justify-between shrink-0">
              <span>{speechError}</span>
              <button onClick={() => setSpeechError(null)} className="text-red-400 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Bottom Chat Input Form */}
          {!showTicketModal && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-slate-950 border-t border-slate-800 shrink-0"
            >
              <div className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder={
                    selectedLang === 'ta'
                      ? (isAuthenticated ? 'விற்பனை, இருப்பு, ஊழியர் பற்றி கேளுங்கள்...' : 'இந்த தளத்தைப் பற்றி எதையும் கேளுங்கள்...')
                      : selectedLang === 'te'
                      ? (isAuthenticated ? 'నన్ను అమ్మకాలు, ఇన్వెంటరీ, సిబ్బంది గురించి అడగండి...' : 'ఈ ప్లాట్‌ఫామ్ గురించి ఏదైనా అడగండి...')
                      : selectedLang === 'hi'
                      ? (isAuthenticated ? 'सेल्स, स्टॉक, स्टाफ के बारे में पूछें...' : 'प्लेटफ़ॉर्म के बारे में कोई भी प्रश्न पूछें...')
                      : (isAuthenticated ? 'Ask about sales, revenue, inventory, staff...' : 'Ask about features, registration, complaints...')
                  }
                  disabled={isProcessing}
                  className="w-full pl-3.5 pr-20 py-2.5 bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none transition-all disabled:opacity-50"
                />

                {/* Right Input Buttons (Mic Voice + Send) */}
                <div className="absolute right-1.5 flex items-center gap-1">
                  {/* Microphone Button */}
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    title={
                      isListening 
                        ? 'Stop recording voice' 
                        : selectedLang === 'ta'
                        ? 'குரல் மூலம் பேச (தமிழ்)'
                        : selectedLang === 'te' 
                        ? 'వాయిస్ ద్వారా మాట్లాడండి (తెలుగు)' 
                        : selectedLang === 'hi' 
                        ? 'वॉइस द्वारा बोलें (हिंदी)' 
                        : 'Speak with Voice (English)'
                    }
                    className={cn(
                      'p-1.5 rounded-lg transition-all',
                      isListening
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-800'
                    )}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!inputQuery.trim() || isProcessing}
                    className="p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-lg transition-all shadow-sm flex items-center justify-center"
                    title="Send query"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. STICKY FLOATING AI ASSISTANT TRIGGER BUTTON (Unified Everywhere)       */}
      {/* ========================================================================= */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-center select-none">
        {/* Subtle Tooltip on Hover */}
        {!isOpen && !hasInteracted && (
          <div 
            onClick={() => setIsOpen(true)}
            className="hidden lg:flex items-center gap-2 mr-3 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-medium shadow-lg border border-slate-700/80 backdrop-blur-md cursor-pointer animate-in fade-in slide-in-from-right-3 duration-300 hover:border-indigo-500/50"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>
              {isAuthenticated
                ? (selectedLang === 'ta' 
                    ? `FranchiseOps AI • ${business.name}` 
                    : selectedLang === 'te' 
                    ? `FranchiseOps AI • ${business.name}` 
                    : selectedLang === 'hi' 
                    ? `FranchiseOps AI • ${business.name}` 
                    : `FranchiseOps AI • ${business.name}`)
                : (selectedLang === 'ta' 
                    ? 'FranchiseOps AI உதவியாளர் • 🎙️ குரல்' 
                    : selectedLang === 'te' 
                    ? 'FranchiseOps AI అసిస్టెంట్ • 🎙️ వాయిస్' 
                    : selectedLang === 'hi' 
                    ? 'FranchiseOps AI असिस्टेंट • 🎙️ वॉइस' 
                    : 'Ask FranchiseOps AI • 🎙️ Voice & Support')}
            </span>
          </div>
        )}

        {/* Floating Button */}
        <button
          onClick={() => {
            if (isOpen) {
              stopSpeaking();
              setIsSpeaking(false);
            }
            setIsOpen(!isOpen);
          }}
          aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
          aria-expanded={isOpen}
          className={cn(
            'group relative flex items-center justify-center rounded-full shadow-2xl transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-indigo-500/30',
            isOpen
              ? 'w-12 h-12 sm:w-14 sm:h-14 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600'
              : 'w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-600 hover:from-indigo-600 hover:to-violet-500 text-white shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-105 active:scale-95 ring-2 ring-indigo-400/40'
          )}
        >
          {/* Animated Glow Aura */}
          {!isOpen && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 to-fuchsia-500 blur-md opacity-40 group-hover:opacity-75 transition-opacity pointer-events-none -z-10 animate-pulse" />
          )}

          {/* Active Live Dot */}
          {!isOpen && (
            <span className="absolute top-0 right-0 flex h-3.5 w-3.5 -mt-0.5 -mr-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900" />
            </span>
          )}

          {/* Toggle between Sparkles/AI Icon and Close (X) */}
          {isOpen ? (
            <X className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:rotate-90 duration-200" />
          ) : (
            <div className="flex items-center justify-center">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 drop-shadow group-hover:rotate-12 transition-transform duration-300" />
            </div>
          )}
        </button>
      </div>
    </>
  );
}

export default FloatingAIAssistant;
