import { glob } from "glob";
import vscode from "vscode";

export class FileHelper {
    private static IGNORE_PATTERNS = [
        '**/node_modules/**',
        '**/dist/**',
        '**/out/**',
        '**/deleteConfigs/**',
        '**/e2e/**',
        '**/.angular/**',
        '**/.vscode/**',
        '**/coverage/**',
        '**/.git/**',
        '**/assets/**',
        '**/public/**',
        '**/environments/**',
        '**/*.{test,spec}.ts',
        '**/*.mock.ts',
        '**/*.config.ts',
        '**/*.d.ts'
    ];
    public static async GetFileContent(filePath: string): Promise<string> {
        const content = await vscode.workspace.fs.readFile(
            vscode.Uri.file(filePath)
        );
        return Buffer.from(content).toString("utf8");
    }

    public static GetComponentFiles(rootPath: string, pattern: string): string[] {
        let globPattern = `**/*.${pattern}`;
        const componentFiles = glob.sync(globPattern, {
            cwd: rootPath,
            ignore: this.IGNORE_PATTERNS,
        });
        return componentFiles;
    }

    public static normalizePath(filePath: string): string {
        return filePath.replace(/\\/g, "/");
    }
}
