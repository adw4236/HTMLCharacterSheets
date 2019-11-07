/**
 * Creates a popup that can be positioned anywhere fixed on the screen.  The popups content can be customized and
 * can be opened or closed at any time.
 *
 * @param x - Optional, the X position of the popup relative to the window
 * @param y - Optional, the Y position of the popup relative to the window
 * @param content - Optional, the content of the popup.
 * @constructor Bind a closing event and initialize the position or content if provided.
 */
function Popup(x, y, content){

    let popup = $("<div class='popup'></div>");

    // If clicked outside of the popup, close the popup.
    $(document).on("mousedown", function(e){
        if(!popup.has($(e.target)).length) this.close();
    }.bind(this));

    /**
     * Repositions the popup if it is colliding with the edge of the screen.
     */
    function correctWalls(){
        let pos = popup.position();
        if(pos.top + popup.outerHeight() > $(window).height()){
            popup.css("top", ($(window).height() - popup.outerHeight() - 5) + "px");
        }
        if(pos.left + popup.outerWidth() > $(window).width()){
            popup.css("left", ($(window).width() - popup.outerWidth() - 5) + "px");
        }
    }

    /**
     * Sets the content of the popup, if the popup is visible, it will be moved so that it is not going over the edge
     * of the screen.
     * @param content - The content to fill with, this can be a DOM element, JQuery element, or just HTML
     */
    this.setContent = function(content){
        popup.html(content);

        if($.contains(document, popup[0])) correctWalls();
    };
    /**
     * Sets the position of the popup, if the popup is visible and the new position pushes it off screen, it will be
     * moved so that it is not going off the edge.
     *
     * @param x - The fixed X position of the popup in pixels
     * @param y - The fixed Y position of the popup in pixels
     */
    this.setPosition = function(x, y){
        popup.css({
            top: y + "px",
            left: x + "px"
        });

        if($.contains(document, popup[0])) correctWalls();
    };

    // Initialize construction if needed.
    if(x && y) this.setPosition(x, y);
    if(content) this.setContent(content);

    /**
     * Opens the popup at the correct position and with the supplied content.
     */
    this.open = function(){
        this.close();
        $("body").append(popup);

        correctWalls();
    };
    /**
     * Forcibly closes the popup.
     */
    this.close = function(){
        popup.remove();
    };
}

/**
 * Creates a new context menu that will appear when right clicking on the provided element.  A list of options is
 * provided and that list can change at any time after the construction to update the list of options on the fly.
 * Options can also be configured after construction and the changes will take effect when the context menu is opened
 * next.
 *
 * CTRL can be held to open the browser default context menu instead.
 *
 * @param element - The element that will have the context menu if you right click on it.
 * @param options - The list of options that appear, this should be an array of objects, see below for templates.
 * @constructor Creates a new popup and binds the opening to the context menu event.
 */
function ContextMenu(element, options){

    let menu = new Popup();

    /**
     * Used internally to populate the contents of the context menu.
     */
    function fillContent(){
        let menuContent = $("<ul class='context_menu'></ul>");
        menu.setContent(menuContent);

        //Options is a list of objects that have the information needed to display them.
        options.forEach(function(option){
            if(option.hidden) return;

            let item = $("<li></li>");
            menuContent.append(item);

            // An empty sep string will just add a line with no title, a null value will not add a line at all.
            if(typeof option.sep === "string"){
                item.html(option.sep);
                item.addClass("disabled separator");
                return;
            }

            item.append($("<span class='item_icon'></span>").html(option.icon));
            item.append($("<span class='item_content'></span>").html(option.content));
            let rightContent = $("<span class='right_content'></span>");
            rightContent.append($("<span class='item_right_content'></span>").html(option.rightContent));
            rightContent.append($("<span class='item_action'></span>").html(option.actionIcon));
            item.append(rightContent);

            if(option.disabled){
                item.addClass("disabled");
            }else{
                item.on("click", function(e){
                    let result = option.call(e);
                    if(typeof result === "undefined" || result) menu.close();
                });
                item.on("mouseenter", function(e){
                    if(option.hover) option.hover(e);
                });
            }
        });
    }

    /**
     * Forces the context menu open at the position provided.
     *
     * @param x - The fixed X position of the menu.
     * @param y - The fixed Y position of the menu.
     */
    this.open = function(x, y){
        menu.open();
        fillContent();
        menu.setPosition(x, y);
    };
    /**
     * Forces the context menu closed.
     */
    this.close = function(){
        menu.close();
    };

    if(element) element.on("contextmenu", function(e){
        // Hold CTRL to get the normal context menu
        if(e.ctrlKey) return;
        e.preventDefault();
        this.open(e.clientX, e.clientY);
    }.bind(this));
}

