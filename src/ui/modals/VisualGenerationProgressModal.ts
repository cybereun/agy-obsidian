import { Modal, type App } from 'obsidian';

export type VisualProgressState = 'running' | 'success' | 'error';

export class VisualGenerationProgressModal extends Modal {
  private listEl: HTMLElement | null = null;
  private statusEl: HTMLElement | null = null;
  private title: string;

  constructor(app: App, title = 'Generating AgyObsidian media') {
    super(app);
    this.title = title;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('agy-obsidian-visual-progress-modal');
    contentEl.createEl('h2', { text: this.title });
    this.statusEl = contentEl.createDiv({ cls: 'agy-obsidian-visual-progress-status', text: 'Starting...' });
    this.listEl = contentEl.createDiv({ cls: 'agy-obsidian-visual-progress-list' });
  }

  addStep(message: string): void {
    console.log(`[AgyObsidian visual] ${message}`);
    this.statusEl?.setText(message);
    if (this.listEl?.lastElementChild?.textContent === message) return;
    const item = this.listEl?.createDiv({ cls: 'agy-obsidian-visual-progress-item is-running' });
    item?.setText(message);
    item?.scrollIntoView({ block: 'nearest' });
  }

  finish(message: string, state: VisualProgressState): void {
    const logger = state === 'error' ? console.error : console.log;
    logger(`[AgyObsidian visual] ${message}`);
    this.statusEl?.setText(message);
    this.statusEl?.toggleClass('is-success', state === 'success');
    this.statusEl?.toggleClass('is-error', state === 'error');
    const item = this.listEl?.createDiv({ cls: `agy-obsidian-visual-progress-item is-${state}` });
    item?.setText(message);
    item?.scrollIntoView({ block: 'nearest' });
  }

  onClose(): void {
    this.contentEl.empty();
    this.listEl = null;
    this.statusEl = null;
  }
}
