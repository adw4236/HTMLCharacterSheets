/**
 * This file contains general components that can be used by other resources to add more functionality to a standard
 * HTML tag.  An element will be passed into the constructor of a component and the component will allow for JS calls
 * to certain actions but will also add any needed handlers to allow the component to act on its own.  See each
 * component for more details.
 */

/**
 * Wraps an HTML element and will automatically scale the font size in the element to fit within the container instead
 * of overflowing.  This trigger will be called with the "input" event but can be disabled with the autoFit property.
 * Fitting can also be called manually with the fit function if the "input" event is not applicable.
 *
 * @param element - The element that should be wrapped. This can be a selector, DOM element, or JQuery element.
 * @constructor Adds the input event to automatically fit the text when input is typed, can be disabled with autoFit.
 */
function FittedText(element){

    element = $(element);

    /**
     * When true, the input event for the element provided will trigger the fit function with the text that was edited.
     * @type {boolean}
     */
    this.autoFit = true;
    /**
     * The smallest font size that will be scaled to before overflow will default to the CSS property.
     * @type {number}
     */
    this.minSize = 8;
    /**
     * The largest font size that will be scaled to within the container.
     * @type {number}
     */
    this.maxSize = 32;

    /**
     * Scales the text of the element provided in the constructor to fit inside of the element.
     * @param content - Optional parameter that will scale the text size so the provided content can fit instead of the
     *                  text that is inside of the element.
     */
    this.fit = function(content){
        if(!content) content = element.html();

        // Visibility hidden must be used over display none so that the size is computed
        let size = $("<span style='display: inline-block; visibility: hidden;'></span>");
        // Element must be in the DOM for size to be computed
        $("body").append(size);
        let font = parseInt(element.css("font-size"));
        // Mirror the content in a div that will expand to fit the text to see how much space the text actually
        // takes up given the font and font size.
        size.html(content);

        // Shrink the font if needed
        size.css("font-size", font + "px");
        while(size.width() > element.width() || size.height() > element.height()){
            if(font <= this.minSize) break;
            font--;
            element.css("font-size", font + "px");
            size.css("font-size", font + "px");
        }

        // Grow the font if needed
        size.css("font-size", (font + 1) + "px");
        while(size.width() < element.width() && size.height() < element.height()){
            if(font >= this.maxSize) break;
            font++;
            element.css("font-size", font + "px");
            size.css("font-size", (font + 1) + "px");
        }

        // Clean up any leftovers
        size.remove();
    };

    /* Constructor */

    element.on("input", function(){
        if(this.autoFit) this.fit();
    }.bind(this));

}

/**
 * Wraps an HTML element to allow for editing on double click.  The double click can be disabled and the edit can be
 * called using the edit method.  Callbacks can be associated with opening, changing, and closing of the edit element.
 * The edit will be saved if the user clicks out of the element, it will be canceled if they press escape.  More
 * interactions can be added using the onOpen method.
 *
 * @param element - The element that should be wrapped. This can be a selector, DOM element, or JQuery element.
 * @constructor Adds the required event listeners on the element.
 */
function EditableBlock(element){

    element = $(element);
    let openCallbacks = [];
    let changeCallbacks = [];
    let closeCallbacks = [];

    /**
     * Specifies if the block is editable by double clicking or not.
     * @type {boolean}
     */
    this.enabled = true;

    /**
     * Enables editing on the block element and focuses it so that the user can begin typing.  The edit will close
     * when the user clicks out of the element (save) or when the user preses escape (cancel).  If the edit is canceled,
     * the text will be reverted to what it was before edit was called.
     *
     * Only one edit can be active at one time, if it is called a second time, the promise will immediately be rejected.
     *
     * @returns {Promise} A promise that will be passed the new text on success or a reason on failure.
     */
    this.edit = function(){
        return new Promise(function(resolve, reject){
            if(element.find("textarea").length > 0){
                reject("Block already being edited");
                return;
            }

            let oldValue = element.html();
            element.attr("contenteditable", "true");
            element.focus();

            /**
             * Saves the edit and calls the associated callbacks.
             */
            function save() {
                let newValue = element.html();
                changeCallbacks.forEach(function (callback) {
                    callback(newValue)
                });
                resolve(newValue);
                close();
            }

            /**
             * Cancels the edit and reverts the content to what it was.
             */
            function cancel() {
                element.html(oldValue);
                reject("Input canceled");
                close();
            }

            /**
             * Called when the edit is both canceled and saved for common cleanup.
             * Also triggers the associated callbacks.
             */
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
    /**
     * The callback provided to this method will be called when the edit is activated either by a programmatic call to
     * the edit method or by the double click event.  The callback method can take two parameters, a save function and
     * a cancel function that can be called respectively to do their tasks.  This method can be used to add extra
     * functionality to the editing mode.
     *
     * @param callback - A function that will be called when the edit is activated.
     */
    this.onOpen = function(callback){
        openCallbacks.push(callback);
    };
    /**
     * The callback provided to this method will be called when an edit is saved (even if no changes were made during
     * that edit).  The function provided will have the updated text passed in as its parameter.
     *
     * @param callback - A function that will be called when an edit is saved.
     */
    this.onChange = function(callback){
        changeCallbacks.push(callback);
    };
    /**
     * The callback provided to this method will be called when an edit is finished weather it saved or not.  Useful to
     * clean up anything that was added when the edit began from onOpen.
     *
     * @param callback
     */
    this.onClose = function(callback){
        closeCallbacks.push(callback);
    };

    /* Constructor */

    //Prevent highlight on double click without preventing highlight altogether.
    element.on("mousedown", function(e){
        if(e.detail > 1){
            e.preventDefault();
        }
    });

    element.on("dblclick", function(){
        if(this.enabled) this.edit();
    }.bind(this));

}