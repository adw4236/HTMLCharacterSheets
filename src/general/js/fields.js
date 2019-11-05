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
    this.menu = {};
    let menu = new ContextMenu(element, this.menu);

    this.init = function(){
        let val = property.get();
        if(val !== null){
            property.update();
        }else if(element.html()){
            property.set(element.html());
        }

        let locked = property.getMetadata("locked");
        if(locked === "true" || (locked === null && element.attr("locked"))){
            this.lock();
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

    this.lock = function(){
        element.attr("locked", "true");
        property.setMetadata({"locked": true});
        this.input.enabled = false;
        this.menu["Lock"] = null;
        this.menu["Unlock"] = this.unlock.bind(this);
    };
    this.unlock = function(){
        element.removeAttr("locked");
        property.setMetadata({"locked": false});
        this.input.enabled = true;
        this.menu["Unlock"] = null;
        this.menu["Lock"] = this.lock.bind(this);
    };
}

function AutoField(property, element){
    PropertyField.call(this, property, element);
    element = $(element);
    this.input.enabled = false;

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
            this.menu["Reset"] = this.reset.bind(this);
            this.menu["Override"] = null;
            element.attr("overridden", "true");
        }else {
            this.input.enabled = false;
            element.removeAttr("overridden");
            this.menu["Reset"] = null;
            this.menu["Override"] = this.override.bind(this);
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

    this.input.onOpen(function(save, cancel){
        element.on("keydown", function(e){
            if(e.key === "Enter") save();
        });
    });
    this.input.onClose(function(){
        element.off("keydown");
    });

    this.menu["Edit"] = this.input.edit.bind(this.input);
    this.menu["Lock"] = this.lock.bind(this);
    this.menu["Unlock"] = null;
}


function LongTextField(property, element){
    PropertyField.call(this, property, element);
    element = $(element);
    this.fit.autoFit = false;

    const DYNAMIC_CHECKED = "<svg viewBox='0 0 448.8 448.8'><path d='M124.95,181.05l-35.7,35.7L204,331.5l255-255l-35.7-35.7L204,260.1L124.95,181.05z M408,408H51V51h255V0H51 C22.95,0,0,22.95,0,51v357c0,28.05,22.95,51,51,51h357c28.05,0,51-22.95,51-51V204h-51V408z'/></svg>Dynamic";
    const DYNAMIC_UNCHECKED = "<svg viewBox='0 0 459 459'><path d='M408,51v357H51V51H408 M408,0H51C22.95,0,0,22.95,0,51v357c0,28.05,22.95,51,51,51h357c28.05,0,51-22.95,51-51V51 C459,22.95,436.05,0,408,0L408,0z'/></svg>Dynamic";

    const FONT_INPUT = element.attr("id") +"_FONT";
    const MIN_FONT_INPUT = element.attr("id") +"_MIN_FONT";
    const MAX_FONT_INPUT = element.attr("id") +"_MAX_FONT";

    const FONT = "Font Size <input id='" + FONT_INPUT + "' type='number' min='1'>";
    const MIN_FONT = "Minimum Font Size <input id='" + MIN_FONT_INPUT + "' type='number' min='1'>";
    const MAX_FONT = "Maximum Font Size <input id='" + MAX_FONT_INPUT + "' type='number' min='1'>";

    let superInit = this.init.bind(this);
    this.init = function(){
        superInit();

        let dynamic = property.getMetadata("dynamic");
        if(dynamic === "true" || (dynamic === null && element.attr("dynamic"))){
            this.setDynamic();
        }
        let minFont = property.getMetadata("min-font");
        if(minFont === null && element.attr("min-font")){
            this.setMinFont(element.attr("min-font"));
        }else if(minFont === null){
            this.setMinFont(this.fit.minSize);
        }
        let maxFont = property.getMetadata("max-font");
        if(maxFont === null && element.attr("max-font")){
            this.setMaxFont(element.attr("max-font"));
        }else if(maxFont === null){
            this.setMaxFont(this.fit.maxSize);
        }
    };

    this.setDynamic = function(){
        element.attr("dynamic", "true");
        property.setMetadata({"dynamic": true});
        this.fit.autoFit = true;
        this.menu["Font"][DYNAMIC_CHECKED] = this.setNondynamic.bind(this);
        this.menu["Font"][DYNAMIC_UNCHECKED] = null;
        this.menu["Font"][MIN_FONT] = function(){return false;};
        this.menu["Font"][MAX_FONT] = function(){return false;};
    };
    this.setNondynamic = function(){
        element.removeAttr("dynamic");
        property.setMetadata({"dynamic": false});
        this.fit.autoFit = false;
        this.menu["Font"][DYNAMIC_CHECKED] = null;
        this.menu["Font"][DYNAMIC_UNCHECKED] = this.setDynamic.bind(this);
        this.menu["Font"][MIN_FONT] = null;
        this.menu["Font"][MAX_FONT] = null;
    };
    this.setFont = function(size){
        element.css("font-size", size + "px");
        property.setMetadata({"font": size});
    };
    this.setMinFont = function(size){
        element.attr("min-font", size);
        property.setMetadata({"min-font": size});
        this.fit.minSize = size;
    };
    this.setMaxFont = function(size){
        element.attr("max-font", size);
        property.setMetadata({"max-font": size});
        this.fit.maxSize = size;
    };

    this.menu["Edit"] = this.input.edit.bind(this.input);
    this.menu["Lock"] = this.lock.bind(this);
    this.menu["Unlock"] = null;
    this.menu["Font"] = {};
    this.menu["Font"][DYNAMIC_CHECKED] = null;
    this.menu["Font"][DYNAMIC_UNCHECKED] = this.setDynamic.bind(this);
    this.menu["Font"][FONT] = function(){return false};
    this.menu["Font"][MIN_FONT] = null;
    this.menu["Font"][MAX_FONT] = null;

    $("body").on("input", "#" + FONT_INPUT, function(){
        this.setFont($("#" + FONT_INPUT).val());
    }.bind(this));
    $("body").on("input", "#" + MIN_FONT_INPUT, function(){
        this.setMinFont($("#" + MIN_FONT_INPUT).val());
    }.bind(this));
    $("body").on("input", "#" + MAX_FONT_INPUT, function(){
        this.setMaxFont($("#" + MAX_FONT_INPUT).val());
    }.bind(this));

    $.initialize("#" + FONT_INPUT, function(){
        $("#" + FONT_INPUT).val(parseInt(element.css("font-size")));
    });
    $.initialize("#" + MIN_FONT_INPUT, function(){
        $("#" + MIN_FONT_INPUT).val(parseInt(property.getMetadata("min-font")));
    });
    $.initialize("#" + MAX_FONT_INPUT, function(){
        $("#" + MAX_FONT_INPUT).val(parseInt(property.getMetadata("max-font")));
    });
}

function ToggleField(property, element){
    PropertyField.call(this, property, element);
    element = $(element);
    this.input.enabled = false;

    this.init = function(){
        let val = property.get();
        if(val){
            property.update();
        }else if(element.attr("cycle")){
            property.set(parseInt(element.attr("cycle")));
        }
        let locked = property.getMetadata("locked");
        if(locked === "true" || (locked === null && element.attr("locked"))){
            this.lock();
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

    this.lock = function(){
        element.attr("locked", "true");
        property.setMetadata({"locked": true});
        element.off("click", toggle);
        this.menu["Lock"] = null;
        this.menu["Unlock"] = this.unlock.bind(this);
    };
    this.unlock = function(){
        element.removeAttr("locked");
        property.setMetadata({"locked": false});
        element.on("click", toggle);
        this.menu["Unlock"] = null;
        this.menu["Lock"] = this.lock.bind(this);
    };

    this.menu["Lock"] = this.lock.bind(this);
    this.menu["Unlock"] = null;

    element.on("click", toggle);
}

function ImageField(property, element){
    PropertyField.call(this, property, element);
    element = $(element);
    this.input.enabled = false;

    this.init = function(){
        let val = property.get();
        if(val){
            property.update();
        }else if(element.find("img").length > 0){
            property.set(element.find("img").attr("src"));
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
    //Prevent flash of highlight on double click without preventing highlight altogether.
    element.on("mousedown", function(e){
        if(e.detail > 1){
            e.preventDefault();
        }
    });
    element.on("dblclick", function(){
        fileInput.click();
    });
}