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

  // Track auth state - YE WALA FUNCTION COMPLETELY CHANGE KARNA HAI
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User signed in
        setCurrentUser(user)
        setShowAuth(false)
        
        // Check if we have guest messages to transfer
        const storedGuestId = localStorage.getItem('guestUserId');
        if (storedGuestId) {
          transferGuestMessages(user.uid, storedGuestId);
        }
      } else {
        // User signed out - create NEW guest session
        const newGuestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('guestUserId', newGuestId);
        setGuestUserId(newGuestId);
        setCurrentUser(null);
        
        // Reset to initial message for new guest session
        setMessages([
          { id: "init", content: "I am your friendly assistant here to help you with anything you need.", isBot: true }
        ]);
      }
    })
    
    return () => unsubscribe()
  }, [])

  // Transfer guest messages to authenticated user (IMPROVED)
  const transferGuestMessages = async (userId: string, guestId: string) => {
    try {
      const q = query(collection(db, "messages"), where("userId", "==", guestId));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        localStorage.removeItem("guestUserId");
        return;
      }

      const batch = writeBatch(db);
      const transferredMessages: Message[] = [];
      
      querySnapshot.forEach((document) => {
        const messageData = document.data();
        const newMessageRef = doc(collection(db, "messages"));
        
        batch.set(newMessageRef, { 
          ...messageData, 
          userId: userId 
        });
        
        batch.delete(document.ref);
        
        transferredMessages.push({
          id: newMessageRef.id,
          content: messageData.content,
          isBot: messageData.isBot,
          userId: userId,
          createdAt: messageData.createdAt
        });
      });

      await batch.commit();
      localStorage.removeItem("guestUserId");
      
      // Update UI with transferred messages
      setMessages(prev => {
        const initialMsg = prev.find(m => m.id === "init") || 
          { id: "init", content: "I am your friendly assistant here to help you with anything you need.", isBot: true };
        return [initialMsg, ...transferredMessages];
      });
      
    } catch (error) {
      console.error("Error transferring messages:", error);
    }
  };

  // Load messages - YE BHI FIX KARNA HAI
  useEffect(() => {
    let unsubscribe: (() => void) | null = null
    
    if (currentUser) {
      // Load authenticated user's messages
      const q = query(
        collection(db, "messages"),
        where("userId", "==", currentUser.uid),
        orderBy("createdAt", "asc")
      )
      
      unsubscribe = onSnapshot(q, (snap) => {
        const loadedMessages = snap.docs.map((doc) => ({
          id: doc.id,
          content: doc.data().content,
          isBot: doc.data().isBot,
          createdAt: doc.data().createdAt,
          userId: doc.data().userId
        } as Message))
        
        // Only update if we have messages
        if (loadedMessages.length > 0) {
          setMessages(prev => {
            const initialMsg = prev.find(m => m.id === "init") || 
              { id: "init", content: "I am your friendly assistant here to help you with anything you need.", isBot: true };
            return [initialMsg, ...loadedMessages.filter(m => m.id !== "init")];
          });
        }
      });
    } else if (guestUserId) {
      // Load guest user's messages
      const q = query(
        collection(db, "messages"),
        where("userId", "==", guestUserId),
        orderBy("createdAt", "asc")
      )
      
      unsubscribe = onSnapshot(q, (snap) => {
        const loadedMessages = snap.docs.map((doc) => ({
          id: doc.id,
          content: doc.data().content,
          isBot: doc.data().isBot,
          createdAt: doc.data().createdAt,
          userId: doc.data().userId
        } as Message))
        
        // Only update if we have messages
        if (loadedMessages.length > 0) {
          setMessages(prev => {
            const initialMsg = prev.find(m => m.id === "init") || 
              { id: "init", content: "I am your friendly assistant here to help you with anything you need.", isBot: true };
            return [initialMsg, ...loadedMessages.filter(m => m.id !== "init")];
          });
        }
      });
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [currentUser, guestUserId])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return
    const text = inputValue.trim()
    const userId = currentUser ? currentUser.uid : guestUserId
    
    if (!userId) {
      setMessages(p => [...p, { 
        id: Date.now().toString(), 
        content: "Please refresh and try again.", 
        isBot: true 
      }]);
      return;
    }

    const userMsg: Message = { id: Date.now().toString(), content: text, isBot: false, userId }
    setMessages(p => [...p, userMsg])
    setInputValue("")
    setIsTyping(true)

    try {
      // Save user message to Firestore
      await addDoc(collection(db, "messages"), {
        userId, 
        content: text, 
        isBot: false, 
        createdAt: serverTimestamp()
      })

      // Get AI response
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [
            ...messages
              .filter(m => m.id !== "init")
              .map(m => ({ 
                role: m.isBot ? "assistant" : "user", 
                content: m.content 
              })),
            { role: "user", content: text }
          ]
        }),
      })
      
      if (!res.ok) throw new Error('API response not OK');
      
      const data = await res.json()
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        content: data.text || "I'm here to help. How can I assist you today?", 
        isBot: true, 
        userId 
      }
      
      setMessages(p => [...p, botMsg])

      // Save bot message to Firestore
      await addDoc(collection(db, "messages"), {
        userId, 
        content: botMsg.content, 
        isBot: true, 
        createdAt: serverTimestamp()
      })
    } catch (err) {
      console.error("Error:", err)
      setMessages(p => [...p, { 
        id: (Date.now() + 2).toString(), 
        content: "Something went wrong. Try again.", 
        isBot: true,
        userId 
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSendMessage()
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Don't reset messages here - let the authStateChanged handler handle it
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  const handleAuthSuccess = () => {
    // AuthForm will handle the message transfer automatically
    setShowAuth(false);
  }

  return (
    <section id="chat" className="py-16 relative">
      {showAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-md">
            <button onClick={() => setShowAuth(false)} className="absolute top-2 right-2">
              <X size={20} />
            </button>
            <AuthForm onSuccess={handleAuthSuccess} currentGuestId={localStorage.getItem('guestUserId')} />
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
          <p className="text-muted-foreground">I'm here to listen and help.</p>
          {!currentUser && guestUserId && (
            <p className="text-sm text-blue-600">You're chatting as a guest. Sign up to save your chat history.</p>
          )}
        </CardHeader>

        <CardContent className="p-0">
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
                <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${msg.isBot ? "" : "flex-row-reverse space-x-reverse"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.isBot ? "bg-primary" : "bg-secondary"}`}>
                    {msg.isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={`p-3 rounded-lg ${msg.isBot ? "bg-muted" : "bg-primary text-primary-foreground"}`}>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary">
                    <Bot className="w-4 h-4" />
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

          <div className="p-4 border-t">
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