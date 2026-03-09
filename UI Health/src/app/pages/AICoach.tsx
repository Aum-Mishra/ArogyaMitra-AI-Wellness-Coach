import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Sparkles, Send, Dumbbell, UtensilsCrossed, Heart, TrendingUp, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Alert, AlertDescription } from "../components/ui/alert";
import { useAuth } from "../../hooks/useAuth";
import { apiClient } from "../../services/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isPlanAdjustment?: boolean;
}

export function AICoach() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPlanRequest, setShowPlanRequest] = useState(false);
  const [planAdjustmentType, setPlanAdjustmentType] = useState<string | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    { icon: Dumbbell, label: "Adjust workout plan", color: "bg-primary" },
    { icon: UtensilsCrossed, label: "Suggest healthy meal", color: "bg-accent" },
    { icon: Heart, label: "Recovery exercises", color: "bg-destructive" },
    { icon: TrendingUp, label: "Track my progress", color: "bg-secondary" },
  ];

  // Load messages from localStorage on mount
  useEffect(() => {
    const loadChatHistory = () => {
      try {
        const saved = localStorage.getItem("aromichatHistory");
        if (saved) {
          const parsed = JSON.parse(saved);
          const messagesWithDates = parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(messagesWithDates);
        } else {
          // Initialize with welcome message
          const welcomeMessage: Message = {
            id: "welcome",
            role: "assistant",
            content: `Hello ${user?.name || "User"}! 👋 I'm AROMI, your AI wellness coach. I'm here to help you with personalized fitness advice, nutrition guidance, and motivation. How can I assist you today?`,
            timestamp: new Date(),
          };
          setMessages([welcomeMessage]);
          localStorage.setItem("aromichatHistory", JSON.stringify([welcomeMessage]));
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
        const welcomeMessage: Message = {
          id: "welcome",
          role: "assistant",
          content: `Hello ${user?.name || "User"}! 👋 I'm AROMI, your AI wellness coach. I'm here to help you with personalized fitness advice, nutrition guidance, and motivation. How can I assist you today?`,
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      } finally {
        setIsLoading(false);
      }
    };

    loadChatHistory();
  }, [user]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      try {
        localStorage.setItem("aromichatHistory", JSON.stringify(messages));
      } catch (error) {
        console.error("Error saving chat history:", error);
      }
    }
  }, [messages, isLoading]);

  // Keep only last 10 exchanges (20 messages)
  useEffect(() => {
    if (messages.length > 20) {
      const trimmedMessages = messages.slice(-20);
      setMessages(trimmedMessages);
      localStorage.setItem("aromichatHistory", JSON.stringify(trimmedMessages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const detectAndHandleAdjustment = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes("injured") || lower.includes("injury")) {
      return "injury";
    } else if (lower.includes("time") && (lower.includes("short") || lower.includes("limited"))) {
      return "time";
    } else if (lower.includes("traveling") || lower.includes("travel")) {
      return "travel";
    } else if (lower.includes("tired") || lower.includes("fatigue")) {
      return "tired";
    } else if (lower.includes("home") || lower.includes("no equipment")) {
      return "equipment";
    }
    return null;
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputMessage.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Check for adjustment request
    const adjustmentType = detectAndHandleAdjustment(messageText);
    if (adjustmentType) {
      setPlanAdjustmentType(adjustmentType);
      setShowPlanRequest(true);
    }

    try {
      // Send message to AROMI backend
      const response = await apiClient.sendAromicMessage(messageText);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.data.response || "I'm having trouble understanding. Can you rephrase?",
        timestamp: new Date(),
        isPlanAdjustment: adjustmentType ? true : false,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message to AROMI:", error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: "I'm having trouble connecting to the AI service. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleApplyPlanAdjustment = async () => {
    if (!planAdjustmentType) return;

    try {
      setIsGeneratingPlan(true);
      await apiClient.applyAromicAdjustment({
        constraint: planAdjustmentType,
        reason: "User requested adjustment for this constraint",
      });

      const confirmMessage: Message = {
        id: (Date.now() + 100).toString(),
        role: "assistant",
        content: `✅ Your workout plan has been adjusted for ${planAdjustmentType}! The updated plan is now available in your Workout Plan section. Please review it and let me know if you'd like any more adjustments!`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, confirmMessage]);
      setShowPlanRequest(false);
      setPlanAdjustmentType(null);
    } catch (error) {
      console.error("Error applying plan adjustment:", error);
      const errorMessage: Message = {
        id: (Date.now() + 101).toString(),
        role: "assistant",
        content: "Sorry, I couldn't adjust your plan. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleQuickAction = (label: string) => {
    handleSendMessage(label);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChatHistory = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `Hello ${user?.name || "User"}! 👋 I'm AROMI, your AI wellness coach. I'm here to help you with personalized fitness advice, nutrition guidance, and motivation. How can I assist you today?`,
        timestamp: new Date(),
      }
    ]);
    localStorage.removeItem("aromichatHistory");
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto h-[calc(100vh-5rem)]">
      <div className="flex flex-col h-full gap-6">
        {/* Header */}
        <div>
          <h1 className="text-[24px] font-semibold flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            AROMI AI Wellness Coach
          </h1>
          <p className="text-muted-foreground text-[14px] mt-1">
            Your 24/7 personal wellness assistant powered by AI. Get personalized fitness and nutrition guidance.
          </p>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden">
          {/* Quick Actions Sidebar */}
          <Card className="lg:col-span-1 flex flex-col">
            <CardHeader>
              <CardTitle className="text-[16px]">Quick Actions</CardTitle>
              <CardDescription className="text-[12px]">Get instant help</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 flex-1 overflow-y-auto">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start gap-2 h-auto py-3"
                  onClick={() => handleQuickAction(action.label)}
                >
                  <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[13px] text-left">{action.label}</span>
                </Button>
              ))}
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={clearChatHistory}
              >
                Clear Chat History
              </Button>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-3 flex flex-col overflow-hidden">
            <CardHeader className="border-b flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-[16px]">Chat with AROMI</CardTitle>
                  <CardDescription className="text-[12px]">AI is online and ready to help</CardDescription>
                </div>
              </div>
            </CardHeader>

            {/* Messages Container */}
            <CardContent 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-full mx-auto mb-3 flex items-center justify-center animate-pulse">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-muted-foreground">Loading AROMI...</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="w-8 h-8 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] rounded-lg p-3 ${
                          message.role === "user"
                            ? "bg-primary text-white"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-[14px] whitespace-pre-wrap">{message.content}</p>
                        <p
                          className={`text-[11px] mt-1 ${
                            message.role === "user" ? "text-white/70" : "text-muted-foreground"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {message.role === "user" && (
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} />
                          <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  )}

                  {showPlanRequest && (
                    <Alert className="mt-4 bg-accent/10 border-accent/50">
                      <AlertCircle className="h-4 w-4 text-accent" />
                      <AlertDescription className="text-accent mt-2">
                        <p className="font-semibold mb-2">Plan Adjustment Requested</p>
                        <p className="text-sm mb-3">I can adjust your workout plan for {planAdjustmentType}. Would you like me to generate an updated plan?</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleApplyPlanAdjustment}
                            disabled={isGeneratingPlan}
                            className="bg-accent hover:bg-accent/90"
                          >
                            {isGeneratingPlan ? "Updating..." : "Yes, Adjust Plan"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowPlanRequest(false)}
                          >
                            Not Now
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </CardContent>

            {/* Input Area */}
            <div className="border-t p-4 flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask me anything about fitness, nutrition, or wellness..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  disabled={isTyping || isLoading}
                />
                <Button
                  size="icon"
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isTyping || isLoading}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                Press Enter to send, Shift + Enter for new line
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
