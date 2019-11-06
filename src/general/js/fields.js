let inputs = {};

$(function(){
    $(".page>div").each(function(){
        let id = $(this).attr("id");

        let prop = id;
        if(prop === "name-background") prop = "name";
        let property = Character[prop];
        if(!property) return;

        if( $(this).hasClass("signed")){
            inputs[id] = new SignedPrefix(property.fieldType, property, this);
        }else{
            inputs[id] = new property.fieldType(property, this);
        }
    });
});

function SignedPrefix(type){
    type.call(this, ...[].slice.call(arguments, 1));

    let superUpdate = this.update;

    this.update = function(val){
        if(val >= 0) superUpdate.call(this, "+" + val);
        else superUpdate.call(this, val);
    };
}

function PropertyField(property, element){
    element = $(element);
    this.input = new EditableBlock(element);
    this.fit = new FittedText(element);
    this.menu = [];
    let menu = new ContextMenu(element, this.menu);

    let lock = new ContextMenu.Toggle("Lock", function(locked){
        this.lock(locked);
    }.bind(this));
    lock.checkedContent = "Unlock";
    lock.checkedActionIcon = "<svg viewBox='0 0 535.5 535.5'><path d='M267.75,408c28.05,0,51-22.95,51-51s-22.95-51-51-51s-51,22.95-51,51S239.7,408,267.75,408z M420.75,178.5h-25.5v-51c0-71.4-56.1-127.5-127.5-127.5c-71.4,0-127.5,56.1-127.5,127.5h48.45c0-43.35,35.7-79.05,79.05-79.05c43.35,0,79.05,35.7,79.05,79.05v51H114.75c-28.05,0-51,22.95-51,51v255c0,28.05,22.95,51,51,51h306c28.05,0,51-22.95,51-51v-255C471.75,201.45,448.8,178.5,420.75,178.5z M420.75,484.5h-306v-255h306V484.5z'/></svg>";
    lock.uncheckedActionIcon = "<svg viewBox='0 0 535.5 535.5'><path d='M420.75,178.5h-25.5v-51c0-71.4-56.1-127.5-127.5-127.5c-71.4,0-127.5,56.1-127.5,127.5v51h-25.5c-28.05,0-51,22.95-51,51v255c0,28.05,22.95,51,51,51h306c28.05,0,51-22.95,51-51v-255C471.75,201.45,448.8,178.5,420.75,178.5z M267.75,48.45c43.35,0,79.05,35.7,79.05,79.05v51H191.25v-51h-2.55C188.7,84.15,224.4,48.45,267.75,48.45z M420.75,484.5h-306v-255h306V484.5z M267.75,408c28.05,0,51-22.95,51-51s-22.95-51-51-51s-51,22.95-51,51S239.7,408,267.75,408z'/></svg>";
    lock.refreshIcons();
    this.menu.push(lock);
    this.init = function(){
        let val = property.get();
        if(val !== null){
            property.update();
        }else if(element.html()){
            property.set(element.html());
        }

        let locked = property.getMetadata("locked");
        if(locked === "true" || (locked === null && element.attr("locked"))){
            this.lock(true);
            lock.toggle(true);
        }

        let font = property.getMetadata("font");
        if(font) element.css("font-size", font + "px");
    };
    $(function(){
        this.init();
    }.bind(this));

    this.update = function(val){
        element.html(val);
    };

    property.addHandler(function(val){
        this.update(val);
    }.bind(this));

    this.input.onChange(function(value){
        if(!property.set(value)) property.update();
        property.setMetadata({"font": parseInt(element.css("font-size"))});
    });

    this.lock = function(locked){
        if(locked) element.attr("locked", "true");
        else element.removeAttr("locked");
        property.setMetadata({"locked": locked});
        this.input.enabled = !locked;
    };
}

