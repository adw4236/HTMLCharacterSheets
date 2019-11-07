/**
 * This file contains field components that are specific to properties to be displayed on the screen.  A field is the
 * method of displaying an abstract property to the screen.  Fields will store values and metadata on the element that
 * they are associated with so that a Ctrl+S will save all of the characters data permanently.
 */

/**
 * List of all inputs that have been created by ID so they can be accessed by the developer console.
 * @type {{}}
 */
let inputs = {};

/**
 * This initialization will loop through all properties and create a new field associated with that property based on
 * what type of field that property requested.
 */
$(function(){
    $(".page>div").each(function(){
        let id = $(this).attr("id");

        let prop = id;

        // Properties that have multiple fields are translated here
        if(prop === "name-background") prop = "name";

        let property = Character[prop];
        if(!property) return;

        if($(this).hasClass("signed")){
            inputs[id] = new SignedPrefix(property.fieldType, property, this);
        }else{
            inputs[id] = new property.fieldType(property, this);
        }
        inputs[id].init();
    });
    for(let property in Character){
        Character[property].update();
    }
});

/**
 * A wrapper for any other field that will change the update method to prefix the value with a "+" if the number is
 * positive.
 *
 * @param type - The type of field that this one is wrapping, should be a constructor reference.
 * @params The remaining parameters will be passed into the constructor of the type you provided.
 * @constructor Calls the constructor of the type passed in and wraps the update method.
 */
function SignedPrefix(type){
    type.call(this, ...[].slice.call(arguments, 1));

    let superUpdate = this.update.bind(this);

    this.update = function(val){
        if(val >= 0) superUpdate.call(this, "+" + val);
        else superUpdate.call(this, val);
    };
}

/**
 * This field is the most basic form of a field and typically should not be used on its own.  It creates a common
 * EditableBlock, FittedText, and ContextMenu that sub types can access.  The main purpose of this type is to
 * consolidate duplicate code so changes can propagate to the other types easily.
 *
 * @param property - The property object that that this field is representing
 * @param element - The element this field is using to display on
 * @constructor Binds the property update method to the fields update method and sets up any other common methods or
 *              configurations.
 */
