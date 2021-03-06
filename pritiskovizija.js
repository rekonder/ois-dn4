var bolnisnice;
var map;
var infowindow;
var zaGraf = "";
var oznaka="";


oznake = new Array();
oznake[0] = "generator";
oznake[1] = "uporaba";
oznake[2] = "noviPodatki";
oznake[3] = "pregledPodatkov";
oznake[4] = "generatorRand";
var index= 1;
var osnovniUrl = 'https://rest.ehrscape.com/rest/v1';
var uporabniskoIme = "ois.seminar";
var koda = "ois4fri";
//zazeni generator
generatorZagon();
//nalozi datoteko out.js
$.getJSON( "out.json", function( data ) {
	//console.log(data);
	var results = "<div class=\"row\"><div class=\"col-xs-12\"><table class='table table-striped table-hover'><tr><th>Naziv</th><th>Naslov</th><th>Poštna številka</th><th>Telefon</th></tr>";
	for (var i = 0; i < data.length; i++) {
		results += "<tr><td>" + data[i].ime+ "</td><td>" + data[i].naslov  + "</td><td>" + data[i].posta + "</td><td>" + data[i].telefon  +"</td></tr>";
	}
	results += "</table></div></div";
	$("#ustanovevSloveniji").html(results);
});
function prijava() {
    var odgovor = $.ajax({
        type: "POST",
        url: osnovniUrl + "/session?username=" + encodeURIComponent(uporabniskoIme) +
                "&password=" + encodeURIComponent(koda),
        async: false
    });
    return odgovor.responseJSON.sessionId;
}
$(document).ready(function() {
	$('#preberiPredlogoBolnika1').on('change', function() {
		$("#vpisaniID").val($('#preberiPredlogoBolnika1').val());
		$("#prebraniID").val($('#preberiPredlogoBolnika1').val());
	});
});

function generatorZagon(){
	for(var i = 0; i<3; i++){
		var info={
			ime: "en" + index,
			priimek:"clovek",
			spol: "MALE",
			rojstniDatum: "1900-1-1"
		}
		narediNovegaUporabnika(info, -2-i);
		index = index+1;
	}
}
function generator(){
	var info={
		ime: "en" + index,
		priimek:"clovek",
		spol: "MALE",
		rojstniDatum: "1900-1-1"
	}
	narediNovegaUporabnika(info, -1);
	index = index+1;
	
}
function generatorPodatki(index){
	var datum= new Date(1930, 1,1);
	for(var i = 0; i<15; i++){
		var cas = datum.getFullYear() + "-" + datum.getMonth() + "-" + datum.getDate();
		if(document.getElementById('visok').checked || index == -2){
			//generiraj podatke za tezo, sistolicni tlak > 150, diastolicni tlak > .., pulz.., datum vnosa
			var info={
				datum:String(cas),
				visina: "190",
				teza:"90",
				sistolicni: String(Math.floor((Math.random() * 80) + 140)),
				diastolicni: String(Math.floor((Math.random() * 60) + 90)),
				pulz: String(Math.floor((Math.random() * 40) + 60))
			}
			dodajNoveMeritve(info);
		}
		else if(document.getElementById('zdrav').checked || index == -3){
			//generiraj podatke za tezo, sistolicni tlak 110<x<150, diastolicni tlak... ,pulz, datum vnosa
			var info={
				datum:String(cas),
				visina: "190",
				teza:"90",
				sistolicni: String(Math.floor((Math.random() * 30) + 90)),
				diastolicni: String(Math.floor((Math.random() * 20) + 60)),
				pulz:  String(Math.floor((Math.random() * 20) + 60))
			}
			dodajNoveMeritve(info);
		}
		else if(document.getElementById('nizek').checked || index == -4){
			//generiraj podatke za tezo, sistolicni tlak x<110. diastolicni tlak,..., pulz, datum vnosa
			var info={
				datum:String(cas),
				visina: "190",
				teza:"90",
				sistolicni: String(Math.floor((Math.random() * 50) + 39)),
				diastolicni: String(Math.floor((Math.random() * 40) + 20)),
				pulz:  String(Math.floor((Math.random() * 40) + 20))
			}
			dodajNoveMeritve(info);
		}
		datum.setDate(datum.getDate() + 1);
	}
}
//toggle map
function prikaziMapo(){
	$('#pano').toggle();
	if( $('#pano').is(':visible') ) {
    	ustvariMapo();
	}

}

