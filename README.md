# Turbo Daemon

A tool for running turbo locally as a demon that can be integrated with monorepo scripts.

## Features

- no money paid to Vercel   
  (they do good work tho, It's just that I'm cheap)
- doesn't use [pm2](https://github.com/Unitech/pm2/pull/5566)
  (turbo-daemon is released under the MIT license)
- wrapper around the highly tried and tested [turborepo-remote-cache](https://github.com/ducktors/turborepo-remote-cache/) server
- idempotent   
  (call as many times as you want, only one server will run)
  - powered by [salvatore](https://github.com/nullvoxpopuli/salvatore)
- automatically shuts down after inactivity  
- CLI available for debugging

## Installation

```bash 
pnpm add turbo-daemon

```

Or from git:
In your package.json:

```js 
"devDependencies": {
    "turbo-daemon": "github:NullVoxPopuli/turbo-daemon"
}
```

To test out a specific branch / tag:
```js 
"devDependencies": {
    "turbo-daemon": "github:NullVoxPopuli/turbo-daemon#branch-name"
}
```


## Usage

In your tooling that wraps `turbo` commands,
add a function that determines what the turbo environment variables should be.

For example:
```js
import { execa } from 'execa';
import { createDaemon, TURBO_TOKEN } from 'turbo-daemon';
import ci from 'ci-info';

const daemon = createDaemon();
const TURBO_TEAM = 'team_your_team_name_here';

async function getServer() {
	if (ci.isCI) {
		return {
			TURBO_API: 'https://turborepo.your-domain-here.com',
			TURBO_TEAM,
			TURBO_TOKEN: process.env['TURBO_TOKEN'],
		}
	}

    /**
     * Environment variables from 
     * https://ducktors.github.io/turborepo-remote-cache/environment-variables.html
     *
     * These environment variables are required for the daemon to have 
     * access to remote storage.
     * If these are omitted, turbo will still work, but fallback to local, in-repo cache.
     */
    Object.assign(process.env, {
      TURBO_TEAM,
      /* ... */
    });

	await daemon.ensureStarted();
	return {
		TURBO_API: `http://localhost:${daemon.info.data.port}`,
		TURBO_TEAM,
		TURBO_TOKEN,
	}
}

/**
 * have your package.json scripts call this instead of turbo directly
 */
export async function wrappedTurbo(args) {
	const connectionInfo = await getServer();

	await execa(`pnpm`, [`turbo`, ...args], {
		env: {
			...connectionInfo,
		}
	})
}
```

### Increasing the allowed size of uploaded assets

In your local / ci env set the `BODY_LIMIT` environment variable.
The value is measure in bytes.

e.g.:
```bash
BODY_LIMIT=1048576 # 1 MB (fastify default, 1024^2)
BODY_LIMIT=536870912 # 512 MB (1024^2 * 512)
BODY_LIMIT=1073741824 # 1 GB (1024^3)
```

## Debugging

This project stores files in `<git root>/node_modules/.turbo-daemon/`

### Start

```bash 
pnpm turbo-daemon start
```

or when working in this project:
```bash
pnpm cli start
```

### Restart


```bash 
pnpm turbo-daemon restart
```

or when working in this project:
```bash
pnpm cli restart
```

### Stop

```bash 
pnpm turbo-daemon stop
```

or when working in this project:
```bash
pnpm cli stop
```

### Status 

```bash 
pnpm turbo-daemon status
```

or when working in this project:
```bash
pnpm cli status
```


### Logs

```bash 
pnpm turbo-daemon logs
```

or when working in this project:
```bash
pnpm logs
```

### Watching for the pid file:

```bash
watch -n 2 "cat node_modules/.turbo-daemon/.turbo.pid"
```

### Debugging why the daemon isn't starting from other tools

in _this project_, run:
```bash
node ./src/run-turbo.js
```
and observe the output, logs, and pidfile.

If that's fine, try the daemonized version:
```bash
pnpm cli start
```

### Debugging what is in the turbo daemon folder

```bash
ls -la node_modules/.turbo-daemon/**
```
This may require
```bash
shopt -s globstar
```

and to watch for changes:
```bash
watch -n 2 "ls -la node_modules/.turbo-daemon/**"
```

### Clearing local cache to test remote speed

```bash
find . -name '.turbo' -type d -prune -exec rm -rf '{}' +
```

`.turbo` folders are in each package's `node_modules` directory.


## Debugging S3 Access

### Testing access to the cache bucket

To see if your local credentials have access to the s3 bucket, run:
```bash
❯ aws s3 ls $NAME_OF_BUCKET
# output doesn't matter
❯ echo $?
0 # this is what you're looking for
```
