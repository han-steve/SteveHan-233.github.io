var triggers = document.getElementsByClassName("expand-trigger");
for(var i = 0; i < triggers.length; i ++) {
    let trigger = triggers[i];
    trigger.addEventListener("click", function() {
        trigger.classList.toggle("triggered");
        var div = trigger.nextElementSibling; 
        if (div.style.maxHeight) {
            div.style.maxHeight = null;
        } else {
            div.style.maxHeight = 700 + "px";
        }
    });
}

