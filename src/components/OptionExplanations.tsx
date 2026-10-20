import React from 'react';
import type { Question } from '../types/quiz';
import { CheckCircle2 } from 'lucide-react';
import { getOptionExplanation, OPTION_KEYS } from '../utils/questionExplanations';

interface OptionExplanationsProps {
  question: Question;
}

export const OptionExplanations: React.FC<OptionExplanationsProps> = ({ question }) => {
  const hasSeparateExplanations = OPTION_KEYS.some((option) => getOptionExplanation(question, option));

  return (
    <section className="space-y-3" aria-label="Giải thích cho từng đáp án">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 text-sm font-bold text-white">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          {hasSeparateExplanations ? 'Giải thích theo từng phương án' : 'Giải thích chi tiết'}
        </h4>
        <span className="rounded-full border border-emerald-700/50 bg-emerald-950/50 px-2.5 py-1 text-xs font-semibold text-emerald-300">
          Đáp án đúng: {question.answer}
        </span>
      </div>

      {hasSeparateExplanations ? (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {OPTION_KEYS.map((option, index) => {
            const isCorrect = option === question.answer.toUpperCase();
            const explanation = getOptionExplanation(question, option);
            const optionText = question.options[index];

            return (
              <article
                key={option}
                className={`rounded-xl border p-3 sm:p-3.5 ${
                  isCorrect
                    ? 'border-emerald-700/60 bg-emerald-950/25'
                    : 'border-slate-700/80 bg-slate-900/70'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-bold ${
                      isCorrect
                        ? 'border-emerald-500/60 bg-emerald-600/30 text-emerald-200'
                        : 'border-slate-600 bg-slate-800 text-slate-300'
                    }`}
                  >
                    {option}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">Phương án {option}</span>
                  {isCorrect && (
                    <span className="ml-auto text-[10px] font-bold uppercase tracking-wide text-emerald-400">
                      Chính xác
                    </span>
                  )}
                </div>

                {optionText && (
                  <p className="mt-2 break-words text-xs leading-relaxed text-slate-400">{optionText}</p>
                )}
                <p className="mt-2 break-words text-sm leading-relaxed text-slate-200">
                  {explanation || 'Chưa có giải thích riêng cho phương án này.'}
                </p>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-3 text-sm leading-relaxed text-slate-200 sm:p-4">
          {question.explanation || 'Chưa có giải thích cho câu hỏi này.'}
        </p>
      )}
    </section>
  );
};
