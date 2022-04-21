const Style = {
    base: [
        "color: #fff",
        "background-color: #9146FF",
        "padding: 2px 4px",
        "border-radius: 2px",
    ],
    warning: [
        "color: #000",
        "background-color: #ffcc00",
    ],
    success: [
        "background-color: green"
    ],
    danger: [
        "background-color: red"
    ],
};

// eslint-disable-next-line no-unused-vars
const nekoLog = (text, extra = []) => {
    let style = Style.base.join(";") + ';';
    style += extra.join(';');
    console.log(`%c[NekoPanel]%c ${text}`,style, 'color: #fff');
};