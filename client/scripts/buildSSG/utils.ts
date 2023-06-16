import { exec } from 'child_process';

export const runCommand = (
  cmd: string,
  options?: {
    /** Redirect stderr to stdout unconditionally, or conditionally based on matching RegExp */
    redirectStderr?: boolean | RegExp;
    /**
     * Opposite of `redirectStderr`. If `true` or stderr matches this RegExp,
     * then `redirectStderr` will be ignored
     */
    ignoreRedirectStderr?: boolean | RegExp;
  }
) => {
  const { redirectStderr, ignoreRedirectStderr } = options ?? {};

  return new Promise<string>((res, rej) => {
    // See https://levelup.gitconnected.com/what-is-the-difference-between-exec-fork-and-spawn-in-node-js-8232773f4198
    const cmdProcess = exec(cmd, (error, stdout, stderr) => {
      let jointStdout = stdout || '';

      if (error) {
        console.log(`error: ${error.message} (exit code ${error.code})`);
        rej(error);
        return;
      }

      if (stderr) {
        console.log(`stderr: ${stderr}`);

        // Allow to redirect stderr to stdout based on matching RegExp
        const shouldIgnoreRedirect = (ignoreRedirectStderr === true)
            || (ignoreRedirectStderr ? stderr.match(ignoreRedirectStderr) : false); // prettier-ignore
        const shouldRedirect = !shouldIgnoreRedirect
            && (
              (redirectStderr === true)
              || (redirectStderr ? stderr.match(redirectStderr) : false)
            ); // prettier-ignore

        if (shouldRedirect) {
          jointStdout += stderr || '';
        } else {
          rej(stderr);
        }
        return;
      }

      res(jointStdout);
    });

    cmdProcess.stdout?.on('data', (data: string) => {
      // Using stdout.write instead of console.log to avoid extra newlines, see https://stackoverflow.com/questions/6157497
      (process.stdout as any).write(data);
    });
  });
};
