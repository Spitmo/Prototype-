"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Bot, User, Mic, X } from "lucide-react"
import { useSpeechToText } from "@/hooks/useSpeechToText"
import AuthForm from "@/components/authform"
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth"
import { db, auth } from "@/lib/firebase"
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  writeBatch,
  getDocs
} from "firebase/firestore"

interface Message {
  id: string
  content: string
  isBot: boolean
  createdAt?: any
  userId?: string
}

export default function AiChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "init", content: "I am your friendly assistant here to help you with anything you need.", isBot: true }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [guestUserId, setGuestUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Generate or get guest user ID
  const getOrCreateGuestId = (): string => {
    if (typeof window === 'undefined') return '';
    
    let guestId = localStorage.getItem('guestUserId');
    if (!guestId) {
      guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('guestUserId', guestId);
    }
    return guestId;
  };

  // Scroll helper
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Speech-to-text
  const { transcript, isListening, startListening, stopListening } = useSpeechToText()
  useEffect(() => {
    if (transcript) setInputValue(transcript)
  }, [transcript])

  // Track auth state - FIXED: Auto login nahi hoga
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? "User logged in" : "User logged out");
      
      if (user) {
        // User signed in
        setCurrentUser(user);
        setShowAuth(false);
        
        // Load user's messages
        loadUserMessages(user.uid);
      } else {
        // User signed out - create NEW guest session (purana data nahi dikhega)
        const guestId = getOrCreateGuestId();
        setGuestUserId(guestId);
        setCurrentUser(null);
        
        // Load guest messages for this NEW session only
        loadGuestMessages(guestId);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Load user messages - FIXED VERSION
  const loadUserMessages = (userId: string) => {
    console.log("Loading messages for user:", userId);
    const q = query(
      collection(db, "messages"),
      where("userId", "==", userId),
      orderBy("createdAt", "asc")
    );
    
    return onSnapshot(q, (snap) => {
      const loadedMessages = snap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          content: data.content,
          isBot: data.isBot,
          createdAt: data.createdAt,
          userId: data.userId
        } as Message;
      });
      
      console.log("Loaded user messages:", loadedMessages);
      
      if (loadedMessages.length > 0) {
        setMessages(prev => {
          const initialMsg = prev.find(m => m.id === "init") || 
            { id: "init", content: "I am your friendly assistant here to help you with anything you need.", isBot: true };
          return [initialMsg, ...loadedMessages];
        });
      }
    }, (error) => {
      console.error("Error loading user messages:", error);
      // Fallback: Try without orderBy if index issue
      if (error.code === 'failed-precondition') {
        const simpleQ = query(
          collection(db, "messages"),
          where("userId", "==", userId)
        );
        onSnapshot(simpleQ, (simpleSnap) => {
          const simpleMessages = simpleSnap.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              content: data.content,
              isBot: data.isBot,
              createdAt: data.createdAt,
              userId: data.userId
            } as Message;
          });
          
          // Sort manually on client side
          simpleMessages.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
              return a.createdAt.toDate() - b.createdAt.toDate();
            }
            return 0;
          });
          
          setMessages(prev => {
            const initialMsg = prev.find(m => m.id === "init") || 
              { id: "init", content: "I am your friendly assistant here to help you with anything you need.", isBot: true };
            return [initialMsg, ...simpleMessages];
          });
        });
      }
    });
  };

  // Load guest messages
  const loadGuestMessages = (guestId: string) => {
    console.log("Loading messages for guest:", guestId);
    const q = query(
      collection(db, "messages"),
      where("userId", "==", guestId),
      orderBy("createdAt", "asc")
    );
    
    return onSnapshot(q, (snap) => {
      const loadedMessages = snap.docs.map((doc) => ({
        id: doc.id,
        content: doc.data().content,
        isBot: doc.data().isBot,
        createdAt: doc.data().createdAt,
        userId: doc.data().userId
      } as Message));
      
      console.log("Loaded guest messages:", loadedMessages.length);
      
      if (loadedMessages.length > 0) {
        setMessages(prev => {
          const initialMsg = prev.find(m => m.id === "init") || 
            { id: "init", content: "I am your friendly assistant here to help you with anything you need.", isBot: true };
          return [initialMsg, ...loadedMessages];
        });
      } else {
        // New guest - show only initial message
        setMessages([
          { id: "init", content: "I am your friendly assistant here to help you with anything you need.", isBot: true }
        ]);
      }
    }, (error) => {
      console.error("Error loading guest messages:", error);
    });
  };

  // AI response function
  const getAIResponse = async (userMessage: string, chatHistory: Message[]) => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [
            ...chatHistory
              .filter(m => m.id !== "init")
              .map(m => ({ 
                role: m.isBot ? "assistant" : "user", 
                content: m.content 
              })),
            { role: "user", content: userMessage }
          ]
        }),
      });
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      
      const data = await res.json();
      return data.text || "I'm here to help. How can I assist you today?";
      
    } catch (error) {
      console.error("API Error:", error);
      return "I'm experiencing some technical difficulties. Please try again in a moment.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userId = currentUser ? currentUser.uid : guestUserId;
    if (!userId) {
      console.error("No user ID available");
      return;
    }

    const text = inputValue.trim();
    const userMsg: Message = { 
      id: `user_${Date.now()}`, 
      content: text, 
      isBot: false, 
      userId 
    };
    
    setMessages(p => [...p, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Save user message to Firestore
      await addDoc(collection(db, "messages"), {
        userId, 
        content: text, 
        isBot: false, 
        createdAt: serverTimestamp()
      });

      // Get AI response
      const botResponse = await getAIResponse(text, messages);
      const botMsg: Message = { 
        id: `bot_${Date.now()}`, 
        content: botResponse, 
        isBot: true, 
        userId 
      };
      
      setMessages(p => [...p, botMsg]);

      // Save bot message to Firestore
      await addDoc(collection(db, "messages"), {
        userId, 
        content: botResponse, 
        isBot: true, 
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error sending message:", err);
      setMessages(p => [...p, { 
        id: `error_${Date.now()}`, 
        content: "Something went wrong. Try again.", 
        isBot: true,
        userId 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSendMessage();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Clear guest ID to ensure fresh session
      localStorage.removeItem('guestUserId');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
  };

  return (
    <section id="chat" className="py-16 relative">
      {showAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-md">
            <button onClick={() => setShowAuth(false)} className="absolute top-2 right-2">
              <X size={20} />
            </button>
            <AuthForm onSuccess={handleAuthSuccess} currentGuestId={guestUserId} />
          </div>
        </div>
      )}

      <div className="flex justify-end max-w-4xl mx-auto mb-2">
        {currentUser ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Logged in as {currentUser.email}</span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setShowAuth(true)}>
            Login / Sign Up
          </Button>
        )}
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center bg-gradient-calm">
          <CardTitle className="text-2xl text-black">AI Mental Health Assistant</CardTitle>
          <p className="text-muted-foreground">I'm here to listen and help. Everything you share is confidential.</p>
          {!currentUser && guestUserId && (
            <p className="text-sm text-blue-600">You're chatting as a guest. Sign up to save your chat history permanently.</p>
          )}
        </CardHeader>

        <CardContent className="p-0">
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
                <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${msg.isBot ? "" : "flex-row-reverse space-x-reverse"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.isBot ? "bg-primary" : "bg-secondary"}`}>
                    {msg.isBot ? <Bot className="w-4 h-4 text-primary-foreground" /> : <User className="w-4 h-4 text-secondary-foreground" />}
                  </div>
                  <div className={`p-3 rounded-lg ${msg.isBot ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"}`}>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button onClick={handleSendMessage} disabled={isTyping || !inputValue.trim()}>
                <Send className="w-4 h-4" />
              </Button>
              <Button onClick={isListening ? stopListening : startListening} variant={isListening ? "destructive" : "outline"}>
                <Mic className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}