import { useState } from 'react';
import { AnimeCharacterCard } from './components/anime-character-card';
import { AnimeMultiplayerChat } from './components/anime-multiplayer-chat';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { Users, Heart, Star, Trophy, Sparkles, MessageSquare } from 'lucide-react';
import { ImageWithFallback } from './components/figma/ImageWithFallback';

interface Character {
  id: string;
  name: string;
  type: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  power: number;
  health: number;
  abilities: string[];
  image: string;
  owned: boolean;
}

interface Player {
  id: string;
  name: string;
  avatar: string;
  character: string;
  isOnline: boolean;
}

const characters: Character[] = [
  {
    id: '1',
    name: 'Sakura Guardian',
    type: 'Magical Girl',
    rarity: 'Legendary',
    power: 95,
    health: 80,
    abilities: ['Cherry Blossom Storm', 'Healing Light', 'Purification'],
    image: 'https://images.unsplash.com/photo-1753099861839-235292e1bc55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMHNha3VyYSUyMGZhbnRhc3l8ZW58MXx8fHwxNzU4NTM5MzcyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    owned: true
  },
  {
    id: '2',
    name: 'Crystal Mage',
    type: 'Wizard',
    rarity: 'Epic',
    power: 88,
    health: 65,
    abilities: ['Crystal Shield', 'Prismatic Beam', 'Time Freeze'],
    image: 'https://images.unsplash.com/photo-1563393471486-370b35d7de64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMGFuaW1lJTIwYXJ0fGVufDF8fHx8MTc1ODUzOTM3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    owned: true
  },
  {
    id: '3',
    name: 'Forest Spirit',
    type: 'Guardian',
    rarity: 'Rare',
    power: 70,
    health: 120,
    abilities: ['Nature\'s Call', 'Root Bind', 'Forest Blessing'],
    image: 'https://images.unsplash.com/photo-1553069350-71209c6757bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwbWFnaWNhbCUyMGZvcmVzdHxlbnwxfHx8fDE3NTg1MzkzODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    owned: false
  },
  {
    id: '4',
    name: 'Starlight Archer',
    type: 'Ranger',
    rarity: 'Epic',
    power: 82,
    health: 75,
    abilities: ['Shooting Star', 'Celestial Arrow', 'Moonbeam'],
    image: 'https://images.unsplash.com/photo-1629350260660-6053fe4fcf47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWdpY2FsJTIwZ2lybCUyMGFuaW1lfGVufDF8fHx8MTc1ODQ1OTkxNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    owned: true
  }
];

