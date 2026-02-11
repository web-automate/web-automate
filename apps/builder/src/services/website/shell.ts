import { exec } from "child_process";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

export class ShellService {
  static async cloneRepo(source: string, target: string) {
    return execAsync(`git clone --recursive ${source} "${target}"`);
  }

  static async installDeps(cwd: string) {
    await execAsync(`pnpm install`, { cwd });
    return execAsync(`pnpm initial`, {
      cwd,
      env: { ...process.env, GOCACHE: path.join(cwd, ".gocache") }
    });
  }

  static async runHugo(cwd: string) {
    return execAsync(`hugo --gc --minify`, { cwd });
  }

  static async runSudo(command: string) {
    if (process.platform === 'win32') return { stdout: 'Skipped on Windows' };
    return execAsync(`sudo ${command}`);
  }
}