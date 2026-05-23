import { Extension, StateField, StateEffect } from '@codemirror/state';
import { EditorView, ViewPlugin, ViewUpdate, Decoration, DecorationSet, WidgetType, keymap } from '@codemirror/view';
import type AgyObsidianPlugin from '../../main';

// State
interface SuggestionState {
  text: string;
  pos: number;
}

const setSuggestion = StateEffect.define<SuggestionState | null>();

const suggestionField = StateField.define<SuggestionState | null>({
  create() {
    return null;
  },
  update(value, tr) {
    if (tr.docChanged || tr.selection) {
      return null;
    }
    for (const effect of tr.effects) {
      if (effect.is(setSuggestion)) {
        return effect.value;
      }
    }
    return value;
  },
  provide: (f) => EditorView.decorations.from(f, (state) => {
    if (!state) return Decoration.none;
    return Decoration.set([
      Decoration.widget({
        widget: new GhostTextWidget(state.text),
        side: 1
      }).range(state.pos)
    ]);
  })
});

class GhostTextWidget extends WidgetType {
  constructor(public readonly text: string) {
    super();
  }
  eq(other: GhostTextWidget) {
    return this.text === other.text;
  }
  toDOM() {
    const span = document.createElement('span');
    span.className = 'agy-copilot-ghost-text';
    span.textContent = this.text;
    span.style.color = 'var(--text-muted)';
    span.style.opacity = '0.6';
    span.style.pointerEvents = 'none';
    span.style.fontStyle = 'italic';
    return span;
  }
}

let timeoutId: number | null = null;
let currentSessionId = 0;

export function buildCopilotExtension(plugin: AgyObsidianPlugin): Extension {
  const pluginView = ViewPlugin.fromClass(
    class {
      constructor(public view: EditorView) {}
      update(update: ViewUpdate) {
        if (update.docChanged || update.selectionSet) {
          if (timeoutId) window.clearTimeout(timeoutId);
          currentSessionId++;
          const sessionId = currentSessionId;
          
          const pos = update.state.selection.main.head;
          const textBefore = update.state.sliceDoc(Math.max(0, pos - 1000), pos);
          const textAfter = update.state.sliceDoc(pos, Math.min(update.state.doc.length, pos + 1000));
          
          if (!textBefore.trim()) return;

          timeoutId = window.setTimeout(async () => {
            try {
              const prompt = [
                'You are an inline autocomplete engine. Complete the text following the prefix.',
                'Output ONLY the raw text that should be inserted next. Do not wrap in markdown code blocks. Do not repeat the prefix.',
                '',
                '<prefix>',
                textBefore,
                '</prefix>',
                '',
                '<suffix>',
                textAfter,
                '</suffix>',
                '',
                'Provide the immediate next logical words or sentence:'
              ].join('\n');

              let completion = '';
              for await (const event of plugin.agent.query({
                prompt,
                cwd: plugin.getVaultPath(),
                allowWorkspaceAccess: false,
              })) {
                if (sessionId !== currentSessionId) return;
                if (event.type === 'text') {
                  completion += event.content;
                }
              }
              
              if (sessionId !== currentSessionId || !completion.trim()) return;
              
              const cleanCompletion = completion.replace(/^```[^\n]*\n/, '').replace(/\n```$/, '').trim();
              if (cleanCompletion) {
                this.view.dispatch({
                  effects: setSuggestion.of({ text: cleanCompletion, pos })
                });
              }
            } catch (e) {
              // Ignore
            }
          }, 800);
        }
      }
    }
  );

  const copilotKeymap = keymap.of([
    {
      key: 'Tab',
      run: (view) => {
        const state = view.state.field(suggestionField, false);
        if (state) {
          view.dispatch({
            changes: { from: state.pos, insert: state.text },
            selection: { anchor: state.pos + state.text.length },
            effects: setSuggestion.of(null)
          });
          return true;
        }
        return false;
      }
    }
  ]);

  return [suggestionField, pluginView, copilotKeymap];
}