//nova mapa
function ustvariMapo(){
	var lang;
	var lon;
	var sirina = $("#pano").width();
	var visina = sirina/2;
	//console.log(sirina,visina);
    document.getElementById('pano').style.width= sirina;
	$("#pano").height(visina);
	if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
			lang= position.coords.latitude;
			lon= position.coords.longitude; 
			//console.log(lang, lon);
			var panoNajdi = document.getElementById('pano');
			var mere = new google.maps.LatLng(lang, lon);
			var mapOptions = {
				center: mere,
				zoom: 12,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			}
			map = new google.maps.Map(panoNajdi, mapOptions);
			var marker = new google.maps.Marker({
			  position: mere,
			  map: map,
			  icon: 'http://maps.google.com/mapfiles/kml/paddle/orange-blank.png'
			});
			
			var zahteva = {
				location: mere,
				radius: '50000',
				types: ['hospital']
			  };
			infowindow = new google.maps.InfoWindow();
			var service = new google.maps.places.PlacesService(map);
			console.log('dds');
			service.nearbySearch(zahteva, hospitals);
		});
    } 
	else {}
	google.maps.event.addDomListener(window, 'load', ustvariMapo);
}
//markiraj mapo
function hospitals(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
	//console.log(results);
    for (var i = 0; i < results.length; i++) {
		createMarker(results[i]);
	}
  }
}
function createMarker(results){
	var mere = new google.maps.LatLng(results.geometry.location.k, results.geometry.location.D);
		var marker = new google.maps.Marker({
			position: mere,
			map: map
		});
		google.maps.event.addListener(marker, 'click', function() {
			console.log(results.name);
			infowindow.setContent(results.name + " " + results.vicinity);
			infowindow.open(map, this);
		});
}
function izbira(id) {
	for (var i = 0;i<oznake.length;i++) {
		var izbira1 = document.getElementById(oznake[i]);
		if (id != oznake[i]) {
			izbira1.style.display = "none";}
		else{
			izbira1.style.display = "block";
		}
	}
}


function narediNovegaUporabnika(data,index){
	prijavaId = prijava();
	if( !data.ime || !data.priimek || !data.spol || !data.rojstniDatum || data.ime.trim().length == 0 || data.priimek.trim().length == 0
		|| data.spol.trim().length == 0|| data.rojstniDatum.trim().length == 0){
		
		$("#opozorilo").html('<p class="label label-warning">Podatki niso vnešeni pravilno</p>');
			
	}
	else{
		$.ajaxSetup({
			headers:{
				"Ehr-Session":prijavaId
			}
		});
		$.ajax({
			url:osnovniUrl + "/ehr",
			type:'POST',
			success:function(podatek){
				var ehrId = podatek.ehrId;
				//$("#opozorilo").html('<p class="label label-success">' + ehrId + '</p>')
				var partyData={
					firstNames: data.ime,
					lastNames: data.priimek,
					dateOfBirth: data.rojstniDatum,
					gender:data.spol,
					partyAdditionalInfo:[
						{
							key:"ehrId",
							value: ehrId
						}
					]
				};
				$.ajax({
					url:osnovniUrl + "/demographics/party",
					type: 'POST',
					contentType: 'application/json',
					data: JSON.stringify(partyData),
					success: function(party){
						if (party.action == 'CREATE') {
							$("#opozorilo").html("<p class='label label-success'>Vaš ID je " + ehrId + "</p>");
							$("#vpisaniID").val(ehrId);
							$("#preberiPredlogoBolnika").append("<option value=\""+ ehrId + "\">" + ehrId + "</option>");
							$("#preberiPredlogoBolnika1").append("<option value=\""+ ehrId + "\">" + ehrId + "</option>");
							if(index < 0){
								generatorPodatki(index);
							}
						}
					},
					error: function(err) {
						$("#opozorilo").html("<p class='label label-danger'>Napaka!</p>");
					}
					
				});
			}
		});
	}
}
function noviUporabnik(){
	var spol = $("#novoSpol").val().trim().toLowerCase();
	if(spol == "moski" || spol == 'm'){
		spol = "MALE";
	}
	else if(spol == "zenski" || spol == "z"){
		spol = "FEMALE";
	}
	var info={
		ime: $("#novoIme").val(),
		priimek:$("#novipriimek").val(),
		spol: spol,
		rojstniDatum: $("#novoRojstvo").val()
	}
	narediNovegaUporabnika(info,0);
	
}

