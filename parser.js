vn( 1);
function izpis(url){
	var page = require('webpage').create();
	page.open(url , function (status) {
		if (status !== 'success') {
			console.log('Unable to access network');
		} else {
			var results = page.evaluate(function(i) {
				var list = document.getElementsByClassName('clan'), nal = [], i;
				//list1 = document.getElementsByClassName('workplace'),
				//spec = document.getElementsByClassName('specialization');
				for (i = 0; i < list.length -2; i++) {
						if(i == 0){
							nal.push("[");
						}
						//tekst = list[i].innerText.replace(/(\r\n|\n|\r)/gm,"");
						tekst = list[i].innerText.split("\n");
						tekst[0] = "\"ime\":\"" + tekst[0] +"\","
						tekst[1] = "\"naslov\":\"" + tekst[1] + "\","
						tekst[2] = "\"posta\":\"" + tekst[2] +"\","
					
						tekst[3] = tekst[3].substring(9);
						tekst[3] = "\"faks\":\"" + tekst[3] +"\","
						tekst[4] = tekst[4].substring(6);
						tekst[4] = "\"telefon\":\"" + tekst[4] +"\""
						tekst.splice(5);
						tekst = tekst.join("\n");
						if(i != list.length -3){
							nal.push("{" + tekst + "},");
						}
						else{
							nal.push("{" + tekst + "}");
						}
				}
				nal.push("]");
				return nal;
			});
			var fs = require('fs');
			fs.write('out.json', results.join('\n'),'a');
			if(results.length != 0){
				fs.write('out.json', '\n','a');
			}
		}
		page.close();
		phantom.exit();
	});
}

function vn( index){
	

			izpis('https://zdrzz.si/index.php?option=com_content&view=article&id=66&Itemid=105');
	
}