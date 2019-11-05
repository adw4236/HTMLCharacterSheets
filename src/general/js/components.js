function FittedText(element){

    this.autoFit = true;
    this.minSize = 8;
    this.maxSize = 32;

    this.fit = function(content){
        if(!content) content = element.html();

        let size = $("<span style='display: inline-block; visibility: hidden;'></span>");
        $("body").append(size);
        let font = parseInt(element.css("font-size"));
        size.html(content);

        size.css("font-size", font + "px");
        while(size.width() > element.width() || size.height() > element.height()){
            if(font <= this.minSize) break;
            font--;
            element.css("font-size", font + "px");
            size.css("font-size", font + "px");
        }

        size.css("font-size", (font + 1) + "px");
        while(size.width() < element.width() && size.height() < element.height()){
            if(font >= this.maxSize) break;
            font++;
            element.css("font-size", font + "px");
            size.css("font-size", (font + 1) + "px");
        }

        size.remove();
    };

    element.on("input", function(){
        if(this.autoFit) this.fit();
    }.bind(this));

}

function EditableBlock(element){

    element = $(element);
    let openCallbacks = [];
    let changeCallbacks = [];
    let closeCallbacks = [];

    this.enabled = true;

    this.edit = function(){
        return new Promise(function(resolve, reject){
            if(element.find("textarea").length > 0){
                reject("Block already being edited");
                return;
            }

            let oldValue = element.html();
            element.attr("contenteditable", "true");
            element.focus();

            function save() {
                let newValue = element.html();
                changeCallbacks.forEach(function (callback) {
                    callback(newValue)
                });
                resolve(newValue);
                close();
            }
            function cancel() {
                element.html(oldValue);
                reject("Input canceled");
                close();
            }
            function close(){
                element.removeAttr("contenteditable");
                closeCallbacks.forEach(function(callback){
                    callback();
                });
            }

            element.on("blur", save);
            element.on("keydown", function(e){
                if(e.key === "Escape") cancel();
            });

            openCallbacks.forEach(function(callback){
                callback(save, cancel);
            });
        });
    };
    this.onOpen = function(callback){
        openCallbacks.push(callback);
    };
    this.onChange = function(callback){
        changeCallbacks.push(callback);
    };
    this.onClose = function(callback){
        closeCallbacks.push(callback);
    };

    //Prevent flash of highlight on double click without preventing highlight altogether.
    element.on("mousedown", function(e){
        if(e.detail > 1){
            e.preventDefault();
        }
    });
    element.on("dblclick", function(){
        if(this.enabled) this.edit();
    }.bind(this));

}