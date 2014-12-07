oznake = new Array()
oznake[0] = "generator";
oznake[1] = "uporaba";
oznake[2] = "noviPodatki";
oznake[3] = "pregledPodatkov";
var osnovniUrl = 'https://rest.ehrscape.com/rest/v1';


var uporabniskoIme = "ois.seminar";
var koda = "ois4fri";

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

function prijava() {
    var odgovor = $.ajax({
        type: "POST",
        url: osnovniUrl + "/session?username=" + encodeURIComponent(uporabniskoIme) +
                "&password=" + encodeURIComponent(koda),
        async: false
    });
    return odgovor.responseJSON.sessionId;
}

function noviUporabnik(){
	prijavaId = prijava();
	var ime = $("#novoIme").val();
	var priimek= $("#novipriimek").val();
	var spol = $("#novoSpol").val().trim().toLowerCase();
	if(spol == "moski" || spol == 'm'){
		spol = "MALE";
	}
	else if(spol == "zenski" || spol == "z"){
		spol = "FEMALE";
	}
	var rojstniDatum = $("#novoRojstvo").val();
	
	if( !ime || !priimek || !spol || !rojstniDatum || ime.trim().length == 0 || priimek.trim().length == 0
		|| spol.trim().length == 0|| rojstniDatum.trim().length == 0){
		
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
					firstNames: ime,
					lastNames: priimek,
					dateOfBirth: rojstniDatum,
					gender:spol,
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
							$("#opozorilo").html("<p class='label label-success'>Vaš ID je " + ehrId + "</p>")
							$("#vpisaniID").val(ehrId);
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


function dodajMeritve(){
	prijavaId = prijava();
	var ehrId = $("#vpisaniID").val();
	var datum = $("#vpisaniDatum").val();
	var visina = $("#vpisanaVisina").val();
	var teza = $("#vpisanaTeza").val();
	var sistolicni = $("#vpisaniSistol").val();
	var diastolicni = $("#vpisaniDias").val();
	var pulz =  $("#vpisaniPulz").val();
	
	$.ajaxSetup({
		headers: {
			"Ehr-Session": prijavaId
		}
	});
	var podatkiZaDodat = {
		"ctx/language": "en",
		"ctx/territory": "SI",
		"ctx/time": datum,
		"vital_signs/height_length/any_event/body_height_length": visina,
		"vital_signs/body_weight/any_event/body_weight": teza,
		"vital_signs/blood_pressure/any_event/systolic": sistolicni,
		"vital_signs/blood_pressure/any_event/diastolic": diastolicni,
		"vital_signs/pulse/any_event/rate": pulz,
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
		},
		error: function(err) {
		    $("#opozoriloDodaj").html("<p class='label label-danger'>Napaka!</p>");
		 }
	});
}


function meritve(){
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
					"from EHR e[e/ehr_id/value='8c59db10-4f06-4c84-b57b-e688b4b8cdb0'] "+
					"contains COMPOSITION a "+
					"contains ( "+
						"OBSERVATION a_a[openEHR-EHR-OBSERVATION.height.v1] and "+
						"OBSERVATION a_b[openEHR-EHR-OBSERVATION.body_weight.v1] and "+
						"OBSERVATION a_c[openEHR-EHR-OBSERVATION.blood_pressure.v1] and "+
						"OBSERVATION a_d[openEHR-EHR-OBSERVATION.heart_rate-pulse.v1]) "+
					"limit 100";
					$.ajax({
					    url: osnovniUrl + "/query?" + $.param({"aql": AQL}),
					    type: 'GET',
					    headers: {"Ehr-Session": prijavaId},
					    success: function (rezultat) {
							var results = "<table class='table table-striped table-hover'><tr><th>Datum in ura</th><th>Višina</th><th>Teža</th><th>Sistolični tlak</th><th>Diastoličen tlak</th><th>Pulz</th></tr>";
							if(rezultat){
								var rezultati = rezultat.resultSet;
								console.log(rezultat);
								for (var i in rezultati) {
						            results += "<tr><td>" + rezultati[i].cas.value + "</td><td>" + rezultati[i].visina.magnitude  + "</td><td>" + rezultati[i].teza.magnitude  + "</td><td>" + rezultati[i].sistolic.magnitude  +"</td><td>" + rezultati[i].diastolic.magnitude  +"</td><td>" + rezultati[i].pulz.magnitude  +"</td></tr>";
						        }
						        results += "</table>";
								$("#vitalniZnaki").append(results);
							}
							else{
								$("#opozoriloVzemi").html("<p class='label label-warning'>Ni podatkov!</p>");
							}
							
						}
					});
			},
			error: function(err){
	    		$("#opozoriloVzemi").html("<p class='label label-danger'>Napaka!</p>");
	    	}
		});
	}
}