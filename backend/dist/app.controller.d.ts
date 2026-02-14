export declare class AppController {
    root(): {
        name: string;
        version: string;
        docs: string;
        health: string;
    };
    health(): {
        status: string;
        timestamp: string;
    };
}
