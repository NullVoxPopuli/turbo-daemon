import { expectTypeOf } from 'expect-type';
import { pidFile, TURBO_TOKEN } from 'turbo-daemon';

import type { Daemon, PidFile } from 'salvatore';
import type { createDaemon, CreateDaemonOptions } from 'turbo-daemon';

// Sanity from the consuming library (copied from salvatore's tests)
expectTypeOf<ConstructorParameters<typeof Daemon>>().toMatchTypeOf<[string, object]>();
expectTypeOf<ConstructorParameters<typeof Daemon>>().toEqualTypeOf<
  [
    string,
    {
      pidFilePath: string;
      runWith?: string;
      timeout?: number;
      logFile?: string;
      restartWhen?: () => boolean;
    },
  ]
>();

expectTypeOf(TURBO_TOKEN).toEqualTypeOf<string>();
expectTypeOf(pidFile).toEqualTypeOf<PidFile>();

expectTypeOf<ReturnType<typeof createDaemon>>().toEqualTypeOf<Daemon>();

expectTypeOf<CreateDaemonOptions>().toEqualTypeOf<{
  runWith?: string;
  timeout?: number;
  restartWhen?: () => boolean;
  fastifyOptions?: any;
}>();

// arguments are optional
expectTypeOf<typeof createDaemon>().toBeCallableWith(undefined);
expectTypeOf<typeof createDaemon>().toBeCallableWith({});
expectTypeOf<typeof createDaemon>().toBeCallableWith({ runWith: 'bun' });
// @ts-expect-error - pidFilePath exists but is not settable by consumers
expectTypeOf<typeof createDaemon>().toBeCallableWith({ pidFilePath: 'nope' });
// @ts-expect-error - logFile exists but is not settable by consumers
expectTypeOf<typeof createDaemon>().toBeCallableWith({ logFile: 'nope' });
