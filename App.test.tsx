import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('./components/QuantumScene', () => ({
  HeroScene: () => <div data-testid="hero-scene" />,
  BrainNetworkScene: () => <div data-testid="brain-network-scene" />,
}));

vi.mock('./components/Diagrams', () => ({
  EvidenceChainDiagram: () => <div data-testid="evidence-chain-diagram" />,
  ComponentMatrixDiagram: () => <div data-testid="component-matrix-diagram" />,
  FindingsMetricDiagram: () => <div data-testid="findings-metric-diagram" />,
}));

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('scrollTo', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders hero content and key sections', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: /parcelbit/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /finding interpretable structure/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /two-layer food result/i })).toBeInTheDocument();
    expect(screen.getByTestId('hero-scene')).toBeInTheDocument();
    expect(screen.getByTestId('brain-network-scene')).toBeInTheDocument();
  });

  it('opens and closes mobile navigation menu', () => {
    render(<App />);

    const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
    fireEvent.click(menuButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
