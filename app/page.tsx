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
  Award,
  Clock,
  Target,
  Sparkles,
  ChevronRight,
  PenTool,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-[28px] border border-violet-200/80 bg-gradient-to-r from-violet-100 via-indigo-50 to-pink-50 p-6 shadow-[0_18px_45px_rgba(124,58,237,0.12)]">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-indigo-500 to-purple-600 shadow-lg shadow-violet-200">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1
              translate="no"
              suppressHydrationWarning
              className="text-4xl font-black tracking-tight bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent"
            >
              TOPIK 1 Korean
            </h1>
          </div>

          <p className="mx-auto max-w-2xl text-lg text-slate-700">
            Learn Korean effectively with interactive games, accurate pronunciation, and a
            spaced repetition system
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="rounded-[24px] border border-blue-100 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50 shadow-sm ring-1 ring-white/70">
          <CardContent className="p-4 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-200">
              <Book className="h-5 w-5" />
            </div>
            <div className="text-3xl font-bold text-blue-700">1000</div>
            <div className="text-sm text-blue-600">Vocabulary</div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-green-100 to-lime-50 shadow-sm ring-1 ring-white/70">
          <CardContent className="p-4 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-md shadow-emerald-200">
              <Target className="h-5 w-5" />
            </div>
            <div className="text-3xl font-bold text-emerald-700">0</div>
            <div className="text-sm text-emerald-600">Learned</div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border border-violet-100 bg-gradient-to-br from-violet-50 via-purple-100 to-fuchsia-50 shadow-sm ring-1 ring-white/70">
          <CardContent className="p-4 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-md shadow-violet-200">
              <Award className="h-5 w-5" />
            </div>
            <div className="text-3xl font-bold text-violet-700">0</div>
            <div className="text-sm text-violet-600">XP Points</div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border border-orange-100 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 shadow-sm ring-1 ring-white/70">
          <CardContent className="p-4 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md shadow-orange-200">
              <Clock className="h-5 w-5" />
            </div>
            <div className="text-3xl font-bold text-orange-700">0</div>
            <div className="text-sm text-orange-600">Day Streak</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="group relative overflow-hidden rounded-[28px] border border-dashed border-violet-200 bg-white/90 shadow-[0_18px_35px_rgba(148,163,184,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_rgba(109,40,217,0.12)]">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-blue-500/5" />

          <CardHeader className="relative pb-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-200 transition-transform duration-300 group-hover:scale-105">
                <Plus className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-slate-800">Start Learning</CardTitle>
                <p className="text-sm text-slate-600">1000 TOPIK 1 vocabulary words are ready!</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative">
            <p className="mb-6 text-sm leading-6 text-slate-600">
              Successfully imported 1000 TOPIK 1 vocabulary words, or add your own custom list.
            </p>

            <div className="space-y-3">
              <Link href="/import">
                <Button className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-200 hover:from-violet-600 hover:to-indigo-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Import More Vocabulary
                </Button>
              </Link>

              <Link href="/library">
                <Button variant="outline" className="w-full rounded-xl border-slate-200 bg-slate-50/80 hover:bg-slate-100">
                  <Book className="mr-2 h-4 w-4" />
                  View Library (1000 words)
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden rounded-[28px] border border-emerald-200 bg-white/90 shadow-[0_18px_35px_rgba(16,185,129,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_rgba(16,185,129,0.12)]">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5" />

          <CardHeader className="relative pb-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200 transition-transform duration-300 group-hover:scale-105">
                <Target className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-slate-800">Today&apos;s Review</CardTitle>
                <p className="text-sm text-slate-600">1000 words to review</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative">
            <p className="mb-6 text-sm leading-6 text-slate-600">
              Use spaced repetition for long-term retention.
            </p>

            <div className="space-y-3">
              <Link href="/flashcards">
                <Button className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200 hover:from-emerald-600 hover:to-teal-700">
                  <Target className="mr-2 h-4 w-4" />
                  Start Review
                </Button>
              </Link>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Today&apos;s Progress</span>
                <span className="font-semibold text-slate-800">0/1000</span>
              </div>
              <Progress value={0} className="h-2.5 rounded-full bg-slate-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Link href="/games" className="min-w-0">
          <Card className="group h-full cursor-pointer rounded-[24px] border border-slate-200 bg-gradient-to-br from-white to-violet-50/60 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-md shadow-violet-200 transition-transform duration-300 group-hover:scale-110">
                <Gamepad2 className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-800">Games</h3>
              <p className="text-sm text-slate-600">5 fun games</p>
              <ChevronRight className="mx-auto mt-3 h-4 w-4 text-slate-500 transition-transform duration-300 group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/write" className="min-w-0">
          <Card className="group h-full cursor-pointer rounded-[24px] border border-slate-200 bg-gradient-to-br from-white to-amber-50/70 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-md shadow-orange-200 transition-transform duration-300 group-hover:scale-110">
                <PenTool className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-800">Writing Practice</h3>
              <p className="text-sm text-slate-600">Korean handwriting</p>
              <ChevronRight className="mx-auto mt-3 h-4 w-4 text-slate-500 transition-transform duration-300 group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/progress" className="min-w-0">
          <Card className="group h-full cursor-pointer rounded-[24px] border border-slate-200 bg-gradient-to-br from-white to-sky-50/80 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-200 transition-transform duration-300 group-hover:scale-110">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-800">Progress</h3>
              <p className="text-sm text-slate-600">Detailed stats</p>
              <ChevronRight className="mx-auto mt-3 h-4 w-4 text-slate-500 transition-transform duration-300 group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/library" className="min-w-0">
          <Card className="group h-full cursor-pointer rounded-[24px] border border-slate-200 bg-gradient-to-br from-white to-emerald-50/80 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md shadow-green-200 transition-transform duration-300 group-hover:scale-110">
                <Book className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-800">Library</h3>
              <p className="text-sm text-slate-600">1000 words</p>
              <ChevronRight className="mx-auto mt-3 h-4 w-4 text-slate-500 transition-transform duration-300 group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/settings" className="min-w-0">
          <Card className="group h-full cursor-pointer rounded-[24px] border border-slate-200 bg-gradient-to-br from-white to-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-slate-700 text-white shadow-md shadow-slate-200 transition-transform duration-300 group-hover:scale-110">
                <Settings className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-800">Settings</h3>
              <p className="text-sm text-slate-600">Customize app</p>
              <ChevronRight className="mx-auto mt-3 h-4 w-4 text-slate-500 transition-transform duration-300 group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className="rounded-[28px] border border-yellow-200 bg-gradient-to-r from-yellow-50 via-orange-50 to-amber-50 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-md shadow-yellow-200">
              <Award className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl font-bold text-amber-800">Recent Achievements</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="py-6 text-center text-amber-700">
            Start learning to unlock your first achievement! 🏆
          </p>
        </CardContent>
      </Card>
    </div>
  );
}