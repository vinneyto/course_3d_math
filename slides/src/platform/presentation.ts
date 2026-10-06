/** A slide applies only its own change and can revert it, including user edits. */
export interface Slide<Context> {
  id: string;
  apply(context: Context, signal: AbortSignal): Promise<void>;
  revert(context: Context, signal: AbortSignal): Promise<void>;
}

export interface PresentationSnapshot<State> {
  state: State;
  index: number;
  busy: boolean;
  error: string | null;
}

/** Generic observable context. State is treated as immutable. */
export class SceneContext<State extends object> {
  constructor(
    private value: State,
    private changed: () => void,
  ) {}
  get state(): State {
    return this.value;
  }
  replace(value: State): void {
    this.value = value;
    this.changed();
  }
  patch(patch: Partial<State>): void {
    this.replace({ ...this.value, ...patch });
  }
}

export function reversibleSlide<State extends object>(
  id: string,
  patch: Partial<State>,
): Slide<SceneContext<State>> {
  let before: State | undefined;
  return {
    id,
    async apply(context, signal) {
      signal.throwIfAborted();
      before = context.state;
      context.patch(patch);
    },
    async revert(context, signal) {
      signal.throwIfAborted();
      if (!before) throw new Error(`Slide ${id} was not applied`);
      context.replace(before);
      before = undefined;
    },
  };
}

/** Sequential navigation. Even jumps replay every intermediate apply/revert. */
export class Presentation<State extends object> {
  readonly context: SceneContext<State>;
  private index = -1;
  private busy = false;
  private error: string | null = null;
  private listeners = new Set<() => void>();
  private queue: Promise<void> = Promise.resolve();
  private lifetime = new AbortController();
  private cached: PresentationSnapshot<State>;

  constructor(
    private slides: Slide<SceneContext<State>>[],
    initial: State,
  ) {
    this.context = new SceneContext(initial, () => this.emit());
    this.cached = this.snapshot();
  }
  private snapshot(): PresentationSnapshot<State> {
    return {
      state: this.context.state,
      index: this.index,
      busy: this.busy,
      error: this.error,
    };
  }
  private emit(): void {
    this.cached = this.snapshot();
    this.listeners.forEach((listener) => listener());
  }
  getSnapshot = (): PresentationSnapshot<State> => this.cached;
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  goTo(target: number): Promise<void> {
    if (
      !Number.isInteger(target) ||
      target < 0 ||
      target >= this.slides.length
    ) {
      return Promise.reject(new RangeError("Slide index is out of range"));
    }
    const operation = this.queue.then(async () => {
      const signal = this.lifetime.signal;
      signal.throwIfAborted();
      this.busy = true;
      this.error = null;
      this.emit();
      try {
        while (this.index !== target) {
          signal.throwIfAborted();
          const advancing = target > this.index;
          const slide = this.slides[advancing ? this.index + 1 : this.index];
          const before = this.context.state;
          try {
            if (advancing) await slide.apply(this.context, signal);
            else await slide.revert(this.context, signal);
            signal.throwIfAborted();
          } catch (error) {
            this.context.replace(before);
            throw error;
          }
          this.index += advancing ? 1 : -1;
          this.emit();
        }
      } catch (error) {
        if (!signal.aborted)
          this.error = error instanceof Error ? error.message : String(error);
        throw error;
      } finally {
        this.busy = false;
        this.emit();
      }
    });
    // A failed transition does not poison later navigation.
    this.queue = operation.catch(() => {});
    return operation;
  }
  dispose(): void {
    this.lifetime.abort();
    this.listeners.clear();
  }
}
