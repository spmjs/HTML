/*! HTML - v0.9.0 - 2013-07-15
* http://nbubna.github.io/HTML/
* Copyright (c) 2013 ESHA Research; Licensed MIT, GPL */
(function(window, document) {
    "use strict";

    var _ = {
        version: "0.9.0",
        slice: Array.prototype.slice,
        list: function(list) {
            if (list.isNodeList){ return list; }
            if (list.length === 1){ return _.node(list[0]); }
            list = _.slice.call(list);
            list.isNodeList = true;
            _.functions(list);
            return list;
        },
        node: function(node) {
            if (!node.isNode) {
                node.isNode = true;
                _.functions(node);
            }
            _.children(node);// make sure we're current
            return node;
        },
        functions: function(o) {
            for (var name in _.fn) {
                o[name] = _.fn[name].bind(o);
            }
        },
        children: function(node) {
            for(var i=0, m=node.childNodes.length, map={}; i<m; i++) {
                var child = node.childNodes[i],
                    type = _.type(child);
                (map[type]||(map[type]=[])).push(child);
            }
            Object.keys(map).forEach(function(key) {
                try {
                    Object.defineProperty(node, key, _.definition(map[key]));
                } catch (e) {}
            });
        },
        type: function(node) {
            return node.tagName ? node.tagName.toLowerCase() :
                   node.nodeType === 3 && node.textContent.trim() ? '_text' :
                   '_empty';
        },
        definition: function(children) {
            return {
                get: function(){ return _.list(children); },
                configurable: true
            };
        },
        fn: {
            each: function(fn) {
                var self = this.isNode ? [this] : this;
                self.forEach(function(el, i, arr) {
                    fn.call(self, _.node(el), i, arr);
                });
                return this;
            },
            find: function(selector) {
                var self = this.isNode ? [this] : this;
                for (var list=[],i=0,m=self.length; i<m; i++) {
                    list = list.concat(_.slice.call(self[i].querySelectorAll(selector)));
                }
                return _.list(list);
            },
            only: function(b, e) {
                var self = this.isNode ? [this] : this;
                return _.list(
                    b >= 0 || b < 0 ?
                        self.slice(b, e || (b + 1) || undefined) :
                        self.filter(
                            typeof b === "function" ? b :
                            function(el){ return el[_.matches](b); }
                        )
                );
            }
        }
    };

    var HTML = _.node(document.documentElement);// early, for use in head
    HTML._ = _;
    ['m','webkitM','mozM','msM'].forEach(function(prefix) {
        if (HTML[prefix+'atchesSelector']) {
            _.matches = prefix+'atchesSelector';
        }
    });
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = HTML;
    } else {
        window.HTML = HTML;
    }
    // again, for use in body
    document.addEventListener("DOMContentLoaded", function(){ _.node(HTML); });

})(window, document);

(function(document, _) {
    "use strict";

    var add = _.fn.add = function(arg) {
        var list = [];
        this.each(function(node) {
            list = list.concat(add.append(node, arg));
        });
        return _.list(list);
    };
    add.append = function(node, arg) {
        if (typeof arg === "string") {
            return add.create(node, arg);
        }
        if ('length' in arg) {// array of append-ables
            var ret = [];
            for (var i=0,m=arg.length; i<m; i++) {
                ret.push(add.append(node, arg[i]));
            }
            return ret;
        }
        // ok, assume they know what they're doing
        node.appendChild(arg);
        return arg;
    };
    add.create = function(node, tag) {
        var el = document.createElement(tag);
        node.appendChild(node);
        return el;
    };

    _.fn.remove = function() {
        var parents = [];
        this.each(function(node) {
            var parent = node.parentNode;
            if (parents.indexOf(parent) < 0) {
                parents.push(parent);
            }
            parent.removeChild(node);

            var key = _.type(node),
                val = parent[key];
            if (val && val.isNodeList) {
                val.splice(val.indexOf(node), 1);
            } else {
                delete parent[key];
            }
        });
        return _.list(parents);
    };

})(document, HTML._);