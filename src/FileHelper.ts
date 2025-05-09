import { glob } from 'glob';
import vscode from 'vscode';

export class FileHelper {
    private static IGNORE_PATTERNS = [
        'deleteConfigs/**',
        'node_modules/**',
        'dist/**',
        'out/**',
        'e2e/**',
        '.angular/**',
        '.vscode/**',
        'public/**',
        'assets/**',
        '.git/**',
        '**/*.test.ts',
        '**/*.spec.ts'
    ];
    public static async GetFileContent(filePath: string): Promise<string> {
        const content = await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
        return Buffer.from(content).toString("utf8");
    }

    public static GetComponentFiles(rootPath: string, pattern :string): string[] {
        const componentFiles = glob.sync(`**/*.{${pattern}}`, {
            cwd: rootPath,
            ignore: this.IGNORE_PATTERNS
        });
        return componentFiles;
    }

    public static normalizePath(filePath: string): string {
        return filePath.replace(/\\/g, '/');
    }

    
}