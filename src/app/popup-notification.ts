export var GROWL_MESSAGES = [];
export var DEFAULT_LIFE_TIME = 5000;

export class MessageSeverity {
    public static readonly SUCCESS = 'success';
    public static readonly ERROR = 'error';
}

export class MessageLabels {
    public static readonly DELETE_SUCCESS = 'Data has been deleted';
    public static readonly DELETE_ERROR = 'An error has occured';
    public static readonly SAVE_SUCCESS = 'Data has been saved';
    public static readonly SAVE_ERROR = 'An error has occured';
}

export class GrowlMessage{
    //public static addSuccessMessage(message: string, title?: string) {
    //    GROWL_MESSAGES.push({ "severity": 'success', "summary": title == null ? 'Success' : title, "detail": message });
    //}

    //public static addErrorMessage(message: string, title?: string) {
    //    GROWL_MESSAGES.push({ "severity": 'error', "summary": title == null ? 'Error' : title, "detail": message });
    //}

    public static addMessage(severity: string, message: string, title?: string) {
        let _title = severity == MessageSeverity.SUCCESS ? 'Success' : 'Error';
        GROWL_MESSAGES.push({ "severity": severity, "summary": title == null ? _title : title, "detail": message });
    }

    public static clear() {
        GROWL_MESSAGES = [];
    }
}
