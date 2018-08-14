var books = document.getElementsByClassName("book-covers");
var details = document.getElementsByClassName("details");
for (let i = 0; i < books.length; i++) {
    books[i].addEventListener("click", () => {
        toggleShow(books[i], details[i]);
        for(let j = 0; j < books.length; j ++) {
            if(books[j].classList.contains("selected") && j!==i) {
                toggleShow(books[j], details[j]);
            }
        }
    })
}

function toggleShow(book, detail){
    console.log("toggling " + detail);
    if (detail.style.maxHeight) {
        detail.style.maxHeight = null;
    } else {
        detail.style.maxHeight = detail.scrollHeight + "px";
    }
    book.classList.toggle("selected");
}