import { renderHook, act } from '@testing-library/react';
import { useCardCounting } from './useCardCounting';
import { Card } from '@/types/game.types';

const makeCard = (rank: string): Card => ({ suit: 'hearts', rank: rank as any, value: 0, faceDown: false });

describe('useCardCounting (Hi-Lo)', () => {
  it('starts at 0', () => {
    const { result } = renderHook(() => useCardCounting('hi-lo'));
    expect(result.current.runningCount).toBe(0);
  });

  it('increments on low card', () => {
    const { result } = renderHook(() => useCardCounting('hi-lo'));
    act(() => { result.current.countCard(makeCard('5')); });
    expect(result.current.runningCount).toBe(1);
  });

  it('decrements on high card', () => {
    const { result } = renderHook(() => useCardCounting('hi-lo'));
    act(() => { result.current.countCard(makeCard('K')); });
    expect(result.current.runningCount).toBe(-1);
  });

  it('neutral card does not change count', () => {
    const { result } = renderHook(() => useCardCounting('hi-lo'));
    act(() => { result.current.countCard(makeCard('8')); });
    expect(result.current.runningCount).toBe(0);
  });

  it('calculates true count correctly', () => {
    const { result } = renderHook(() => useCardCounting('hi-lo'));
    act(() => {
      result.current.countCard(makeCard('2'));
      result.current.countCard(makeCard('3'));
      result.current.countCard(makeCard('4'));
    });
    const trueCount = result.current.getTrueCount(3);
    expect(trueCount).toBe(1);
  });

  it('resets properly', () => {
    const { result } = renderHook(() => useCardCounting('hi-lo'));
    act(() => {
      result.current.countCard(makeCard('2'));
      result.current.countCard(makeCard('A'));
      result.current.reset();
    });
    expect(result.current.runningCount).toBe(0);
    expect(result.current.cardsDealt).toBe(0);
  });

  it('skips face-down cards', () => {
    const { result } = renderHook(() => useCardCounting('hi-lo'));
    act(() => {
      result.current.countCard({ suit: 'hearts', rank: '5', value: 5, faceDown: true });
    });
    expect(result.current.runningCount).toBe(0);
  });

  it('gives correct bet advice for high count', () => {
    const { result } = renderHook(() => useCardCounting('hi-lo'));
    expect(result.current.getBetAdvice(4)).toContain('8x');
  });
});