export default function App() {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(characters.find(c => c.owned) || null);
  const [activeTab, setActiveTab] = useState('collection');
  const [currentPlayer] = useState<Player>({
    id: '1',
    name: 'Player1',
    avatar: '🌸',
    character: selectedCharacter?.name || 'No Character',
    isOnline: true
  });

  const handleCharacterSelect = (id: string) => {
    const character = characters.find(c => c.id === id);
    if (character && character.owned) {
      setSelectedCharacter(character);
    }
  };

  const handleStartAdventure = () => {
    setActiveTab('adventure');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 relative">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-20">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1753099861839-235292e1bc55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMHNha3VyYSUyMGZhbnRhc3l8ZW58MXx8fHwxNzU4NTM5MzcyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Anime sakura fantasy"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl text-transparent bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text drop-shadow-lg">
              IZAKAYA verse ✨
            </h1>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-pulse">
              <Star className="w-6 h-6 text-white fill-current" />
            </div>
          </div>
          <p className="text-pink-600 text-lg drop-shadow">
            🌸 Magical Character Collection & Anime Adventure Game 🌸
          </p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6 mb-8">
          <Card className="bg-white/60 backdrop-blur-sm border-pink-300/50 shadow-lg">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-pink-500 mx-auto mb-2" />
              <p className="text-pink-700 text-sm">Magical Friends</p>
              <p className="text-pink-600">2,847</p>
            </CardContent>
          </Card>
          <Card className="bg-white/60 backdrop-blur-sm border-purple-300/50 shadow-lg">
            <CardContent className="p-4 text-center">
              <Trophy className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-purple-700 text-sm">Adventures</p>
              <p className="text-purple-600">15,632</p>
            </CardContent>
          </Card>
          <Card className="bg-white/60 backdrop-blur-sm border-indigo-300/50 shadow-lg">
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
              <p className="text-indigo-700 text-sm">Characters</p>
              <p className="text-indigo-600">156</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm border border-pink-300 shadow-lg">
              <TabsTrigger 
                value="collection" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-400 data-[state=active]:to-purple-400 data-[state=active]:text-white"
              >
                <Star className="w-4 h-4 mr-2" />
                ✨ Character Collection
              </TabsTrigger>
              <TabsTrigger 
                value="adventure"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-indigo-400 data-[state=active]:text-white"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                🌸 Magical Adventure
              </TabsTrigger>
            </TabsList>

            <TabsContent value="collection" className="mt-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Character Selection */}
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl text-pink-800 mb-2">Your Magical Collection ✨</h2>
                    <p className="text-pink-600">Collect and nurture powerful magical beings for your adventures</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {characters.map((character) => (
                      <AnimeCharacterCard
                        key={character.id}
                        {...character}
                        onSelect={handleCharacterSelect}
                      />
                    ))}
                  </div>
                </div>

                {/* Selected Character & Adventure Start */}
                <div className="space-y-6">
                  {selectedCharacter ? (
                    <div className="space-y-4">
                      <Card className="bg-gradient-to-br from-white/80 to-pink-50/80 border-pink-300/50 backdrop-blur-sm shadow-lg">
                        <CardContent className="p-6 text-center">
                          <h3 className="text-xl text-pink-800 mb-4">Selected Character ✨</h3>
                          <div className="space-y-3">
                            <h4 className="text-lg text-pink-900">{selectedCharacter.name}</h4>
                            <div className="flex justify-center gap-4">
                              <Badge className="bg-rose-100 text-rose-700 border-rose-300">
                                <Sparkles className="w-3 h-3 mr-1" />
                                {selectedCharacter.power}
                              </Badge>
                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                                <Heart className="w-3 h-3 mr-1 fill-current" />
                                {selectedCharacter.health}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-1 justify-center">
                              {selectedCharacter.abilities.map((ability, index) => (
                                <Badge 
                                  key={index}
                                  variant="outline" 
                                  className="text-xs bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-300"
                                >
                                  {ability}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Button 
                        onClick={handleStartAdventure}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-lg py-6 shadow-lg hover:shadow-pink-200/50"
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Start Magical Adventure ✨
                      </Button>
                    </div>
                  ) : (
                    <Card className="bg-white/50 border-pink-300 backdrop-blur-sm">
                      <CardContent className="p-6 text-center">
                        <div className="text-pink-500">
                          <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Select a magical character from your collection to begin your adventure ✨</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <div className="space-y-4 text-center">
                    <h3 className="text-xl text-pink-700">Magical Features 🌟</h3>
                    <div className="space-y-2 text-pink-600">
                      <p className="flex items-center justify-center gap-2">
                        <Users className="w-4 h-4 text-pink-500" />
                        Multiplayer adventures with AI Guardian 🌸
                      </p>
                      <p className="flex items-center justify-center gap-2">
                        <Star className="w-4 h-4 text-purple-500" />
                        Collect & bond with magical beings ✨
                      </p>
                      <p className="flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                        AI-guided anime storylines 🦋
                      </p>
                      <p className="flex items-center justify-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        Magical tournaments & rankings 🏆
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="adventure" className="mt-6">
              <Card className="bg-white/90 backdrop-blur-sm border-pink-300 shadow-2xl">
                <div className="h-[700px]">
                  <AnimeMultiplayerChat 
                    roomId="Sakura-Garden-001" 
                    currentPlayer={{
                      ...currentPlayer,
                      character: selectedCharacter?.name || 'No Character'
                    }}
                  />
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}