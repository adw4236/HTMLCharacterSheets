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