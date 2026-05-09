/**
 * @jest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { create } from './index';

describe('dom-walker create()', () => {
  let container: HTMLElement;
  let child: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.setAttribute('data-level', '0');
    child = document.createElement('span');
    child.setAttribute('data-level', '1');
    container.appendChild(child);
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should create a walker from a DOM element', () => {
    const walker = create(container) as Record<string, unknown>;
    expect(walker).toBeDefined();
  });

  it('should support name() augmentation', () => {
    const walker = create(container) as { name(): string };
    expect(walker.name()).toBe('div');
  });

  it('should support children() augmentation', () => {
    const walker = create(container) as { children(): { length(): number } };
    expect(walker.children().length()).toBe(1);
  });

  it('should support attribute() augmentation', () => {
    const walker = create(container) as { attribute(name: string): string | null };
    expect(walker.attribute('data-level')).toBe('0');
  });

  it('should support $ prefix for data attributes', () => {
    const walker = create(container) as Record<string, unknown>;
    (container as unknown as Record<string, unknown>).customProp = 'test';
    expect(walker.$customProp).toBe('test');
  });

  it('should navigate to children by tag name', () => {
    const walker = create(container) as Record<string, unknown>;
    const spans = walker.span as { length(): number };
    expect(spans.length()).toBe(1);
  });
});
