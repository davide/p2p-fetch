(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){
;(function(){

  /* UNBUILD */
  var root;
  if(typeof window !== "undefined"){ root = window }
  if(typeof global !== "undefined"){ root = global }
  root = root || {};
  var console = root.console || {log: function(){}};
  function USE(arg, req){
    return req? require(arg) : arg.slice? USE[R(arg)] : function(mod, path){
      arg(mod = {exports: {}});
      USE[R(path)] = mod.exports;
    }
    function R(p){
      return p.split('/').slice(-1).toString().replace('.js','');
    }
  }
  if(typeof module !== "undefined"){ var common = module }
  /* UNBUILD */

	;USE(function(module){
		// Generic javascript utilities.
		var Type = {};
		//Type.fns = Type.fn = {is: function(fn){ return (!!fn && fn instanceof Function) }}
		Type.fn = {is: function(fn){ return (!!fn && 'function' == typeof fn) }}
		Type.bi = {is: function(b){ return (b instanceof Boolean || typeof b == 'boolean') }}
		Type.num = {is: function(n){ return !list_is(n) && ((n - parseFloat(n) + 1) >= 0 || Infinity === n || -Infinity === n) }}
		Type.text = {is: function(t){ return (typeof t == 'string') }}
		Type.text.ify = function(t){
			if(Type.text.is(t)){ return t }
			if(typeof JSON !== "undefined"){ return JSON.stringify(t) }
			return (t && t.toString)? t.toString() : t;
		}
		Type.text.random = function(l, c){
			var s = '';
			l = l || 24; // you are not going to make a 0 length random number, so no need to check type
			c = c || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz';
			while(l > 0){ s += c.charAt(Math.floor(Math.random() * c.length)); l-- }
			return s;
		}
		Type.text.match = function(t, o){ var r = false;
			t = t || '';
			o = Type.text.is(o)? {'=': o} : o || {}; // {'~', '=', '*', '<', '>', '+', '-', '?', '!'} // ignore case, exactly equal, anything after, lexically larger, lexically lesser, added in, subtacted from, questionable fuzzy match, and ends with.
			if(Type.obj.has(o,'~')){ t = t.toLowerCase(); o['='] = (o['='] || o['~']).toLowerCase() }
			if(Type.obj.has(o,'=')){ return t === o['='] }
			if(Type.obj.has(o,'*')){ if(t.slice(0, o['*'].length) === o['*']){ r = true; t = t.slice(o['*'].length) } else { return false }}
			if(Type.obj.has(o,'!')){ if(t.slice(-o['!'].length) === o['!']){ r = true } else { return false }}
			if(Type.obj.has(o,'+')){
				if(Type.list.map(Type.list.is(o['+'])? o['+'] : [o['+']], function(m){
					if(t.indexOf(m) >= 0){ r = true } else { return true }
				})){ return false }
			}
			if(Type.obj.has(o,'-')){
				if(Type.list.map(Type.list.is(o['-'])? o['-'] : [o['-']], function(m){
					if(t.indexOf(m) < 0){ r = true } else { return true }
				})){ return false }
			}
			if(Type.obj.has(o,'>')){ if(t > o['>']){ r = true } else { return false }}
			if(Type.obj.has(o,'<')){ if(t < o['<']){ r = true } else { return false }}
			function fuzzy(t,f){ var n = -1, i = 0, c; for(;c = f[i++];){ if(!~(n = t.indexOf(c, n+1))){ return false }} return true } // via http://stackoverflow.com/questions/9206013/javascript-fuzzy-search
			if(Type.obj.has(o,'?')){ if(fuzzy(t, o['?'])){ r = true } else { return false }} // change name!
			return r;
		}
		Type.list = {is: function(l){ return (l instanceof Array) }}
		Type.list.slit = Array.prototype.slice;
		Type.list.sort = function(k){ // creates a new sort function based off some key
			return function(A,B){
				if(!A || !B){ return 0 } A = A[k]; B = B[k];
				if(A < B){ return -1 }else if(A > B){ return 1 }
				else { return 0 }
			}
		}
		Type.list.map = function(l, c, _){ return obj_map(l, c, _) }
		Type.list.index = 1; // change this to 0 if you want non-logical, non-mathematical, non-matrix, non-convenient array notation
		Type.obj = {is: function(o){ return o? (o instanceof Object && o.constructor === Object) || Object.prototype.toString.call(o).match(/^\[object (\w+)\]$/)[1] === 'Object' : false }}
		Type.obj.put = function(o, k, v){ return (o||{})[k] = v, o }
		Type.obj.has = function(o, k){ return o && Object.prototype.hasOwnProperty.call(o, k) }
		Type.obj.del = function(o, k){
			if(!o){ return }
			o[k] = null;
			delete o[k];
			return o;
		}
		Type.obj.as = function(o, k, v, u){ return o[k] = o[k] || (u === v? {} : v) }
		Type.obj.ify = function(o){
			if(obj_is(o)){ return o }
			try{o = JSON.parse(o);
			}catch(e){o={}};
			return o;
		}
		;(function(){ var u;
			function map(v,k){
				if(obj_has(this,k) && u !== this[k]){ return }
				this[k] = v;
			}
			Type.obj.to = function(from, to){
				to = to || {};
				obj_map(from, map, to);
				return to;
			}
		}());
		Type.obj.copy = function(o){ // because http://web.archive.org/web/20140328224025/http://jsperf.com/cloning-an-object/2
			return !o? o : JSON.parse(JSON.stringify(o)); // is shockingly faster than anything else, and our data has to be a subset of JSON anyways!
		}
		;(function(){
			function empty(v,i){ var n = this.n;
				if(n && (i === n || (obj_is(n) && obj_has(n, i)))){ return }
				if(i){ return true }
			}
			Type.obj.empty = function(o, n){
				if(!o){ return true }
				return obj_map(o,empty,{n:n})? false : true;
			}
		}());
		;(function(){
			function t(k,v){
				if(2 === arguments.length){
					t.r = t.r || {};
					t.r[k] = v;
					return;
				} t.r = t.r || [];
				t.r.push(k);
			};
			var keys = Object.keys;
			Type.obj.map = function(l, c, _){
				var u, i = 0, x, r, ll, lle, f = fn_is(c);
				t.r = null;
				if(keys && obj_is(l)){
					ll = keys(l); lle = true;
				}
				if(list_is(l) || ll){
					x = (ll || l).length;
					for(;i < x; i++){
						var ii = (i + Type.list.index);
						if(f){
							r = lle? c.call(_ || this, l[ll[i]], ll[i], t) : c.call(_ || this, l[i], ii, t);
							if(r !== u){ return r }
						} else {
							//if(Type.test.is(c,l[i])){ return ii } // should implement deep equality testing!
							if(c === l[lle? ll[i] : i]){ return ll? ll[i] : ii } // use this for now
						}
					}
				} else {
					for(i in l){
						if(f){
							if(obj_has(l,i)){
								r = _? c.call(_, l[i], i, t) : c(l[i], i, t);
								if(r !== u){ return r }
							}
						} else {
							//if(a.test.is(c,l[i])){ return i } // should implement deep equality testing!
							if(c === l[i]){ return i } // use this for now
						}
					}
				}
				return f? t.r : Type.list.index? 0 : -1;
			}
		}());
		Type.time = {};
		Type.time.is = function(t){ return t? t instanceof Date : (+new Date().getTime()) }

		var fn_is = Type.fn.is;
		var list_is = Type.list.is;
		var obj = Type.obj, obj_is = obj.is, obj_has = obj.has, obj_map = obj.map;
		module.exports = Type;
	})(USE, './type');

	;USE(function(module){
		// On event emitter generic javascript utility.
		module.exports = function onto(tag, arg, as){
			if(!tag){ return {to: onto} }
			var u, tag = (this.tag || (this.tag = {}))[tag] ||
			(this.tag[tag] = {tag: tag, to: onto._ = {
				next: function(arg){ var tmp;
					if((tmp = this.to)){
						tmp.next(arg);
				}}
			}});
			if(arg instanceof Function){
				var be = {
					off: onto.off ||
					(onto.off = function(){
						if(this.next === onto._.next){ return !0 }
						if(this === this.the.last){
							this.the.last = this.back;
						}
						this.to.back = this.back;
						this.next = onto._.next;
						this.back.to = this.to;
						if(this.the.last === this.the){
							delete this.on.tag[this.the.tag];
						}
					}),
					to: onto._,
					next: arg,
					the: tag,
					on: this,
					as: as,
				};
				(be.back = tag.last || tag).to = be;
				return tag.last = be;
			}
			if((tag = tag.to) && u !== arg){ tag.next(arg) }
			return tag;
		};
	})(USE, './onto');

	;USE(function(module){
		/* Based on the Hypothetical Amnesia Machine thought experiment */
		function HAM(machineState, incomingState, currentState, incomingValue, currentValue){
			if(machineState < incomingState){
				return {defer: true}; // the incoming value is outside the boundary of the machine's state, it must be reprocessed in another state.
			}
			if(incomingState < currentState){
				return {historical: true}; // the incoming value is within the boundary of the machine's state, but not within the range.

			}
			if(currentState < incomingState){
				return {converge: true, incoming: true}; // the incoming value is within both the boundary and the range of the machine's state.

			}
			if(incomingState === currentState){
				incomingValue = Lexical(incomingValue) || "";
				currentValue = Lexical(currentValue) || "";
				if(incomingValue === currentValue){ // Note: while these are practically the same, the deltas could be technically different
					return {state: true};
				}
				/*
					The following is a naive implementation, but will always work.
					Never change it unless you have specific needs that absolutely require it.
					If changed, your data will diverge unless you guarantee every peer's algorithm has also been changed to be the same.
					As a result, it is highly discouraged to modify despite the fact that it is naive,
					because convergence (data integrity) is generally more important.
					Any difference in this algorithm must be given a new and different name.
				*/
				if(incomingValue < currentValue){ // Lexical only works on simple value types!
					return {converge: true, current: true};
				}
				if(currentValue < incomingValue){ // Lexical only works on simple value types!
					return {converge: true, incoming: true};
				}
			}
			return {err: "Invalid CRDT Data: "+ incomingValue +" to "+ currentValue +" at "+ incomingState +" to "+ currentState +"!"};
		}
		if(typeof JSON === 'undefined'){
			throw new Error(
				'JSON is not included in this browser. Please load it first: ' +
				'ajax.cdnjs.com/ajax/libs/json2/20110223/json2.js'
			);
		}
		var Lexical = JSON.stringify, undefined;
		module.exports = HAM;
	})(USE, './HAM');

	;USE(function(module){
		var Type = USE('./type');
		var Val = {};
		Val.is = function(v){ // Valid values are a subset of JSON: null, binary, number (!Infinity), text, or a soul relation. Arrays need special algorithms to handle concurrency, so they are not supported directly. Use an extension that supports them if needed but research their problems first.
			if(v === u){ return false }
			if(v === null){ return true } // "deletes", nulling out keys.
			if(v === Infinity){ return false } // we want this to be, but JSON does not support it, sad face.
			if(text_is(v) // by "text" we mean strings.
			|| bi_is(v) // by "binary" we mean boolean.
			|| num_is(v)){ // by "number" we mean integers or decimals.
				return true; // simple values are valid.
			}
			return Val.rel.is(v) || false; // is the value a soul relation? Then it is valid and return it. If not, everything else remaining is an invalid data type. Custom extensions can be built on top of these primitives to support other types.
		}
		Val.link = Val.rel = {_: '#'};
		;(function(){
			Val.rel.is = function(v){ // this defines whether an object is a soul relation or not, they look like this: {'#': 'UUID'}
				if(v && v[rel_] && !v._ && obj_is(v)){ // must be an object.
					var o = {};
					obj_map(v, map, o);
					if(o.id){ // a valid id was found.
						return o.id; // yay! Return it.
					}
				}
				return false; // the value was not a valid soul relation.
			}
			function map(s, k){ var o = this; // map over the object...
				if(o.id){ return o.id = false } // if ID is already defined AND we're still looping through the object, it is considered invalid.
				if(k == rel_ && text_is(s)){ // the key should be '#' and have a text value.
					o.id = s; // we found the soul!
				} else {
					return o.id = false; // if there exists anything else on the object that isn't the soul, then it is considered invalid.
				}
			}
		}());
		Val.rel.ify = function(t){ return obj_put({}, rel_, t) } // convert a soul into a relation and return it.
		Type.obj.has._ = '.';
		var rel_ = Val.link._, u;
		var bi_is = Type.bi.is;
		var num_is = Type.num.is;
		var text_is = Type.text.is;
		var obj = Type.obj, obj_is = obj.is, obj_put = obj.put, obj_map = obj.map;
		module.exports = Val;
	})(USE, './val');

	;USE(function(module){
		var Type = USE('./type');
		var Val = USE('./val');
		var Node = {_: '_'};
		Node.soul = function(n, o){ return (n && n._ && n._[o || soul_]) } // convenience function to check to see if there is a soul on a node and return it.
		Node.soul.ify = function(n, o){ // put a soul on an object.
			o = (typeof o === 'string')? {soul: o} : o || {};
			n = n || {}; // make sure it exists.
			n._ = n._ || {}; // make sure meta exists.
			n._[soul_] = o.soul || n._[soul_] || text_random(); // put the soul on it.
			return n;
		}
		Node.soul._ = Val.link._;
		;(function(){
			Node.is = function(n, cb, as){ var s; // checks to see if an object is a valid node.
				if(!obj_is(n)){ return false } // must be an object.
				if(s = Node.soul(n)){ // must have a soul on it.
					return !obj_map(n, map, {as:as,cb:cb,s:s,n:n});
				}
				return false; // nope! This was not a valid node.
			}
			function map(v, k){ // we invert this because the way we check for this is via a negation.
				if(k === Node._){ return } // skip over the metadata.
				if(!Val.is(v)){ return true } // it is true that this is an invalid node.
				if(this.cb){ this.cb.call(this.as, v, k, this.n, this.s) } // optionally callback each key/value.
			}
		}());
		;(function(){
			Node.ify = function(obj, o, as){ // returns a node from a shallow object.
				if(!o){ o = {} }
				else if(typeof o === 'string'){ o = {soul: o} }
				else if(o instanceof Function){ o = {map: o} }
				if(o.map){ o.node = o.map.call(as, obj, u, o.node || {}) }
				if(o.node = Node.soul.ify(o.node || {}, o)){
					obj_map(obj, map, {o:o,as:as});
				}
				return o.node; // This will only be a valid node if the object wasn't already deep!
			}
			function map(v, k){ var o = this.o, tmp, u; // iterate over each key/value.
				if(o.map){
					tmp = o.map.call(this.as, v, ''+k, o.node);
					if(u === tmp){
						obj_del(o.node, k);
					} else
					if(o.node){ o.node[k] = tmp }
					return;
				}
				if(Val.is(v)){
					o.node[k] = v;
				}
			}
		}());
		var obj = Type.obj, obj_is = obj.is, obj_del = obj.del, obj_map = obj.map;
		var text = Type.text, text_random = text.random;
		var soul_ = Node.soul._;
		var u;
		module.exports = Node;
	})(USE, './node');

	;USE(function(module){
		var Type = USE('./type');
		var Node = USE('./node');
		function State(){
			var t;
			/*if(perf){
				t = start + perf.now(); // Danger: Accuracy decays significantly over time, even if precise.
			} else {*/
				t = time();
			//}
			if(last < t){
				return N = 0, last = t + State.drift;
			}
			return last = t + ((N += 1) / D) + State.drift;
		}
		var time = Type.time.is, last = -Infinity, N = 0, D = 1000; // WARNING! In the future, on machines that are D times faster than 2016AD machines, you will want to increase D by another several orders of magnitude so the processing speed never out paces the decimal resolution (increasing an integer effects the state accuracy).
		var perf = (typeof performance !== 'undefined')? (performance.timing && performance) : false, start = (perf && perf.timing && perf.timing.navigationStart) || (perf = false);
		State._ = '>';
		State.drift = 0;
		State.is = function(n, k, o){ // convenience function to get the state on a key on a node and return it.
			var tmp = (k && n && n[N_] && n[N_][State._]) || o;
			if(!tmp){ return }
			return num_is(tmp = tmp[k])? tmp : -Infinity;
		}
		State.lex = function(){ return State().toString(36).replace('.','') }
		State.ify = function(n, k, s, v, soul){ // put a key's state on a node.
			if(!n || !n[N_]){ // reject if it is not node-like.
				if(!soul){ // unless they passed a soul
					return;
				}
				n = Node.soul.ify(n, soul); // then make it so!
			}
			var tmp = obj_as(n[N_], State._); // grab the states data.
			if(u !== k && k !== N_){
				if(num_is(s)){
					tmp[k] = s; // add the valid state.
				}
				if(u !== v){ // Note: Not its job to check for valid values!
					n[k] = v;
				}
			}
			return n;
		}
		State.to = function(from, k, to){
			var val = (from||{})[k];
			if(obj_is(val)){
				val = obj_copy(val);
			}
			return State.ify(to, k, State.is(from, k), val, Node.soul(from));
		}
		;(function(){
			State.map = function(cb, s, as){ var u; // for use with Node.ify
				var o = obj_is(o = cb || s)? o : null;
				cb = fn_is(cb = cb || s)? cb : null;
				if(o && !cb){
					s = num_is(s)? s : State();
					o[N_] = o[N_] || {};
					obj_map(o, map, {o:o,s:s});
					return o;
				}
				as = as || obj_is(s)? s : u;
				s = num_is(s)? s : State();
				return function(v, k, o, opt){
					if(!cb){
						map.call({o: o, s: s}, v,k);
						return v;
					}
					cb.call(as || this || {}, v, k, o, opt);
					if(obj_has(o,k) && u === o[k]){ return }
					map.call({o: o, s: s}, v,k);
				}
			}
			function map(v,k){
				if(N_ === k){ return }
				State.ify(this.o, k, this.s) ;
			}
		}());
		var obj = Type.obj, obj_as = obj.as, obj_has = obj.has, obj_is = obj.is, obj_map = obj.map, obj_copy = obj.copy;
		var num = Type.num, num_is = num.is;
		var fn = Type.fn, fn_is = fn.is;
		var N_ = Node._, u;
		module.exports = State;
	})(USE, './state');

	;USE(function(module){
		var Type = USE('./type');
		var Val = USE('./val');
		var Node = USE('./node');
		var Graph = {};
		;(function(){
			Graph.is = function(g, cb, fn, as){ // checks to see if an object is a valid graph.
				if(!g || !obj_is(g) || obj_empty(g)){ return false } // must be an object.
				return !obj_map(g, map, {cb:cb,fn:fn,as:as}); // makes sure it wasn't an empty object.
			}
			function map(n, s){ // we invert this because the way'? we check for this is via a negation.
				if(!n || s !== Node.soul(n) || !Node.is(n, this.fn, this.as)){ return true } // it is true that this is an invalid graph.
				if(!this.cb){ return }
				nf.n = n; nf.as = this.as; // sequential race conditions aren't races.
				this.cb.call(nf.as, n, s, nf);
			}
			function nf(fn){ // optional callback for each node.
				if(fn){ Node.is(nf.n, fn, nf.as) } // where we then have an optional callback for each key/value.
			}
		}());
		;(function(){
			Graph.ify = function(obj, env, as){
				var at = {path: [], obj: obj};
				if(!env){
					env = {};
				} else
				if(typeof env === 'string'){
					env = {soul: env};
				} else
				if(env instanceof Function){
					env.map = env;
				}
				if(env.soul){
					at.rel = Val.rel.ify(env.soul);
				}
				env.shell = (as||{}).shell;
				env.graph = env.graph || {};
				env.seen = env.seen || [];
				env.as = env.as || as;
				node(env, at);
				env.root = at.node;
				return env.graph;
			}
			function node(env, at){ var tmp;
				if(tmp = seen(env, at)){ return tmp }
				at.env = env;
				at.soul = soul;
				if(Node.ify(at.obj, map, at)){
					at.rel = at.rel || Val.rel.ify(Node.soul(at.node));
					if(at.obj !== env.shell){
						env.graph[Val.rel.is(at.rel)] = at.node;
					}
				}
				return at;
			}
			function map(v,k,n){
				var at = this, env = at.env, is, tmp;
				if(Node._ === k && obj_has(v,Val.rel._)){
					return n._; // TODO: Bug?
				}
				if(!(is = valid(v,k,n, at,env))){ return }
				if(!k){
					at.node = at.node || n || {};
					if(obj_has(v, Node._) && Node.soul(v)){ // ? for safety ?
						at.node._ = obj_copy(v._);
					}
					at.node = Node.soul.ify(at.node, Val.rel.is(at.rel));
					at.rel = at.rel || Val.rel.ify(Node.soul(at.node));
				}
				if(tmp = env.map){
					tmp.call(env.as || {}, v,k,n, at);
					if(obj_has(n,k)){
						v = n[k];
						if(u === v){
							obj_del(n, k);
							return;
						}
						if(!(is = valid(v,k,n, at,env))){ return }
					}
				}
				if(!k){ return at.node }
				if(true === is){
					return v;
				}
				tmp = node(env, {obj: v, path: at.path.concat(k)});
				if(!tmp.node){ return }
				return tmp.rel; //{'#': Node.soul(tmp.node)};
			}
			function soul(id){ var at = this;
				var prev = Val.link.is(at.rel), graph = at.env.graph;
				at.rel = at.rel || Val.rel.ify(id);
				at.rel[Val.rel._] = id;
				if(at.node && at.node[Node._]){
					at.node[Node._][Val.rel._] = id;
				}
				if(obj_has(graph, prev)){
					graph[id] = graph[prev];
					obj_del(graph, prev);
				}
			}
			function valid(v,k,n, at,env){ var tmp;
				if(Val.is(v)){ return true }
				if(obj_is(v)){ return 1 }
				if(tmp = env.invalid){
					v = tmp.call(env.as || {}, v,k,n);
					return valid(v,k,n, at,env);
				}
				env.err = "Invalid value at '" + at.path.concat(k).join('.') + "'!";
				if(Type.list.is(v)){ env.err += " Use `.set(item)` instead of an Array." }
			}
			function seen(env, at){
				var arr = env.seen, i = arr.length, has;
				while(i--){ has = arr[i];
					if(at.obj === has.obj){ return has }
				}
				arr.push(at);
			}
		}());
		Graph.node = function(node){
			var soul = Node.soul(node);
			if(!soul){ return }
			return obj_put({}, soul, node);
		}
		;(function(){
			Graph.to = function(graph, root, opt){
				if(!graph){ return }
				var obj = {};
				opt = opt || {seen: {}};
				obj_map(graph[root], map, {obj:obj, graph: graph, opt: opt});
				return obj;
			}
			function map(v,k){ var tmp, obj;
				if(Node._ === k){
					if(obj_empty(v, Val.rel._)){
						return;
					}
					this.obj[k] = obj_copy(v);
					return;
				}
				if(!(tmp = Val.rel.is(v))){
					this.obj[k] = v;
					return;
				}
				if(obj = this.opt.seen[tmp]){
					this.obj[k] = obj;
					return;
				}
				this.obj[k] = this.opt.seen[tmp] = Graph.to(this.graph, tmp, this.opt);
			}
		}());
		var fn_is = Type.fn.is;
		var obj = Type.obj, obj_is = obj.is, obj_del = obj.del, obj_has = obj.has, obj_empty = obj.empty, obj_put = obj.put, obj_map = obj.map, obj_copy = obj.copy;
		var u;
		module.exports = Graph;
	})(USE, './graph');

	;USE(function(module){
		// request / response module, for asking and acking messages.
		USE('./onto'); // depends upon onto!
		module.exports = function ask(cb, as){
			if(!this.on){ return }
			if(!(cb instanceof Function)){
				if(!cb || !as){ return }
				var id = cb['#'] || cb, tmp = (this.tag||empty)[id];
				if(!tmp){ return }
				tmp = this.on(id, as);
				clearTimeout(tmp.err);
				return true;
			}
			var id = (as && as['#']) || Math.random().toString(36).slice(2);
			if(!cb){ return id }
			var to = this.on(id, cb, as);
			to.err = to.err || setTimeout(function(){
				to.next({err: "Error: No ACK received yet.", lack: true});
				to.off();
			}, (this.opt||{}).lack || 9000);
			return id;
		}
	})(USE, './ask');

	;USE(function(module){
		var Type = USE('./type');
		function Dup(opt){
			var dup = {s:{}};
			opt = opt || {max: 1000, age: 1000 * 9};//1000 * 60 * 2};
			dup.check = function(id){ var tmp;
				if(!(tmp = dup.s[id])){ return false }
				if(tmp.pass){ return tmp.pass = false }
				return dup.track(id);
			}
			dup.track = function(id, pass){
				var it = dup.s[id] || (dup.s[id] = {});
				it.was = time_is();
				if(pass){ it.pass = true }
				if(!dup.to){
					dup.to = setTimeout(function(){
						var now = time_is();
						Type.obj.map(dup.s, function(it, id){
							if(it && opt.age > (now - it.was)){ return }
							Type.obj.del(dup.s, id);
						});
						dup.to = null;
					}, opt.age + 9);
				}
				return it;
			}
			return dup;
		}
		var time_is = Type.time.is;
		module.exports = Dup;
	})(USE, './dup');

	;USE(function(module){

		function Gun(o){
			if(o instanceof Gun){ return (this._ = {gun: this, $: this}).$ }
			if(!(this instanceof Gun)){ return new Gun(o) }
			return Gun.create(this._ = {gun: this, $: this, opt: o});
		}

		Gun.is = function($){ return ($ instanceof Gun) || ($ && $._ && ($ === $._.$)) || false }

		Gun.version = 0.9;

		Gun.chain = Gun.prototype;
		Gun.chain.toJSON = function(){};

		var Type = USE('./type');
		Type.obj.to(Type, Gun);
		Gun.HAM = USE('./HAM');
		Gun.val = USE('./val');
		Gun.node = USE('./node');
		Gun.state = USE('./state');
		Gun.graph = USE('./graph');
		Gun.on = USE('./onto');
		Gun.ask = USE('./ask');
		Gun.dup = USE('./dup');

		;(function(){
			Gun.create = function(at){
				at.root = at.root || at;
				at.graph = at.graph || {};
				at.on = at.on || Gun.on;
				at.ask = at.ask || Gun.ask;
				at.dup = at.dup || Gun.dup();
				var gun = at.$.opt(at.opt);
				if(!at.once){
					at.on('in', root, at);
					at.on('out', root, {at: at, out: root});
					Gun.on('create', at);
					at.on('create', at);
				}
				at.once = 1;
				return gun;
			}
			function root(msg){
				//add to.next(at); // TODO: MISSING FEATURE!!!
				var ev = this, as = ev.as, at = as.at || as, gun = at.$, dup, tmp;
				if(!(tmp = msg['#'])){ tmp = msg['#'] = text_rand(9) }
				if((dup = at.dup).check(tmp)){
					if(as.out === msg.out){
						msg.out = u;
						ev.to.next(msg);
					}
					return;
				}
				dup.track(tmp);
				if(!at.ask(msg['@'], msg)){
					if(msg.get){
						Gun.on.get(msg, gun); //at.on('get', get(msg));
					}
					if(msg.put){
						Gun.on.put(msg, gun); //at.on('put', put(msg));
					}
				}
				ev.to.next(msg);
				if(!as.out){
					msg.out = root;
					at.on('out', msg);
				}
			}
		}());

		;(function(){
			Gun.on.put = function(msg, gun){
				var at = gun._, ctx = {$: gun, graph: at.graph, put: {}, map: {}, souls: {}, machine: Gun.state(), ack: msg['@'], cat: at, stop: {}};
				if(!Gun.graph.is(msg.put, null, verify, ctx)){ ctx.err = "Error: Invalid graph!" }
				if(ctx.err){ return at.on('in', {'@': msg['#'], err: Gun.log(ctx.err) }) }
				obj_map(ctx.put, merge, ctx);
				if(!ctx.async){ obj_map(ctx.map, map, ctx) }
				if(u !== ctx.defer){
					setTimeout(function(){
						Gun.on.put(msg, gun);
					}, ctx.defer - ctx.machine);
				}
				if(!ctx.diff){ return }
				at.on('put', obj_to(msg, {put: ctx.diff}));
			};
			function verify(val, key, node, soul){ var ctx = this;
				var state = Gun.state.is(node, key), tmp;
				if(!state){ return ctx.err = "Error: No state on '"+key+"' in node '"+soul+"'!" }
				var vertex = ctx.graph[soul] || empty, was = Gun.state.is(vertex, key, true), known = vertex[key];
				var HAM = Gun.HAM(ctx.machine, state, was, val, known);
				if(!HAM.incoming){
					if(HAM.defer){ // pick the lowest
						ctx.defer = (state < (ctx.defer || Infinity))? state : ctx.defer;
					}
					return;
				}
				ctx.put[soul] = Gun.state.to(node, key, ctx.put[soul]);
				(ctx.diff || (ctx.diff = {}))[soul] = Gun.state.to(node, key, ctx.diff[soul]);
				ctx.souls[soul] = true;
			}
			function merge(node, soul){
				var ctx = this, cat = ctx.$._, at = (cat.next || empty)[soul];
				if(!at){
					if(!(cat.opt||empty).super){
						ctx.souls[soul] = false;
						return;
					}
					at = (ctx.$.get(soul)._);
				}
				var msg = ctx.map[soul] = {
					put: node,
					get: soul,
					$: at.$
				}, as = {ctx: ctx, msg: msg};
				ctx.async = !!cat.tag.node;
				if(ctx.ack){ msg['@'] = ctx.ack }
				obj_map(node, each, as);
				if(!ctx.async){ return }
				if(!ctx.and){
					// If it is async, we only need to setup one listener per context (ctx)
					cat.on('node', function(m){
						this.to.next(m); // make sure to call other context's listeners.
						if(m !== ctx.map[m.get]){ return } // filter out events not from this context!
						ctx.souls[m.get] = false; // set our many-async flag
						obj_map(m.put, patch, m); // merge into view
						if(obj_map(ctx.souls, function(v){ if(v){ return v } })){ return } // if flag still outstanding, keep waiting.
						if(ctx.c){ return } ctx.c = 1; // failsafe for only being called once per context.
						this.off();
						obj_map(ctx.map, map, ctx); // all done, trigger chains.
					});
				}
				ctx.and = true;
				cat.on('node', msg); // each node on the current context's graph needs to be emitted though.
			}
			function each(val, key){
				var ctx = this.ctx, graph = ctx.graph, msg = this.msg, soul = msg.get, node = msg.put, at = (msg.$._), tmp;
				graph[soul] = Gun.state.to(node, key, graph[soul]);
				if(ctx.async){ return }
				at.put = Gun.state.to(node, key, at.put);
			}
			function patch(val, key){
				var msg = this, node = msg.put, at = (msg.$._);
				at.put = Gun.state.to(node, key, at.put);
			}
			function map(msg, soul){
				if(!msg.$){ return }
				this.cat.stop = this.stop; // temporary fix till a better solution?
				(msg.$._).on('in', msg);
				this.cat.stop = null; // temporary fix till a better solution?
			}

			Gun.on.get = function(msg, gun){
				var root = gun._, get = msg.get, soul = get[_soul], node = root.graph[soul], has = get[_has], tmp;
				var next = root.next || (root.next = {}), at = next[soul];
				if(obj_has(soul, '*')){ // TEMPORARY HACK FOR MARTTI, TESTING
					var graph = {};
					Gun.obj.map(root.graph, function(node, s){
						if(Gun.text.match(s, soul)){
							graph[s] = Gun.obj.copy(node);
						}
					});
					if(!Gun.obj.empty(graph)){
						root.on('in', {
							'@': msg['#'],
							how: '*',
							put: graph,
							$: gun
						});
					}
				} // TEMPORARY HACK FOR MARTTI, TESTING
				if(!node){ return root.on('get', msg) }
				if(has){
					if(!obj_has(node, has)){ return root.on('get', msg) }
					node = Gun.state.to(node, has);
					// If we have a key in-memory, do we really need to fetch?
					// Maybe... in case the in-memory key we have is a local write
					// we still need to trigger a pull/merge from peers.
				} else {
					node = Gun.obj.copy(node);
				}
				node = Gun.graph.node(node);
				tmp = (at||empty).ack;
				root.on('in', {
					'@': msg['#'],
					how: 'mem',
					put: node,
					$: gun
				});
				//if(0 < tmp){ return }
				root.on('get', msg);
			}
		}());

		;(function(){
			Gun.chain.opt = function(opt){
				opt = opt || {};
				var gun = this, at = gun._, tmp = opt.peers || opt;
				if(!obj_is(opt)){ opt = {} }
				if(!obj_is(at.opt)){ at.opt = opt }
				if(text_is(tmp)){ tmp = [tmp] }
				if(list_is(tmp)){
					tmp = obj_map(tmp, function(url, i, map){
						map(url, {url: url});
					});
					if(!obj_is(at.opt.peers)){ at.opt.peers = {}}
					at.opt.peers = obj_to(tmp, at.opt.peers);
				}
				at.opt.peers = at.opt.peers || {};
				obj_to(opt, at.opt); // copies options on to `at.opt` only if not already taken.
				Gun.on('opt', at);
				at.opt.uuid = at.opt.uuid || function(){ return state_lex() + text_rand(12) }
				return gun;
			}
		}());

		var list_is = Gun.list.is;
		var text = Gun.text, text_is = text.is, text_rand = text.random;
		var obj = Gun.obj, obj_is = obj.is, obj_has = obj.has, obj_to = obj.to, obj_map = obj.map, obj_copy = obj.copy;
		var state_lex = Gun.state.lex, _soul = Gun.val.rel._, _has = '.', node_ = Gun.node._, rel_is = Gun.val.link.is;
		var empty = {}, u;

		console.debug = function(i, s){ return (console.debug.i && i === console.debug.i && console.debug.i++) && (console.log.apply(console, arguments) || s) };

		Gun.log = function(){ return (!Gun.log.off && console.log.apply(console, arguments)), [].slice.call(arguments).join(' ') }
		Gun.log.once = function(w,s,o){ return (o = Gun.log.once)[w] = o[w] || 0, o[w]++ || Gun.log(s) }

		;"Please do not remove these messages unless you are paying for a monthly sponsorship, thanks!";
		Gun.log.once("welcome", "Hello wonderful person! :) Thanks for using GUN, feel free to ask for help on https://gitter.im/amark/gun and ask StackOverflow questions tagged with 'gun'!");
		;"Please do not remove these messages unless you are paying for a monthly sponsorship, thanks!";

		if(typeof window !== "undefined"){ (window.GUN = window.Gun = Gun).window = window }
		try{ if(typeof common !== "undefined"){ common.exports = Gun } }catch(e){}
		module.exports = Gun;

		/*Gun.on('opt', function(ctx){ // FOR TESTING PURPOSES
			this.to.next(ctx);
			if(ctx.once){ return }
			ctx.on('node', function(msg){
				var to = this.to;
				//Gun.node.is(msg.put, function(v,k){ msg.put[k] = v + v });
				setTimeout(function(){
					to.next(msg);
				},1);
			});
		});*/
	})(USE, './root');

	;USE(function(module){
		var Gun = USE('./root');
		Gun.chain.back = function(n, opt){ var tmp;
			n = n || 1;
			if(-1 === n || Infinity === n){
				return this._.root.$;
			} else
			if(1 === n){
				return (this._.back || this._).$;
			}
			var gun = this, at = gun._;
			if(typeof n === 'string'){
				n = n.split('.');
			}
			if(n instanceof Array){
				var i = 0, l = n.length, tmp = at;
				for(i; i < l; i++){
					tmp = (tmp||empty)[n[i]];
				}
				if(u !== tmp){
					return opt? gun : tmp;
				} else
				if((tmp = at.back)){
					return tmp.$.back(n, opt);
				}
				return;
			}
			if(n instanceof Function){
				var yes, tmp = {back: at};
				while((tmp = tmp.back)
				&& u === (yes = n(tmp, opt))){}
				return yes;
			}
			if(Gun.num.is(n)){
				return (at.back || at).$.back(n - 1);
			}
			return this;
		}
		var empty = {}, u;
	})(USE, './back');

	;USE(function(module){
		// WARNING: GUN is very simple, but the JavaScript chaining API around GUN
		// is complicated and was extremely hard to build. If you port GUN to another
		// language, consider implementing an easier API to build.
		var Gun = USE('./root');
		Gun.chain.chain = function(sub){
			var gun = this, at = gun._, chain = new (sub || gun).constructor(gun), cat = chain._, root;
			cat.root = root = at.root;
			cat.id = ++root.once;
			cat.back = gun._;
			cat.on = Gun.on;
			cat.on('in', input, cat); // For 'in' if I add my own listeners to each then I MUST do it before in gets called. If I listen globally for all incoming data instead though, regardless of individual listeners, I can transform the data there and then as well.
			cat.on('out', output, cat); // However for output, there isn't really the global option. I must listen by adding my own listener individually BEFORE this one is ever called.
			return chain;
		}

		function output(msg){
			var put, get, at = this.as, back = at.back, root = at.root, tmp;
			if(!msg.I){ msg.I = at.$ }
			if(!msg.$){ msg.$ = at.$ }
			this.to.next(msg);
			if(get = msg.get){
				/*if(u !== at.put){
					at.on('in', at);
					return;
				}*/
				if(get['#'] || at.soul){
					get['#'] = get['#'] || at.soul;
					msg['#'] || (msg['#'] = text_rand(9));
					back = (root.$.get(get['#'])._);
					if(!(get = get['.'])){
						tmp = back.ack;
						if(!tmp){ back.ack = -1 }
						if(obj_has(back, 'put')){
							back.on('in', back);
						}
						if(tmp){ return }
						msg.$ = back.$;
					} else
					if(obj_has(back.put, get)){
						put = (back.$.get(get)._);
						if(!(tmp = put.ack)){ put.ack = -1 }
						back.on('in', {
							$: back.$,
							put: Gun.state.to(back.put, get),
							get: back.get
						});
						if(tmp){ return }
					}
					root.ask(ack, msg);
					return root.on('in', msg);
				}
				if(root.now){ root.now[at.id] = root.now[at.id] || true; at.pass = {} }
				if(get['.']){
					if(at.get){
						msg = {get: {'.': at.get}, $: at.$};
						//if(back.ask || (back.ask = {})[at.get]){ return }
						(back.ask || (back.ask = {}));
						back.ask[at.get] = msg.$._; // TODO: PERFORMANCE? More elegant way?
						return back.on('out', msg);
					}
					msg = {get: {}, $: at.$};
					return back.on('out', msg);
				}
				at.ack = at.ack || -1;
				if(at.get){
					msg.$ = at.$;
					get['.'] = at.get;
					(back.ask || (back.ask = {}))[at.get] = msg.$._; // TODO: PERFORMANCE? More elegant way?
					return back.on('out', msg);
				}
			}
			return back.on('out', msg);
		}

		function input(msg){
			var eve = this, cat = eve.as, root = cat.root, gun = msg.$, at = (gun||empty)._ || empty, change = msg.put, rel, tmp;
			if(cat.get && msg.get !== cat.get){
				msg = obj_to(msg, {get: cat.get});
			}
			if(cat.has && at !== cat){
				msg = obj_to(msg, {$: cat.$});
				if(at.ack){
					cat.ack = at.ack;
					//cat.ack = cat.ack || at.ack;
				}
			}
			if(u === change){
				tmp = at.put;
				eve.to.next(msg);
				if(cat.soul){ return } // TODO: BUG, I believee the fresh input refactor caught an edge case that a `gun.get('soul').get('key')` that points to a soul that doesn't exist will not trigger val/get etc.
				if(u === tmp && u !== at.put){ return }
				echo(cat, msg, eve);
				if(cat.has){
					not(cat, msg);
				}
				obj_del(at.echo, cat.id);
				obj_del(cat.map, at.id);
				return;
			}
			if(cat.soul){
				eve.to.next(msg);
				echo(cat, msg, eve);
				if(cat.next){ obj_map(change, map, {msg: msg, cat: cat}) }
				return;
			}
			if(!(rel = Gun.val.link.is(change))){
				if(Gun.val.is(change)){
					if(cat.has || cat.soul){
						not(cat, msg);
					} else
					if(at.has || at.soul){
						(at.echo || (at.echo = {}))[cat.id] = at.echo[at.id] || cat;
						(cat.map || (cat.map = {}))[at.id] = cat.map[at.id] || {at: at};
						//if(u === at.put){ return } // Not necessary but improves performance. If we have it but at does not, that means we got things out of order and at will get it. Once at gets it, it will tell us again.
					}
					eve.to.next(msg);
					echo(cat, msg, eve);
					return;
				}
				if(cat.has && at !== cat && obj_has(at, 'put')){
					cat.put = at.put;
				};
				if((rel = Gun.node.soul(change)) && at.has){
					at.put = (cat.root.$.get(rel)._).put;
				}
				tmp = (root.stop || {})[at.id];
				//if(tmp && tmp[cat.id]){ } else {
					eve.to.next(msg);
				//}
				relate(cat, msg, at, rel);
				echo(cat, msg, eve);
				if(cat.next){ obj_map(change, map, {msg: msg, cat: cat}) }
				return;
			}
			var was = root.stop;
			tmp = root.stop || {};
			tmp = tmp[at.id] || (tmp[at.id] = {});
			//if(tmp[cat.id]){ return }
			tmp.is = tmp.is || at.put;
			tmp[cat.id] = at.put || true;
			//if(root.stop){
				eve.to.next(msg)
			//}
			relate(cat, msg, at, rel);
			echo(cat, msg, eve);
		}
		var C = 0;

		function relate(at, msg, from, rel){
			if(!rel || node_ === at.get){ return }
			var tmp = (at.root.$.get(rel)._);
			if(at.has){
				from = tmp;
			} else
			if(from.has){
				relate(from, msg, from, rel);
			}
			if(from === at){ return }
			if(!from.$){ from = {} }
			(from.echo || (from.echo = {}))[at.id] = from.echo[at.id] || at;
			if(at.has && !(at.map||empty)[from.id]){ // if we haven't seen this before.
				not(at, msg);
			}
			tmp = from.id? ((at.map || (at.map = {}))[from.id] = at.map[from.id] || {at: from}) : {};
			if(rel === tmp.link){
				if(!(tmp.pass || at.pass)){
					return;
				}
			}
			if(at.pass){
				Gun.obj.map(at.map, function(tmp){ tmp.pass = true })
				obj_del(at, 'pass');
			}
			if(tmp.pass){ obj_del(tmp, 'pass') }
			if(at.has){ at.link = rel }
			ask(at, tmp.link = rel);
		}
		function echo(at, msg, ev){
			if(!at.echo){ return } // || node_ === at.get ?
			//if(at.has){ msg = obj_to(msg, {event: ev}) }
			obj_map(at.echo, reverb, msg);
		}
		function reverb(to){
			if(!to || !to.on){ return }
			to.on('in', this);
		}
		function map(data, key){ // Map over only the changes on every update.
			var cat = this.cat, next = cat.next || empty, via = this.msg, chain, at, tmp;
			if(node_ === key && !next[key]){ return }
			if(!(at = next[key])){
				return;
			}
			//if(data && data[_soul] && (tmp = Gun.val.rel.is(data)) && (tmp = (cat.root.$.get(tmp)._)) && obj_has(tmp, 'put')){
			//	data = tmp.put;
			//}
			if(at.has){
				//if(!(data && data[_soul] && Gun.val.rel.is(data) === Gun.node.soul(at.put))){
				if(u === at.put || !Gun.val.link.is(data)){
					at.put = data;
				}
				chain = at.$;
			} else
			if(tmp = via.$){
				tmp = (chain = via.$.get(key))._;
				if(u === tmp.put || !Gun.val.link.is(data)){
					tmp.put = data;
				}
			}
			at.on('in', {
				put: data,
				get: key,
				$: chain,
				via: via
			});
		}
		function not(at, msg){
			if(!(at.has || at.soul)){ return }
			var tmp = at.map, root = at.root;
			at.map = null;
			if(at.has){ at.link = null }
			//if(!root.now || !root.now[at.id]){
			if(!at.pass){
				if((!msg['@']) && null === tmp){ return }
				//obj_del(at, 'pass');
			}
			if(u === tmp && Gun.val.link.is(at.put)){ return } // This prevents the very first call of a thing from triggering a "clean up" call. // TODO: link.is(at.put) || !val.is(at.put) ?
			obj_map(tmp, function(proxy){
				if(!(proxy = proxy.at)){ return }
				obj_del(proxy.echo, at.id);
			});
			tmp = at.put;
			obj_map(at.next, function(neat, key){
				if(u === tmp && u !== at.put){ return true }
				neat.put = u;
				if(neat.ack){
					neat.ack = -1;
				}
				neat.on('in', {
					get: key,
					$: neat.$,
					put: u
				});
			});
		}
		function ask(at, soul){
			var tmp = (at.root.$.get(soul)._);
			if(at.ack){
				tmp.on('out', {get: {'#': soul}});
				if(!at.ask){ return } // TODO: PERFORMANCE? More elegant way?
			}
			tmp = at.ask; Gun.obj.del(at, 'ask');
			obj_map(tmp || at.next, function(neat, key){
				neat.on('out', {get: {'#': soul, '.': key}});
			});
			Gun.obj.del(at, 'ask'); // TODO: PERFORMANCE? More elegant way?
		}
		function ack(msg, ev){
			var as = this.as, get = as.get || empty, at = as.$._, tmp = (msg.put||empty)[get['#']];
			if(at.ack){ at.ack = (at.ack + 1) || 1; }
			if(!msg.put || (get['.'] && !obj_has(tmp, at.get))){
				if(at.put !== u){ return }
				at.on('in', {
					get: at.get,
					put: at.put = u,
					$: at.$,
					'@': msg['@']
				});
				return;
			}
			if(node_ == get['.']){ // is this a security concern?
				at.on('in', {get: at.get, put: Gun.val.link.ify(get['#']), $: at.$, '@': msg['@']});
				return;
			}
			msg.$ = at.root.$;
			Gun.on.put(msg, at.root.$);
		}
		var empty = {}, u;
		var obj = Gun.obj, obj_has = obj.has, obj_put = obj.put, obj_del = obj.del, obj_to = obj.to, obj_map = obj.map;
		var text_rand = Gun.text.random;
		var _soul = Gun.val.rel._, node_ = Gun.node._;
	})(USE, './chain');

	;USE(function(module){
		var Gun = USE('./root');
		Gun.chain.get = function(key, cb, as){
			var gun, tmp;
			if(typeof key === 'string'){
				var back = this, cat = back._;
				var next = cat.next || empty;
				if(!(gun = next[key])){
					gun = cache(key, back);
				}
				gun = gun.$;
			} else
			if(key instanceof Function){
				if(true === cb){ return soul(this, key, cb, as) }
				gun = this;
				var at = gun._, root = at.root, tmp = root.now, ev;
				as = cb || {};
				as.at = at;
				as.use = key;
				as.out = as.out || {};
				as.out.get = as.out.get || {};
				(ev = at.on('in', use, as)).rid = rid;
				(root.now = {$:1})[as.now = at.id] = ev;
				var mum = root.mum; root.mum = {};
				at.on('out', as.out);
				root.mum = mum;
				root.now = tmp;
				return gun;
			} else
			if(num_is(key)){
				return this.get(''+key, cb, as);
			} else
			if(tmp = rel.is(key)){
				return this.get(tmp, cb, as);
			} else {
				(as = this.chain())._.err = {err: Gun.log('Invalid get request!', key)}; // CLEAN UP
				if(cb){ cb.call(as, as._.err) }
				return as;
			}
			if(tmp = cat.stun){ // TODO: Refactor?
				gun._.stun = gun._.stun || tmp;
			}
			if(cb && cb instanceof Function){
				gun.get(cb, as);
			}
			return gun;
		}
		function cache(key, back){
			var cat = back._, next = cat.next, gun = back.chain(), at = gun._;
			if(!next){ next = cat.next = {} }
			next[at.get = key] = at;
			if(back === cat.root.$){
				at.soul = key;
			} else
			if(cat.soul || cat.has){
				at.has = key;
				//if(obj_has(cat.put, key)){
					//at.put = cat.put[key];
				//}
			}
			return at;
		}
		function soul(gun, cb, opt, as){
			var cat = gun._, acks = 0, tmp;
			if(tmp = cat.soul){ return cb(tmp, as, cat), gun }
			if(tmp = cat.link){ return cb(tmp, as, cat), gun }
			gun.get(function(msg, ev){
				if(u === msg.put && (tmp = (obj_map(cat.root.opt.peers, function(v,k,t){t(k)})||[]).length) && acks++ <= tmp){
					return;
				}
				ev.rid(msg);
				var at = ((at = msg.$) && at._) || {};
				tmp = at.link || at.soul || rel.is(msg.put) || node_soul(msg.put) || at.dub;
				cb(tmp, as, msg, ev);
			}, {out: {get: {'.':true}}});
			return gun;
		}
		function use(msg){
			var eve = this, as = eve.as, cat = as.at, root = cat.root, gun = msg.$, at = (gun||{})._ || {}, data = msg.put || at.put, tmp;
			if((tmp = root.now) && eve !== tmp[as.now]){ return eve.to.next(msg) }
			//console.log("USE:", cat.id, cat.soul, cat.has, cat.get, msg, root.mum);
			//if(at.async && msg.root){ return }
			//if(at.async === 1 && cat.async !== true){ return }
			//if(root.stop && root.stop[at.id]){ return } root.stop && (root.stop[at.id] = true);
			//if(!at.async && !cat.async && at.put && msg.put === at.put){ return }
			//else if(!cat.async && msg.put !== at.put && root.stop && root.stop[at.id]){ return } root.stop && (root.stop[at.id] = true);


			//root.stop && (root.stop.ID = root.stop.ID || Gun.text.random(2));
			//if((tmp = root.stop) && (tmp = tmp[at.id] || (tmp[at.id] = {})) && tmp[cat.id]){ return } tmp && (tmp[cat.id] = true);
			if(eve.seen && at.id && eve.seen[at.id]){ return eve.to.next(msg) }
			//if((tmp = root.stop)){ if(tmp[at.id]){ return } tmp[at.id] = msg.root; } // temporary fix till a better solution?
			if((tmp = data) && tmp[rel._] && (tmp = rel.is(tmp))){
				tmp = ((msg.$$ = at.root.gun.get(tmp))._);
				if(u !== tmp.put){
					msg = obj_to(msg, {put: data = tmp.put});
				}
			}
			if((tmp = root.mum) && at.id){ // TODO: can we delete mum entirely now?
				var id = at.id + (eve.id || (eve.id = Gun.text.random(9)));
				if(tmp[id]){ return }
				if(u !== data && !rel.is(data)){ tmp[id] = true; }
			}
			as.use(msg, eve);
			if(eve.stun){
				eve.stun = null;
				return;
			}
			eve.to.next(msg);
		}
		function rid(at){
			var cat = this.on;
			if(!at || cat.soul || cat.has){ return this.off() }
			if(!(at = (at = (at = at.$ || at)._ || at).id)){ return }
			var map = cat.map, tmp, seen;
			//if(!map || !(tmp = map[at]) || !(tmp = tmp.at)){ return }
			if(tmp = (seen = this.seen || (this.seen = {}))[at]){ return true }
			seen[at] = true;
			return;
			//tmp.echo[cat.id] = {}; // TODO: Warning: This unsubscribes ALL of this chain's listeners from this link, not just the one callback event.
			//obj.del(map, at); // TODO: Warning: This unsubscribes ALL of this chain's listeners from this link, not just the one callback event.
			return;
		}
		var obj = Gun.obj, obj_map = obj.map, obj_has = obj.has, obj_to = Gun.obj.to;
		var num_is = Gun.num.is;
		var rel = Gun.val.link, node_soul = Gun.node.soul, node_ = Gun.node._;
		var empty = {}, u;
	})(USE, './get');

	;USE(function(module){
		var Gun = USE('./root');
		Gun.chain.put = function(data, cb, as){
			// #soul.has=value>state
			// ~who#where.where=what>when@was
			// TODO: BUG! Put probably cannot handle plural chains!
			var gun = this, at = (gun._), root = at.root.$, tmp;
			as = as || {};
			as.data = data;
			as.via = as.$ = as.via || as.$ || gun;
			if(typeof cb === 'string'){
				as.soul = cb;
			} else {
				as.ack = as.ack || cb;
			}
			if(at.soul){
				as.soul = at.soul;
			}
			if(as.soul || root === gun){
				if(!obj_is(as.data)){
					(as.ack||noop).call(as, as.out = {err: Gun.log("Data saved to the root level of the graph must be a node (an object), not a", (typeof as.data), 'of "' + as.data + '"!')});
					if(as.res){ as.res() }
					return gun;
				}
				as.soul = as.soul || (as.not = Gun.node.soul(as.data) || (as.via.back('opt.uuid') || Gun.text.random)());
				if(!as.soul){ // polyfill async uuid for SEA
					as.via.back('opt.uuid')(function(err, soul){ // TODO: improve perf without anonymous callback
						if(err){ return Gun.log(err) } // TODO: Handle error!
						(as.ref||as.$).put(as.data, as.soul = soul, as);
					});
					return gun;
				}
				as.$ = root.get(as.soul);
				as.ref = as.$;
				ify(as);
				return gun;
			}
			if(Gun.is(data)){
				data.get(function(soul, o, msg){
					if(!soul && Gun.val.is(msg.put)){
						return Gun.log("The reference you are saving is a", typeof msg.put, '"'+ msg.put +'", not a node (object)!');
					}
					gun.put(Gun.val.rel.ify(soul), cb, as);
				}, true);
				return gun;
			}
			as.ref = as.ref || (root._ === (tmp = at.back))? gun : tmp.$;
			if(as.ref._.soul && Gun.val.is(as.data) && at.get){
				as.data = obj_put({}, at.get, as.data);
				as.ref.put(as.data, as.soul, as);
				return gun;
			}
			as.ref.get(any, true, {as: as});
			if(!as.out){
				// TODO: Perf idea! Make a global lock, that blocks everything while it is on, but if it is on the lock it does the expensive lookup to see if it is a dependent write or not and if not then it proceeds full speed. Meh? For write heavy async apps that would be terrible.
				as.res = as.res || stun; // Gun.on.stun(as.ref); // TODO: BUG! Deal with locking?
				as.$._.stun = as.ref._.stun;
			}
			return gun;
		};

		function ify(as){
			as.batch = batch;
			var opt = as.opt||{}, env = as.env = Gun.state.map(map, opt.state);
			env.soul = as.soul;
			as.graph = Gun.graph.ify(as.data, env, as);
			if(env.err){
				(as.ack||noop).call(as, as.out = {err: Gun.log(env.err)});
				if(as.res){ as.res() }
				return;
			}
			as.batch();
		}

		function stun(cb){
			if(cb){ cb() }
			return;
			var as = this;
			if(!as.ref){ return }
			if(cb){
				as.after = as.ref._.tag;
				as.now = as.ref._.tag = {};
				cb();
				return;
			}
			if(as.after){
				as.ref._.tag = as.after;
			}
		}

		function batch(){ var as = this;
			if(!as.graph || obj_map(as.stun, no)){ return }
			as.res = as.res || function(cb){ if(cb){ cb() } };
			as.res(function(){
				var cat = (as.$.back(-1)._), ask = cat.ask(function(ack){
					cat.root.on('ack', ack);
					if(ack.err){ Gun.log(ack) }
					if(!ack.lack){ this.off() } // One response is good enough for us currently. Later we may want to adjust this.
					if(!as.ack){ return }
					as.ack(ack, this);
				}, as.opt);
				// NOW is a hack to get synchronous replies to correctly call.
				// and STOP is a hack to get async behavior to correctly call.
				// neither of these are ideal, need to be fixed without hacks,
				// but for now, this works for current tests. :/
				var tmp = cat.root.now; obj.del(cat.root, 'now');
				var mum = cat.root.mum; cat.root.mum = {};
				(as.ref._).on('out', {
					$: as.ref, put: as.out = as.env.graph, opt: as.opt, '#': ask
				});
				cat.root.mum = mum? obj.to(mum, cat.root.mum) : mum;
				cat.root.now = tmp;
			}, as);
			if(as.res){ as.res() }
		} function no(v,k){ if(v){ return true } }

		function map(v,k,n, at){ var as = this;
			var is = Gun.is(v);
			if(k || !at.path.length){ return }
			(as.res||iife)(function(){
				var path = at.path, ref = as.ref, opt = as.opt;
				var i = 0, l = path.length;
				for(i; i < l; i++){
					ref = ref.get(path[i]);
				}
				if(is){ ref = v }
				var id = (ref._).dub;
				if(id || (id = Gun.node.soul(at.obj))){
					ref.back(-1).get(id);
					at.soul(id);
					return;
				}
				(as.stun = as.stun || {})[path] = true;
				ref.get(soul, true, {as: {at: at, as: as, p:path}});
			}, {as: as, at: at});
			//if(is){ return {} }
		}

		function soul(id, as, msg, eve){
			var as = as.as, cat = as.at; as = as.as;
			var at = ((msg || {}).$ || {})._ || {};
			id = at.dub = at.dub || id || Gun.node.soul(cat.obj) || Gun.node.soul(msg.put || at.put) || Gun.val.rel.is(msg.put || at.put) || (as.via.back('opt.uuid') || Gun.text.random)(); // TODO: BUG!? Do we really want the soul of the object given to us? Could that be dangerous?
			if(eve){ eve.stun = true }
			if(!id){ // polyfill async uuid for SEA
				at.via.back('opt.uuid')(function(err, id){ // TODO: improve perf without anonymous callback
					if(err){ return Gun.log(err) } // TODO: Handle error.
					solve(at, at.dub = at.dub || id, cat, as);
				});
				return;
			}
			solve(at, at.dub = id, cat, as);
		}

		function solve(at, id, cat, as){
			at.$.back(-1).get(id);
			cat.soul(id);
			as.stun[cat.path] = false;
			as.batch();
		}

		function any(soul, as, msg, eve){
			as = as.as;
			if(!msg.$ || !msg.$._){ return } // TODO: Handle
			if(msg.err){ // TODO: Handle
				console.log("Please report this as an issue! Put.any.err");
				return;
			}
			var at = (msg.$._), data = at.put, opt = as.opt||{}, root, tmp;
			if((tmp = as.ref) && tmp._.now){ return }
			if(eve){ eve.stun = true }
			if(as.ref !== as.$){
				tmp = (as.$._).get || at.get;
				if(!tmp){ // TODO: Handle
					console.log("Please report this as an issue! Put.no.get"); // TODO: BUG!??
					return;
				}
				as.data = obj_put({}, tmp, as.data);
				tmp = null;
			}
			if(u === data){
				if(!at.get){ return } // TODO: Handle
				if(!soul){
					tmp = at.$.back(function(at){
						if(at.link || at.soul){ return at.link || at.soul }
						as.data = obj_put({}, at.get, as.data);
					});
				}
				tmp = tmp || at.soul || at.link || at.dub;// || at.get;
				at = tmp? (at.root.$.get(tmp)._) : at;
				as.soul = tmp;
				data = as.data;
			}
			if(!as.not && !(as.soul = as.soul || soul)){
				if(as.path && obj_is(as.data)){
					as.soul = (opt.uuid || as.via.back('opt.uuid') || Gun.text.random)();
				} else {
					//as.data = obj_put({}, as.$._.get, as.data);
					if(node_ == at.get){
						as.soul = (at.put||empty)['#'] || at.dub;
					}
					as.soul = as.soul || at.soul || at.soul || (opt.uuid || as.via.back('opt.uuid') || Gun.text.random)();
				}
				if(!as.soul){ // polyfill async uuid for SEA
					as.via.back('opt.uuid')(function(err, soul){ // TODO: improve perf without anonymous callback
						if(err){ return Gun.log(err) } // Handle error.
						as.ref.put(as.data, as.soul = soul, as);
					});
					return;
				}
			}
			as.ref.put(as.data, as.soul, as);
		}
		var obj = Gun.obj, obj_is = obj.is, obj_put = obj.put, obj_map = obj.map;
		var u, empty = {}, noop = function(){}, iife = function(fn,as){fn.call(as||empty)};
		var node_ = Gun.node._;
	})(USE, './put');

	;USE(function(module){
		var Gun = USE('./root');
		USE('./chain');
		USE('./back');
		USE('./put');
		USE('./get');
		module.exports = Gun;
	})(USE, './index');

	;USE(function(module){
		var Gun = USE('./index');
		Gun.chain.on = function(tag, arg, eas, as){
			var gun = this, at = gun._, tmp, act, off;
			if(typeof tag === 'string'){
				if(!arg){ return at.on(tag) }
				act = at.on(tag, arg, eas || at, as);
				if(eas && eas.$){
					(eas.subs || (eas.subs = [])).push(act);
				}
				return gun;
			}
			var opt = arg;
			opt = (true === opt)? {change: true} : opt || {};
			opt.at = at;
			opt.ok = tag;
			//opt.last = {};
			gun.get(ok, opt); // TODO: PERF! Event listener leak!!!?
			return gun;
		}

		function ok(msg, ev){ var opt = this;
			var gun = msg.$, at = (gun||{})._ || {}, data = at.put || msg.put, cat = opt.at, tmp;
			if(u === data){
				return;
			}
			if(tmp = msg.$$){
				tmp = (msg.$$._);
				if(u === tmp.put){
					return;
				}
				data = tmp.put;
			}
			if(opt.change){ // TODO: BUG? Move above the undef checks?
				data = msg.put;
			}
			// DEDUPLICATE // TODO: NEEDS WORK! BAD PROTOTYPE
			//if(tmp.put === data && tmp.get === id && !Gun.node.soul(data)){ return }
			//tmp.put = data;
			//tmp.get = id;
			// DEDUPLICATE // TODO: NEEDS WORK! BAD PROTOTYPE
			//at.last = data;
			if(opt.as){
				opt.ok.call(opt.as, msg, ev);
			} else {
				opt.ok.call(gun, data, msg.get, msg, ev);
			}
		}

		Gun.chain.val = function(cb, opt){
			Gun.log.once("onceval", "Future Breaking API Change: .val -> .once, apologies unexpected.");
			return this.once(cb, opt);
		}
		Gun.chain.once = function(cb, opt){
			var gun = this, at = gun._, data = at.put;
			if(0 < at.ack && u !== data){
				(cb || noop).call(gun, data, at.get);
				return gun;
			}
			if(cb){
				(opt = opt || {}).ok = cb;
				opt.at = at;
				opt.out = {'#': Gun.text.random(9)};
				gun.get(val, {as: opt});
				opt.async = true; //opt.async = at.stun? 1 : true;
			} else {
				Gun.log.once("valonce", "Chainable val is experimental, its behavior and API may change moving forward. Please play with it and report bugs and ideas on how to improve it.");
				var chain = gun.chain();
				chain._.nix = gun.once(function(){
					chain._.on('in', gun._);
				});
				return chain;
			}
			return gun;
		}

		function val(msg, eve, to){
			var opt = this.as, cat = opt.at, gun = msg.$, at = gun._, data = at.put || msg.put, link, tmp;
			if(tmp = msg.$$){
				link = tmp = (msg.$$._);
				if(u !== link.put){
					data = link.put;
				}
			}
			if((tmp = eve.wait) && (tmp = tmp[at.id])){ clearTimeout(tmp) }
			if((!to && (u === data || at.soul || at.link || (link && !(0 < link.ack))))
			|| (u === data && (tmp = (obj_map(at.root.opt.peers, function(v,k,t){t(k)})||[]).length) && (!to && (link||at).ack <= tmp))){
				tmp = (eve.wait = {})[at.id] = setTimeout(function(){
					val.call({as:opt}, msg, eve, tmp || 1);
				}, opt.wait || 99);
				return;
			}
			if(link && u === link.put && (tmp = rel.is(data))){ data = Gun.node.ify({}, tmp) }
			eve.rid(msg);
			opt.ok.call(gun || opt.$, data, msg.get);
		}

		Gun.chain.off = function(){
			// make off more aggressive. Warning, it might backfire!
			var gun = this, at = gun._, tmp;
			var cat = at.back;
			if(!cat){ return }
			if(tmp = cat.next){
				if(tmp[at.get]){
					obj_del(tmp, at.get);
				} else {

				}
			}
			if(tmp = cat.ask){
				obj_del(tmp, at.get);
			}
			if(tmp = cat.put){
				obj_del(tmp, at.get);
			}
			if(tmp = at.soul){
				obj_del(cat.root.graph, tmp);
			}
			if(tmp = at.map){
				obj_map(tmp, function(at){
					if(at.link){
						cat.root.$.get(at.link).off();
					}
				});
			}
			if(tmp = at.next){
				obj_map(tmp, function(neat){
					neat.$.off();
				});
			}
			at.on('off', {});
			return gun;
		}
		var obj = Gun.obj, obj_map = obj.map, obj_has = obj.has, obj_del = obj.del, obj_to = obj.to;
		var rel = Gun.val.link;
		var empty = {}, noop = function(){}, u;
	})(USE, './on');

	;USE(function(module){
		var Gun = USE('./index');
		Gun.chain.map = function(cb, opt, t){
			var gun = this, cat = gun._, chain;
			if(!cb){
				if(chain = cat.each){ return chain }
				cat.each = chain = gun.chain();
				chain._.nix = gun.back('nix');
				gun.on('in', map, chain._);
				return chain;
			}
			Gun.log.once("mapfn", "Map functions are experimental, their behavior and API may change moving forward. Please play with it and report bugs and ideas on how to improve it.");
			chain = gun.chain();
			gun.map().on(function(data, key, at, ev){
				var next = (cb||noop).call(this, data, key, at, ev);
				if(u === next){ return }
				if(data === next){ return chain._.on('in', at) }
				if(Gun.is(next)){ return chain._.on('in', next._) }
				chain._.on('in', {get: key, put: next});
			});
			return chain;
		}
		function map(msg){
			if(!msg.put || Gun.val.is(msg.put)){ return this.to.next(msg) }
			if(this.as.nix){ this.off() } // TODO: Ugly hack!
			obj_map(msg.put, each, {at: this.as, msg: msg});
			this.to.next(msg);
		}
		function each(v,k){
			if(n_ === k){ return }
			var msg = this.msg, gun = msg.$, at = this.at, tmp = (gun.get(k)._);
			(tmp.echo || (tmp.echo = {}))[at.id] = tmp.echo[at.id] || at;
		}
		var obj_map = Gun.obj.map, noop = function(){}, event = {stun: noop, off: noop}, n_ = Gun.node._, u;
	})(USE, './map');

	;USE(function(module){
		var Gun = USE('./index');
		Gun.chain.set = function(item, cb, opt){
			var gun = this, soul;
			cb = cb || function(){};
			opt = opt || {}; opt.item = opt.item || item;
			if(soul = Gun.node.soul(item)){ item = Gun.obj.put({}, soul, Gun.val.link.ify(soul)) }
			if(!Gun.is(item)){
				if(Gun.obj.is(item)){;
					item = gun.back(-1).get(soul = soul || Gun.node.soul(item) || gun.back('opt.uuid')()).put(item);
				}
				return gun.get(soul || (Gun.state.lex() + Gun.text.random(7))).put(item, cb, opt);
			}
			item.get(function(soul, o, msg){
				if(!soul){ return cb.call(gun, {err: Gun.log('Only a node can be linked! Not "' + msg.put + '"!')}) }
				gun.put(Gun.obj.put({}, soul, Gun.val.link.ify(soul)), cb, opt);
			},true);
			return item;
		}
	})(USE, './set');

	;USE(function(module){
		if(typeof Gun === 'undefined'){ return } // TODO: localStorage is Browser only. But it would be nice if it could somehow plugin into NodeJS compatible localStorage APIs?

		var root, noop = function(){}, store, u;
		try{store = (Gun.window||noop).localStorage}catch(e){}
		if(!store){
			console.log("Warning: No localStorage exists to persist data to!");
			store = {setItem: function(k,v){this[k]=v}, removeItem: function(k){delete this[k]}, getItem: function(k){return this[k]}};
		}
		/*
			NOTE: Both `lib/file.js` and `lib/memdisk.js` are based on this design!
			If you update anything here, consider updating the other adapters as well.
		*/

		Gun.on('create', function(root){
			// This code is used to queue offline writes for resync.
			// See the next 'opt' code below for actual saving of data.
			var ev = this.to, opt = root.opt;
			if(root.once){ return ev.next(root) }
			//if(false === opt.localStorage){ return ev.next(root) } // we want offline resynce queue regardless!
			opt.prefix = opt.file || 'gun/';
			var gap = Gun.obj.ify(store.getItem('gap/'+opt.prefix)) || {};
			var empty = Gun.obj.empty, id, to, go;
			// add re-sync command.
			if(!empty(gap)){
				var disk = Gun.obj.ify(store.getItem(opt.prefix)) || {}, send = {};
				Gun.obj.map(gap, function(node, soul){
					Gun.obj.map(node, function(val, key){
						send[soul] = Gun.state.to(disk[soul], key, send[soul]);
					});
				});
				setTimeout(function(){
					root.on('out', {put: send, '#': root.ask(ack), I: root.$});
				},1);
			}

			root.on('out', function(msg){
				if(msg.lS){ return }
				if(msg.I && msg.put && !msg['@'] && !empty(opt.peers)){
					id = msg['#'];
					Gun.graph.is(msg.put, null, map);
					if(!to){ to = setTimeout(flush, opt.wait || 1) }
				}
				this.to.next(msg);
			});
			root.on('ack', ack);

			function ack(ack){ // TODO: This is experimental, not sure if we should keep this type of event hook.
				if(ack.err || !ack.ok){ return }
				var id = ack['@'];
				setTimeout(function(){
					Gun.obj.map(gap, function(node, soul){
						Gun.obj.map(node, function(val, key){
							if(id !== val){ return }
							delete node[key];
						});
						if(empty(node)){
							delete gap[soul];
						}
					});
					flush();
				}, opt.wait || 1);
			};
			ev.next(root);

			var map = function(val, key, node, soul){
				(gap[soul] || (gap[soul] = {}))[key] = id;
			}
			var flush = function(){
				clearTimeout(to);
				to = false;
				try{store.setItem('gap/'+opt.prefix, JSON.stringify(gap));
				}catch(e){ Gun.log(err = e || "localStorage failure") }
			}
		});

		Gun.on('create', function(root){
			this.to.next(root);
			var opt = root.opt;
			if(root.once){ return }
			if(false === opt.localStorage){ return }
			opt.prefix = opt.file || 'gun/';
			var graph = root.graph, acks = {}, count = 0, to;
			var disk = Gun.obj.ify(store.getItem(opt.prefix)) || {};
			var lS = function(){}, u;
			root.on('localStorage', disk); // NON-STANDARD EVENT!

			root.on('put', function(at){
				this.to.next(at);
				Gun.graph.is(at.put, null, map);
				if(!at['@']){ acks[at['#']] = true; } // only ack non-acks.
				count += 1;
				if(count >= (opt.batch || 1000)){
					return flush();
				}
				if(to){ return }
				to = setTimeout(flush, opt.wait || 1);
			});

			root.on('get', function(msg){
				this.to.next(msg);
				var lex = msg.get, soul, data, u;
				function to(){
				if(!lex || !(soul = lex['#'])){ return }
				//if(0 >= msg.cap){ return }
				var has = lex['.'];
				data = disk[soul] || u;
				if(data && has){
					data = Gun.state.to(data, has);
				}
				if(!data && !Gun.obj.empty(opt.peers)){ // if data not found, don't ack if there are peers.
					return; // Hmm, what if we have peers but we are disconnected?
				}
				//console.log("lS get", lex, data);
				root.on('in', {'@': msg['#'], put: Gun.graph.node(data), how: 'lS', lS: msg.I});
				};
				Gun.debug? setTimeout(to,1) : to();
			});

			var map = function(val, key, node, soul){
				disk[soul] = Gun.state.to(node, key, disk[soul]);
			}

			var flush = function(data){
				var err;
				count = 0;
				clearTimeout(to);
				to = false;
				var ack = acks;
				acks = {};
				if(data){ disk = data }
				try{store.setItem(opt.prefix, JSON.stringify(disk));
				}catch(e){
					Gun.log(err = (e || "localStorage failure") + " Consider using GUN's IndexedDB plugin for RAD for more storage space, temporary example at https://github.com/amark/gun/blob/master/test/tmp/indexedDB.html .");
					root.on('localStorage:error', {err: err, file: opt.prefix, flush: disk, retry: flush});
				}
				if(!err && !Gun.obj.empty(opt.peers)){ return } // only ack if there are no peers.
				Gun.obj.map(ack, function(yes, id){
					root.on('in', {
						'@': id,
						err: err,
						ok: 0 // localStorage isn't reliable, so make its `ok` code be a low number.
					});
				});
			}
		});
	})(USE, './adapters/localStorage');

	;USE(function(module){
		var Type = USE('../type');

		function Mesh(ctx){
			var mesh = function(){};
			var opt = ctx.opt || {};
			opt.log = opt.log || console.log;
			opt.gap = opt.gap || opt.wait || 1;
			opt.pack = opt.pack || (opt.memory? (opt.memory * 1000 * 1000) : 1399000000) * 0.3; // max_old_space_size defaults to 1400 MB.

			mesh.out = function(msg){ var tmp;
				if(this.to){ this.to.next(msg) }
				//if(mesh.last != msg['#']){ return mesh.last = msg['#'], this.to.next(msg) }
				if((tmp = msg['@'])
				&& (tmp = ctx.dup.s[tmp])
				&& (tmp = tmp.it)
				&& tmp.mesh){
					mesh.say(msg, tmp.mesh.via, 1);
					tmp['##'] = msg['##'];
					return;
				}
				// add hook for AXE?
				//if (Gun.AXE && opt && opt.super) { Gun.AXE.say(msg, mesh.say, this); return; } // rogowski
				mesh.say(msg);
			}

			ctx.on('create', function(root){
				root.opt.pid = root.opt.pid || Type.text.random(9);
				this.to.next(root);
				ctx.on('out', mesh.out);
			});

			mesh.hear = function(raw, peer){
				if(!raw){ return }
				var dup = ctx.dup, id, hash, msg, tmp = raw[0];
				if(opt.pack <= raw.length){ return mesh.say({dam: '!', err: "Message too big!"}, peer) }
				try{msg = JSON.parse(raw);
				}catch(e){opt.log('DAM JSON parse error', e)}
				if('{' === tmp){
					if(!msg){ return }
					if(dup.check(id = msg['#'])){ return }
					dup.track(id, true).it = msg; // GUN core also dedups, so `true` is needed.
					if((tmp = msg['@']) && msg.put){
						hash = msg['##'] || (msg['##'] = mesh.hash(msg));
						if((tmp = tmp + hash) != id){
							if(dup.check(tmp)){ return }
							(tmp = dup.s)[hash] = tmp[id];
						}
					}
					(msg.mesh = function(){}).via = peer;
					if((tmp = msg['><'])){
						msg.mesh.to = Type.obj.map(tmp.split(','), function(k,i,m){m(k,true)});
					}
					if(msg.dam){
						if(tmp = mesh.hear[msg.dam]){
							tmp(msg, peer, ctx);
						}
						return;
					}
          
					ctx.on('in', msg);

					return;
				} else
				if('[' === tmp){
					if(!msg){ return }
					var i = 0, m;
					while(m = msg[i++]){
						mesh.hear(m, peer);
					}

					return;
				}
			}

			;(function(){
				mesh.say = function(msg, peer, o){
					/*
						TODO: Plenty of performance optimizations
						that can be made just based off of ordering,
						and reducing function calls for cached writes.
					*/
					if(!peer){
						Type.obj.map(opt.peers, function(peer){
							mesh.say(msg, peer);
						});
						return;
					}
					var tmp, wire = peer.wire || ((opt.wire) && opt.wire(peer)), msh, raw;// || open(peer, ctx); // TODO: Reopen!
					if(!wire){ return }
					msh = msg.mesh || empty;
					if(peer === msh.via){ return }
					if(!(raw = msh.raw)){ raw = mesh.raw(msg) }
					if((tmp = msg['@'])
					&& (tmp = ctx.dup.s[tmp])
					&& (tmp = tmp.it)){
						if(tmp.get && tmp['##'] && tmp['##'] === msg['##']){ // PERF: move this condition outside say?
							return; // TODO: this still needs to be tested in the browser!
						}
					}
					if((tmp = msh.to) && (tmp[peer.url] || tmp[peer.id]) && !o){ return } // TODO: still needs to be tested
					if(peer.batch){
						peer.tail = (peer.tail || 0) + raw.length;
						if(peer.tail <= opt.pack){
							peer.batch.push(raw);
							return;
						}
						flush(peer);
					}
					peer.batch = [];
					setTimeout(function(){flush(peer)}, opt.gap);
					send(raw, peer);
				}
				function flush(peer){
					var tmp = peer.batch;
					if(!tmp){ return }
					peer.batch = peer.tail = null;
					if(!tmp.length){ return }
					try{send(JSON.stringify(tmp), peer);
					}catch(e){opt.log('DAM JSON stringify error', e)}
				}
				function send(raw, peer){
					var wire = peer.wire;
					try{
						if(wire.send){
							wire.send(raw);
						} else
						if(peer.say){
							peer.say(raw);
						}
					}catch(e){
						(peer.queue = peer.queue || []).push(raw);
					}
				}

			}());

			;(function(){

				mesh.raw = function(msg){
					if(!msg){ return '' }
					var dup = ctx.dup, msh = msg.mesh || {}, put, hash, tmp;
					if(tmp = msh.raw){ return tmp }
					if(typeof msg === 'string'){ return msg }
					if(msg['@'] && (tmp = msg.put)){
						if(!(hash = msg['##'])){
							put = $(tmp, sort) || '';
							hash = mesh.hash(msg, put);
							msg['##'] = hash;
						}
						(tmp = dup.s)[hash = msg['@']+hash] = tmp[msg['#']];
						msg['#'] = hash || msg['#'];
						if(put){ (msg = Type.obj.to(msg)).put = _ }
					}
					var i = 0, to = []; Type.obj.map(opt.peers, function(p){
						to.push(p.url || p.id); if(++i > 9){ return true } // limit server, fast fix, improve later!
					}); msg['><'] = to.join();
					var raw = $(msg);
					if(u !== put){
						tmp = raw.indexOf(_, raw.indexOf('put'));
						raw = raw.slice(0, tmp-1) + put + raw.slice(tmp + _.length + 1);
						//raw = raw.replace('"'+ _ +'"', put); // https://github.com/amark/gun/wiki/@$$ Heisenbug
					}
					if(msh){
						msh.raw = raw;
					}
					return raw;
				}

				mesh.hash = function(msg, hash){
					return Mesh.hash(hash || $(msg.put, sort) || '') || msg['#'] || Type.text.random(9);
				}

				function sort(k, v){ var tmp;
					if(!(v instanceof Object)){ return v }
					Type.obj.map(Object.keys(v).sort(), map, {to: tmp = {}, on: v});
					return tmp;
				}

				function map(k){
					this.to[k] = this.on[k];
				}
				var $ = JSON.stringify, _ = ':])([:';

			}());

			mesh.hi = function(peer){
				var tmp = peer.wire || {};
				if(peer.id || peer.url){
					opt.peers[peer.url || peer.id] = peer;
					Type.obj.del(opt.peers, tmp.id);
				} else {
					tmp = tmp.id = tmp.id || Type.text.random(9);
					mesh.say({dam: '?'}, opt.peers[tmp] = peer);
				}
				if(!tmp.hied){ ctx.on(tmp.hied = 'hi', peer) }
				tmp = peer.queue; peer.queue = [];
				Type.obj.map(tmp, function(msg){
					mesh.say(msg, peer);
				});
			}
			mesh.bye = function(peer){
				Type.obj.del(opt.peers, peer.id); // assume if peer.url then reconnect
				ctx.on('bye', peer);
			}

			mesh.hear['!'] = function(msg, peer){ opt.log('Error:', msg.err) }
			mesh.hear['?'] = function(msg, peer){
				if(!msg.pid){ return mesh.say({dam: '?', pid: opt.pid, '@': msg['#']}, peer) }
				peer.id = peer.id || msg.pid;
				mesh.hi(peer);
			}

			return mesh;
		}

		Mesh.hash = function(s){ // via SO
			if(typeof s !== 'string'){ return {err: 1} }
	    var c = 0;
	    if(!s.length){ return c }
	    for(var i=0,l=s.length,n; i<l; ++i){
	      n = s.charCodeAt(i);
	      c = ((c<<5)-c)+n;
	      c |= 0;
	    }
	    return c; // Math.abs(c);
	  }

	  var empty = {}, u;
	  Object.keys = Object.keys || function(o){ return map(o, function(v,k,t){t(k)}) }

	  try{ module.exports = Mesh }catch(e){}

	})(USE, './adapters/mesh');

	;USE(function(module){
		var Gun = USE('../index');
		Gun.Mesh = USE('./mesh');

		Gun.on('opt', function(root){
			this.to.next(root);
			var opt = root.opt;
			if(root.once){ return }
			if(false === opt.WebSocket){ return }

			var env;
			if(typeof window !== "undefined"){ env = window }
			if(typeof global !== "undefined"){ env = global }
			env = env || {};

			var websocket = opt.WebSocket || env.WebSocket || env.webkitWebSocket || env.mozWebSocket;
			if(!websocket){ return }
			opt.WebSocket = websocket;

			var mesh = opt.mesh = opt.mesh || Gun.Mesh(root);

			var wire = opt.wire;
			opt.wire = open;
			function open(peer){ try{
				if(!peer || !peer.url){ return wire && wire(peer) }
				var url = peer.url.replace('http', 'ws');
				var wire = peer.wire = new opt.WebSocket(url);
				wire.onclose = function(){
					opt.mesh.bye(peer);
					reconnect(peer);
				};
				wire.onerror = function(error){
					reconnect(peer); // placement?
					if(!error){ return }
					if(error.code === 'ECONNREFUSED'){
						//reconnect(peer, as);
					}
				};
				wire.onopen = function(){
					opt.mesh.hi(peer);
				}
				wire.onmessage = function(msg){
					if(!msg){ return }
					opt.mesh.hear(msg.data || msg, peer);
				};
				return wire;
			}catch(e){}}

			function reconnect(peer){
				clearTimeout(peer.defer);
				peer.defer = setTimeout(function(){
					open(peer);
				}, 2 * 1000);
			}
		});
		var noop = function(){};
	})(USE, './adapters/websocket');

}());
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
;(function(){

	function Radisk(opt){

		opt = opt || {};
		opt.log = opt.log || console.log;
		opt.file = String(opt.file || 'radata');
		opt.pack = opt.pack || (opt.memory? (opt.memory * 1000 * 1000) : 1399000000) * 0.3; // max_old_space_size defaults to 1400 MB.
		opt.until = opt.until || opt.wait || 9;
		opt.batch = opt.batch || 10 * 1000;
		opt.chunk = opt.chunk || (1024 * 1024 * 10); // 10MB
		opt.code = opt.code || {};
		opt.code.from = opt.code.from || '!';

		function ename(t){ return encodeURIComponent(t).replace(/\*/g, '%2A') }
		var map = Gun.obj.map;

		if(!opt.store){
			return opt.log("ERROR: Radisk needs `opt.store` interface with `{get: fn, put: fn (, list: fn)}`!");
		}
		if(!opt.store.put){
			return opt.log("ERROR: Radisk needs `store.put` interface with `(file, data, cb)`!");
		}
		if(!opt.store.get){
			return opt.log("ERROR: Radisk needs `store.get` interface with `(file, cb)`!");
		}
		if(!opt.store.list){
			//opt.log("WARNING: `store.list` interface might be needed!");
		}

		/*
			Any and all storage adapters should...
			1. Because writing to disk takes time, we should batch data to disk. This improves performance, and reduces potential disk corruption.
			2. If a batch exceeds a certain number of writes, we should immediately write to disk when physically possible. This caps total performance, but reduces potential loss.
		*/
		var r = function(key, val, cb){
			key = ''+key;
			if(val instanceof Function){
				cb = val;
				val = r.batch(key);
				if(u !== val){
					// if a node is requested and some of it is cached... the other parts might not be.
					return cb(u, val);
				}
				if(r.thrash.at){
					val = r.thrash.at(key);
					if(u !== val){
						// if a node is requested and some of it is cached... the other parts might not be.
						return cb(u, val);
					}
				}
				return r.read(key, cb);
			}
			r.batch(key, val);
			if(cb){ r.batch.acks.push(cb) }
			if(++r.batch.ed >= opt.batch){ return r.thrash() } // (2)
			clearTimeout(r.batch.to); // (1)
			r.batch.to = setTimeout(r.thrash, opt.until || 1);
		}

		r.batch = Radix();
		r.batch.acks = [];
		r.batch.ed = 0;

		r.thrash = function(){
			var thrash = r.thrash;
			if(thrash.ing){ return thrash.more = true }
			thrash.more = false;
			thrash.ing = true;
			var batch = thrash.at = r.batch, i = 0;
			clearTimeout(r.batch.to);
			r.batch = null;
			r.batch = Radix();
			r.batch.acks = [];
			r.batch.ed = 0;
			r.save(batch, function(err, ok){
				if(++i > 1){ return }
				if(err){ opt.log('err', err) }
				map(batch.acks, function(cb){ cb(err, ok) });
				thrash.at = null;
				thrash.ing = false;
				if(thrash.more){ thrash() }
			});
		}

		/*
			1. Find the first radix item in memory.
			2. Use that as the starting index in the directory of files.
			3. Find the first file that is lexically larger than it,
			4. Read the previous file to that into memory
			5. Scan through the in memory radix for all values lexically less than the limit.
			6. Merge and write all of those to the in-memory file and back to disk.
			7. If file to large, split. More details needed here.
		*/
		r.save = function(rad, cb){
			var s = function Span(){};
			s.find = function(tree, key){
				if(key < s.start){ return }
				s.start = key;
				r.list(s.lex);
				return true;
			}
			s.lex = function(file){
				file = (u === file)? u : decodeURIComponent(file);
				if(!file || file > s.start){
					s.mix(s.file || opt.code.from, s.start, s.end = file);
					return true;
				}
				s.file = file;
			}
			s.mix = function(file, start, end){
				s.start = s.end = s.file = u;
				r.parse(file, function(err, disk){
					if(err){ return cb(err) }
					disk = disk || Radix();
					Radix.map(rad, function(val, key){
						if(key < start){ return }
						if(end && end < key){ return s.start = key }
						// PLUGIN: consider adding HAM as an extra layer of protection
						disk(key, val); // merge batch[key] -> disk[key]
					});
					r.write(file, disk, s.next);
				});
			}
			s.next = function(err, ok){
				if(s.err = err){ return cb(err) }
				if(s.start){ return Radix.map(rad, s.find) }
				cb(err, ok);
			}
			Radix.map(rad, s.find);
		}

		/*
			Any storage engine at some point will have to do a read in order to write.
			This is true of even systems that use an append only log, if they support updates.
			Therefore it is unavoidable that a read will have to happen,
			the question is just how long you delay it.
		*/
		r.write = function(file, rad, cb, force){
			var f = function Fractal(){};
			f.text = '';
			f.count = 0;
			f.file = file;
			f.each = function(val, key, k, pre){
				if(u !== val){ f.count++ }
				if(opt.pack <= (val||'').length){ return cb("Record too big!"), true }
				var enc = Radisk.encode(pre.length) +'#'+ Radisk.encode(k) + (u === val? '' : '='+ Radisk.encode(val)) +'\n';
				if((opt.chunk < f.text.length + enc.length) && (1 < f.count) && !force){
					f.text = '';
					f.limit = Math.ceil(f.count/2);
					f.count = 0;
					f.sub = Radix();
					Radix.map(rad, f.slice)
					return true;
				}
				f.text += enc;
			}
			f.write = function(){
				var tmp = ename(file);
				opt.store.put(tmp, f.text, function(err){
					if(err){ return cb(err) }
					r.list.add(tmp, cb);
				});
			}
			f.slice = function(val, key){
				if(key < f.file){ return }
				if(f.limit < (++f.count)){
					var name = f.file;
					f.file = key;
					f.count = 0;
					r.write(name, f.sub, f.next, force);
					return true;
				}
				f.sub(key, val);
			}
			f.next = function(err){
				if(err){ return cb(err) }
				f.sub = Radix();
				if(!Radix.map(rad, f.slice)){
					r.write(f.file, f.sub, cb, force);
				}
			}
			if(!Radix.map(rad, f.each, true)){ f.write() }
		}

		;(function(){
			var Q = {};
			r.read = function(key, cb, next){
				if(RAD && !next){ // cache
					var val = RAD(key);
					if(u !== val){
						// if a node is requested and some of it is cached... the other parts might not be.
						return cb(u, val);
					}
				}
				var g = function Get(){}, tmp;
				g.lex = function(file){
					file = (u === file)? u : decodeURIComponent(file);
					if(!file || file > (next || key)){
						if(next){ g.file = file }
						if(tmp = Q[g.file]){
							tmp.push({key: key, ack: cb, file: g.file});
							return true;
						}
						Q[g.file] = [{key: key, ack: cb, file: g.file}];
						r.parse(g.file, g.it);
						return true;
					}
					g.file = file;
				}
				g.it = function(err, disk){
					if(g.err = err){ opt.log('err', err) }
					if(disk){ RAD = g.disk = disk }
					disk = Q[g.file]; delete Q[g.file];
					map(disk, g.ack);
				}
				g.ack = function(as){
					if(!as.ack){ return }
					var tmp = as.key, rad = g.disk || noop, data = rad(tmp), last = rad.last;
					if(data){ as.ack(g.err, data) }
					else if(!as.file){ return as.ack(g.err, u) }
					if(!last || last === tmp){ return as.ack(g.err, u) } // is this correct?
					if(last > tmp && 0 > last.indexOf(tmp)){ return as.ack(g.err, u) }
					r.read(tmp, as.ack, as.file);
				}
				r.list(g.lex);
			}
		}());

		;(function(){
			/*
				Let us start by assuming we are the only process that is
				changing the directory or bucket. Not because we do not want
				to be multi-process/machine, but because we want to experiment
				with how much performance and scale we can get out of only one.
				Then we can work on the harder problem of being multi-process.
			*/
			var Q = {}, s = String.fromCharCode(31);
			r.parse = function(file, cb){ var q;
				if(q = Q[file]){ return q.push(cb) } q = Q[file] = [cb];
				var p = function Parse(){};
				p.disk = Radix();
				p.read = function(err, data){ var tmp;
					delete Q[file];
					if((p.err = err) || (p.not = !data)){
						//return cb(err, u);//map(q, p.ack);
						return map(q, p.ack);
					}
					if(typeof data !== 'string'){
						try{
							if(opt.pack <= data.length){
								p.err = "Chunk too big!";
							} else {
								data = data.toString();
							}
						}catch(e){ p.err = e }
						if(p.err){ return map(q, p.ack) }
					}
					var tmp = p.split(data), pre = [], i, k, v;
					while(tmp){
						k = v = u;
						i = tmp[1];
						tmp = p.split(tmp[2])||'';
						if('#' == tmp[0]){
							k = tmp[1];
							pre = pre.slice(0,i);
							if(i <= pre.length){
								pre.push(k);
							}
						}
						tmp = p.split(tmp[2])||'';
						if('\n' == tmp[0]){ continue }
						if('=' == tmp[0]){ v = tmp[1] }
						if(u !== k && u !== v){ p.disk(pre.join(''), v) }
						tmp = p.split(tmp[2]);
					}
					//cb(err, p.disk);
					map(q, p.ack);
				};
				p.split = function(t){
					if(!t){ return }
					var l = [], o = {}, i = -1, a = '', b, c;
					i = t.indexOf(s);
					if(!t[i]){ return }
					a = t.slice(0, i);
					l[0] = a;
					l[1] = b = Radisk.decode(t.slice(i), o);
					l[2] = t.slice(i + o.i);
					return l;
				}
				p.ack = function(cb){ 
					if(!cb){ return }
					if(p.err || p.not){ return cb(p.err, u) }
					cb(u, p.disk);
				}
				opt.store.get(ename(file), p.read);
			}
		}());

		;(function(){
			var dir, q, f = String.fromCharCode(28), ef = ename(f);
			r.list = function(cb){
				if(dir){
					Radix.map(dir, function(val, key){
						return cb(key);
					}) || cb();
					return;
				}
				if(q){ return q.push(cb) } q = [cb];
				r.parse(f, r.list.init);
			}
			r.list.add = function(file, cb){
				var has = dir(file);
				if(has || file === ef){
					return cb(u, 1);
				}
				dir(file, true);
				r.write(f, dir, function(err, ok){
					if(err){ return cb(err) }
					cb(u, 1);
				}, true);
			}
			r.list.init = function(err, disk){
				if(err){
					opt.log('list', err);
					setTimeout(function(){ r.parse(f, r.list.init) }, 1000);
					return;
				}
				if(disk){
					r.list.drain(disk);
					return;
				}
				if(!opt.store.list){
					r.list.drain(Radix());
					return;
				}
				// import directory.
				opt.store.list(function(file){
					dir = dir || Radix();
					if(!file){ return r.list.drain(dir) }
					r.list.add(file, noop);
				});
			}
			r.list.drain = function(rad, tmp){
				r.list.dir = dir = rad;
				tmp = q; q = null;
				Gun.list.map(tmp, function(cb){
					Radix.map(dir, function(val, key){
						return cb(key);
					}) || cb();
				});
			}
		}());

		var noop = function(){}, RAD, u;
		return r;
	}



	;(function(){
		var _ = String.fromCharCode(31), u;
		Radisk.encode = function(d, o, s){ s = s || _;
			var t = s, tmp;
			if(typeof d == 'string'){
				var i = d.indexOf(s);
				while(i != -1){ t += s; i = d.indexOf(s, i+1) }
				return t + '"' + d + s;
			} else
			if(d && d['#'] && (tmp = Gun.val.link.is(d))){
				return t + '#' + tmp + t;
			} else
			if(Gun.num.is(d)){
				return t + '+' + (d||0) + t;
			} else
			if(null === d){
				return t + ' ' + t;
			} else
			if(true === d){
				return t + '+' + t;
			} else
			if(false === d){
				return t + '-' + t;
			}// else
			//if(binary){}
		}
		Radisk.decode = function(t, o, s){ s = s || _;
			var d = '', i = -1, n = 0, c, p;
			if(s !== t[0]){ return }
			while(s === t[++i]){ ++n }
			p = t[c = n] || true;
			while(--n >= 0){ i = t.indexOf(s, i+1) }
			if(i == -1){ i = t.length }
			d = t.slice(c+1, i);
			if(o){ o.i = i+1 }
			if('"' === p){
				return d;
			} else
			if('#' === p){
				return Gun.val.link.ify(d);
			} else
			if('+' === p){
				if(0 === d.length){
					return true;
				}
				return parseFloat(d);
			} else
			if(' ' === p){
				return null;
			} else
			if('-' === p){
				return false;
			}
		}
	}());

	if(typeof window !== "undefined"){
	  var Gun = window.Gun;
	  var Radix = window.Radix;
	  window.Radisk = Radisk;
	} else { 
	  var Gun = require('../gun');
		var Radix = require('./radix');
		try{ module.exports = Radisk }catch(e){}
	}

	Radisk.Radix = Radix;

}());
},{"../gun":1,"./radix":3}],3:[function(require,module,exports){
;(function(){

	function Radix(){
		var radix = function(key, val, t){
			key = ''+key;
			if(!t && u !== val){ 
				radix.last = (key < radix.last)? radix.last : key;
				radix.sort = null;
			}
			t = t || radix[_] || (radix[_] = {});
			var i = 0, l = key.length-1, k = key[i], at, tmp;
			while(!(at = t[k]) && i < l){
				k += key[++i];
			}
			if(!at){
				if(!map(t, function(r, s){
					var ii = 0, kk = '';
					while(s[ii] == key[ii]){
						kk += s[ii++];
					}
					if(kk){
						if(u === val){
							if(ii <= l){ return }
							return (tmp || (tmp = {}))[s.slice(ii)] = r;
						}
						var __ = {};
						__[s.slice(ii)] = r;
						(__[key.slice(ii)] = {})[$] = val;
						(t[kk] = {})[_] = __;
						delete t[s];
						return true;
					}
				})){
					if(u === val){ return; }
					(t[k] || (t[k] = {}))[$] = val;
				}
				if(u === val){
					return tmp;
				}
			} else 
			if(i == l){
				if(u === val){ return (u === (tmp = at[$]))? at[_] : tmp }
				at[$] = val;
			} else {
				if(u !== val){ at.sort = null }
				return radix(key.slice(++i), val, at[_] || (at[_] = {}));
			}
		}
		return radix;
	};

	Radix.map = function map(radix, cb, opt, pre){ pre = pre || [];
		var t = radix[_] || radix, keys = radix.sort || (radix.sort = Object.keys(t).sort()), i = 0, l = keys.length;
		for(;i < l; i++){ var key = keys[i], tree = t[key], tmp;
			if(u !== (tmp = tree[$])){
				tmp = cb(tmp, pre.join('') + key, key, pre);
				if(u !== tmp){ return tmp }
			} else 
			if(opt){
				cb(u, pre.join(''), key, pre);
			}
			if(tmp = tree[_]){
				pre.push(key);
				tmp = map(tree, cb, opt, pre);
				//tmp = map(tmp, cb, opt, pre);
				if(u !== tmp){ return tmp }
				pre.pop();
			}
		}
	};

	Object.keys = Object.keys || function(o){ return map(o, function(v,k,t){t(k)}) }

	if(typeof window !== "undefined"){
	  var Gun = window.Gun;
	  window.Radix = Radix;
	} else { 
	  var Gun = require('../gun');
		try{ module.exports = Radix }catch(e){}
	}
	
	var map = Gun.obj.map, no = {}, u;
	var $ = String.fromCharCode(30), _ = String.fromCharCode(29);
	
}());
},{"../gun":1}],4:[function(require,module,exports){
var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');

function Store(opt){
	opt = opt || {};
	opt.file = String(opt.file || 'radata');
	var fs = require('fs'), u;
	var store = function Store(){};

	store.put = function(file, data, cb){
		var random = Math.random().toString(36).slice(-3);
		var tmp = opt.file+'-'+file+'-'+random+'.tmp';
		fs.writeFile(tmp, data, function(err, ok){
			if(err){ return cb(err) }
			move(tmp, opt.file+'/'+file, cb);
		});
	};
	store.get = function(file, cb){
		fs.readFile(opt.file+'/'+file, function(err, data){
			if(err){
				if('ENOENT' === (err.code||'').toUpperCase()){
					return cb(null);
				}
				Gun.log("ERROR:", err)
			}
			cb(err, data);
		});
	};
	store.list = function(cb, match){
		fs.readdir(opt.file, function(err, dir){
			Gun.obj.map(dir, cb) || cb(); // Stream interface requires a final call to know when to be done.
		});
	};
	if(!fs.existsSync(opt.file)){ fs.mkdirSync(opt.file) }
	//store.list(function(){ return true });

	function move(oldPath, newPath, cb) {
		fs.rename(oldPath, newPath, function (err) {
			if (err) {
				if (err.code === 'EXDEV') {
					var readStream = fs.createReadStream(oldPath);
					var writeStream = fs.createWriteStream(newPath);

					readStream.on('error', cb);
					writeStream.on('error', cb);

					readStream.on('close', function () {
						fs.unlink(oldPath, cb);
					});

					readStream.pipe(writeStream);
				} else {
					cb(err);
				}
			} else {
				cb();
			}
		});
	};
	
	return store;
}

function Mem(opt){
  opt = opt || {};
  opt.file = String(opt.file || 'radata');
  var storage = Mem.storage || (Mem.storage = {});
  var store = function Store(){}, u;
  store.put = function(file, data, cb){
  	setTimeout(function(){
      storage[file] = data;
      cb(null, 1);
    }, 1);
  };
  store.get = function(file, cb){
    setTimeout(function(){
      var tmp = storage[file] || u;
      cb(null, tmp);
    }, 1);
  };
  store.list = function(cb, match){ // supporting this is no longer needed! Optional.
    setTimeout(function(){
      Gun.obj.map(Object.keys(storage), cb) || cb();
    }, 1);
  };
  return store;
}

module.exports = Store;//Gun.TESTING? Mem : Store;

},{"../gun":1,"fs":8}],5:[function(require,module,exports){
;(function(){
  var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');

  Gun.on('create', function(root){
    this.to.next(root);
    root.opt.store = root.opt.store || Store(root.opt);
  });

  function Store(opt){
    opt = opt || {};
    opt.file = String(opt.file || 'radata');
    var db = null;

    opt.indexedDB = opt.indexedDB || window.indexedDB;
    // Initialize indexedDB. Version 1.
    var request = opt.indexedDB.open(opt.file, 1)

    // Create schema. onupgradeneeded is called only when DB is first created or when the DB version increases.
    request.onupgradeneeded = function(event){
      var db = event.target.result;
      db.createObjectStore(opt.file);
    }

    // onsuccess is called when the DB is ready.
    request.onsuccess = function(){
      db = request.result;
    }

    request.onerror = function(event){
      console.log('ERROR: RAD IndexedDB generic error:', event);
    };

    var store = function Store(){}, u;

    store.put = function(file, data, cb){
      cb = cb || function(){};
      var doPut = function(){
        // Start a transaction. The transaction will be automaticallt closed when the last success/error handler took no new action.
        var transaction = db.transaction([opt.file], 'readwrite');

        // Add or update data.
        var radStore = transaction.objectStore(opt.file);
        var putRequest = radStore.put(data, file);
        putRequest.onsuccess = radStore.onsuccess = transaction.onsuccess = function(){
          //console.log('RAD IndexedDB put transaction was succesful.');
          cb(null, 1);
        };
        putRequest.onabort = radStore.onabort = transaction.onabort = function(){
          var es = 'ERROR: RAD IndexedDB put transaction was aborted.';
          console.log(es);
          cb(es, undefined);
        };
        putRequest.onerror = radStore.onerror = transaction.onerror = function(event){
          var es = 'ERROR: RAD IndexedDB put transaction was in error: ' + JSON.stringify(event)
          console.log(es);
          cb(es, undefined);
        };
      }
      if(!db){
        waitDbReady(doGet, 100, function(){
          var es = 'ERROR: Timeout: RAD IndexedDB not ready.';
          console.log(es);
          cb(es, undefined);
        }, 10)
      } else {
        doPut();
      }
    };

    store.get = function(file, cb){
      cb = cb || function(){};
      var doGet = function(){
        // Start a transaction. The transaction will be automaticallt closed when the last success/error handler took no new action.
        var transaction = db.transaction([opt.file], 'readwrite');

        // Read data.
        var radStore = transaction.objectStore(opt.file);
        var getRequest = radStore.get(file);
        getRequest.onsuccess = function(){
          //console.log('RAD IndexedDB get transaction was succesful.');
          cb(null, getRequest.result);
        };
        getRequest.onabort = function(){
          var es = 'ERROR: RAD IndexedDB get transaction was aborted.';
          console.log(es);
          cb(es, undefined);
        };
        getRequest.onerror = function(event){
          var es = 'ERROR: RAD IndexedDB get transaction was in error: ' + JSON.stringify(event)
          console.log(es);
          cb(es, undefined);
        };
      }
      if(!db){
        waitDbReady(doGet, 100, function(){
          var es = 'ERROR: Timeout: RAD IndexedDB not ready.';
          console.log(es);
          cb(es, undefined);
        }, 10)
      } else {
        doGet();
      }
    };

    var waitDbReady = function(readyFunc, checkInterval, timeoutFunc, timeoutSecs){
      var startTime = new Date();
      var checkFunc = function(){
        if(db){
          readyFunc(); 
        } else {
          if((new Date() - startTime) / 1000 >= timeoutSecs){
            timeoutFunc();
          } else {
            setTimeout(checkFunc, checkInterval);
          }
        }
      };
      checkFunc();
    };

    return store;
  }

  if(Gun.window){
    Gun.window.RindexedDB = Store;
  } else {
    module.exports = Store;
  }
}());
},{"../gun":1}],6:[function(require,module,exports){
var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');

Gun.on('create', function(root){
	this.to.next(root);
	var opt = root.opt, u;
	if(typeof window !== "undefined"){
		opt.window = window;
	}
	//if(true !== opt.radisk && (!opt.window && !process.env.RAD_ENV && !process.env.AWS_S3_BUCKET) && false !== opt.localStorage){ return }
	//if(true !== opt.radisk){ return }
	if(false === opt.radisk){ return }
	var Radisk = (opt.window && opt.window.Radisk) || require('./radisk');
	var Radix = Radisk.Radix;

	opt.store = opt.store || (!opt.window && require('./rfs')(opt));
	var rad = Radisk(opt), esc = String.fromCharCode(27);

	root.on('put', function(msg){
		this.to.next(msg);
		var id = msg['#'], track = !msg['@'], acks = track? 0 : u; // only ack non-acks.
		if(msg.rad && !track){ return } // don't save our own acks
		Gun.graph.is(msg.put, null, function(val, key, node, soul){
			if(track){ ++acks }
			val = Radisk.encode(val, null, esc)+'>'+Radisk.encode(Gun.state.is(node, key), null, esc);
			rad(soul+'.'+key, val, (track? ack : u));
		});
		function ack(err, ok){
			acks--;
			if(ack.err){ return }
			if(ack.err = err){
				root.on('in', {'@': id, err: err});
				return;
			}
			if(acks){ return }
			root.on('in', {'@': id, ok: 1});
		}
	});

	root.on('get', function(msg){
		this.to.next(msg);
		var id = msg['#'], soul = msg.get['#'], key = msg.get['.']||'', tmp = soul+'.'+key, node;
		rad(tmp, function(err, val){
			if(val){
				if(val && typeof val !== 'string'){ Radix.map(val, each) }
				if(!node){ each(val, key) }
			}
			root.on('in', {'@': id, put: Gun.graph.node(node), err: err? err : u, rad: Radix});
		});
		function each(val, key){
			tmp = val.lastIndexOf('>');
			var state = Radisk.decode(val.slice(tmp+1), null, esc);
			val = Radisk.decode(val.slice(0,tmp), null, esc);
			node = Gun.state.ify(node, key, state, val, soul);
		}
	});

});
},{"../gun":1,"./radisk":2,"./rfs":4}],7:[function(require,module,exports){

function getQueryParam(key, defaultValue) {
  var values = self.location.search.substring(1).split('&');
  for(var i in values) {
    var pair = values[i].split('=');
    if (decodeURIComponent(pair[0]) == key) {
      return decodeURIComponent(pair[1]) || defaultValue;
    }
  }
  return defaultValue;
}

self.GUN_SERVER = getQueryParam('GUN_SERVER', false);
self.GUN_DB_NAME = getQueryParam('GUN_DB_NAME', 'gun-db');
self.GUN_WAIT_TIME = parseInt( getQueryParam('GUN_WAIT_TIME', '1000') );
self.URL_MATCH_REGEX = new RegExp( getQueryParam('URL_MATCH_REGEX', false) );
self.FORCE_P2P = getQueryParam('FORCE_P2P', '');

if (!self.GUN_SERVER) {
  console.log('Missing parameter in service worker: "gun-server"');
  return;
}

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  return self.clients.claim();
});

