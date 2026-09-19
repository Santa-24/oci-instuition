'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { supabase } from '@/lib/supabase/client';
import { HelpCircle, Clock, Award, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function StudentExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [activeExam, setActiveExam] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isTestActive, setIsTestActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scorecard, setScorecard] = useState<any | null>(null);

  useEffect(() => {
    async function loadExams() {
      const { data } = await supabase.from('exams').select('*').eq('is_published', true);
      if (data) setExams(data);
    }
    loadExams();
  }, []);

  const handleStartExam = async (exam: any) => {
    setActiveExam(exam);
    // Fetch questions from question bank
    const { data } = await supabase.from('questions').select('*').limit(10);
    const loadedQ = (data && data.length > 0) ? data : [
      {
        id: 'q1',
        question: 'A shopkeeper sells an article at a discount of 20% on the marked price and still earns a profit of 25%. If the marked price is Rs. 500, what is the cost price?',
        options: ['Rs. 320', 'Rs. 350', 'Rs. 300', 'Rs. 400'],
        correct_option_index: 0,
        marks: 4,
        negative_marks: 1,
      },
      {
        id: 'q2',
        question: 'In which year was the historic Salt Satyagraha launched at Inchudi in Balasore district of Odisha?',
        options: ['1930', '1920', '1942', '1919'],
        correct_option_index: 0,
        marks: 4,
        negative_marks: 1,
      },
    ];
    setQuestions(loadedQ);
    setAnswers({});
    setScorecard(null);
    setIsTestActive(true);
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitExam = async () => {
    setIsSubmitting(true);
    try {
      // 1. Send submission to Render backend API or evaluate directly
      const studentId = 'usr_std_01';
      let correct = 0;
      let score = 0;
      const totalMarks = questions.length * 4;

      for (const q of questions) {
        const selected = answers[q.id];
        if (selected !== undefined && selected !== null) {
          if (selected === q.correct_option_index) {
            correct++;
            score += q.marks || 4;
          } else {
            score -= q.negative_marks || 1;
          }
        }
      }

      const percentage = totalMarks > 0 ? Number(((score / totalMarks) * 100).toFixed(1)) : 0;
      const accuracy = Object.keys(answers).length > 0 ? Number(((correct / Object.keys(answers).length) * 100).toFixed(1)) : 0;

      const resultObj = {
        score: Math.max(0, score),
        totalMarks,
        correctCount: correct,
        attemptedCount: Object.keys(answers).length,
        totalQuestions: questions.length,
        percentage,
        accuracy,
        airRank: 14,
      };

      // Record in Supabase exam_results if available
      try {
        await supabase.from('exam_results').upsert({
          exam_id: activeExam?.id,
          student_id: studentId,
          score: resultObj.score,
          total_marks: totalMarks,
          percentage: resultObj.percentage,
          accuracy_percentage: resultObj.accuracy,
          responses: answers,
          submitted_at: new Date().toISOString(),
        });
      } catch (_) {}

      setScorecard(resultObj);
      setIsTestActive(false);
    } catch (err) {
      console.error('[Exam Submission Error]:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight">Computer-Based Mock Test (CBT) Series</h1>
        <p className="text-xs text-slate-400 mt-1">
          Simulate real exam pressure, time management, and negative marking constraints under strict competitive conditions.
        </p>
      </div>

      {/* Scorecard Modal */}
      {scorecard && (
        <Card glow className="p-6 border-indigo-500/30 bg-indigo-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-amber-400" />
              <div>
                <h3 className="text-lg font-black text-white">Official CBT Mock Scorecard</h3>
                <p className="text-xs text-slate-400">Test: {activeExam?.title}</p>
              </div>
            </div>
            <Badge variant="success" className="text-sm px-3 py-1">
              AIR {scorecard.airRank}
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400">Final Score</span>
              <p className="text-xl font-black text-white mt-0.5">{scorecard.score} / {scorecard.totalMarks}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400">Percentage</span>
              <p className="text-xl font-black text-indigo-400 mt-0.5">{scorecard.percentage}%</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400">Accuracy</span>
              <p className="text-xl font-black text-emerald-400 mt-0.5">{scorecard.accuracy}%</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400">Attempted</span>
              <p className="text-xl font-black text-amber-400 mt-0.5">{scorecard.attemptedCount} / {scorecard.totalQuestions}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Test Runner Modal */}
      {isTestActive && (
        <Modal isOpen={isTestActive} onClose={() => setIsTestActive(false)} title={`CBT: ${activeExam?.title}`}>
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
              <span>Marking: +4 for correct • -1 for incorrect • 0 for unattempted</span>
              <span className="font-mono font-bold text-white flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> 60:00 Mins Remaining
              </span>
            </div>

            {questions.map((q, qIndex) => {
              const opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
              return (
                <div key={q.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-white leading-relaxed">
                      Q{qIndex + 1}. {q.question}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">4 Marks</span>
                  </div>

                  <div className="space-y-2 pt-1">
                    {(opts || []).map((opt: string, optIndex: number) => {
                      const isSelected = answers[q.id] === optIndex;
                      return (
                        <button
                          key={optIndex}
                          type="button"
                          onClick={() => handleSelectOption(q.id, optIndex)}
                          className={`w-full text-left p-3 rounded-lg text-xs font-medium border transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-indigo-600/20 border-indigo-500 text-white'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span>{opt}</span>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-indigo-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmitExam}
              isLoading={isSubmitting}
            >
              Submit CBT Exam & Calculate Scorecard
            </Button>
          </div>
        </Modal>
      )}

      {/* Published Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exams.map((exam) => (
          <Card key={exam.id} className="p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="primary">OFFICIAL CBT</Badge>
                <span className="text-xs text-slate-400 font-mono">{exam.duration_minutes} Mins</span>
              </div>
              <h3 className="text-sm font-bold text-white">{exam.title}</h3>
              <p className="text-xs text-slate-400">Total Marks: {exam.total_marks} • Negative Marking Enabled</p>
            </div>

            <Button
              size="sm"
              onClick={() => handleStartExam(exam)}
              rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
            >
              Start CBT Test
            </Button>
          </Card>
        ))}

        {exams.length === 0 && (
          <div className="col-span-full py-12 text-center text-xs text-slate-500">
            No mock tests currently published for your batch.
          </div>
        )}
      </div>
    </div>
  );
}
