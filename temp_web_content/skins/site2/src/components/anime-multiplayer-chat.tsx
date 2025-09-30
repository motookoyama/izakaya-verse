import { useState, useRef, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Send, Users, Sparkles, Heart } from "lucide-react";

interface Player {
  id: string;
  name: string;
  avatar: string;
  character: string;
  isOnline: boolean;
}

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderType: 'player' | 'ai' | 'system';
  timestamp: string;
  character?: string;
}

interface AnimeMultiplayerChatProps {
  roomId: string;
  currentPlayer: Player;
}

export function AnimeMultiplayerChat({ roomId, currentPlayer }: AnimeMultiplayerChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: `✨ Welcome to Magical Adventure Room ${roomId}! Your AI Guardian is here to guide you through this enchanted journey! 🌸`,
      senderId: 'system',
      senderName: 'System',
      senderType: 'system',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    },
    {
      id: '2',
      text: 'Greetings, brave adventurers! 🌟 I sense powerful magical energy from this party. Your quest begins in the Enchanted Sakura Gardens, where ancient spirits await. What magical adventure shall we embark upon? ✨🌸',
      senderId: 'ai-guardian',
      senderName: 'AI Guardian',
      senderType: 'ai',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [onlinePlayers] = useState<Player[]>([
    currentPlayer,
    {
      id: '2',
      name: 'SakuraMage',
      avatar: '🌸',
      character: 'Cherry Blossom Sorceress',
      isOnline: true
    },
    {
      id: '3', 
      name: 'StarKnight',
      avatar: '⭐',
      character: 'Celestial Warrior',
      isOnline: true
    }
  ]);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const aiResponses = [
    "How wonderful! ✨ As you step forward, magical sparkles dance around you and reveal a hidden path...",
    "The magical creatures of the forest sense your pure heart! 🦋 They offer you a mystical gift...",
    "A gentle breeze carries cherry blossoms around you as a wise spirit appears with a riddle... 🌸",
    "Your character's magical aura glows brighter! ⭐ The enchanted forest responds to your kindness...",
    "Amazing choice! 💫 The other magical beings watch in wonder as you demonstrate your unique power...",
    "The mystical realm shimmers with approval! 🌈 Reality bends around your magical influence...",
    "A new quest unfolds before you: Help the lost fairy find her way back to the Crystal Gardens! 🧚‍♀️✨"
  ];

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      senderId: currentPlayer.id,
      senderName: currentPlayer.name,
      senderType: 'player',
      character: currentPlayer.character,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI Guardian response delay
    setTimeout(() => {
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        senderId: 'ai-guardian',
        senderName: 'AI Guardian',
        senderType: 'ai',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500 + Math.random() * 2500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const MessageComponent = ({ message }: { message: ChatMessage }) => {
    const getMessageStyle = () => {
      switch (message.senderType) {
        case 'system':
          return 'bg-gradient-to-r from-indigo-100 to-purple-100 border-indigo-300 text-indigo-800';
        case 'ai':
          return 'bg-gradient-to-r from-pink-100 to-rose-100 border-pink-300 text-pink-800';
        case 'player':
          return message.senderId === currentPlayer.id 
            ? 'bg-gradient-to-r from-emerald-100 to-teal-100 border-emerald-300 text-emerald-800'
            : 'bg-gradient-to-r from-orange-100 to-yellow-100 border-orange-300 text-orange-800';
        default:
          return 'bg-gray-100 border-gray-300 text-gray-800';
      }
    };

    const getAvatar = () => {
      switch (message.senderType) {
        case 'system':
          return '⚡';
        case 'ai':
          return '🌟';
        default:
          return onlinePlayers.find(p => p.id === message.senderId)?.avatar || '😊';
      }
    };

    return (
      <div className={`flex gap-3 mb-4 ${message.senderId === currentPlayer.id ? 'justify-end' : 'justify-start'}`}>
        {message.senderId !== currentPlayer.id && (
          <Avatar className="w-8 h-8 border-2 border-pink-300 bg-white">
            <AvatarFallback className="bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700">
              {getAvatar()}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={`max-w-[80%] ${message.senderId === currentPlayer.id ? 'order-1' : 'order-2'}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-pink-600">{message.senderName}</span>
            {message.character && (
              <Badge variant="outline" className="text-xs bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-300">
                ✨ {message.character}
              </Badge>
            )}
            <span className="text-xs text-pink-400">{message.timestamp}</span>
          </div>
          
          <Card className={`${getMessageStyle()} backdrop-blur-sm shadow-md`}>
            <CardContent className="p-3">
              <p className="text-sm">{message.text}</p>
            </CardContent>
          </Card>
        </div>
        
        {message.senderId === currentPlayer.id && (
          <Avatar className="w-8 h-8 border-2 border-emerald-300 bg-white">
            <AvatarFallback className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700">
              {currentPlayer.avatar}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Room Header */}
      <div className="p-4 border-b border-pink-200 bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg text-pink-800">✨ Magical Room {roomId} 🌸</h3>
            <p className="text-sm text-pink-600">AI-Guided Anime Adventure</p>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-pink-500" />
            <span className="text-sm text-pink-600">{onlinePlayers.filter(p => p.isOnline).length} magical beings</span>
          </div>
        </div>
      </div>

      {/* Players List */}
      <div className="p-3 border-b border-pink-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex gap-2 overflow-x-auto">
          {onlinePlayers.map((player) => (
            <div key={player.id} className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 whitespace-nowrap border border-pink-200 shadow-sm">
              <span className="text-sm">{player.avatar}</span>
              <span className="text-xs text-pink-700">{player.name}</span>
              {player.isOnline && <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>}
            </div>
          ))}
        </div>
      </div>
      
      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageComponent key={message.id} message={message} />
          ))}
          {isTyping && (
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8 border-2 border-pink-300 bg-white">
                <AvatarFallback className="bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700">
                  <Sparkles className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <Card className="bg-gradient-to-r from-pink-100 to-rose-100 border-pink-300">
                <CardContent className="p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Input */}
      <div className="p-4 border-t border-pink-200 bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-100">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Cast your magical message... ✨"
            className="flex-1 bg-white/80 backdrop-blur-sm border-pink-300 text-pink-800 placeholder-pink-500 focus:border-pink-400 shadow-sm"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg hover:shadow-pink-200/50"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}