class Log {
    public static info(message: string) {
        const now = new Date();

        console.log(`${now.toLocaleString()} [Info] ${message}`);
    }

    public static error(message: string, error?: any) {
        const now = new Date();

        console.error(`${now.toLocaleString()} [Error] ${message}`);

        if (error) {
            console.error(error);
        }
    }

    public static debug(message: string) {
        const now = new Date();

        console.debug(`${now.toLocaleString()} [Debug] ${message}`);
    }
}

export default Log;