import {
  GhostRenderer,
  SurmiserEngine,
  buildContext,
  type SurmiserOptions,
  type SurmiserProvider,
} from "surmiser";

import type { SearchResult } from "@/app/lib/search-results";

/**
 * A slightly tweaked Surmiser attach helper that avoids hiding the ghost
 * suggestion between keystrokes, which reduces visible flicker.
 */
export function attachStableSurmiser(
  inputEl: HTMLInputElement,
  options: SurmiserOptions
): () => void {
  const renderer = new GhostRenderer(inputEl);
  const engine = new SurmiserEngine({
    ...options,
    onSuggestion: (suggestion) => {
      renderer.render(
        inputEl.value,
        inputEl.selectionStart || 0,
        suggestion?.text || null
      );
      options.onSuggestion?.(suggestion);
    },
  });

  let isComposing = false;

  const renderFromCurrent = () => {
    const suggestion = engine.getCurrentSuggestion();
    renderer.render(
      inputEl.value,
      inputEl.selectionStart || 0,
      suggestion?.text || null
    );
  };

  const onInput = () => {
    if (isComposing) return;
    const value = inputEl.value;
    const cursorPos = inputEl.selectionStart || 0;
    const ctx = buildContext(value, cursorPos);
    engine.requestSuggestion(ctx);
  };

  const onCompositionStart = () => {
    isComposing = true;
    engine.clearSuggestion();
    renderer.render(inputEl.value, inputEl.selectionStart || 0, null);
  };

  const onCompositionEnd = () => {
    isComposing = false;
    onInput();
  };

  const acceptSuggestion = (suggestion: { text: string }) => {
    const cursorPos = inputEl.selectionStart || 0;
    const newValue = inputEl.value.slice(0, cursorPos) + suggestion.text;
    inputEl.value = newValue;
    inputEl.setSelectionRange(newValue.length, newValue.length);
    inputEl.dispatchEvent(new Event("input", { bubbles: true }));
    engine.clearSuggestion();
    renderer.render(newValue, newValue.length, null);
    options.onAccept?.(suggestion as any);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const suggestion = engine.getCurrentSuggestion();
    if (!suggestion) return;
    if (e.key === "Tab") {
      e.preventDefault();
      acceptSuggestion(suggestion);
      return;
    }
    if (e.key === "ArrowRight" && inputEl.selectionStart === inputEl.value.length) {
      e.preventDefault();
      acceptSuggestion(suggestion);
      return;
    }
    if (e.key === "Escape") {
      engine.clearSuggestion();
      renderer.render(inputEl.value, inputEl.selectionStart || 0, null);
      return;
    }
  };

  const onBlur = () => {
    engine.clearSuggestion();
    renderFromCurrent();
  };

  inputEl.addEventListener("input", onInput);
  inputEl.addEventListener("keydown", onKeyDown);
  inputEl.addEventListener("blur", onBlur);
  inputEl.addEventListener("compositionstart", onCompositionStart);
  inputEl.addEventListener("compositionend", onCompositionEnd);

  return () => {
    inputEl.removeEventListener("input", onInput);
    inputEl.removeEventListener("keydown", onKeyDown);
    inputEl.removeEventListener("blur", onBlur);
    inputEl.removeEventListener("compositionstart", onCompositionStart);
  inputEl.removeEventListener("compositionend", onCompositionEnd);
  engine.destroy();
  renderer.destroy();
  };
}

export function createSurmiserProvider(
  searchResults: SearchResult[]
): SurmiserProvider {
  return {
    id: "tsl-search",
    priority: 100,
    async suggest(ctx, signal) {
      if (signal.aborted) return null;
      const cursor = Number.isFinite(ctx.cursorPosition)
        ? ctx.cursorPosition
        : ctx.text.length;
      const query = ctx.text.slice(0, cursor).trim();
      if (!query) return null;
      const normalized = query.toLowerCase();

      let best: { text: string; confidence: number } | null = null;

      for (const item of searchResults) {
        const suggestionText = getCompletion(normalized, query, item);
        if (!suggestionText) continue;

        const confidence = computeConfidence(
          normalized.length,
          item.titleLower.length
        );

        if (!best || confidence > best.confidence) {
          best = { text: suggestionText, confidence };
        }

        if (confidence === 100) break;
      }

      if (!best) return null;

      return {
        text: best.text,
        confidence: best.confidence,
        providerId: "tsl-search",
      };
    },
  };
}

function getCompletion(
  normalizedQuery: string,
  rawQuery: string,
  item: SearchResult
): string | null {
  const tryField = (field: string, lower: string) => {
    if (rawQuery.length >= field.length) return null;
    if (!lower.startsWith(normalizedQuery)) return null;
    const remainder = field.slice(rawQuery.length);
    return remainder || null;
  };

  return (
    tryField(item.title, item.titleLower) ||
    tryField(item.breadcrumb, item.breadcrumbLower) ||
    (item.description
      ? tryField(item.description, item.descriptionLower)
      : null) ||
    null
  );
}

function computeConfidence(
  queryLength: number,
  candidateLength: number
): number {
  if (candidateLength === 0) return 0;
  const ratio = Math.min(1, queryLength / candidateLength);
  const score = Math.round(75 + ratio * 25);
  return Math.max(70, Math.min(100, score));
}
