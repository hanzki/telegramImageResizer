export class Logger {

    public static info(msg: string, data?: object) {
        this.writeLogItem("INFO", msg, data);
    }

    public static debug(msg: string, data?: object) {
        this.writeLogItem("DEBUG", msg, data);
    }

    public static warn(msg: string, data?: object) {
        this.writeLogItem("WARN", msg, data);
    }

    public static error(msg: string, data?: object) {
        this.writeLogItem("ERROR", msg, data);
    }

    private static writeLogItem(level: string, msg: string, data?: object) {
        const isError = level === "ERROR";
        const logItem = {
            level: level,
            message: msg,
            error: isError,
            data: data
        };
        if(isError) {
            console.error(JSON.stringify(logItem))
        } else {
            console.log(JSON.stringify(logItem));
        }
    }
}