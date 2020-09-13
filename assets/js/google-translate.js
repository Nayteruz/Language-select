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
    
    if (document.querySelector('[data-google-lang="' + code + '"]') != undefined){
    	document.querySelector('[data-google-lang="' + code + '"]').classList.add('active_lang');
    }

    if (code == googleTranslateConfig.lang) {
        // Если язык по умолчанию, совпадает с языком на который переводим
        // То очищаем куки
        TranslateClearCookie();
    }

    // Инициализируем виджет с языком по умолчанию
    new google.translate.TranslateElement({
        pageLanguage: googleTranslateConfig.lang,
    });

    // Вешаем событие  клик на флаги
    let lang_items = document.querySelectorAll('[data-google-lang]');
    lang_items.forEach(el =>{
    	el.addEventListener('click', () =>{
    		TranslateSetCookie(el.dataset.googleLang)
    		window.location.reload();
    	})
    })
}

function TranslateGetCode() {
    // Если куки нет, то передаем дефолтный язык
    let lang = googleTranslateConfig.lang;
    let lang2 = document.cookie.split(';');
    	for (let i=0; i<lang2.length; i++){
    		if (lang2[i].includes('googtrans')){
    			lang = decodeURIComponent(lang2[i]).substr(-2);
    			break;
    		}
    	}
    return lang;
}

function TranslateClearCookie() {
	let cookieArr = document.cookie.split(';');
	for (let i=0; i<cookieArr.length; i++){
		if (cookieArr[i].includes('googtrans')){
			cookieArr.splice(cookieArr[i], 1);
		}
	}
	document.cookie = cookieArr.join(';');
	document.cookie = `googtrans=null;`;
	document.cookie = `googtrans=null; domain=${document.domain}`;
    
}

function TranslateSetCookie(code) {
    // Записываем куки /язык_который_переводим/язык_на_который_переводим
    let cookieArr = document.cookie.split(';');
	for (let i=0; i<cookieArr.length; i++){
		if (cookieArr[i].includes('googtrans')){
			cookieArr.splice(cookieArr[i], 1);
		}
	}
	document.cookie = cookieArr.join(';');
	document.cookie = `googtrans=/auto/${code};`;
	document.cookie = `googtrans=/auto/${code}; domain=${document.domain}`;
}

Vue.config.devtools = true;

let status_texts = {
	in_process : 'Идет перевод текста',
	done : 'Перевод завершен можно копировать',
	not_selected : 'Не выбран языка для перевода',
	copy : 'Текст скопирован в буфер обмена'
}

let vm = new Vue({
	el:".content-text",
	data : {
		item_list : translate_data,                // Отрисовка списка перевода.
		item_select_list : translate_list,         // Отрисовка списка выбора языка.
		formatedCopyText : '',                     // Форматированный текст для копирования.
		copy_ready : false,
		is_popup : false,
		status_text : status_texts.not_selected,   // Статусы.
		copy: status_texts.copy                    // Текст всплывающей подсказки.
	},
	methods: {
		translateCopy : function() {
			this.$refs.copytext.select();
	  		document.execCommand('copy');	
	  		this.pop_done();
		},
		pop_done : function(){
			this.is_popup = true;
			let intr;
            let thisVm = this;
            
            clearTimeout(intr);
		    intr = setTimeout(function(){
		        thisVm.is_popup = false;
		    },2000);
		},
		// is done
		count_translated_lines : function(){
			let found_no = 0; // Найдено не переведенных.
			let found_yes = 0; // Найдено переведенных.
			let items_list_text = document.querySelectorAll('.line-text');
			items_list_text.forEach(function(comment){
				let text = comment.querySelector('.text-translate').innerHTML;
				if(!text.includes('font')){
					found_no++;
				} else {
					found_yes++;
				}
		  	})
		  	return {
		  		'found_no': found_no,
		  		'found_yes' : found_yes,
		  		'total_count' : items_list_text.length
		  	}
		  	// Возвращает количество переведенных строк, не переведенных, общее количество строк. 
		},
		persent_translate : function(){
			let text_tr = status_texts.in_process;
			let thisVm = this;
			
			let inter = setInterval(function(){
				let persent_ready = thisVm.count_translated_lines();
				let persent_now = (persent_ready.found_yes / persent_ready.total_count * 100).toFixed(2);
				
				document.querySelector('.text-is-reading span').innerHTML = text_tr + ' ' + persent_now + '%';

				thisVm.formatedCopyText = '';
				thisVm.copy_ready = false;
				
				if (persent_now > 99.5){
					clearInterval(inter);
					document.querySelector('.text-is-reading span').innerHTML = status_texts.done;
					
					thisVm.formatedCopyText = thisVm.get_translated_text();
					thisVm.copy_ready = true;
				}
			},1000)
			// Выводит процент перевода и меняет текст статуса
		},
		get_translated_text : function(){
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
			return text_tr;	
			// Формирование текста для копирования.
		}
		// /is done
	},
	// is done
	components : {
		// Отрисовка списков текстов для перевода и списка выбора языка.
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
		// \Отрисовка списков текстов для перевода и списка выбора языка.
	},
	// is done
	mounted: function(){
		if (document.cookie.includes('googtrans') && !document.cookie.includes('googtrans=null')){
			this.persent_translate();
		} else {
			this.status_text = status_texts.not_selected;
		}
	}
})
