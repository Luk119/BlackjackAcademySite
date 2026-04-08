'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

type TableMode = 'hard' | 'soft' | 'pairs';

const DEALER_UPCARDS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];

// Hard totals: rows = player total (8-17), cols = dealer upcard
const HARD_CHART: Record<number, string[]> = {
  8:  ['H','H','H','H','H','H','H','H','H','H'],
  9:  ['H','D','D','D','D','H','H','H','H','H'],
  10: ['D','D','D','D','D','D','D','D','H','H'],
  11: ['D','D','D','D','D','D','D','D','D','H'],
  12: ['H','H','S','S','S','H','H','H','H','H'],
  13: ['S','S','S','S','S','H','H','H','H','H'],
  14: ['S','S','S','S','S','H','H','H','H','H'],
  15: ['S','S','S','S','S','H','H','H','R','H'],
  16: ['S','S','S','S','S','H','H','R','R','R'],
  17: ['S','S','S','S','S','S','S','S','S','S'],
};

// Soft totals: rows = non-ace card value (2-9), cols = dealer upcard
const SOFT_CHART: Record<number, string[]> = {
  2: ['H','H','H','D','D','H','H','H','H','H'],
  3: ['H','H','H','D','D','H','H','H','H','H'],
  4: ['H','H','D','D','D','H','H','H','H','H'],
  5: ['H','H','D','D','D','H','H','H','H','H'],
  6: ['D','D','D','D','D','H','H','H','H','H'],
  7: ['S','D','D','D','D','S','S','H','H','H'],
  8: ['S','S','S','S','S','S','S','S','S','S'],
  9: ['S','S','S','S','S','S','S','S','S','S'],
};

// Pairs: rows = pair rank
const PAIRS_CHART: Record<string, string[]> = {
  '2': ['P','P','P','P','P','P','H','H','H','H'],
  '3': ['P','P','P','P','P','P','H','H','H','H'],
  '4': ['H','H','H','P','P','H','H','H','H','H'],
  '5': ['D','D','D','D','D','D','D','D','H','H'],
  '6': ['P','P','P','P','P','H','H','H','H','H'],
  '7': ['P','P','P','P','P','P','H','H','H','H'],
  '8': ['P','P','P','P','P','P','P','P','P','P'],
  '9': ['P','P','P','P','P','S','P','P','S','S'],
  '10':['S','S','S','S','S','S','S','S','S','S'],
  'A': ['P','P','P','P','P','P','P','P','P','P'],
};

const ACTION_STYLES: Record<string, string> = {
  H: 'bg-blue-700 text-white',
  S: 'bg-red-700 text-white',
  D: 'bg-yellow-600 text-black',
  P: 'bg-purple-700 text-white',
  R: 'bg-gray-600 text-white',
};

const ACTION_LABELS: Record<string, string> = {
  H: 'Hit',
  S: 'Stand',
  D: 'Double',
  P: 'Split',
  R: 'Surrender',
};

export function BasicStrategyTable() {
  const [mode, setMode] = useState<TableMode>('hard');
  const [highlighted, setHighlighted] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex gap-2">
        {(['hard', 'soft', 'pairs'] as TableMode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              'px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-colors',
              mode === m
                ? 'bg-gold text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700',
            )}
          >
            {m === 'hard' ? 'Hard Totals' : m === 'soft' ? 'Soft Totals' : 'Pairs'}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(ACTION_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setHighlighted(highlighted === key ? null : key)}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold transition-all',
              ACTION_STYLES[key],
              highlighted && highlighted !== key && 'opacity-30',
            )}
          >
            {key} = {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="text-xs border-collapse">
          <thead>
            <tr>
              <th className="bg-gray-900 p-2 text-gray-500 text-left">
                {mode === 'hard' ? 'Player' : mode === 'soft' ? 'A +' : 'Pair'}
              </th>
              {DEALER_UPCARDS.map(u => (
                <th key={u} className="bg-gray-900 p-2 text-gray-300 font-bold text-center min-w-[36px]">
                  {u}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mode === 'hard' && Object.entries(HARD_CHART).map(([total, actions]) => (
              <tr key={total}>
                <td className="bg-gray-900 p-2 font-bold text-gray-200 text-right pr-3">{total}</td>
                {actions.map((action, i) => (
                  <motion.td
                    key={i}
                    whileHover={{ scale: 1.15, zIndex: 10 }}
                    className={cn(
                      'p-1.5 text-center font-bold cursor-default border border-gray-900/50',
                      ACTION_STYLES[action],
                      highlighted && highlighted !== action && 'opacity-20',
                    )}
                    title={ACTION_LABELS[action]}
                  >
                    {action}
                  </motion.td>
                ))}
              </tr>
            ))}
            {mode === 'soft' && Object.entries(SOFT_CHART).map(([val, actions]) => (
              <tr key={val}>
                <td className="bg-gray-900 p-2 font-bold text-gray-200 text-right pr-3">{val}</td>
                {actions.map((action, i) => (
                  <motion.td
                    key={i}
                    whileHover={{ scale: 1.15, zIndex: 10 }}
                    className={cn(
                      'p-1.5 text-center font-bold cursor-default border border-gray-900/50',
                      ACTION_STYLES[action],
                      highlighted && highlighted !== action && 'opacity-20',
                    )}
                    title={ACTION_LABELS[action]}
                  >
                    {action}
                  </motion.td>
                ))}
              </tr>
            ))}
            {mode === 'pairs' && Object.entries(PAIRS_CHART).map(([pair, actions]) => (
              <tr key={pair}>
                <td className="bg-gray-900 p-2 font-bold text-gray-200 text-right pr-3">{pair}-{pair}</td>
                {actions.map((action, i) => (
                  <motion.td
                    key={i}
                    whileHover={{ scale: 1.15, zIndex: 10 }}
                    className={cn(
                      'p-1.5 text-center font-bold cursor-default border border-gray-900/50',
                      ACTION_STYLES[action],
                      highlighted && highlighted !== action && 'opacity-20',
                    )}
                    title={ACTION_LABELS[action]}
                  >
                    {action}
                  </motion.td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500">
        Based on 6-deck, S17, DAS, RSA rules. Click a legend item to highlight that action.
      </p>
    </div>
  );
}
