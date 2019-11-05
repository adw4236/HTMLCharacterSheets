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

function AutoField(property, element){

    element = $(element);
    let input = new EditableBlock(element);
    input.enabled = false;
    let fit = new FittedText(element);
    let options = {};

    this.update = function(val){
        element.html(val);
        if(property.overridden){
            input.enabled = true;
            element.attr("overridden", "true");
        }else {
            input.enabled = false;
            element.removeAttr("overridden");
        }
    };
    property.addHandler(function(val){
        this.update(val);
    }.bind(this));

    input.onChange(function(value){
        if(!property.set(value)) property.update();
    });

    function override(){
        input.edit();
        options["Reset"] = reset;
        options["Override"] = null;
    }
    function reset(){
        property.reset();
        options["Reset"] = null;
        options["Override"] = override;
    }

    options["Override"] = override;
    options["Reset"] = null;
    let menu = new ContextMenu(element, options);

    $(function(){
        fit.maxSize = parseInt(element.css("font-size"));

        let val = property.get();
        if(val !== null){
            property.update(val);
        }else if(element.attr("overridden")){
            property.set(element.html());
        }

        if(property.overridden){
            options["Override"] = null;
            options["Reset"] = reset;
        }
    });
}

function TextField(property, element) {

    element = $(element);
    let input = new EditableBlock(element);
    let fit = new FittedText(element);
    let options = {};

    this.update = function(val){
        element.html(val);
    };
    property.addHandler(function(val){
        this.update(val);
    }.bind(this));

    input.onOpen(function(save, cancel){
        element.on("keydown", function(e){
            if(e.key === "Enter") save();
        });
    });
    input.onClose(function(){
        element.off("keydown");
    });
    input.onChange(function(value){
        if(!property.set(value)) property.update();
        this.setFont(parseInt(element.css("font-size")));
    }.bind(this));

    this.lock = function(){
        element.attr("locked", "true");
        property.setMetadata({"locked": true});
        input.enabled = false;
        options["Lock"] = null;
        options["Unlock"] = this.unlock.bind(this);
    };
    this.unlock = function(){
        element.removeAttr("locked");
        property.setMetadata({"locked": false});
        input.enabled = true;
        options["Unlock"] = null;
        options["Lock"] = this.lock.bind(this);
    };
    this.setFont = function(size){
        element.css("font-size", size + "px");
        property.setMetadata({"font": size});
    };

    options["Edit"] = input.edit;
    options["Lock"] = this.lock.bind(this);
    options["Unlock"] = null;
    let menu = new ContextMenu(element, options);

    $(function(){
        fit.maxSize = parseInt(element.css("font-size"));

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
    }.bind(this));
}


