/*
* sidebar events
*/

$(function(){
	var isOpen = false;
	$("#sidebar, #gray_back").click(function(){
		if(!isOpen){
			$("#header").animate({left:'0px'});
			$("#gray_back").fadeIn('fast');
			isOpen = true;
		}else{
			$("#header").animate({left:'-200px'});
			$("#gray_back").fadeOut('fast');
			isOpen = false;
		}
	})
});

/*
*book page tip messages
*/
$(function(){
	//tooltip function
	var curentWidth = $(window).width();
	if(curentWidth<=768){
		$(".book-message p").mouseover(function(){
		//todo:
		})
	}
	
})