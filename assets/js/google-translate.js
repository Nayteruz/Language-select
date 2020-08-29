/*!***************************************************
 * google-translate.js v1.0.0
 * https://Get-Web.Site/
 * author: L2Banners
 *****************************************************/



const googleTranslateConfig = {
    lang: "ru",
};

function TranslateInit() {
    let code = TranslateGetCode();
    // Находим флаг с выбранным языком для перевода и добавляем к нему активный класс
    $('[data-google-lang="' + code + '"]').addClass('active_lang');

    if (code == googleTranslateConfig.lang) {
        // Если язык по умолчанию, совпадает с языком на который переводим
        // То очищаем куки
        TranslateClearCookie();
    }

    // Инициализируем виджет с языком по умолчанию
    new google.translate.TranslateElement({
        pageLanguage: googleTranslateConfig.lang,
    }, 'translate_element');

    // Вешаем событие  клик на флаги
    $('[data-google-lang]').click(function () {
        TranslateSetCookie($(this).attr("data-google-lang"))
        // Перезагружаем страницу
        window.location.reload();
    });
}

function TranslateGetCode() {
    // Если куки нет, то передаем дефолтный язык
    let lang = ($.cookie('googtrans') != undefined && $.cookie('googtrans') != "null") ? $.cookie('googtrans') : googleTranslateConfig.lang;
    return lang.substr(-2);
}

function TranslateClearCookie() {
    $.cookie('googtrans', null);
    $.cookie("googtrans", null, {
        domain: "." + document.domain,
    });
}

function TranslateSetCookie(code) {
    // Записываем куки /язык_который_переводим/язык_на_который_переводим
    $.cookie('googtrans', "/auto/" + code);
    $.cookie("googtrans", "/auto/" + code, {
        domain: "." + document.domain,
    });
}


Vue.config.devtools = true;
new Vue({
	el:".content-text",
	data : {
		item_list : translate_data,
		item_select_list : translate_list,
		afterCopy : '',
		translated : {},
		copy_done : false,
		popup_done : false,
		text_translate_label : 'Идет перевод текста'
	},
	methods: {
		translateCopy : function() {
			this.$refs.copytext.select();
	  		document.execCommand('copy');	
	  		this.pop_done();
		},
		translateChange : function(){
			let translate_count = is_translate();
			
			if (translate_count.found_no>10){
				this.text_translate_label = 'Перевод еще не завершен нужно подождать';
			} else {
				this.text_translate_label = 'Перевод завершен можно копировать';
				this.afterCopy = '';
				let text_tr = '';
			  	this.afterCopy = list();
			  	this.copy_done = false;
			  	this.popup_done = false;
			}

		},
		pop_done : function(){
			this.popup_done = true;
			let intr;
            let self = this;
            clearTimeout(intr);
		    intr = setTimeout(function(){
		        self.popup_done = false;
		        self.copy_done = false;
		    },2000);
		},
		
	},
	watch: {
		afterCopy: function(newVal, oldVal) {
            let intr;
            let self = this;
            clearTimeout(intr);
		    intr = setTimeout(function(){
		        self.copy_done = true;
		    },1500);
		    
        },
        
	},
	components : {
		list_translate : {
			template:`<div class="line-text">
				<div class="name skiptranslate">"{{item.key}}" : "</div>
				<div class="text-translate"><span>{{item.text}}</span><span class="skiptranslate">"</span></div>
			</div>`,
			props : ['item']
		},
		item_select_list : {
			template:`<div class="item-lang" :data-google-lang="item.lang">
    			<img :src="item.src" :alt="item.lang" class="language__img">
    			<div class="name">{{item.name}}</div>
    		</div>`,
			props : ['item']
		}
	},
	mounted: function(){
		
	}
})

function list(){
	text_tr = '{ \n \t"ru": {\n';
	let items_list_text = document.querySelectorAll('.line-text');
	let length_items = items_list_text.length;
	let count = 0;
  	items_list_text.forEach(function(comment){
  		count++;
  		let name = comment.querySelector('.name').textContent;
		let text = comment.querySelector('.text-translate span').textContent.replace(/"/g, '&quot;') + '"';
		if (length_items == count){
			text_tr += '\t\t' + name + text + '\n'	
		} else {
			text_tr += '\t\t' + name + text + ', \n'
		}
  	})
  	text_tr += '\t} \n}';
	console.log(length_items, count)
	return text_tr;	
}

function is_translate(){
	let found_no = 0; // Найдено не переведенных.
	let found_yes = 0; // Найдено переведенных.
	let items_list_text = document.querySelectorAll('.line-text');
	items_list_text.forEach(function(comment){
		let text = comment.querySelector('.text-translate').innerHTML;
		if(text.indexOf('font') == -1){
			found_no++;
		} else {
			found_yes++;
		}
  	})

  	return {
  		'found_no': found_no,
  		'found_yes' : found_yes
  	}
}

