iterate = (function(context) {
	var parseClass = "parse-contents"

	var pc = function(tag, context, collapse) {
		var contents = tag.firstChild;
		if (contents.nodeType != 3)
			throw "could not find statement in tag `" + tag.tagName.toLower() + '`';
		var statement = contents.nodeValue.trim();
		tag.classList.remove(parseClass);

		var lex = statement.match(/foreach ([^;]+)(;([\s\S]+))?/)

		if (lex) {
			var token = lex[1]
			var content = lex[3]
			if (content === undefined) 
				content = ""
			contents.nodeValue = content

			if (token.startsWith('_')) token = token.replace('_','context')
			try {
				//thanks for being simple for once JS
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

	var tree = function(tag, context, par, last) {
		this.tag = tag;
		this.context = context
		if (par === undefined) par = this
		if (last === undefined || (tag.classList.length > 0))
			last = this

		var classList = [];
		var children = tag.children;
		//need a closure per loop; no forEach in HTMLCollection
		for (var i = 0; i < children.length; i++) (function(here){
			var child = children[i];
			if (child.classList.contains(parseClass)) {
				var nextContext = []
				pc(child, here.context, nextContext)
				par.nextContext = nextContext
				//id contexts, append into preexisting 
				if (child.id) {
					var context = par[child.id]
					if (context === undefined)
						par[child.id] = nextContext
					else if (context instanceof Array) {
						par[child.id] = context.concat(nextContext)
					}
					child.id = '';
				}
				return 
			}

			//parse children as a tree if we don't have to parse-contents
			var select = new tree(child, here.context, par, last);
			
			for (var j in child.classList) {
				var cl = child.classList[j]
				if (!(1+classList.indexOf(cl))) {
					classList.push(cl);
					last[cl] = select
				}
			}
		})(this)
	};
 
	return function(context) {
		var ret = [];
		var parse = document.getElementsByClassName(parseClass);

		while (parse.length) {
			var collapse = [];
			var id = parse[0].id
			parse[0].id = ""; //remove id so that it won't be cloned
			pc(parse[0],context,collapse);
			ret.push(collapse);
			//id contexts, append into preexisting 
			if (id) {
				if (ret[id] === undefined)
					ret[id] = collapse
				else if (ret[id] instanceof Array)
					ret[id] = ret[id].concat(collapse)
			}

			parse = document.getElementsByClassName(parseClass);
		}
		return ret;
	}
})()
