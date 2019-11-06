function Popup(x, y, content){

    let popup = $("<div class='popup'></div>");

    $(document).on("mousedown", function(e){
        if(!popup.has($(e.target)).length) this.close();
    }.bind(this));

    function correctWalls(){
        let pos = popup.position();
        if(pos.top + popup.outerHeight() > $(window).height()){
            popup.css("top", ($(window).height() - popup.outerHeight() - 5) + "px");
        }
        if(pos.left + popup.outerWidth() > $(window).width()){
            popup.css("left", ($(window).width() - popup.outerWidth() - 5) + "px");
        }
    }

    this.setContent = function(content){
        popup.html(content);

        if($.contains(document, popup[0])) correctWalls();
    };
    this.getContent = function(){
        return popup.children();
    };
    this.setPosition = function(x, y){
        popup.css({
            top: y + "px",
            left: x + "px"
        });

        if($.contains(document, popup[0])) correctWalls();
    };
    this.getPosition = function(){
        return popup.position();
    };

    if(x && y) this.setPosition(x, y);
    if(content) this.setContent(content);

    this.open = function(){
        this.close();
        $("body").append(popup);

        correctWalls();
    };
    this.close = function(){
        popup.remove();
    };
}

function ContextMenu(element, options){

    let menu = new Popup();

    function fillContent(){
        let menuContent = $("<ul class='context_menu'></ul>");
        menu.setContent(menuContent);

        options.forEach(function(option){
            if(option.hidden) return;

            let item = $("<li></li>");
            menuContent.append(item);

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

    this.open = function(x, y){
        menu.open();
        fillContent();
        menu.setPosition(x, y);
    };
    this.close = function(){
        menu.close();
    };

    if(element) element.on("contextmenu", function(e){
        if(e.ctrlKey) return;
        e.preventDefault();
        this.open(e.clientX, e.clientY);
    }.bind(this));
}

ContextMenu.Option = function(content, action, icon){
    this.icon = icon || null;
    this.content = content;
    this.rightContent = null;
    this.actionIcon = null;

    this.action = action || function(){return false};
    this.disabled = false;
    this.hidden = false;

    this.call = function(){
        return this.action();
    }
};
ContextMenu.Toggle = function(content, action, checked, icon){

    this.checkedIcon = icon || null;
    this.uncheckedIcon = icon || null;
    this.checkedContent = content;
    this.uncheckedContent = content;
    this.checkedRightContent = null;
    this.uncheckedRightContent = null;
    this.checkedActionIcon = "<svg viewBox='0 0 448.8 448.8'><path d='M124.95,181.05l-35.7,35.7L204,331.5l255-255l-35.7-35.7L204,260.1L124.95,181.05z M408,408H51V51h255V0H51 C22.95,0,0,22.95,0,51v357c0,28.05,22.95,51,51,51h357c28.05,0,51-22.95,51-51V204h-51V408z'/></svg>";
    this.uncheckedActionIcon = "<svg viewBox='0 0 459 459'><path d='M408,51v357H51V51H408 M408,0H51C22.95,0,0,22.95,0,51v357c0,28.05,22.95,51,51,51h357c28.05,0,51-22.95,51-51V51 C459,22.95,436.05,0,408,0L408,0z'/></svg>";

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
ContextMenu.Sep = function(title){
    this.sep = title || "";
};
ContextMenu.Sub = function(content, menu, icon){

    this.icon = icon || null;
    this.content = content;
    this.rightContent = null;
    this.actionIcon = "<svg style='height: 8px; margin-top: 3px;' viewBox='0 0 357 357'><polygon points='38.25,0 38.25,357 318.75,178.5'/></svg>";

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

    function closeTimeout(item){
        clearTimeout(timeout);
        if(element) element.off("mouseleave", close);
        close = function(){
            timeout = setTimeout(function(){
                subMenu.close();
                element.off("mouseleave", close);
            }, 500);
        };
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


    this.hover = function(e){
        let item = $(e.target);
        closeTimeout(item);
        let pos = item.offset();
        subMenu.open((pos.left - $(window).scrollLeft()) + item.width(), pos.top - $(window).scrollTop());
    };
};