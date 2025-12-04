export class Logger {
    private static formatDate(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // Months are 0-indexed
        const day = now.getDate();
        const hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    private static colorize(color: string, text: string): string {
        const colors: Record<string, string> = {
            reset: '\x1b[0m',
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            magenta: '\x1b[35m',
            cyan: '\x1b[36m',
            white: '\x1b[37m',
        };
        return `${colors[color]}${text}${colors.reset}`;
    }

    static info(message: string, ...args: any[]): void {
        console.log(
            `${this.colorize('cyan', '[INFO]')} ${this.formatDate()} - ${message}`,
            ...args
        );
    }

    static error(message: string, error?: any): void {
        console.error(
            `${this.colorize('red', '[ERROR]')} ${this.formatDate()} - ${message}`,
            error || ''
        );
    }

    static warn(message: string, ...args: any[]): void {
        console.warn(
            `${this.colorize('yellow', '[WARN]')} ${this.formatDate()} - ${message}`,
            ...args
        );
    }

    static success(message: string, ...args: any[]): void {
        console.log(
            `${this.colorize('green', '[SUCCESS]')} ${this.formatDate()} - ${message}`,
            ...args
        );
    }

    static debug(message: string, ...args: any[]): void {
        if (process.env.NODE_ENV === 'development') {
            console.log(
                `${this.colorize('magenta', '[DEBUG]')} ${this.formatDate()} - ${message}`,
                ...args
            );
        }
    }

    static http(method: string, path: string, statusCode: number, duration: number): void {
        const color = statusCode >= 500 ? 'red'
            : statusCode >= 400 ? 'yellow'
                : statusCode >= 300 ? 'cyan'
                    : 'green';

        console.log(
            `${this.colorize('blue', '[HTTP]')} ${this.formatDate()} - ${this.colorize(color, method)} ${path} ${this.colorize(color, String(statusCode))} - ${duration}ms`
        );
    }
}
