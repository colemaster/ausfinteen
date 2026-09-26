// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from './index';

/**
 * Recharts is ~149 KB gzip. These tests guard the behaviour that keeps it off the
 * critical path: the library is not requested at all until a chart approaches
 * the viewport.
 *
 * jsdom reports a zero-width layout, so Recharts' ResponsiveContainer mounts but
 * draws no <svg>. We therefore assert on the ResponsiveContainer element, which
 * is what proves the async chunk was fetched and the lazy children mounted.
 */

let container: HTMLDivElement;
let root: Root | undefined;
let notifyIntersecting: (() => void) | null;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  notifyIntersecting = null;

  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(cb: IntersectionObserverCallback) {
        notifyIntersecting = () =>
          cb(
            [{ isIntersecting: true } as IntersectionObserverEntry],
            this as unknown as IntersectionObserver,
          );
      }
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    },
  );
});

afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  container.remove();
  vi.unstubAllGlobals();
});

function render(element: React.ReactNode) {
  act(() => {
    root = createRoot(container);
    root.render(element);
  });
}

const chart = (
  <ResponsiveContainer height={280}>
    <BarChart data={[{ year: '2026', v: 10 }, { year: '2027', v: 20 }]}>
      <XAxis dataKey="year" />
      <YAxis />
      <Bar dataKey="v" />
    </BarChart>
  </ResponsiveContainer>
);

const skeleton = () => container.querySelector('[data-chart-skeleton]');
const rechartsMounted = () => container.querySelector('.recharts-responsive-container');

describe('deferred chart primitives', () => {
  it('defers Recharts entirely while the chart is off-screen', () => {
    render(chart);

    expect(notifyIntersecting).not.toBeNull();
    expect(rechartsMounted()).toBeNull();
  });

  it('reserves the chart height up-front so nothing reflows', () => {
    render(chart);

    const placeholder = skeleton();
    expect(placeholder).not.toBeNull();
    expect(placeholder!.getAttribute('style')).toContain('height: 280px');
  });

  it('loads and mounts the chart once it approaches the viewport', async () => {
    render(chart);
    expect(rechartsMounted()).toBeNull();

    await act(async () => {
      notifyIntersecting!();
    });
    await vi.waitFor(() => expect(rechartsMounted()).not.toBeNull());

    // The placeholder is swapped out for the real chart.
    expect(skeleton()).toBeNull();
  });

  it('loads the chart immediately where IntersectionObserver is unavailable', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);

    render(chart);
    await vi.waitFor(() => expect(rechartsMounted()).not.toBeNull());

    // Old browsers and non-DOM environments must not be stuck on a placeholder
    // that can never resolve.
    expect(skeleton()).toBeNull();
  });
});