function AutoField(property, element){
    PropertyField.call(this, property, element);
    element = $(element);
    this.input.enabled = false;

    let lock = this.menu[0];
    let override = new ContextMenu.Option("Override", function(){
        this.override();
    }.bind(this));
    let reset = new ContextMenu.Option("Reset", function(){
        this.reset();
    }.bind(this));
    this.menu.unshift(override, reset);

    this.init = function(){
        let val = property.get();
        if(val !== null){
            property.update(val);
        }else if(element.attr("overridden")){
            property.set(element.html());
        }

        let font = property.getMetadata("font");
        if(font) element.css("font-size", font + "px");
    };

    this.input.onOpen(function(save, cancel){
        element.on("keydown", function(e){
            if(e.key === "Enter") save();
        });
    });
    this.input.onClose(function(){
        element.off("keydown");
    });

    let superUpdate = this.update.bind(this);
    this.update = function(val){
        superUpdate(val);
        if(property.overridden){
            this.input.enabled = true;
            override.disabled = true;
            reset.disabled = false;
            lock.disabled = false;
            element.attr("overridden", "true");
        }else{
            this.input.enabled = false;
            override.disabled = false;
            reset.disabled = true;
            lock.disabled = true;
            element.removeAttr("overridden");
        }
    };

    this.override = function(){
        this.input.edit();
    };
    this.reset = function(){
        property.reset();
    };
}

function TextField(property, element) {
    PropertyField.call(this, property, element);
    element = $(element);

    this.menu.unshift(new ContextMenu.Option("Edit", this.input.edit.bind(this.input)));

    this.input.onOpen(function(save, cancel){
        element.on("keydown", function(e){
            if(e.key === "Enter") save();
        });
    });
    this.input.onClose(function(){
        element.off("keydown");
    });
}


function LongTextField(property, element){
    PropertyField.call(this, property, element);
    element = $(element);
    this.fit.autoFit = false;

    this.menu.unshift(new ContextMenu.Option("Edit", this.input.edit.bind(this.input)));

    let dynamicFont = new ContextMenu.Toggle("Dynamic", function(dynamic){
        this.setDynamic(dynamic);
    }.bind(this));

    const FONT_INPUT = element.attr("id") +"_FONT";
    const MIN_FONT_INPUT = element.attr("id") +"_MIN_FONT";
    const MAX_FONT_INPUT = element.attr("id") +"_MAX_FONT";

    let fontSizeInput = $("<input id='" + FONT_INPUT + "' class='font_sizing' type='number'>");
    let minFontInput = $("<input id='" + MIN_FONT_INPUT + "' class='font_sizing' type='number'>");
    let maxFontInput = $("<input id='" + MAX_FONT_INPUT + "' class='font_sizing' type='number'>");

    let fontSize = new ContextMenu.Option("Font Size");
    fontSize.rightContent = fontSizeInput;
    let minFont = new ContextMenu.Option("Min Font");
    minFont.rightContent = minFontInput;
    let maxFont = new ContextMenu.Option("Max Font");
    maxFont.rightContent = maxFontInput;
    minFont.disabled = true;
    maxFont.disabled = true;

    this.menu.push(new ContextMenu.Sub("Font", [dynamicFont, fontSize, minFont, maxFont]));

    let superInit = this.init.bind(this);
    this.init = function(){
        superInit();

        fontSizeInput.val(parseInt(element.css("font-size")));

        let dynamic = property.getMetadata("dynamic");
        if(dynamic === "true" || (dynamic === null && element.attr("dynamic"))){
            this.setDynamic(true);
            dynamicFont.toggle(true);
        }
        let minFont = property.getMetadata("min-font");
        if(minFont === null && element.attr("min-font")){
            minFont = parseInt(element.attr("min-font"));
        }else if(minFont === null){
            minFont = this.fit.minSize;
        }
        this.setMinFont(minFont);

        let maxFont = property.getMetadata("max-font");
        if(maxFont === null && element.attr("max-font")){
            maxFont = parseInt(element.attr("max-font"));
        }else if(maxFont === null){
            maxFont = this.fit.maxSize;
        }
        this.setMaxFont(maxFont);
    };

    this.setDynamic = function(dynamic){
        if(dynamic) element.attr("dynamic", "true");
        else element.removeAttr("dynamic");
        property.setMetadata({"dynamic": dynamic});
        this.fit.autoFit = dynamic;
        minFont.disabled = !dynamic;
        maxFont.disabled = !dynamic;
    };
    this.setFont = function(size){
        element.css("font-size", size + "px");
        property.setMetadata({"font": size});
        fontSizeInput.val(size);
    };
    this.setMinFont = function(size){
        element.attr("min-font", size);
        property.setMetadata({"min-font": size});
        this.fit.minSize = size;
        minFontInput.val(size);
    };
    this.setMaxFont = function(size){
        element.attr("max-font", size);
        property.setMetadata({"max-font": size});
        this.fit.maxSize = size;
        maxFontInput.val(size);
    };

    $("body").on("input", "#" + FONT_INPUT, function(){
        this.setFont(parseInt(fontSizeInput.val()));
    }.bind(this));
    $("body").on("input", "#" + MIN_FONT_INPUT, function(){
        this.setMinFont(parseInt(minFontInput.val()));
    }.bind(this));
    $("body").on("input", "#" + MAX_FONT_INPUT, function(){
        this.setMaxFont(parseInt(maxFontInput.val()));
    }.bind(this));
}