function dodajNoveMeritve(data1){
	var ehrId =  $("#vpisaniID").val();
	prijavaId = prijava();
	$.ajaxSetup({
		headers: {
			"Ehr-Session": prijavaId
		}
	});
	var podatkiZaDodat = {
		"ctx/language": "en",
		"ctx/territory": "SI",
		"ctx/time": data1.datum,
		"vital_signs/height_length/any_event/body_height_length": data1.visina,
		"vital_signs/body_weight/any_event/body_weight": data1.teza,
		"vital_signs/blood_pressure/any_event/systolic": data1.sistolicni,
		"vital_signs/blood_pressure/any_event/diastolic": data1.diastolicni,
		"vital_signs/pulse/any_event/rate": data1.pulz,
	};
	var podatkiPoizvedbe = {
		"ehrId": ehrId,
		templateId: 'Vital Signs',
		format: 'FLAT',
		committer: 'jaz osebno'
	};
	$.ajax({
		url: osnovniUrl + "/composition?" + $.param(podatkiPoizvedbe),
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify(podatkiZaDodat),
		success: function (res) {
		    $("#opozoriloDodaj").html("<p class='label label-success'>Uspešno dodano</p>");
			//sistolicni, diastolicno
			if(data1.sistolicni < 90){
				$("#opozoriloZaPodatke").html("<p>Imate prenizek sistolični tlak (hipotenzija), obvezno se oglasite pri zdravniku</p>");
			}
			else if(data1.sistolicni < 120){
				$("#opozoriloZaPodatke").html("<p>Vaš sistlični tlak je v vredu</p>");
			}
			else if(data1.sistolicni < 140){
				$("#opozoriloZaPodatke").html("<p>Vaš sistolični tlak je nekoliko previsok previsok.</p>");
			}
			else if(data1.sistolicni < 180){
				$("#opozoriloZaPodatke").html("<p>Vaš sistolični tlak je previsok previsok.Priporočamo vam obisk zdravnika</p>");
			}
			else if(data1.sistolicni >= 180){
				$("#opozoriloZaPodatke").html("<p>Vaš sistolični tlak je previsok. Prosimo  vas da se oglasite pri zdravniku</p>");
			}
			
			if(data1.diastolicni < 60){
				$("#opozoriloZaPodatke").append("<p>Imate prenizek diastolični tlak (hipotenzija), obvezno se oglasite pri zdravniku</p>");
			}
			else if(data1.diastolicni < 80){
				$("#opozoriloZaPodatke").append("<p>Vaš diastolični tlak je v vredu</p>");
			}
			else if(data1.diastolicni < 90){
				$("#opozoriloZaPodatke").append("<p>Vaš diastolični tlak je nekoliko previsok previsok.</p>");
			}
			else if(data1.diastolicni < 110){
				$("#opozoriloZaPodatke").append("<p>Vaš diastolični tlak je previsok previsok.Priporočamo vam obisk zdravnika</p>");
			}
			else if(data1.diastolicni >= 110){
				$("#opozoriloZaPodatke").append("<p>Vaš diastolični tlak je previsok. Prosimo  vas da se oglasite pri zdravniku</p>");
			}
		},
		error: function(err) {
		    $("#opozoriloDodaj").html("<p class='label label-danger'>Napaka!</p>");
		 }
	});
}
function dodajMeritve(){
	var info={
		datum:$("#vpisaniDatum").val(),
		visina: $("#vpisanaVisina").val(),
		teza:$("#vpisanaTeza").val(),
		sistolicni: $("#vpisaniSistol").val(),
		diastolicni: $("#vpisaniDias").val(),
		pulz:  $("#vpisaniPulz").val()
	}
	dodajNoveMeritve(info);
}

