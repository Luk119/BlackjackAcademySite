'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { lessonsApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Question {
  id: string;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuizProps {
  quizId: string;
  title: string;
  questions: Question[];
  onComplete?: (score: number, maxScore: number) => void;
}

export function Quiz({ quizId, title, questions, onComplete }: QuizProps) {
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnswer = (qIndex: number, optIndex: number) => {
    if (submitted) return;
    setAnswers(prev => {
      const next = [...prev];
      next[qIndex] = optIndex;
      return next;
    });
  };

  const handleSubmit = async () => {
    if (answers.some(a => a === null)) {
      toast.error('Please answer all questions first');
      return;
    }

    setIsLoading(true);
    try {
      const result = await lessonsApi.submitQuiz(quizId, answers as number[]);
      setResults(result.results);
      setSubmitted(true);
      onComplete?.(result.score, result.maxScore);
      if (result.passed) {
        toast.success(`Passed! ${result.score}/${result.maxScore} correct`, { icon: '🎉' });
      } else {
        toast.error(`${result.score}/${result.maxScore} — try again`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const score = results.filter(r => r.correct).length;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        {!submitted && (
          <span className="text-sm text-gray-400">
            {answers.filter(a => a !== null).length}/{questions.length} answered
          </span>
        )}
        {submitted && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              'text-sm font-bold px-3 py-1 rounded-full',
              score === questions.length ? 'bg-green-700 text-green-100' :
              score >= Math.ceil(questions.length * 0.7) ? 'bg-yellow-700 text-yellow-100' :
              'bg-red-700 text-red-100',
            )}
          >
            {score}/{questions.length}
          </motion.span>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q, qIdx) => {
          const userAnswer = answers[qIdx];
          const result = results[qIdx];

          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qIdx * 0.05 }}
              className={cn(
                'bg-gray-800/60 rounded-xl p-4 border',
                !submitted && 'border-gray-700',
                submitted && result?.correct && 'border-green-600',
                submitted && !result?.correct && 'border-red-600',
              )}
            >
              <p className="text-white font-medium mb-3">
                <span className="text-gray-500 mr-2">{qIdx + 1}.</span>
                {q.text}
              </p>

              <div className="space-y-2">
                {q.options.map((opt, optIdx) => {
                  const isSelected = userAnswer === optIdx;
                  const isCorrect = optIdx === q.correct;
                  const showResult = submitted;

                  return (
                    <motion.button
                      key={optIdx}
                      whileHover={!submitted ? { scale: 1.01 } : undefined}
                      whileTap={!submitted ? { scale: 0.99 } : undefined}
                      onClick={() => handleAnswer(qIdx, optIdx)}
                      disabled={submitted}
                      className={cn(
                        'w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all border',
                        !showResult && !isSelected && 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500',
                        !showResult && isSelected && 'bg-blue-700/50 border-blue-500 text-white',
                        showResult && isCorrect && 'bg-green-700/50 border-green-500 text-green-100',
                        showResult && !isCorrect && isSelected && 'bg-red-700/50 border-red-500 text-red-100',
                        showResult && !isCorrect && !isSelected && 'bg-gray-700/30 border-gray-700 text-gray-500',
                      )}
                    >
                      <span className="mr-2 font-semibold">{String.fromCharCode(65 + optIdx)}.</span>
                      {opt}
                      {showResult && isCorrect && <span className="ml-2">✓</span>}
                      {showResult && !isCorrect && isSelected && <span className="ml-2">✗</span>}
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation after submit */}
              {submitted && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-3 text-xs text-gray-400 bg-gray-900/50 rounded-lg p-3 border border-gray-700"
                >
                  <span className="font-semibold text-gray-300">Explanation: </span>
                  {q.explanation}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Submit */}
      {!submitted && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={isLoading || answers.some(a => a === null)}
          className="w-full py-3 bg-gradient-to-r from-gold-dark to-gold text-black font-bold rounded-xl
            disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
        >
          {isLoading ? 'Checking...' : 'Submit Answers'}
        </motion.button>
      )}
    </div>
  );
}
