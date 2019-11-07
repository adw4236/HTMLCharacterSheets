const path = require("path");
const fs = require("fs");
const mkdirp = require("mkdirp");
const rimraf = require("rimraf");
const compress = require("node-minify");

const src = path.join(__dirname, "src");
const work = path.join(__dirname, "work");
const out = path.join(__dirname, "out");

const css_regex = /<link\s+rel=["']stylesheet["']\s+href=["'](.*?)["']>/g;
const js_regex = /<script\s+src=["'](.*?)["']><\/script>/g;
const svg_regex = /<img\s+.*src=["'](.*?)["']\s*?.*?>/g;

start();

function start(){
    mkdirp.sync(work);
    mkdirp.sync(out);

    let processes = [];

    let args = process.argv.slice(2);
    if(args.length > 0){
        args.forEach(function(file){
            if(!file.endsWith(".html")) file += ".html";
            processes.push(processHTML(file));
        });
    }else{
        fs.readdir(src, function(err, files){
            files.forEach(function(file){
                if(file.endsWith(".html")){
                    processes.push(processHTML(file));
                }
            });
        });
    }

    Promise.all(processes).then(end);
}
function end(){
    rimraf.sync(work);
}

function processHTML(file){
    return new Promise(function(resolve, reject){
        fs.readFile(path.join(src, file), "utf8", function(err, contents) {
            if(err){
                console.log(err.message);
                return;
            }

            console.log("Processing:", file);

            let replacements = {};
            let processes = [];

            let css = css_regex.exec(contents);
            while(css !== null){
                let found = css[0];

                processes.push(minifyCSS(css[1]).then(function(min){
                    replacements[found] = "<style>" + min + "</style>";
                }));

                css = css_regex.exec(contents);
            }

            let js = js_regex.exec(contents);
            while(js !== null){
                let found = js[0];
                let jsFile = js[1];

                if(!jsFile.endsWith(".min.js")) {

                    processes.push(minifyJS(jsFile).then(function (min) {
                        replacements[found] = "<script>" + min + "</script>";
                    }));
                }else{
                    processes.push(new Promise(function(resolve, reject){
                        fs.readFile(path.join(src, jsFile), "utf8", function(err, contents) {
                            if(err) reject(err);
                            else{
                                replacements[found] = "<script>" + contents + "</script>";
                                resolve();
                            }
                        });
                    }));
                }

                js = js_regex.exec(contents);
            }

            let svg = svg_regex.exec(contents);
            while(svg !== null){
                let found = svg[0];
                let svgFile = svg[1];

                processes.push(new Promise(function(resolve, reject){
                    fs.readFile(path.join(src, svgFile), "utf8", function(err, contents){
                        if(err) reject(err);
                        else{
                            replacements[found] = contents;
                            resolve();
                        }
                    });
                }));

                svg = svg_regex.exec(contents);
            }

            let bundled = contents;
            Promise.all(processes).then(function(){
                for(let replacement in replacements){
                    bundled = bundled.replace(replacement, replacements[replacement].replace(/\$/g, "$$$"));
                }

                fs.writeFile(path.join(work, file), bundled, function(err){
                    if(err) reject(err);
                    minifyHTML(file).then(function(min){
                        console.log("Finished:", file);
                        resolve(min);
                    });
                });
            });
        });
    });
}

function minifyCSS(file){
    mkdirp.sync(path.join(work, path.dirname(file)));
    return compress.minify({
        compressor: "clean-css",
        input: path.join(src, file),
        output: path.join(work, file)
    });
}
function minifyJS(file){
    mkdirp.sync(path.join(work, path.dirname(file)));
    return compress.minify({
        compressor: "terser",
        input: path.join(src, file),
        output: path.join(work, file)
    });
}
function minifyHTML(file){
    return compress.minify({
        compressor: "html-minifier",
        input: path.join(work, file),
        output: path.join(out, file)
    })
}