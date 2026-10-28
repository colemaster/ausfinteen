// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTeenProfile, resetStoredProfile } from './TeenProfileContext';

describe('TeenProfileContext cross-island synchronization', () => {
  beforeEach(() => {
    localStorage.clear();
    resetStoredProfile();
  });

  it('provides default profile when empty', () => {
    const { result } = renderHook(() => useTeenProfile());
    expect(result.current.profile.name).toBe('Issy');
    expect(result.current.profile.age).toBe(15);
  });

  it('updates profile and notifies subscribers', () => {
    const { result } = renderHook(() => useTeenProfile());
    act(() => {
      result.current.updateProfile({ name: 'Sam', age: 16 });
    });
    expect(result.current.profile.name).toBe('Sam');
    expect(result.current.profile.age).toBe(16);
    expect(JSON.parse(localStorage.getItem('aus_teen_profile') || '{}').name).toBe('Sam');
  });

  it('applies age preset correctly', () => {
    const { result } = renderHook(() => useTeenProfile());
    act(() => {
      result.current.applyAgePreset(17);
    });
    expect(result.current.profile.age).toBe(17);
    expect(result.current.profile.hourlyRate).toBe(20.86);
  });

  it('resets profile correctly', () => {
    const { result } = renderHook(() => useTeenProfile());
    act(() => {
      result.current.updateProfile({ name: 'Custom' });
    });
    expect(result.current.profile.name).toBe('Custom');
    act(() => {
      result.current.resetProfile();
    });
    expect(result.current.profile.name).toBe('Issy');
    expect(localStorage.getItem('aus_teen_profile')).toBeNull();
  });
});
