var elements = document.getElementsByClassName("scroll");
for(var i = 0; i < elements.length; i ++) {
    let element = elements[i];
    element.style.visibility = "hidden";
    let animation = element.classList[element.classList.length - 1];
    let delay = element.classList[element.classList.length - 2];
    if (isNaN(delay)) {
        delay = 0;
    }
    element.classList.remove(animation, delay);
    $(window).on('scroll' , function(){
        var scroll_pos = $(window).scrollTop() + $(window).height();
        var element_pos = $(element).offset().top + 150 + Number(delay);
        if (scroll_pos > element_pos) {
            element.classList.add('animated', animation);
            element.style.visibility = "visible";
        };
    
    })
}