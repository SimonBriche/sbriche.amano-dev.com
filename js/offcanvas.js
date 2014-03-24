$(document).ready(function () {
    $('[data-toggle=offcanvas]').click(function () {
        $('.row-offcanvas').toggleClass('active');
        $('.sidebar-offcanvas').css('top', $(window).scrollTop()+'px');
    });
    $(window).scroll(function(){
        clearTimeout($.data(this, 'scrollTimer'));
        $.data(this, 'scrollTimer', setTimeout(function() {
            $('.sidebar-offcanvas').css('top', $(window).scrollTop()+'px');
            }, 250)
        );
    });
    
    $('a[href*=#]:not([href=#])').click(function() {
        if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') 
            || location.hostname == this.hostname) {

            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
            if (target.length) {
				$('[data-toggle=offcanvas]').click();
				setTimeout(function() {
					$('html,body').animate({
						 scrollTop: target.offset().top - parseInt($('.container-fluid.main').css("padding-top"))
					}, 500);
				},$('[data-toggle=offcanvas]').is(':visible') ? 150 : 0);
                return false;
            }
        }
    });
});