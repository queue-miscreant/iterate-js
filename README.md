A simple framework that iterates over tags such as
```html
<div id="foo" class="parse-contents">
foreach _;
bar
<div class="baz">
qux
</div>
<div class="baz"></div>
</div>
```

This script exports the name 'iterate'.
To use, run `iterate(context)`, where context is a JavaScipt Object (or Array).
This will bind the '\_' in each node with class 'parse-contents' (but not nested
parse-contents) to the object `context`.

`iterate` returns an array of 'tree' objects for DOM elements. A tree has the
following members:

* tag
	* The DOM element
* context
	* The most local context (since the last parse-contents)
* nextContext(?)
	* An array of trees that in the next most local contexts.
	  If there is no next context that has been parsed, this
	  is undefined

For each child element of `tag`, if it is the first child of its class, the tree will
also have a member that points to the tag with the name of the class. In the above HTML
example, the first `(div.baz)` will bind to `tree.baz`

An example using the above HTML:
```javascript
iterate(['#F00','#0F0','#00F'])[0].forEach(function(each) {
	each.baz.tag.style.color = each.context
})
```
The result is 3 `(div.foo)`s, containing the two `(div.baz)`s. The displayed text
in the first `(div.baz)` will be red, green, or blue, in order.

`iterate`'s returned Array will also contain members for the ID of the 'parse-contents'
In the above example, it will have the member `foo`, which points to the Array generated
from `(div#foo.parse-contents)`. This makes it easier to navigate the return value of
`iterate`. If there are multiple elements with the same id, then they are combined into
one array.
