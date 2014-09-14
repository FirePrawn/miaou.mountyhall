	
var patterns = [
	{re:/Vous avez utilis. le Sortil.ge : (\w+)/i, res:['sort']},
	{re:/Le Monstre Cibl. fait partie des :[^\(\)]+\(\s*([^\(]+)\s*-\s*N°(\d+)\)/i, res:['nom','id'], vals:{cdm:'ok'}},
	{re:/CONNAISSANCE DES MONSTRES sur une?\s+([^\(]+)\s+\((\d{7})\)/i, res:['nom','id'], vals:{cdm:'ok'}},
	{re:/La Cible subit donc pleinement l'effet/i, vals:{full:true}},
	{re:/Le sortil.ge a donc un EFFET REDUIT/i, vals:{full:false}},
	{re:/Le sortil.ge (.*) a eu l'effet suivant/, res:['sort']},
	{re:/un ([^\(]+) \(\s*(\d+)\s*\) a été influencé par l'effet du sortilège/, res:['','id']},
	{re:/Seuil de R.sistance de la Cible\.+: (\d+) %/, res:['seuilres']},
	{re:/(\d\d)\/(\d\d)\/(\d{4}) (\d\d):(\d\d):\d\d MORT .* \( (\d+) \) a débarrassé le Monde Souterrain de la présence maléfique d´une? ([^\(]+) \(\s?(\d+)\s?\)/, res:['J','M','A','h','m','killer','nom','id']},
	{re:/Vous avez attaqu. une? ([^\(]+) \(\s?(\d+)\s?\) .* comp/, res:['nom','id'], vals:{catatt:'comp'}},
	{re:/Vous avez attaqu. une? ([^\(]+) \(\s?(\d+)\s?\) .* sortil/, res:['nom','id'], vals:{catatt:'sort'}},
	{re:/Vous avez attaqu. une? ([^\(]+) \(\s?(\d+)\s?\)/, res:['nom','id'], vals:{typeatt:'AN'}},
	{re:/Le Jet d'Esquive de votre adversaire est de\.*: (\d+)/, res:['esq']},
	{re:/Vous avez donc RAT. votre adversair/, vals:{touché:false}},
	{re:/Vous avez donc TOUCH. votre adversaire par un coup critique/, vals:{touché:true, critique:true}},
	{re:/Vous avez donc TOUCH. votre adversaire/, vals:{touché:true, critique:false}}, // due to last one
	{re:/Vous lui avez infligé (\d+) points de dég/, res:['degbrut']},
	{re:/Son Armure le prot.ge et il ne perdra que (\d+) points de vie/, res:['degnet']},
	{re:/Il était alors aux alentours de : (\d\d)\/(\d\d)\/(\d{4}) (\d\d):(\d\d):\d\d/, res:['J','M','A','h','m']},
	{re:/Résultat du Combat : (.*)/, res:['typeatt']},
	{re:/Votre Jet d'Attaque est de\.*: (\d+)/, res:['att']},
	{re:/Le Monstre Cibl. fait partie des : \w+ \(([^\-]+) - N°\s*(\d+)\s*\)/, res:['nom','id']},
	{re:/Niveau\s*:\s*[^>:\(\)]*\s*\([^\(]+\)/, res:['niveau']},
	{re:/Blessure\D+(\d+)\s*%/, res:['blessure']},
	{re:/Armure\s*:\s*[^\(]+\(([^\)]+)\)/, res:['arm']},
	{re:/Points de Vie\s*:\s*[^\(]+\(\s*entre\s+(\d+)\s+et\s+(\d+)\s*\)/i, res:['pvmin','pvmax']},
	{re:/Points de Vie\s*:\s*[^\(]+\(\s*sup.erieur\s+a\s+(\d+)\s*\)/i, res:['pvmin']},
	{re:/Attaque\s*:\s*[^\(]+\(([^\)]+)\)/, res:['att']},
	{re:/Esquive\s*:\s*[^\(]+\(([^\)]+)\)/, res:['esq']},
	//{re://, res:[]},
	{re:/\((\d{7})\)/, res:['id']},
];

// explo

// message | action | pv | détails

function cpl(){
	var cur = arguments[0];
	if (!cur.id || !cur.nom) return false;
	for (var i=1; i<arguments.length; i++) {
		if (cur[arguments[i]]===undefined) return false;
	}
	return true;
}


var MMM = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function formatDateDDMMM(date){
	var d = date.getDate();
	return (d<10 ? '0' : '') + d + ' ' + MMM[date.getMonth()];
}
function formatTime(t){
	var date = new Date(t*1000), now = new Date,
		m = date.getMinutes(), h = date.getHours(), Y = date.getFullYear();
		s = s = (h<10?'0':'')+h+':'+(m<10?'0':'')+m;
	if (now.getFullYear()===Y && now.getMonth()===date.getMonth() && now.getDate()===date.getDate()) {
		return s;
	}
	return formatDateDDMMM(date) + (Y!==now.getFullYear() ? (' '+Y) : '')  + ' ' + s;
}
//~ 
//~ function tominmax(str, m){
	//~ if (m = str.match(/entre\s+(\d+)\s+et\s+(\d+)/i)) return [+m[1],+m[2]];
	//~ if (m = str.match(/sup.rieur\s+.\s+(\d+)/i)) return [+m[1]];
//~ }


function getReportItem(o){
	var r = {nom:o.nom, id:o.id};
	if (cpl(o, 'touché')) {
		r.action = o.typeatt || o.catatt;
		r.détails = '';
		if (o.touché && cpl(o, 'degbrut', 'degnet')) {
			if (o.critique) r.action += ' critique';
			if (o.full===false) r.action += ' résisté';
			r.pv = '**-'+o.degnet+' PV**';
			if (o.degbrut) r.pv += ' (-'+o.degbrut+')';
			if (o.att) r.détails += 'att: '+o.att+'|';
			if (o.esq) r.détails += 'esq: '+o.esq+'|';
			if (o.seuilres) r.détails += 'Seuil res: '+o.seuilres+' %|';
			return r;
		} else if (!o.touché && cpl(o, 'typeatt')) {
			r.action += ' esquivé';
			if (o.att) r.détails += 'att: '+o.att+'|';
			if (o.esq) r.détails += 'esq: '+o.esq+'|';
			return r;
		}
	}
	if (cpl(o, 'touché', 'degbrut', 'degnet')) {
		r.action = o.typeatt || o.catatt;
		return r;
	}
	if (cpl(o, 'arm', 'pvmin', 'blessure','esq')) {
		var pvmin = +o.pvmin, pvmax = +o.pvmax, blessure = +o.blessure;
		r.action = 'CDM';
		r.détails = 'Armure: '+o.arm + '|PV: '+pvmin;
		if (pvmax) r.détails += ' à '+pvmax;
		r.détails += '|blessure: '+o.blessure+'%';
		if (pvmin && pvmin%10===5) pvmin += 5;
		if (pvmax && pvmax%10===5) pvmax -= 5;
		if (pvmin && pvmax) {
			if (!blessure) r.pv = Math.floor(0.95*pvmin)+' à '+Math.floor(pvmax);
			else if (blessure===95) r.pv = '< '+Math.ceil(0.075*pvmax);
			else r.pv = Math.floor((100-(blessure+5))*pvmin/100)+' à '+Math.floor((100-(blessure-5))*pvmax/100);
		} else if (pvmin) {
			if (!blessure) r.pv = '> '+Math.floor(0.95*pvmin);
			else if (blessure===95) r.pv = 'pas grand chose';
			else r.pv = '> '+Math.floor((100-(blessure+5))*pvmin/100);
		}
		return r;
	}
	
}

// returns an array of objects (cdm, sorts, frappes, etc.) found in the message
function parse(message){
	var cur = {}, objects = [], lines = message.content.split('\n'), item;
	for (var l=0; l<lines.length; l++) {
		var line = lines[l];
		if (/:\s*$/.test(line)) line += lines[++l] || "";
		console.log(line);
		for (var i=0; i<patterns.length; i++) {
			var p = patterns[i], m = line.match(p.re);
			if (!m) continue;
			for (var j=1; j<m.length; j++) {
				cur[p.res[j-1]] = m[j].toLowerCase();
				console.log(p.res[j-1], m[j].toLowerCase());
			}
			if (p.vals) {
				for (var k in p.vals) cur[k] = p.vals[k];
			}
			if (item = getReportItem(cur)) {
				item.message = '['+message.authorname+' '+formatTime(message.created)+'](#'+message.id+')';
				objects.push(item);
				cur = {};
			}
			break;
		}
	}
	return objects;
}

exports.onMonster = function(bot, shoe, id){	
	var db = shoe.db;
	db.on([shoe.room.id, id, 'english', 50])
	.spread(db.search)
	.map(parse)
	.then(function(bananas){
		var r, nom, items = [].concat.apply([], bananas.reverse()).filter(function(item){
			if (item.id != id) return false;
			nom = nom || item.nom;
			return true;
		});
		if (items.length) {
			r = nom + ' ('+id+')\n'+
				"Message|Action|PV|Détails\n"+
				":-----|:----:|:-:|-------\n"+
				items.map(function(i){
					return (i.message||' ')+'|'+(i.action||' ')+'|'+(i.pv||' ')+'|'+(i.détails||' ')
				}).join('\n')+
				"";
		} else {
			r = "Rien d'intéressant trouvé dans cette salle pour le monstre "+id;
		}
		//~ r += JSON.stringify(objects, null, '\t');
		shoe.botMessage(bot, r);
	})
	.catch(function(e){
		shoe.botMessage(bot, 'A pas marché :(');
		console.log(e);		
	})
	.finally(db.off);	
}
