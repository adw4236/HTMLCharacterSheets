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
            popup.css("left", ($(window).width() - menu.outerWidth() - 5) + "px");
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

    function updateContent(menu, options){
        let content = $("<ul class='context_menu'></ul>");
        menu.setContent(content);

        function addOption(option, action){
            let item = $("<li>" + option + "</li>");
            content.append(item);
            item.on("click", function(){
                let result = action();
                if(typeof result === "undefined" || result) menu.close();
            });
        }

        function addSubmenu(option, subOptions){
            let item = $("<li>" + option + "<span class='sub_arrow'><svg viewBox=\"0 0 357 357\"><polygon points='38.25,0 38.25,357 318.75,178.5'/></svg></span></li>");
            content.append(item);
            let subMenu = new Popup();

            let mousein = false;
            let timeout = 0;
            item.on("mouseenter", function(){
                mousein = true;
                clearTimeout(timeout);
                subMenu.open();
                updateContent(subMenu, subOptions);
                let menuPos = menu.getPosition();
                subMenu.setPosition(menuPos.left + content.width(), menuPos.top + item.position().top);
                subMenu.getContent().on("mouseenter", function(){
                    mousein = true;
                    clearTimeout(timeout);
                });
                subMenu.getContent().on("mouseleave", function(){
                    mousein = false;
                    timeout = setTimeout(function(){
                        if(!mousein) subMenu.close();
                    }, 500);
                })
            });
            item.on("mouseleave", function(){
                mousein = false;
                timeout = setTimeout(function(){
                    if(!mousein) subMenu.close();
                }, 500);
            })
        }

        function processOptions(group){
            for(let option in group){
                if(typeof group[option] === "function"){
                    addOption(option, group[option]);
                }else if(group[option] !== null){
                    addSubmenu(option, group[option]);
                }
            }
        }

        if(Array.isArray(options)){
            for(let i = 0; i < options.length; i++){
                processOptions(options[i]);
                if(i < options.length - 1) content.append("<hr>");
            }
        }else{
            processOptions(options);
        }

        return content;
    }

    element.on("contextmenu", function(e){
        if(e.ctrlKey) return;
        e.preventDefault();

        menu.open();
        updateContent(menu, options);
        menu.setPosition(e.clientX, e.clientY);

    }.bind(this));
}