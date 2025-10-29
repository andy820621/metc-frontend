declare module '#q-app/wrappers' {
  export function defineConfig<T = any>(fn: (ctx: any) => T): T;
}