/**
 * A simple option that displays on the context menu and will execute the action provided when it is clicked.
 *
 * @param content - The content to be displayed on the menu option.
 * @param action - The function that will be called when the option is clicked.
 * @param icon - An optional icon the will be displayed on the option.
 * @constructor Initializes all fields the context menu may or may not need to render the option.
 */
ContextMenu.Option = function(content, action, icon){
    /**
     * The icon that will render on the far left
     */
    this.icon = icon || null;
    /**
     * The content that will render next to the icon on the left
     */
    this.content = content;
    /**
     * The content that will render on the right
     */
    this.rightContent = null;
    /**
     * The icon that represents the action of the option, shown on the far right.
     */
    this.actionIcon = null;

    /**
     * The function that will be called when the option is clicked, if this function returns false, the menu will not
     * close.
     * @type {Function}
     */
    this.action = action || function(){return false};
    /**
     * A disabled option is grayed out.
     * @type {boolean}
     */
    this.disabled = false;
    /**
     * A hidden option is not rendered on the menu at all.
     * @type {boolean}
     */
    this.hidden = false;

    /**
     * This method is executed by the context menu to allow for more specific implementations of options.
     * @returns {Boolean} The value returned by the action.
     */
    this.call = function(){
        return this.action();
    }
};
/**
 * An option that will toggle between two settings when clicked.
 *
 * @param content - The content to display on the option.
 * @param action - A function that will be called when the option is clicked, it will be provided a boolean parameter.
 * @param checked - Optional default state of the option (defaults to false)
 * @param icon - Optional icon that will be displayed to the left of the content
 * @constructor Initializes the normal option values as well as the toggle functionality.
 */
ContextMenu.Toggle = function(content, action, checked, icon){

    /**
     * The icon that will be displayed when the toggle is true
     */
    this.checkedIcon = icon || null;
    /**
     * The icon that will be displayed when the toggle is false
     */
    this.uncheckedIcon = icon || null;
    /**
     * The content that will be displayed when the toggle is true
     */
    this.checkedContent = content;
    /**
     * The content that will be displayed when the toggle is false
     */
    this.uncheckedContent = content;
    /**
     * The right content that will be displayed when the toggle is true
     */
    this.checkedRightContent = null;
    /**
     * The right content that will be displayed when the toggle is false
     */
    this.uncheckedRightContent = null;
    /**
     * The action icon that will be displayed when the toggle is true (default is a checked box)
     */
    this.checkedActionIcon = "<svg viewBox='0 0 448.8 448.8'><path d='M124.95,181.05l-35.7,35.7L204,331.5l255-255l-35.7-35.7L204,260.1L124.95,181.05z M408,408H51V51h255V0H51 C22.95,0,0,22.95,0,51v357c0,28.05,22.95,51,51,51h357c28.05,0,51-22.95,51-51V204h-51V408z'/></svg>";
    /**
     * The action icon that will be displayed when the toggle is false (default is an unchecked box)
     */
    this.uncheckedActionIcon = "<svg viewBox='0 0 459 459'><path d='M408,51v357H51V51H408 M408,0H51C22.95,0,0,22.95,0,51v357c0,28.05,22.95,51,51,51h357c28.05,0,51-22.95,51-51V51 C459,22.95,436.05,0,408,0L408,0z'/></svg>";

    /**
     * Called to re-calculate which icons should be displayed based on the state of the option, should be called if any
     * of the above attributes are changed manually.
     */
    this.refreshIcons = function(){
        this.icon = checked ? this.checkedIcon : this.uncheckedIcon;
        this.content = checked ? this.checkedContent : this.uncheckedContent;
        this.rightContent = checked ? this.checkedRightContent : this.uncheckedRightContent;
        this.actionIcon = checked ? this.checkedActionIcon : this.uncheckedActionIcon;
    };

    checked = Boolean(checked);
    this.refreshIcons();

    this.action = action || function(){return false};
    this.disabled = false;
    this.hidden = false;

    /**
     * Toggles the option, if a parameter is provided, it sets the option instead.
     * @param set - Optional boolean to set the toggle to.
     */
    this.toggle = function(set){
        if(typeof set === "undefined") checked = !checked;
        else checked = Boolean(set);
        this.refreshIcons();
    };

    this.call = function(){
        let result = this.action(!checked);
        if(typeof result === "undefined" || result){
            this.toggle();
        }
        return result;
    };
};
/**
 * Creates a separator line with an optional title in the context menu.  This line cannot be clicked.
 *
 * @param title - Optional text to display on top of the line.
 * @constructor Initializes the sep field.
 */
