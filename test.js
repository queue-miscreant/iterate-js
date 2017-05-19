function(context) {
	var pc = function(tag, context, collapse) {
		var contents = tag.firstChild;
		if (contents.nodeType != 3)
			throw "could not find statement in tag `" + tag.tagName.toLower() + '`';
		var statement = contents.nodeValue.trim();
		tag.classList.remove('parse-contents');

		var lex = statement.match(/foreach ([^;]+)(;(.+))?/)
		if (lex) {
			var token = lex[1]
			var content = lex[3]
			if (content === undefined) 
				content = ""
			contents.nodeValue = content

			if (token.startsWith('_')) token = token.replace('_','context')
			//thanks for being simple for once JS
			try {
				var object = eval(token)
			} catch(err) {
				throw "Error occurred when parsing token"+lex[1]
			}

			if (object instanceof Array) {
				for (var i in object) { //successfully parsed, apply shit
					var clone = tag.cloneNode(true)
					tag.parentNode.appendChild(clone)
					collapse.push(new tree(clone, object[i]))
				}
				tag.remove()
			}
		}
	}

	var tree = function(tag, context, par) {
		this.tag = tag;
		this.context = context
		if (par === undefined)
			par = this

		var classList = [];
		var children = tag.children;
		//need a closure per loop; no forEach in HTMLCollection
		for (var i = 0; i < children.length; i++) (function(here){
			var child = children[i];
			if (child.classList.contains("parse-contents")) {
				par.pchildren = []
				pc(child, here.context, par.pchildren)
				return 
			}

			var select = new here(child, here.context, par);
			
			for (var j in child.classList) {
				var cl = child.classList[j]
				if (!(1+classList.indexOf(cl))) {
					classList.push(cl);
					here[cl] = select
				}
			}
		})(this)
	};
 
	return function(context) {
		var ret = [];
		var parse = document.getElementsByClassName('parse-contents');

		while (parse.length) {
			var collapse = [];
			pc(parse[0],context,collapse);
			ret.push(collapse);

			ret = document.getElementsByClassName('parse-contents');
		}
		return stuff;
	}
}
