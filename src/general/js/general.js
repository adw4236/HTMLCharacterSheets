/**
 * This file contains code that is general to the application as a whole and not to a certain subsystem.
 */

$(function(){

    // Open the default tab
    $("#" + $(".nav>div[active]").data("open")).show();
    // Change tabs on click
    $(".nav>div").on("click", function(){
        $(".nav>div").removeAttr("active");
        $(this).attr("active", true);
        $(".page").hide();
        $("#" + $(this).data("open")).show();
    });

});