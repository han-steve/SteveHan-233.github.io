var elements = document.getElementsByClassName("scroll-right");
for(var i = 0; i < elements.length; i ++) {
    var element = elements[i];
    element.style.visibility = "hidden";
    $(window).on('scroll' , function(){
        var scroll_pos = $(window).scrollTop() + $(window).height();
        var element_pos = $(element).offset().top;
        if (scroll_pos > element_pos) {
            $(element).addClass('animated fadeInRightBig');
            element.style.visibility = "visible";
        };
    
    })
}
