import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, MessageSquare, BookOpen, Clock, Brain, 
  ArrowLeft, Trophy, Calculator, Calendar, FileText, Sparkles
} from 'lucide-react';
import { StudentChat } from './components/StudentChat';
import { SubjectsManager } from './components/SubjectsManager';
import { PomodoroTimer } from './components/PomodoroTimer';
import { FlashcardsStudy } from './components/FlashcardsStudy';
import { ExamSimulator } from './components/ExamSimulator';
import { FinalGradeCalculator } from './components/FinalGradeCalculator';
import { ClassScheduleGrid } from './components/ClassScheduleGrid';
import { FocusSoundscape } from './components/FocusSoundscape';
import { AcademicBadges } from './components/AcademicBadges';
import { SubjectMentors, SUBJECT_MENTORS } from './components/SubjectMentors';
import { useStudentXP } from './hooks/useStudentXP';


type StudentTab = 'mentors' | 'chat' | 'subjects' | 'exam' | 'calculator' | 'schedule' | 'pomodoro' | 'flashcards' | 'badges';

export const StudentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StudentTab>('mentors');
  const navigate = useNavigate();
  const { totalXP, currentLevel } = useStudentXP();

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fade-in">
      
      {/* Top Header with Universal Back Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/app')}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mr-1 flex items-center gap-1 font-semibold text-xs"
              title="Voltar ao Painel Principal"
            >
              <ArrowLeft size={18} />
              <span>Voltar</span>
            </button>
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
              <GraduationCap size={24} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Hub Académico &amp; Estudantes
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-12">
            Plataforma académica integral: mentores IA por disciplina, exames simulados, horário exportável e som binaural.
          </p>
        </div>

        <div className="flex items-center gap-2 pl-12 sm:pl-0">
          <button
            onClick={() => setActiveTab('badges')}
            className="px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-xs border border-amber-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trophy size={14} />
            <span>{currentLevel.icon} Nível {currentLevel.level} • {currentLevel.name} (+{totalXP.toLocaleString()} XP)</span>
          </button>
        </div>
      </div>


      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('mentors')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'mentors'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles size={18} />
          <span>Mentores IA ({SUBJECT_MENTORS.length} Especialistas)</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'chat'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MessageSquare size={18} />
          <span>Chat &amp; Tutor Geral</span>
        </button>

        <button
          onClick={() => setActiveTab('subjects')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'subjects'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen size={18} />
          <span>Disciplinas &amp; Média</span>
        </button>

        <button
          onClick={() => setActiveTab('exam')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'exam'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText size={18} />
          <span>Simulador de Exames IA</span>
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'calculator'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calculator size={18} />
          <span>Calculadora de Nota Mínima</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'schedule'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar size={18} />
          <span>Horário Semanal (.ics)</span>
        </button>

        <button
          onClick={() => setActiveTab('pomodoro')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'pomodoro'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Clock size={18} />
          <span>Foco &amp; Som Binaural</span>
        </button>

        <button
          onClick={() => setActiveTab('flashcards')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'flashcards'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Brain size={18} />
          <span>Flashcards de Revisão</span>
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'badges'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Trophy size={18} />
          <span>Conquistas &amp; XP</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="pt-2">
        {activeTab === 'mentors' && <SubjectMentors />}
        {activeTab === 'chat' && <StudentChat />}
        {activeTab === 'subjects' && <SubjectsManager />}
        {activeTab === 'exam' && <ExamSimulator />}
        {activeTab === 'calculator' && <FinalGradeCalculator />}
        {activeTab === 'schedule' && <ClassScheduleGrid />}
        {activeTab === 'pomodoro' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PomodoroTimer />
            </div>
            <div>
              <FocusSoundscape />
            </div>
          </div>
        )}
        {activeTab === 'flashcards' && <FlashcardsStudy />}
        {activeTab === 'badges' && <AcademicBadges />}
      </div>

    </div>
  );
};

export default StudentsPage;


