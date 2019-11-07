const path = require("path");
const open = require("open");

const src = path.join(__dirname, "src");

let args = process.argv.slice(2);
if(args.length > 0){
    args.forEach(function(file) {
        if (!file.endsWith(".html")) file += ".html";
        open(path.join(src, file));
    });
}