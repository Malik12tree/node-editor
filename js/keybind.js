class Keybind {
    static all = {};
    /**
     * @type Keybind
     */
    static lastKey = new KeyboardEvent("keypress");
    constructor(data) {
        this.key = data.key.toLowerCase();
        this.ctrlKey = !!data.ctrlKey;
        this.shiftKey = !!data.shiftKey;
        this.altKey = !!data.altKey;

        this.run = data.run;
        Keybind.all[[this.key,this.ctrlKey,this.shiftKey,this.altKey]] = this;
    }
    toString(){
        //ctrl+shift+alt+key
        let string = '';
        if (this.ctrlKey)   string+= 'Ctrl+';
        if (this.shiftKey)  string+= 'Shift+';
        if (this.altKey)    string+= 'Alt+';
        string+= this.key.toUpperCase();
        return string;
    }
}
/**
 * @param {KeyboardEvent} e 
 */
function onKeyPress(e) {
    let trueKey = e.key.toLowerCase();
    e.key=trueKey;

    let earlyKeyBind = Keybind.all[[trueKey,e.ctrlKey,e.shiftKey,e.altKey]];
    if (earlyKeyBind) {
        earlyKeyBind.run(e,Keybind.lastKey);
    }
    Keybind.lastKey = e;
}
$(document).on("keyup", onKeyPress);