import Link from 'next/link';
import { getAllParts } from '@/lib/courses';
import ProgressBanner from '@/components/ui/ProgressBanner';
import HomeBatchManager from '@/components/ui/HomeBatchManager';
import SyncButton from '@/components/ui/SyncButton';
import ThemeToggle from '@/components/ui/ThemeToggle';
import HomeAccordion from '@/components/ui/HomeAccordion';
import AuthHeader from '@/components/ui/AuthHeader';
import ResumeButton from '@/components/ui/ResumeButton';
import MentorOnly from '@/components/ui/MentorOnly';
import CurriculumSearch from '@/components/ui/CurriculumSearch';

export default function HomePage() {
  const parts = getAllParts();
  const totalTopics = parts.reduce((sum, p) => sum + p.modules.reduce((s, m) => s + m.topics.length, 0), 0);
  const totalModules = parts.reduce((sum, p) => sum + p.modules.length, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-xs font-bold text-white">M</div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              <span className="text-blue-600 dark:text-blue-400">Mentor</span>Desk
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <a href="#features" className="hover:text-gray-900 dark:hover:text-white transition-colors">Features</a>
            <a href="#curriculum" className="hover:text-gray-900 dark:hover:text-white transition-colors">Curriculum</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AuthHeader />
            <Link href="#curriculum" className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Landing Hero */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-xs text-blue-700 dark:text-blue-400 font-medium mb-6">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            Mentorship Platform for Full-Stack Development
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-tight mb-6">
            Teach full-stack dev<br />
            <span className="text-blue-600 dark:text-blue-400">without switching tabs</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
            Code editor, drawing board, live preview, and Node.js sandbox - all in one window. Built for mentors who screen-share while teaching.
          </p>
          <div className="flex items-center justify-center gap-4 mb-8">
            <Link
              href="#curriculum"
              className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
            >
              Explore Curriculum
            </Link>
            <a
              href="#features"
              className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              See Features
            </a>
          </div>
          <div className="mb-12">
            <ResumeButton />
          </div>
          {/* Stats */}
          <div className="flex items-center justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-black text-gray-900 dark:text-white">{parts.length}</div>
              <div className="text-xs text-gray-500 mt-1">Parts</div>
            </div>
            <div className="w-px h-10 bg-gray-200 dark:bg-gray-800" />
            <div>
              <div className="text-3xl font-black text-gray-900 dark:text-white">{totalModules}</div>
              <div className="text-xs text-gray-500 mt-1">Modules</div>
            </div>
            <div className="w-px h-10 bg-gray-200 dark:bg-gray-800" />
            <div>
              <div className="text-3xl font-black text-gray-900 dark:text-white">{totalTopics}</div>
              <div className="text-xs text-gray-500 mt-1">Topics</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 dark:bg-gray-950 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-10">Everything a mentor needs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
              <div className="text-2xl mb-3">💻</div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Multi-File Editor</h3>
              <p className="text-xs text-gray-500">HTML, CSS, JS, TypeScript with IntelliSense and live preview</p>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
              <div className="text-2xl mb-3">🎨</div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Drawing Board</h3>
              <p className="text-xs text-gray-500">Sketch architecture diagrams and write notes alongside code</p>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
              <div className="text-2xl mb-3">🎬</div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Present Mode</h3>
              <p className="text-xs text-gray-500">One-click fullscreen for clean screen-sharing sessions</p>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
              <div className="text-2xl mb-3">📊</div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Batch System</h3>
              <p className="text-xs text-gray-500">Manage multiple batches with isolated progress and code</p>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section id="curriculum" className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Curriculum</h2>
              <p className="text-sm text-gray-500 mt-1">{totalTopics} topics across {totalModules} modules</p>
            </div>
            <div className="flex items-center gap-2">
              <MentorOnly>
                <Link href="/dashboard" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">Dashboard</Link>
                <HomeBatchManager />
                <SyncButton />
              </MentorOnly>
            </div>
          </div>

          <ProgressBanner />
          <CurriculumSearch parts={parts} />
          <HomeAccordion parts={parts} />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 text-center text-xs text-gray-500">
        MentorDesk - Built for mentors, by developers.
      </footer>
    </div>
  );
}
