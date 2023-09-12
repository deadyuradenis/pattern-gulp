const jsSlider = new Swiper('.jsSlider .slider__inner', {
	loop: true,
	slidesPerView: "auto",
	speed: 600,
	centeredSlides: true,
	spaceBetween: 35,

	breakpoints: {
		0:{
			spaceBetween: 25,
		},

		834: {
			spaceBetween: 35,
		},
	}
});