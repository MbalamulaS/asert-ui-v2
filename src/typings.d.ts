declare var module: {
  exports: any;
  hot: {
    accept: (path?: string, callback?: () => void) => void;
    dispose: (callback: () => void) => void;
  };
};

// Vite HMR types
interface ImportMetaHot {
  accept(): void;
  accept(cb: (mod: any) => void): void;
  accept(dep: string, cb: (mod: any) => void): void;
  accept(deps: string[], cb: (mods: any[]) => void): void;
  dispose(cb: () => void): void;
  decline(): void;
  invalidate(): void;
  data: any;
}

interface ImportMeta {
  hot?: ImportMetaHot;
}
