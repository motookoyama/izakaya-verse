import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Star, Heart, Sparkles, Wand2 } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface AnimeCharacterCardProps {
  id: string;
  name: string;
  type: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  power: number;
  health: number;
  abilities: string[];
  image: string;
  owned?: boolean;
  onSelect?: (id: string) => void;
}

export function AnimeCharacterCard({ 
  id, 
  name, 
  type, 
  rarity, 
  power, 
  health, 
  abilities, 
  image, 
  owned = false,
  onSelect 
}: AnimeCharacterCardProps) {
  const rarityColors = {
    Common: "bg-green-100 text-green-700 border-green-300",
    Rare: "bg-blue-100 text-blue-700 border-blue-300",
    Epic: "bg-purple-100 text-purple-700 border-purple-300",
    Legendary: "bg-gradient-to-r from-pink-100 to-orange-100 text-orange-700 border-orange-300"
  };

  const cardBorders = {
    Common: "border-green-300 shadow-green-200/50",
    Rare: "border-blue-400 shadow-blue-200/50",
    Epic: "border-purple-400 shadow-purple-200/50", 
    Legendary: "border-gradient-to-r from-pink-400 to-orange-400 shadow-pink-200/50"
  };

  const cardGradients = {
    Common: "from-green-50 via-white to-green-50",
    Rare: "from-blue-50 via-white to-blue-50",
    Epic: "from-purple-50 via-white to-purple-50",
    Legendary: "from-pink-50 via-orange-50 to-yellow-50"
  };

  return (
    <Card className={`w-full max-w-sm bg-gradient-to-br ${cardGradients[rarity]} border-2 ${cardBorders[rarity]} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${owned ? 'ring-2 ring-pink-400' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className="bg-pink-100 text-pink-700 border-pink-300">
            {type}
          </Badge>
          <Badge variant="outline" className={rarityColors[rarity]}>
            ✨ {rarity}
          </Badge>
        </div>
        
        <div className="relative h-32 mb-3 rounded-lg overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100">
          <ImageWithFallback 
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
          {owned && (
            <div className="absolute top-2 right-2 bg-pink-400 text-white rounded-full p-1 animate-pulse">
              <Star className="w-4 h-4 fill-current" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
        </div>
        
        <CardTitle className="text-lg text-pink-900">{name}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1 text-rose-500">
            <Wand2 className="w-4 h-4" />
            <span className="text-sm">{power}</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-500">
            <Heart className="w-4 h-4 fill-current" />
            <span className="text-sm">{health}</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-pink-600">Special Abilities:</p>
          <div className="flex flex-wrap gap-1">
            {abilities.map((ability, index) => (
              <Badge 
                key={index}
                variant="outline" 
                className="text-xs bg-gradient-to-r from-pink-50 to-purple-50 text-purple-700 border-purple-300"
              >
                {ability}
              </Badge>
            ))}
          </div>
        </div>
        
        {onSelect && (
          <Button 
            onClick={() => onSelect(id)}
            className="w-full mt-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg hover:shadow-pink-200/50"
            disabled={!owned}
          >
            {owned ? (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Select ✨
              </>
            ) : (
              'Not Owned 💫'
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}