function PropertyField(property, element){
    element = $(element);
    /**
     * Can be used by subtypes to configure the "double click to edit" feature of a field.
     * @type {EditableBlock}
     */
    this.input = new EditableBlock(element);
    /**
     * Can be used by subtypes to configure the automatic text resizing of a field.
     * @type {FittedText}
     */
    this.fit = new FittedText(element);
    /**
     * Can be used by subtypes to configure the context menu elements that will appear when right clicked.
     * @type {Array}
     */
    this.menu = [];
    // The actual context menu object has no configuration, so does not need to be available.
    let menu = new ContextMenu(element, this.menu);

    // The lock option allows you to disable the "double click" to edit feature of a field.
    // The lock option can be grabbed by subclasses via the menu to configure.
    let lock = new ContextMenu.Toggle("Lock", function(locked){
        this.lock(locked);
    }.bind(this));
    lock.checkedContent = "Unlock";
    lock.checkedActionIcon = "<svg viewBox='0 0 535.5 535.5'><path d='M267.75,408c28.05,0,51-22.95,51-51s-22.95-51-51-51s-51,22.95-51,51S239.7,408,267.75,408z M420.75,178.5h-25.5v-51c0-71.4-56.1-127.5-127.5-127.5c-71.4,0-127.5,56.1-127.5,127.5h48.45c0-43.35,35.7-79.05,79.05-79.05c43.35,0,79.05,35.7,79.05,79.05v51H114.75c-28.05,0-51,22.95-51,51v255c0,28.05,22.95,51,51,51h306c28.05,0,51-22.95,51-51v-255C471.75,201.45,448.8,178.5,420.75,178.5z M420.75,484.5h-306v-255h306V484.5z'/></svg>";
    lock.uncheckedActionIcon = "<svg viewBox='0 0 535.5 535.5'><path d='M420.75,178.5h-25.5v-51c0-71.4-56.1-127.5-127.5-127.5c-71.4,0-127.5,56.1-127.5,127.5v51h-25.5c-28.05,0-51,22.95-51,51v255c0,28.05,22.95,51,51,51h306c28.05,0,51-22.95,51-51v-255C471.75,201.45,448.8,178.5,420.75,178.5z M267.75,48.45c43.35,0,79.05,35.7,79.05,79.05v51H191.25v-51h-2.55C188.7,84.15,224.4,48.45,267.75,48.45z M420.75,484.5h-306v-255h306V484.5z M267.75,408c28.05,0,51-22.95,51-51s-22.95-51-51-51s-51,22.95-51,51S239.7,408,267.75,408z'/></svg>";
    lock.refreshIcons();
    this.menu.push(lock);

    /**
     * The init function is called after all of the elements have loaded into the DOM so that a subtype can set up any
     * values or metadata about the element it needs to.  This usually ensures that any attributes of the element are
     * loaded into the properties metadata or that any metadata is configured correctly on the element for the first
     * time.
     */
    this.init = function(){
        //If no data is in the property, update it with the persistent data.
        if(property.get() === null && element.html()){
            property.set(element.html());
        }

        // Set any metadata that should be synced
        this.lock(this.getMetadata("locked") === "true");
        lock.toggle(this.getMetadata("locked") === "true");
        this.setFontSize(this.getMetadata("font-size"));
    };

    /**
     * Sets the metadata on this field for persistent storage and on the property associated for local storage.
     *
     * @param key - The key of the metadata to store
     * @param value - The value of the metadata to store
     */
    this.setMetadata = function(key, value){
        // Save to property
        let metadata = {};
        metadata[key] = value;
        property.setMetadata(metadata);
        // Save to element
        if(value) element.attr("metadata-" + key, value);
        else element.removeAttr("metadata-" + key);
    };
    /**
     * Gets the metadata for this field by first trying to get it from the property, and second trying to receive
     * it from the element.  If both fail, null is returned.
     *
     * @param key - The key of the metadata to receive.
     * @returns The metadata stored or null if it never was.
     */
    this.getMetadata = function(key){
        // Try receiving from property
        let value = property.getMetadata(key);
        if(value) return value;
        // Try receiving from element
        value = element.attr("metadata-" + key);
        if(value) return value;
        // Metadata not found
        return null;
    };

    /**
     * This method is called to update the contents of the element to reflect the value of the property.
     * @param val - The value the element should display to accurately reflect its property.
     */
    this.update = function(val){
        element.html(val);
    };
    property.addHandler(function(val){
        this.update(val);
    }.bind(this));

    // When the property is edited, it will update the property and notify that it has changed to any other fields.
    this.input.onChange(function(value){
        //Property.set will call update itself on success, but on failure, call update to revert the text.
        if(!property.set(value)) property.update();
        // Due to FittedText, the font size can change while editing a field, make sure the new font size is saved.
        property.setMetadata({"font": parseInt(element.css("font-size"))});
    });

    /**
     * Locks the field from being double clicked, this will also update the metadata to save the decision.
     * @param locked {boolean} True if the field should be locked, false if it should be unlocked.
     */
    this.lock = function(locked){
        this.setMetadata("locked", locked);
        this.input.enabled = !locked;
    };
    this.setFontSize = function(size){
        this.setMetadata("font-size", size);
        element.css("font-size", size + "px");
    }
}

/**
 * This type of field cannot be edited naturally because the properties value is automatically calculated based on the
 * value of other properties.  It can be overridden however and then treated like a normal property.
 *
 * @param property - The property object that that this field is representing
 * @param element - The element this field is using to display on
 * @constructor Disables editing by default, will be re enabled if the property is overridden.
 */
function AutoField(property, element){
    PropertyField.call(this, property, element);
    element = $(element);
    // An auto property can only be edited if it is overridden.
    this.input.enabled = false;

    let lock = this.menu[0];
    // New override and reset menu options can be used to enable editing or revert back to auto calculation.
    let override = new ContextMenu.Option("Override", function(){
        this.override();
    }.bind(this));
    let reset = new ContextMenu.Option("Reset", function(){
        this.reset();
    }.bind(this));
    // Override and reset come before lock
    this.menu.unshift(override, reset);

    /**
     * Only sets the stored value if the property is overridden, also changes the font and locked metadata as expected.
     */
    this.init = function(){
        // If there is no property data but there is persistent data, override the property data.
        if(property.getMetadata("overridden") === null && this.getMetadata("overridden") === "true"){
            property.set(element.html());
        }

        // Set any metadata that should be synced
        this.lock(this.getMetadata("locked") === "true");
        lock.toggle(this.getMetadata("locked") === "true");
        this.setFontSize(this.getMetadata("font-size"));
    };

    // If the input is edited, it is only a single line, so the enter key should save the edit.
    this.input.onOpen(function(save, cancel){
        element.on("keydown", function(e){
            if(e.key === "Enter") save();
        });
    });
    this.input.onClose(function(){
        element.off("keydown");
    });

    let superUpdate = this.update.bind(this);
    /**
     * Calls the super update, but also sets the menu items to what is expected if the property is overridden.
     * @param val - The value given to super update.
     */
    this.update = function(val){
        superUpdate(val);
        this.setOverridden(property.overridden);
    };

    /**
     * Overrides this property by allowing the user to type in a new value into the field.
     */
    this.override = function(){
        this.input.edit();
    };

    /**
     * Resets the property if it is overridden.
     */
    this.reset = function(){
        property.reset();
    };

    /**
     * Forces this field to be set to overridden or not based on the boolean given.
     *
     * @param overridden {Boolean} If this field is overridden (true) or reset (false)
     */
    this.setOverridden = function(overridden){
        this.setMetadata("overridden", overridden);
        this.input.enabled = overridden;
        override.disabled = overridden;
        reset.disabled = !overridden;
        lock.disabled = !overridden;
    }
}