Gun = require('gun/gun');
require('gun/lib/store');
require('gun/lib/rindexed');
//require('gun/lib/not');

self.connect = new Promise(function(resolve){
  console.log('Connecting to gun-db server...')
  var gun = new Gun({
    peers: [ self.GUN_SERVER ],
    localStorage: false,
    indexedDB: indexedDB,
    file: self.GUN_DB_NAME
  });
  console.log('Connecting to gun-db server... setup timeout.')
  setTimeout(function(){
    resolve(gun);
  }, 4000);
  gun.on('hi', function(peer){
    console.log('Connected to gun-db server!', peer);
    resolve(gun)
  });
  gun.on('bye', function(peer){
    console.log('Disconnected from gun-db server!', peer);
  });

});

// https://stackoverflow.com/a/16245768
function b64toBlob(b64Data, contentType, sliceSize) {
  contentType = contentType || '';
  sliceSize = sliceSize || 512;

  var byteCharacters = atob(b64Data);
  var byteArrays = [];

  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    var slice = byteCharacters.slice(offset, offset + sliceSize);

    var byteNumbers = new Array(slice.length);
    for (var i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    var byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  var blob = new Blob(byteArrays, {type: contentType});
  return blob;
}


function dataURLToBlob(dataUrl) {
  var split1 = dataUrl.indexOf(';'),
      split2 = dataUrl.indexOf(',') + 1,
      contentType = dataUrl.substring(5, split1),
      b64Data = dataUrl.substr(split2);
  return b64toBlob(b64Data, contentType);
}


// approach taken from: http://craig-russell.co.uk/2016/01/26/modifying-service-worker-responses.html
self.addEventListener('fetch', function(event) {
  // https://stackoverflow.com/a/49719964 -- temporary fix
  if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
    return;
  }
  var url = event.request.url;
  if (url.match('/p2p-fetch(-sw)?\.js') || !url.match(self.URL_MATCH_REGEX)) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    new Promise(function(resolve){

    self.connect.then(function(gun){

        console.log('gun.get(encodeURI("' + url + '"))')

        var p2pTimeout = (self.FORCE_P2P != '') ? 9999999 : self.GUN_WAIT_TIME;

        // applying a user-defined timeout (see https://gun.eco/docs/API#once)
        gun.get(encodeURI(url)).once(function(dataForUrl){
          if (dataForUrl) {
            console.log('Got P2P data!')
            var init = JSON.parse(dataForUrl.init_json || '{}'),
                bodyDataUrl = dataForUrl.body_data_url;
            console.log('url: ', url, ', init: ', init, ', body: ', bodyDataUrl.substring(0, 70));
            var blob = dataURLToBlob(bodyDataUrl);
            return resolve(
              new Response(blob, init)
            );
          }

          console.log('No data found. Off to the internets to get: ', url);
          fetch(event.request, {mode: "cors", credentials: "same-origin"}).then(function(response){
            var r = response.clone();            
            var init = {
              status:     r.status,
              statusText: r.statusText,
              headers: {
                "content-type": r.headers["content-type"] || r.headers["Content-Type"],
                "content-length": r.headers["content-length"] || r.headers["Content-Length"],
                "etag": r.headers["etag"] || r.headers["Etag"],
                "last-modified": r.headers["last-modified"] || r.headers["Last-Modified"]
              }
            };
            //r.headers.forEach(function(v,k){ init.headers[k] = v; });
            return r.arrayBuffer().then(function(bodyArrayBuffer){
              console.log('The internets have spoken. P2P storage, engage!');
              var contentType = init.headers['content-type'] || init.headers['Content-Type'];
              var blob = new Blob([bodyArrayBuffer], {type : contentType});
              if (blob.size == 0) {
                console.log('Crap! Can\'t reach the data to store it!');
                return resolve(response);
              }
              var reader = new FileReader();
              reader.readAsDataURL(blob); 
              reader.onloadend = function() {
                var bodyDataUrl = reader.result;
                gun.get(encodeURI(url)).put({
                  init_json: JSON.stringify(init),
                  body_data_url: bodyDataUrl
                }, function(ack){
                  console.log('url: ', url, ', init: ', init, ', body: ', bodyDataUrl.substring(0, 70));
                  var blob = dataURLToBlob(bodyDataUrl);
                  resolve(
                    new Response(blob, init)
                  );
                });
              };
            });

          }); // fetch

        }, {wait: p2pTimeout}); // gun get

      }); // connect.then


    }) // Promise
  ); // event.respondWith

});

},{"gun/gun":1,"gun/lib/rindexed":5,"gun/lib/store":6}],8:[function(require,module,exports){

},{}]},{},[7]);
