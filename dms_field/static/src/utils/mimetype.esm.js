var mapping = [
    ["image", /^image\//],
    ["audio_file", /^audio\//],
    ["video_file", /^video\//],
    ["picture_as_pdf", "application/pdf"],
    ["article", "text/plain"],
    ["code", ["text/html", "text/javascript", "application/javascript"]],
    [
        "folder_zip",
        [
            /^application\/x-(g?tar|xz|compress|bzip2|g?zip)$/,
            /^application\/x-(7z|rar|zip)-compressed$/,
            /^application\/(zip|gzip|tar)$/,
        ],
    ],
    [
        "description",
        [
            /ms-?word/,
            "application/vnd.oasis.opendocument.text",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
    ],
    [
        "slideshow",
        [
            /ms-?powerpoint/,
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ],
    ],
    [
        "table_chart",
        [
            /ms-?excel/,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ],
    ],
    ["description"],
];

function match(mimetype, cond) {
    if (Array.isArray(cond)) {
        return cond.reduce(function (v, c) {
            return v || match(mimetype, c);
        }, false);
    } else if (cond instanceof RegExp) {
        return cond.test(mimetype);
    } else if (cond === undefined) {
        return true;
    }
    return mimetype === cond;
}

var cache = {};
function resolve(mimetype) {
    if (cache[mimetype]) {
        return cache[mimetype];
    }
    for (var i = 0; i < mapping.length; i++) {
        if (match(mimetype, mapping[i][1])) {
            cache[mimetype] = mapping[i][0];
            return mapping[i][0];
        }
    }
}

export function mimetype2fa(mimetype, options) {
    if (typeof mimetype === "object") {
        var new_options = mimetype;
        return function (new_mimetype) {
            return mimetype2fa(new_mimetype, new_options);
        };
    }
    var icon = resolve(mimetype);
    if (icon && options && options.prefix) {
        return options.prefix + icon;
    }
    return icon;
}
