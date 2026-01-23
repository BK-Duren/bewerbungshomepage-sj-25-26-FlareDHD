<<<<<<< HEAD
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.classList.toggle("is-open");
    nav.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}
=======
/* -- ----------------------------- */
/* -- BKSD - Remove Active          */
/* -- ----------------------------- */
function active_remove() {
        $('.active').each(function(index) {
         $(this).removeClass('active');
       });
    }
/* -- ------------------------------ */
/* -- BKSD - Set Active Menü         */
/* -- ------------------------------ */
 function setActiveMenu(id) {
       /* Entferne Active-Markierung */
       active_remove();
       /* Füge Klasse Active hinzu */
       jQuery(id).addClass('active');
    }
>>>>>>> b1b9d05 (version12)
