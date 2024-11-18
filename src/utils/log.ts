class Log {
    public static info(message: string) {
        const now = new Date();
        console.log(`${now.toLocaleString()} ´[Info] ${message}`);
    }

    public static error(message: string) {
        const now = new Date();
        console.error(`${now.toLocaleString()} ´[Error] ${message}`);
    }
}

export default Log;