function ToggleField(property, element){
    PropertyField.call(this, property, element);
    element = $(element);
    this.input.enabled = false;

    let lock = this.menu[0];

    this.init = function(){
        let val = property.get();
        if(val){
            property.update();
        }else if(element.attr("cycle")){
            property.set(parseInt(element.attr("cycle")));
        }
        let locked = property.getMetadata("locked");
        if(locked === "true" || (locked === null && element.attr("locked"))){
            this.lock(true);
            lock.toggle(true);
        }
    };

    this.update = function(val){
        element.attr("cycle", val);
        if(val === 0)
            element.html("");
        if(val === 1)
            element.html("<svg style='display: block; width: 100%; height: 100%'><circle cx='50%' cy='50%' r='50%' fill='black'/></svg>");
        if(val === 2)
            element.html("<svg style='display: block; width: 100%; height: 100%'><circle cx='50%' cy='50%' r='50%' fill='red'/></svg>");
    };

    function toggle(){
        property.toggle();
    }

    let superLock = this.lock.bind(this);
    this.lock = function(locked){
        superLock(locked);
        this.input.enabled = false;
        if(locked) element.off("click", toggle);
        else element.on("click", toggle);
    };

    element.on("click", toggle);
}

function ImageField(property, element){
    PropertyField.call(this, property, element);
    element = $(element);
    this.input.enabled = false;

    let lock = this.menu[0];

    this.init = function(){
        let val = property.get();
        if(val){
            property.update();
        }else if(element.find("img").length > 0){
            property.set(element.find("img").attr("src"));
        }
        let locked = property.getMetadata("locked");
        if(locked === "true" || (locked === null && element.attr("locked"))){
            this.lock(true);
            lock.toggle(true);
        }
    };

    this.update = function(val){
        element.html("");
        let img = $("<img src='" + val + "'>");
        element.append(img);
    };

    let fileInput = $("<input type='file' accept='image/*'>");
    fileInput.on("change", function(){
        let file = fileInput.prop("files")[0];
        if(file) property.setFile(file);
    });

    function selectFile(){
        fileInput.click();
    }

    let superLock = this.lock.bind(this);
    this.lock = function(locked){
        superLock(locked);
        this.input.enabled = false;
        if(locked) element.off("dblclick", selectFile);
        else element.on("dblclick", selectFile);
    };

    element.on("dblclick", selectFile);
}