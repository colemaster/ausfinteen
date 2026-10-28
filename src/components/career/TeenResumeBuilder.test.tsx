// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TeenResumeBuilder, ROLE_PRESETS, STAR_INTERVIEW_SCENARIOS } from './TeenResumeBuilder';

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

beforeEach(() => {
  localStorage.clear();
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockImplementation(() => Promise.resolve()),
    },
  });
});

describe('TeenResumeBuilder Component', () => {
  it('renders title, ATS compatibility meter, and template selector', () => {
    render(<TeenResumeBuilder />);

    expect(
      screen.getByText(/First Job Resume Builder & STAR Interview Simulator/i),
    ).toBeDefined();
    expect(screen.getByText(/ATS Scanner Readiness/i)).toBeDefined();
    expect(screen.getByText(/Applicant Tracking System Ready/i)).toBeDefined();
    expect(screen.getByText('ATS Single-Page')).toBeDefined();
    expect(screen.getByText('Modern Casual')).toBeDefined();
    expect(screen.getByText('Academic / Trainee')).toBeDefined();
    expect(screen.getByText('Clean Minimalist')).toBeDefined();
  });

  it('renders all 7 zero-experience role presets and applies them on click', () => {
    render(<TeenResumeBuilder />);

    for (const preset of ROLE_PRESETS) {
      const shortName = preset.name.split('(')[0].trim();
      const presetButtons = screen.getAllByText(new RegExp(shortName, 'i'));
      expect(presetButtons.length).toBeGreaterThan(0);
    }

    // Apply Babysitting preset
    const babysittingPresetBtn = screen.getByText("Babysitting & Mother's Helper");
    fireEvent.click(babysittingPresetBtn);

    expect(screen.getByDisplayValue(/Child Care/i)).toBeDefined();
  });

  it('allows customizing school achievements, sports leadership, and certifications', () => {
    render(<TeenResumeBuilder />);

    const achieveInput = screen.getByPlaceholderText(/Year 10 Honour Roll/i);
    fireEvent.change(achieveInput, {
      target: { value: 'Year 10 Dux of Science, 100% Attendance Award' },
    });

    const sportsInput = screen.getByPlaceholderText(/Under-15 Netball Captain/i);
    fireEvent.change(sportsInput, {
      target: { value: 'Captain of District Touch Football Team' },
    });

    const certInput = screen.getByPlaceholderText(/HLTAID011 Provide First Aid/i);
    fireEvent.change(certInput, {
      target: { value: 'HLTAID011 Provide First Aid & CPR + SITXFSA005 Food Safety' },
    });

    expect(screen.getAllByText(/Year 10 Dux of Science/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/District Touch Football Team/i).length).toBeGreaterThan(0);
  });

  it('switches between ATS, modern, academic, and minimalist templates', () => {
    render(<TeenResumeBuilder />);

    // Modern Casual
    const modernBtn = screen.getByText('Modern Casual');
    fireEvent.click(modernBtn);
    expect(screen.getByText(/First Job AU/i)).toBeDefined();

    // Academic / Trainee
    const academicBtn = screen.getByText('Academic / Trainee');
    fireEvent.click(academicBtn);
    expect(screen.getByText(/Academic Standing/i)).toBeDefined();

    // Clean Minimalist
    const minimalistBtn = screen.getByText('Clean Minimalist');
    fireEvent.click(minimalistBtn);
    expect(screen.getByText(/\/\/ 01\. PROFILE SUMMARY/i)).toBeDefined();

    // Back to ATS
    const atsBtn = screen.getByText('ATS Single-Page');
    fireEvent.click(atsBtn);
    expect(screen.getByText(/OBJECTIVE & PERSONAL PROFILE/i)).toBeDefined();
  });

  it('copies plain text and markdown formatted resumes to clipboard', () => {
    render(<TeenResumeBuilder />);

    const copyTextBtn = screen.getByText('Copy Text');
    fireEvent.click(copyTextBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();

    const copyMdBtn = screen.getByText('Markdown');
    fireEvent.click(copyMdBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it('renders all 7 STAR method interview scenarios with S-T-A-R cards and coach tips', () => {
    render(<TeenResumeBuilder />);

    expect(screen.getByText(/STAR Method Interview Technique Simulator/i)).toBeDefined();
    expect(STAR_INTERVIEW_SCENARIOS.length).toBe(7);

    // Open Scenario 2 (Teamwork Under Heavy Rush)
    const scenario2Btn = screen.getByText(STAR_INTERVIEW_SCENARIOS[1].q);
    fireEvent.click(scenario2Btn);

    expect(screen.getByText(STAR_INTERVIEW_SCENARIOS[1].situation)).toBeDefined();
    expect(screen.getByText(STAR_INTERVIEW_SCENARIOS[1].task)).toBeDefined();
    expect(screen.getByText(STAR_INTERVIEW_SCENARIOS[1].action)).toBeDefined();
    expect(screen.getByText(STAR_INTERVIEW_SCENARIOS[1].result)).toBeDefined();
  });

  it('supports loading a scenario into the custom STAR rehearsal builder and copying it', () => {
    render(<TeenResumeBuilder />);

    const scenario3Btn = screen.getByText(STAR_INTERVIEW_SCENARIOS[2].q);
    fireEvent.click(scenario3Btn);

    const loadIntoBuilderBtn = screen.getByText(/Load into Custom Practice Builder/i);
    fireEvent.click(loadIntoBuilderBtn);

    expect(
      screen.getByDisplayValue(STAR_INTERVIEW_SCENARIOS[2].situation),
    ).toBeDefined();

    const copyStarBtn = screen.getByText('Copy Formatted Answer');
    fireEvent.click(copyStarBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});