/**
 * The most basic field type, allows you to edit a single line field and will automatically fit the text you type in.
 *
 * @param property - The property object that that this field is representing
 * @param element - The element this field is using to display on
 * @constructor Adds an "Edit" option to the context menu in case the field is locked.
 */
function TextField(property, element) {
    PropertyField.call(this, property, element);
    element = $(element);

    // Add edit option for convenience of editing while locked.
    this.menu.unshift(new ContextMenu.Option("Edit", this.input.edit.bind(this.input)));

    // If the input is edited, it is only a single line, so the enter key should save the edit.
    this.input.onOpen(function(save, cancel){
        element.on("keydown", function(e){
            if(e.key === "Enter") save();
        });
    });
    this.input.onClose(function(){
        element.off("keydown");
    });
}

/**
 * Similar to the normal text field, but allows for multi line entries. also adds options for setting the font size
 * and disabling / enabling dynamic font size as well as setting the min and max font sizes.
 *
 * @param property - The property object that that this field is representing
 * @param element - The element this field is using to display on
 * @constructor Adds required menu elements to support enabling and disabling of dynamic font.
 */
function LongTextField(property, element){
    PropertyField.call(this, property, element);
    element = $(element);
    // Dynamic font size is disabled by default, but if the element has the attribute to enable it, it will be enabled.
    this.fit.autoFit = false;

    // Add edit option for convenience of editing while locked.
    this.menu.unshift(new ContextMenu.Option("Edit", this.input.edit.bind(this.input)));

    // New menu option for toggling the dynamic font option
    let dynamicFont = new ContextMenu.Toggle("Dynamic", function(dynamic){
        this.setDynamic(dynamic);
    }.bind(this));

    // When the inputs are removed from the DOM, their event listeners are also removed, they must be given an ID
    // so that the event listeners can be attached to the body instead.
    const FONT_INPUT = element.attr("id") +"_FONT";
    const MIN_FONT_INPUT = element.attr("id") +"_MIN_FONT";
    const MAX_FONT_INPUT = element.attr("id") +"_MAX_FONT";

    // Inputs that are found in the context menu
    let fontSizeInput = $("<input id='" + FONT_INPUT + "' class='font_sizing' type='number'>");
    let minFontInput = $("<input id='" + MIN_FONT_INPUT + "' class='font_sizing' type='number'>");
    let maxFontInput = $("<input id='" + MAX_FONT_INPUT + "' class='font_sizing' type='number'>");

    // Font size context menu options
    let fontSize = new ContextMenu.Option("Font Size");
    fontSize.rightContent = fontSizeInput;
    let minFont = new ContextMenu.Option("Min Font");
    minFont.rightContent = minFontInput;
    let maxFont = new ContextMenu.Option("Max Font");
    maxFont.rightContent = maxFontInput;
    // Min and max font are only enabled with dynamic font
    minFont.disabled = true;
    maxFont.disabled = true;

    // Add all font items in a common sub menu.
    this.menu.push(new ContextMenu.Sub("Font", [dynamicFont, fontSize, minFont, maxFont]));

    let superInit = this.init.bind(this);
    /**
     * Performs all of the normal initialization, but also initializes all dynamic font metadata.
     */
    this.init = function(){
        superInit();

        fontSizeInput.val(parseInt(element.css("font-size")));

        // Set any metadata that should be synced
        this.setDynamic(this.getMetadata("dynamic") === "true");
        dynamicFont.toggle(this.getMetadata("dynamic") === "true");
        this.setMinFont(this.getMetadata("min-font") || this.fit.minSize);
        this.setMaxFont(this.getMetadata("max-font") || this.fit.maxSize);
    };

    /**
     * Sets the dynamic property of this field to the parameter provided
     * @param dynamic {boolean} True if dynamic font size is enabled, false otherwise.
     */
    this.setDynamic = function(dynamic){
        this.setMetadata("dynamic", dynamic);
        this.fit.autoFit = dynamic;
        minFont.disabled = !dynamic;
        maxFont.disabled = !dynamic;
        minFontInput.prop("disabled", !dynamic);
        maxFontInput.prop("disabled", !dynamic);
    };

    // Set the font size whenever the input is changed so that the context menu updates.
    this.input.onChange(function(){
        this.setFontSize(parseInt(element.css("font-size")));
    }.bind(this));

    /**
     * Sets the min font of this field, should be called so that the context menu is updated and the metadata is saved.
     * @param size {number} The size in pixels the min font is set to.
     */
    this.setMinFont = function(size){
        this.setMetadata("min-font", size);
        this.fit.minSize = size;
        minFontInput.val(size);
    };
    /**
     * Sets the max font of this field, should be called so that the context menu is updated and the metadata is saved.
     * @param size {number} The size in pixels the max font is set to.
     */
    this.setMaxFont = function(size){
        this.setMetadata("max-font", size);
        this.fit.maxSize = size;
        maxFontInput.val(size);
    };

    // The event listeners for the context menu items cannot be applied directly to the inputs because they are
    // removed when the inputs are removed from the dom (context menu closing)
    $("body").on("input", "#" + FONT_INPUT, function(){
        this.setFontSize(parseInt(fontSizeInput.val()));
    }.bind(this));
    $("body").on("input", "#" + MIN_FONT_INPUT, function(){
        this.setMinFont(parseInt(minFontInput.val()));
    }.bind(this));
    $("body").on("input", "#" + MAX_FONT_INPUT, function(){
        this.setMaxFont(parseInt(maxFontInput.val()));
    }.bind(this));
}