ContextMenu.Sep = function(title){
    /**
     * The text to display on the separator line.  This attribute should be null if others are being used.
     */
    this.sep = title || "";
};
/**
 * Creates a sub menu option for the context menu that will open another when hovered over.
 *
 * @param content - The content of the option
 * @param menu - An array that holds the options for the sub menu
 * @param icon - An optional icon for the option
 * @constructor Creates all logic needed to have functional sub-menus
 */
ContextMenu.Sub = function(content, menu, icon){

    this.icon = icon || null;
    this.content = content;
    this.rightContent = null;
    this.actionIcon = "<svg style='height: 8px; margin-top: 3px;' viewBox='0 0 357 357'><polygon points='38.25,0 38.25,357 318.75,178.5'/></svg>";

    // An action that returns false will not close when clicked, but this can be overridden to add functionality.
    this.action = function(){return false};
    this.disabled = false;
    this.hidden = false;
    this._menu = menu;

    let subMenu = new ContextMenu(null, menu);

    this.call = function(){
        return this.action();
    };

    let timeout;
    let element;
    let close;

    /**
     * When the mouse leaves the elment provided, a timeout begins that will close the dialog after a short time if the
     * cursor does not enter in the sub menu or the option again.
     * @param item - The option that was just entered that we should watch for a leave.
     */
    function closeTimeout(item){
        // If closeTimeout is called a second time, the previous one needs to be cleared out and the listener reset.
        // or the timeouts will build up and close the menu when its not intended.
        clearTimeout(timeout);
        if(element) element.off("mouseleave", close);

        close = function(){
            timeout = setTimeout(function(){
                subMenu.close();
                element.off("mouseleave", close);
            }, 500);
        };

        // Since this function is called whenever a mouse enters an option, only the option the cursor is in will have
        // a mouse leave event.
        element = item;
        element.on("mouseleave", close);
    }

    //Hijack the hover method of the items so we know if they are being hovered
    function addHoverListners(menu){
        menu.forEach(function(item){
            let superHover = function(){};
            if(item.hover) superHover = item.hover.bind(item);

            item.hover = function(e){
                closeTimeout($(e.target));
                superHover(e);
            };
            if(item._menu) addHoverListners(item._menu);
        });
    }
    addHoverListners(menu);

    /**
     * Called when this option is hovered over.
     * @param e - The hover event, used to grab the element that was hovered to add mouse leave listeners.
     */
    this.hover = function(e){
        let item = $(e.target);
        closeTimeout(item);
        let pos = item.offset();
        subMenu.open((pos.left - $(window).scrollLeft()) + item.width(), pos.top - $(window).scrollTop());
    };
};