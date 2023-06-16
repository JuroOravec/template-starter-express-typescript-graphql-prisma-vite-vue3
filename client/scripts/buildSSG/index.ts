import { runCommand } from './utils';

runCommand('npm run build:ssg', {
  // Supress warnings sent to stderr, but only if they don't contain the word "err"
  redirectStderr: true,
  ignoreRedirectStderr: /err/im,
});
