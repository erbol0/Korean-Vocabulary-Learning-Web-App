'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Book, 
  Gamepad2, 
  BarChart3, 
  Settings,
  Plus,
  TrendingUp,
  Award,
  Clock,
  Target,
  Sparkles,
  ChevronRight
} from 'lucide-react';

// TEST TAILWIND - This component displays a gradient if Tailwind CSS is working correctly
function TailwindTest() {
  return (
    <div className="p-10 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white">
      <h1 className="text-4xl font-bold mb-4 animate-bounce">
        🎉 TAILWIND V4 IS WORKING! 🎉
      </h1>
      <p className="text-xl">If you see this gradient, your CSS setup is complete!</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* TAILWIND TEST - REMOVE AFTER VERIFYING CSS */}
      <TailwindTest />
      
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-pulse">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            TOPIK 1 Korean
          </h1>
        </div>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Learn Korean effectively with interactive games, accurate pronunciation, and a spaced repetition system.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white mx-auto mb-3">
              <Book className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-blue-700">0</div>
            <div className="text-sm text-blue-600">Vocabulary</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white mx-auto mb-3">
              <Target className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-green-700">0</div>
            <div className="text-sm text-green-600">Learned</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500 text-white mx-auto mb-3">
              <Award className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-purple-700">0</div>
            <div className="text-sm text-purple-600">XP Points</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 text-white mx-auto mb-3">
              <Clock className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-orange-700">0</div>
            <div className="text-sm text-orange-600">Day Streak</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Start Learning Card */}
        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 border-dashed border-primary/20 hover:border-primary/40">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300" />
          
          <CardHeader className="relative">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Plus className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Start Learning</CardTitle>
                <p className="text-muted-foreground">Add your first vocabulary words</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="relative">
            <p className="text-sm text-muted-foreground mb-6">
              Import a TOPIK 1 vocabulary list or create your own custom decks.
            </p>
            
            <div className="space-y-3">
              <Link href="/import">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Import Vocabulary
                </Button>
              </Link>
              
              <Link href="/library">
                <Button variant="outline" className="w-full">
                  <Book className="h-4 w-4 mr-2" />
                  View Library
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Today's Review */}
        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-500/5 group-hover:from-green-500/10 group-hover:to-teal-500/10 transition-all duration-300" />
          
          <CardHeader className="relative">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Target className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Today's Review</CardTitle>
                <p className="text-muted-foreground">0 words to review</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="relative">
            <p className="text-sm text-muted-foreground mb-6">
              Use spaced repetition for long-term retention.
            </p>
            
            <div className="space-y-3">
              <Link href="/flashcards">
                <Button className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white">
                  <Target className="h-4 w-4 mr-2" />
                  Start Review
                </Button>
              </Link>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Today's Progress</span>
                <span className="font-medium">0/0</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/games">
          <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Gamepad2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Games</h3>
              <p className="text-sm text-muted-foreground">5 fun games</p>
              <ChevronRight className="h-4 w-4 mx-auto mt-2 group-hover:translate-x-1 transition-transform duration-300" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/progress">
          <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Progress</h3>
              <p className="text-sm text-muted-foreground">Detailed stats</p>
              <ChevronRight className="h-4 w-4 mx-auto mt-2 group-hover:translate-x-1 transition-transform duration-300" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/library">
          <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Book className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Library</h3>
              <p className="text-sm text-muted-foreground">Vocabulary list</p>
              <ChevronRight className="h-4 w-4 mx-auto mt-2 group-hover:translate-x-1 transition-transform duration-300" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/settings">
          <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Settings</h3>
              <p className="text-sm text-muted-foreground">Customize app</p>
              <ChevronRight className="h-4 w-4 mx-auto mt-2 group-hover:translate-x-1 transition-transform duration-300" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Achievement Preview */}
      <Card className="bg-gradient-to-r from-yellow-50 via-orange-50 to-yellow-50 border-yellow-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Award className="h-6 w-6 text-yellow-600" />
            <CardTitle className="text-yellow-800">Recent Achievements</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-700 text-center py-8">
            Start learning to unlock your first achievement! 🏆
          </p>
        </CardContent>
      </Card>
    </div>
  );
}