let regexpPhone = new RegExp('(7|8)\\s[\(][0-9]{3}[\)]\\s[0-9]{3}[\-][0-9]{2}[\-][0-9]{2}');
let regexpMail = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);

let phoneElement = document.querySelectorAll('.jsPhoneMask');

let phoneMaskSettings = {
	mask: [
		{
			mask: '8 (000) 000-00-00',
			startsWith: '8',
			lazy: true
		},
		{
			mask: '+{7} (000) 000-00-00',
			startsWith: '7',
			lazy: true
		},
		{
			mask: '+{7} (000) 000-00-00',
			startsWith: '',
			lazy: true
		},
		{
			mask: '+{7} (000) 000-00-00',
			startsWith: '9',
			lazy: true
		}
	],
	dispatch: function (appended, dynamicMasked) {
		let number = (dynamicMasked.value + appended).replace(/\D/g, '');

		return dynamicMasked.compiledMasks.find(function (m) {
			return number.indexOf(m.startsWith) === 0;
		}) || this.dynamicMasked.compiledMasks[this.dynamicMasked.compiledMasks.length - 1];
	}
};

if (phoneElement.length > 0) {
	for (let i = 0; i < phoneElement.length; i++) {
		let mask = IMask(phoneElement[i], phoneMaskSettings);
	}
}


$('.jsForm form').each(function(){
	const that = $(this);

	that.submit(function (e) {
		e.preventDefault();

		$(this).find('.jsInput.input__field--required').each(function(){
			checkInputs($(this));
		});


		if($(this).find('.input.is-error').length == 0 & !$(this).find('.jsInput').val().length == 0){

			alert('Отправка формы')


			// $.ajax({
			// type: "POST",
			// url: ,
			// data: ,
			// success: function () {
			// }
			// });
		}
	});

});




let jsInputs = $('.jsInput');

jsInputs.each(function() {
  
    if($(this).hasClass('jsInputReq')){
        $(this).on('keyup input', function(){
            checkInputs($(this));
        })
    }

	$(this).focus(function() {
		$(this).closest('.input').removeClass('is-filled');
		$(this).closest('.input').addClass('is-focus');
	});

	$(this).blur(function(){
		if($(this).val().length > 0){
			$(this).closest('.input').removeClass('is-focus');
			$(this).closest('.input').addClass('is-filled');
		} else {
			$(this).closest('.input').removeClass('is-focus');
			$(this).closest('.input').removeClass('is-error');
		}
	})
})

$('.jsInputType').on('click', function(){
	let input = $(this).closest('.input').find('.jsInput');
	
	if(input.attr('type') == 'password') {
		input.attr('type', 'text');
		$(this).removeClass('is-show')
		$(this).addClass('is-hide')

	} else if(input.attr('type') == 'text'){
		input.attr('type', 'password');
		$(this).removeClass('is-hide')
		$(this).addClass('is-show')
	}
})

$('.jsForm').each(function(){
    let thisForm = $(this);

    thisForm.submit(function (e) {

        let inputs = thisForm.find('.jsInput.jsInputReq');
		let checkboxes = $('.jsCheckbox.jsInputReq');

		checkboxes.each(function(){
            checkboxCheck($(this));
        })
        inputs.each(function(){
            checkInputs($(this));
        })

        if(thisForm.find('.is-error').length ){
            e.preventDefault();
        }
    });
})

function checkInputs(input){

    if(input.hasClass('jsPhoneMask')){
        if(input.val() != 0 & regexpPhone.test(input.val()) == true){
            input.closest('.input').removeClass('is-error');
        } else{
            input.closest('.input').addClass('is-error');
        }  
    } else if(input.val() == 0){
        input.closest('.input').addClass('is-error');
    } else{
        input.closest('.input').removeClass('is-error');
    }  

	if(input.hasClass('jsInputPassword')){
		if(input.closest('.jsForm').find('.jsInputPassword').length > 1){
			let secondInput = input.closest('.jsForm').find('.jsInputPassword').not(input);

			if(secondInput.val() != 0){
				if(input.val() != secondInput.val()){
					input.closest('.input').addClass('is-error');
					secondInput.closest('.input').addClass('is-error');
					
				} else {
					input.closest('.input').removeClass('is-error');
					secondInput.closest('.input').removeClass('is-error');
				}
			}
		}
	}
}

function checkboxCheck(checkbox){
	if(!checkbox.is(':checked')){
		checkbox.closest('.checkbox').addClass('is-error')
	} else {
		checkbox.closest('.checkbox').removeClass('is-error')
	}
}


function checkInputsOnVal (){
	$('.jsInput').each(function (){
		if($(this).val().length > 0){
			$(this).closest('.input').addClass('is-filled');
		}
	}) 
}

checkInputsOnVal()
