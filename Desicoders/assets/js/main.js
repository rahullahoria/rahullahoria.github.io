/*=========================================
    # Preload Spinner
=========================================*/
$(window).on('load', function() {
	setTimeout(removeLoader, 250);
});

function removeLoader() {
	$(".preloadSpinner").fadeOut(200, function() {
		$(".preloadSpinner").remove();
	});
}
/*=========================================
    # Back To Top
=========================================*/
$(window).scroll(function() {
	if ($(this).scrollTop() > 100) {
		$('.backtotop').fadeIn(100);
	} else {
		$('.backtotop').fadeOut(100);
	}
});
$('.backtotop').click(function() {
	$("html, body").animate({
		scrollTop: 0
	}, 100);
	return false;
});

$(document).ready(function() {
	/*=========================================
	    # Parallax
	=========================================*/
	if ($(".parallax").length) {
		$('.parallax').jarallax();
	}
	/*=========================================
	    # Footer Copyrights Year
	=========================================*/
	document.getElementById("copyright_year").innerHTML = new Date().getFullYear();
	/*=========================================
	    # Application Form
	=========================================*/
	if ($("#application-form").length) {
		$("#application-form").validate({
			errorPlacement: function(error, element) {
				return true;
			},
			rules: {
				full_name: {
					required: true,
					minlength: 3
				},
				email: {
					required: true,
					email: true
				},
				phone_number: {
					required: true,
					number: true,
					minlength: 10,
					maxlength: 10
				},
				average_revenue: {
					required: true,
				},
				thing_holding_you_back: {
					required: true,
				},
				good_fit_for_your_business: {
					required: true,
				},
			},
			submitHandler: function(form) {
				var formData = $('#application-form').serialize();
				$.ajax({
					type: 'POST',
					url: 'assets/php/order-form.php',
					dataType: "json",
					data: formData,
					success: function(data) {
						if (data.success) {
							$('.form-status').addClass('alert alert-success');
							$('.form-status').text('Your Message Has been Sent Successfully');
							form.submit();
							$('.form-status').slideDown().delay(3000).slideUp();
							$("#application-form").trigger("reset");
							window.location.href = 'thank-you.html';
						} else {
							$('.form-status').addClass('alert alert-danger');
							$('.form-status').text('Error Occurred, Please Try Again');
							$('.form-status').slideDown().delay(3000).slideUp();
						}
					},
					error: function(xhr, status, error) {
						$('.form-status').addClass('alert alert-danger');
						$('.form-status').text('Something Went Wrong');
						$('.form-status').slideDown().delay(3000).slideUp();
					}
				});
			}
		});
	}
});