function LongTextField(property, element){

    element = $(element);
    let input = new EditableBlock(element);
    let fit = new FittedText(element);
    fit.autoFit = false;
    let options = {};

    const DYNAMIC_CHECKED = "<svg viewBox='0 0 448.8 448.8'><path d='M124.95,181.05l-35.7,35.7L204,331.5l255-255l-35.7-35.7L204,260.1L124.95,181.05z M408,408H51V51h255V0H51 C22.95,0,0,22.95,0,51v357c0,28.05,22.95,51,51,51h357c28.05,0,51-22.95,51-51V204h-51V408z'/></svg>Dynamic";
    const DYNAMIC_UNCHECKED = "<svg viewBox='0 0 459 459'><path d='M408,51v357H51V51H408 M408,0H51C22.95,0,0,22.95,0,51v357c0,28.05,22.95,51,51,51h357c28.05,0,51-22.95,51-51V51 C459,22.95,436.05,0,408,0L408,0z'/></svg>Dynamic";

    const FONT_INPUT = element.attr("id") +"_FONT";
    const MIN_FONT_INPUT = element.attr("id") +"_MIN_FONT";
    const MAX_FONT_INPUT = element.attr("id") +"_MAX_FONT";

    const FONT = "Font Size <input id='" + FONT_INPUT + "' type='number' min='1'>";
    const MIN_FONT = "Minimum Font Size <input id='" + MIN_FONT_INPUT + "' type='number' min='1'>";
    const MAX_FONT = "Maximum Font Size <input id='" + MAX_FONT_INPUT + "' type='number' min='1'>";

    this.update = function(val){
        if(val) val = val.replace(/(?:\r\n|\r|\n)/g, '<br>');
        element.html(val);
    };
    property.addHandler(function(val){
        this.update(val);
    }.bind(this));

    input.onChange(function(value){
        if(!property.set(value)) property.update();
        this.setFont(parseInt(element.css("font-size")));
    }.bind(this));

    this.lock = function(){
        element.attr("locked", "true");
        property.setMetadata({"locked": true});
        input.enabled = false;
        options["Lock"] = null;
        options["Unlock"] = this.unlock.bind(this);
    };
    this.unlock = function(){
        element.removeAttr("locked");
        property.setMetadata({"locked": false});
        input.enabled = true;
        options["Unlock"] = null;
        options["Lock"] = this.lock.bind(this);
    };
    this.setDynamic = function(){
        element.attr("dynamic", "true");
        property.setMetadata({"dynamic": true});
        fit.autoFit = true;
        options["Font"][DYNAMIC_CHECKED] = this.setNondynamic.bind(this);
        options["Font"][DYNAMIC_UNCHECKED] = null;
        options["Font"][MIN_FONT] = function(){return false;};
        options["Font"][MAX_FONT] = function(){return false;};
    };
    this.setNondynamic = function(){
        element.removeAttr("dynamic");
        property.setMetadata({"dynamic": false});
        fit.autoFit = false;
        options["Font"][DYNAMIC_CHECKED] = null;
        options["Font"][DYNAMIC_UNCHECKED] = this.setDynamic.bind(this);
        options["Font"][MIN_FONT] = null;
        options["Font"][MAX_FONT] = null;
    };
    this.setFont = function(size){
        element.css("font-size", size + "px");
        property.setMetadata({"font": size});
    };
    this.setMinFont = function(size){
        element.attr("min-font", size);
        property.setMetadata({"min-font": size});
        fit.minSize = size;
    };
    this.setMaxFont = function(size){
        element.attr("max-font", size);
        property.setMetadata({"max-font": size});
        fit.maxSize = size;
    };

    options["Edit"] = input.edit;
    options["Lock"] = this.lock.bind(this);
    options["Unlock"] = null;
    options["Font"] = {};
    options["Font"][DYNAMIC_CHECKED] = null;
    options["Font"][DYNAMIC_UNCHECKED] = this.setDynamic.bind(this);
    options["Font"][FONT] = function(){return false};
    options["Font"][MIN_FONT] = null;
    options["Font"][MAX_FONT] = null;
    let menu = new ContextMenu(element, options);

    //Prevent flash of highlight on double click without preventing highlight altogether.
    element.on("mousedown", function(e){
        if(e.detail > 1){
            e.preventDefault();
        }
    });
    element.on("dblclick", this.edit);
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

    $(function(){
        let val = property.get();
        if(val !== null){
            property.update();
        }else if(element.html()){
            val = element.html().replace(/<br\s*[\/]?>/g, "\n");
            property.set(val);
        }
        let locked = property.getMetadata("locked");
        if(locked === "true" || (locked === null && element.attr("locked"))){
            this.lock();
        }
        let dynamic = property.getMetadata("dynamic");
        if(dynamic === "true" || (dynamic === null && element.attr("dynamic"))){
            this.setDynamic();
        }
        let font = property.getMetadata("font");
        if(font) element.css("font-size", font + "px");
        let minFont = property.getMetadata("min-font");
        if(minFont === null && element.attr("min-font")){
            this.setMinFont(element.attr("min-font"));
        }
        let maxFont = property.getMetadata("max-font");
        if(maxFont === null && element.attr("max-font")){
            this.setMaxFont(element.attr("max-font"));
        }
    }.bind(this));
}

function SignedPrefix(type){
    type.call(this, ...[].slice.call(arguments, 1));

    let superUpdate = this.update;

    this.update = function(val){
        if(val >= 0) superUpdate.call(this, "+" + val);
        else superUpdate.call(this, val);
    };
}

function ToggleField(property, element){

    element = $(element);
    let options = {};

    this.update = function(val){
        element.attr("cycle", val);
        if(val === 0)
            element.html("");
        if(val === 1)
            element.html("<svg style='display: block; width: 100%; height: 100%'><circle cx='50%' cy='50%' r='50%' fill='black'/></svg>");
        if(val === 2)
            element.html("<svg style='display: block; width: 100%; height: 100%'><circle cx='50%' cy='50%' r='50%' fill='red'/></svg>");
    };
    property.addHandler(function(val){
        this.update(val);
    }.bind(this));

    this.edit = function(){
        property.toggle();
    };

    this.lock = function(){
        element.attr("locked", "true");
        property.setMetadata({"locked": true});
        element.off("click", this.edit);
        options["Lock"] = null;
        options["Unlock"] = this.unlock.bind(this);
    };
    this.unlock = function(){
        element.removeAttr("locked");
        property.setMetadata({"locked": false});
        element.on("click", this.edit);
        options["Unlock"] = null;
        options["Lock"] = this.lock.bind(this);
    };

    options["Lock"] = this.lock.bind(this);
    options["Unlock"] = null;
    let menu = new ContextMenu(element, options);

    //Prevent flash of highlight on double click without preventing highlight altogether.
    element.on("mousedown", function(e){
        if(e.detail > 1){
            e.preventDefault();
        }
    });
    element.on("click", this.edit);

    $(function(){
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
    }.bind(this));
}

function ImageField(property, element){
    element = $(element);

    this.update = function(val){
        element.html("");
        let img = $("<img src='" + val + "'>");
        element.append(img);
    };

    property.addHandler(function(val){
        this.update(val);
    }.bind(this));

    $(function(){
        let val = property.get();
        if(val){
            property.update();
        }else if(element.find("img").length > 0){
            property.set(element.find("img").attr("src"));
        }
    });

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