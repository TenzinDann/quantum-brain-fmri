import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('./components/QuantumScene', () => ({
  HeroScene: () => <div data-testid="hero-scene" />,
  QuantumComputerScene: () => <div data-testid="quantum-computer-scene" />,
}));

vi.mock('./components/Diagrams', () => ({
  SurfaceCodeDiagram: () => <div data-testid="surface-code-diagram" />,
  TransformerDecoderDiagram: () => <div data-testid="transformer-decoder-diagram" />,
  PerformanceMetricDiagram: () => <div data-testid="performance-metric-diagram" />,
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

    expect(screen.getByRole('heading', { name: /voxelbit/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /the noise barrier/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /towards fault tolerance/i })).toBeInTheDocument();
    expect(screen.getByTestId('hero-scene')).toBeInTheDocument();
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