function graf(){
	prijavaId = prijava();
	var ehrId = $("#prebraniID").val();
	var izbrani= $("#zeljeniIzris").val();
	if ($("#vitalniZnaki").is(':empty') || !ehrId || ehrId.trim().length == 0 ){
		$("#opozoriloGraf").html("<p class='label label-warning'>Nimate podatkov za izris grafov</p>");
	}
	else{
		$.ajax({
			url: osnovniUrl + "/demographics/ehr/" + ehrId + "/party",
	    	type: 'GET',
	    	headers: {"Ehr-Session": prijavaId},
	    	success: function (data) {
					var AQL = '';
					if(izbrani == 'SistolicniTlakC'){
						AQL= "select "+
								"a_a/data[at0001]/events[at0006]/time as time, " +
									"a_a/data[at0001]/events[at0006]/data[at0003]/items[at0004]/value as rezultat " +
							"from EHR e[e/ehr_id/value='" + ehrId+ "']"+
							"contains COMPOSITION a " +
							"contains OBSERVATION a_a[openEHR-EHR-OBSERVATION.blood_pressure.v1] " +
							"offset 0 limit 15 ";
						oznaka="Sistolični tlak";
					}
					else if(izbrani == 'DiastolicniTlakC'){
						AQL = "select " +
							"a_a/data[at0001]/events[at0006]/time as time, " +
							"a_a/data[at0001]/events[at0006]/data[at0003]/items[at0005]/value as rezultat " +
						"from EHR e[e/ehr_id/value='" + ehrId+ "']" +
						"contains COMPOSITION a " +
						"contains OBSERVATION a_a[openEHR-EHR-OBSERVATION.blood_pressure.v1] " +
						"offset 0 limit 15 ";
						oznaka="Diastolični tlak";
					}
					else if(izbrani  == 'PulzC'){
						AQL= "select "+
							"a_a/data[at0002]/events[at0003]/time as time, " +  
							"a_a/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value as rezultat "+
						"from EHR e[e/ehr_id/value='" + ehrId + "']"+
						"contains COMPOSITION a "+
						"contains OBSERVATION a_a[openEHR-EHR-OBSERVATION.heart_rate-pulse.v1] " +
						"offset 0 limit 15 "
						oznaka="Pulz";
					}
					$.ajax({
					    url: osnovniUrl + "/query?" + $.param({"aql": AQL}),
					    type: 'GET',
					    headers: {"Ehr-Session": prijavaId},
					    success: function (rezultata) {
							//console.log(rezultata);
							
							if(rezultata){
								zaGraf = rezultata
								noviGraf(rezultata);
								
								
							}
							else{
								$("#opozoriloGraf").html("<p class='label label-warning'>Ni podatkov!</p>");
							}
							
						},
						error: function(err){
							$("#opozoriloGraf").html("<p class='label label-danger'>Napaka!</p>");
						}
					});
	//console.log(izrani);
			},
			error: function(err){
				$("#opozoriloGraf").html("<p class='label label-danger'>Napaka!</p>");
			}
		});
	

	}
}
function noviGraf(rezultata){
	$("#izpisGraf").html("");
	$("#grafSirina").html();
	if(rezultata != ""){
	var sirina = $("#grafSirina").width();
	var visina = sirina/2;
	var margin = {top:30, right:20, bottom: 60, left:40};
	sirina = sirina- margin.left - margin.right;
	visina= visina - margin.top - margin.bottom;
	var x = d3.scale.ordinal().rangeRoundBands([0, sirina], .1);
	var y = d3.scale.linear().range([visina, 0]);
	var xAxis = d3.svg.axis().scale(x).orient("bottom");
	var yAxis = d3.svg.axis().scale(y).orient("left")
	var svg = d3.select("#izpisGraf").append("svg").attr("width", sirina + margin.left + margin.right).attr("height", visina + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	var tabela=[];
	var rezultati = rezultata.resultSet;
	for (var i in rezultati) {
		var date = new Date(rezultati[i].time.value);
		var stringDate =  date.getDate()+ "."+ (date.getMonth() +1) + "." + date.getFullYear() ;
		var a = { vrednost:rezultati[i].rezultat.magnitude ,cas: stringDate};
		tabela.push(a);
	}
								
	x.domain(tabela.map(function(tabela) { return tabela.cas; }));
	y.domain([0, d3.max(tabela, function(tabela) { return tabela.vrednost; })]);
		svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + visina + ")")
		.call(xAxis)
		.selectAll("text")
		.attr("dy", "-.50em")
		.attr("dx", "-.5em")
		.style("text-anchor", "end")
		.attr("transform", "rotate(-90)" );

		svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 1)
		.attr("dy", ".1em")
		.style("text-anchor", "end")
		.text(oznaka)
								  
		svg.selectAll("#izpisGraf")
		.data(tabela)
		.enter()
			.append("rect")
			.attr("class", "bar")
			.attr("x", function(tabela) { return x(tabela.cas); })
			.attr("width", x.rangeBand())
			.attr("y", function(tabela, i) { return y(tabela.vrednost); })
			.attr("height", function(tabela) { return visina - y(tabela.vrednost); });
		}

}
function meritve(){
	zaGraf="";
	oznaka="";
	$("#izpisGraf").html("");
	prijavaId = prijava();
	var ehrId = $("#prebraniID").val();
	if (!ehrId || ehrId.trim().length == 0) {
		$("#opozoriloVzemi").html("<p class='label label-warning'>Vnesite podatke!</p>");
	}
	else{
		$.ajax({
			url: osnovniUrl + "/demographics/ehr/" + ehrId + "/party",
	    	type: 'GET',
	    	headers: {"Ehr-Session": prijavaId},
	    	success: function (data) {
				var podatki = data.party;
				$("#vitalniZnaki").html("<br/><p>Pridobivanje podatkov za bolnika: " + podatki.firstNames + " " + podatki.lastNames + "</p><br/>");
				var AQL ="select "+
						"a_c/data[at0001]/events[at0006]/time as cas, "+
						"a_a/data[at0001]/events[at0002]/data[at0003]/items[at0004, 'Body Height/Length']/value as visina, "+
						"a_b/data[at0002]/events[at0003]/data[at0001]/items[at0004, 'Body weight']/value as teza, "+
						"a_c/data[at0001]/events[at0006]/data[at0003]/items[at0004]/value as sistolic, "+
						"a_c/data[at0001]/events[at0006]/data[at0003]/items[at0005]/value as diastolic, "+
						"a_d/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value as pulz "+
					"from EHR e[e/ehr_id/value='" + ehrId+ "']" +
					"contains COMPOSITION a "+
					"contains ( "+
						"OBSERVATION a_a[openEHR-EHR-OBSERVATION.height.v1] and "+
						"OBSERVATION a_b[openEHR-EHR-OBSERVATION.body_weight.v1] and "+
						"OBSERVATION a_c[openEHR-EHR-OBSERVATION.blood_pressure.v1] and "+
						"OBSERVATION a_d[openEHR-EHR-OBSERVATION.heart_rate-pulse.v1]) "+
					"limit 15";
					$.ajax({
					    url: osnovniUrl + "/query?" + $.param({"aql": AQL}),
					    type: 'GET',
					    headers: {"Ehr-Session": prijavaId},
					    success: function (rezultat) {
							var results = "<div><table class='table table-striped table-hover'><tr><th>Datum in ura</th><th>Višina</th><th>Teža</th><th>Sistolični tlak</th><th>Diastoličen tlak</th><th>Pulz</th></tr>";
							if(rezultat){
								var povprecjeSis = 0;
								var povprecjeDias = 0;
								var rezultati = rezultat.resultSet;
								for (var i in rezultati) {
									povprecjeSis = povprecjeSis + rezultati[i].sistolic.magnitude;
									povprecjeDias = povprecjeDias + rezultati[i].pulz.magnitude;
						            results += "<tr><td>" + rezultati[i].cas.value + "</td><td>" + rezultati[i].visina.magnitude  + "</td><td>" + rezultati[i].teza.magnitude  + "</td><td>" + rezultati[i].sistolic.magnitude  +"</td><td>" + rezultati[i].diastolic.magnitude  +"</td><td>" + rezultati[i].pulz.magnitude  +"</td></tr>";
						        }
								povprecjeSis = povprecjeSis/rezultati.length;
								povprecjeDias = povprecjeDias/rezultati.length;
								//console.log(povprecjeSis,povprecjeDias);
								if(povprecjeSis > 150 || povprecjeDias > 95){
									$("#vitalniZnaki").append("<h3>Vaš sistolični ali diastolični tlak je previsok. Prosimo vas da se oglasite pri zdravniku</h3>");
								}
								else if(povprecjeSis < 90 || povprecjeDias < 60){
									$("#vitalniZnaki").append("<h3>Vaš sistolični ali diastolični tlak je prenizek. Prosimo vas da se oglasite pri zdravniku</h3>");
								}
								
						        results += "</table></div>";
								$("#vitalniZnaki").append(results);
								$("#opozoriloVzemi").html("<p class='label label-success'>Uspešno prebrano</p>");
							}
							else{
								$("#opozoriloVzemi").html("<p class='label label-warning'>Ni podatkov!</p>");
							}
							
						},
						error: function(err){
							$("#opozoriloVzemi").html("<p class='label label-danger'>Napaka!</p>");
						}
					});
			},
			error: function(err){
	    		$("#opozoriloVzemi").html("<p class='label label-danger'>Napaka!</p>");
	    	}
		});
	}
}
function zdravniskeUstanove(){
	$('#ustanovevSloveniji').toggle();
}
window.addEventListener('resize', function(event){
  noviGraf(zaGraf)
});