/**
 * Instead of text, this field will display a dot where the color is based off of the number the value of the property
 * is.  Clicking on the field will change the dot to the next color, but it can be locked like a normal property.
 *
 * 0 - Transparent
 * 1 - Black
 * 2 - Red
 *
 * @param property - The property object that that this field is representing
 * @param element - The element this field is using to display on
 * @constructor Disables all text input to the field and instead toggles when clicked.
 */
function ToggleField(property, element){
    PropertyField.call(this, property, element);
    element = $(element);
    // The toggle cannot support text.
    this.input.enabled = false;

    let lock = this.menu[0];

    /**
     * Sets the value based on the cycle attribute instead of the content.
     */
    this.init = function(){
        // Set the value of to the cycle if there is no property value
        if(property.get() === null && element.attr("cycle")){
            property.set(parseInt(element.attr("cycle")));
        }

        // Set any metadata that should be synced
        this.lock(this.getMetadata("locked") === "true");
        lock.toggle(this.getMetadata("locked") === "true");
    };

    /**
     * Change the content to an SVG based on the number that is provided by the value.
     * @param val - The number indicating which color the circle should be.
     */
    this.update = function(val){
        element.attr("cycle", val);
        if(val === 0)
            element.html("");
        if(val === 1)
            element.html("<svg style='display: block; width: 100%; height: 100%'><circle cx='50%' cy='50%' r='50%' fill='black'/></svg>");
        if(val === 2)
            element.html("<svg style='display: block; width: 100%; height: 100%'><circle cx='50%' cy='50%' r='50%' fill='red'/></svg>");
    };

    // Function used so that element.off can target a specific function.
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

/**
 * This field displays an image instead of text, double clicking it brings up a dialog to choose an image from your
 * computer and it will be embedded instead of text.
 *
 * @param property - The property object that that this field is representing
 * @param element - The element this field is using to display on
 * @constructor Disables the text input and adds a double click event to select a file instead.
 */
function ImageField(property, element){
    PropertyField.call(this, property, element);
    element = $(element);
    // Disable text to allow for image selection.
    this.input.enabled = false;

    let lock = this.menu[0];

    /**
     * Initializes locked as normal, but initializes based on the image tag being included instead of content.
     */
    this.init = function(){
        // Set the value if there is an image present and it is not in the property.
        if(property.get() === null && element.find("img").length > 0){
            property.set(element.find("img").attr("src"));
        }

        // Set any metadata that should be synced
        this.lock(this.getMetadata("locked") === "true");
        lock.toggle(this.getMetadata("locked") === "true");
    };

    /**
     * Set the value to the image source instead of the element content.
     * @param val - The encoded image source to embed.
     */
    this.update = function(val){
        if(val) element.html("<img src='" + val + "'>");
    };

    let fileInput = $("<input type='file' accept='image/*'>");
    fileInput.on("change", function(){
        let file = fileInput.prop("files")[0];
        if(file) property.setFile(file);
    });

    // Function used so that element.off can target a specific function.
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