# UsefulJS

UsefulJS is a lightweight general-purpose JavaScript development library that is designed
to make programming easier and more pleasant by creating a consistent 
ES5/6 runtime environment with useful enhancements. It doesn't try to do
everything and it certainly doesn't try to tell you how to program; it just
takes care of the basics unobtrusively, letting you get on with your job.

## Getting started

Read `docs/index.html` and follow directions. TLDR: edit `minjs.mk` to use your 
JavaScript minification tool and then build the project:<br>
<code>$ make all</code>
    
If you prefer, you can download built libraries from [usefuljs.net](http://usefuljs.net).
    
## Using the library

Include whichever built version you prefer, for example:<br>
<code>&lt;script src="path/to/UsefilJS-min-full-latest.js"&gt;&lt;/script&gt;</code>
    
At the top of your application entry point, make the following call to to fix your runtime
environment:<br>
<code>UsefulJS.fix({string : "all"});</code>
    
Now you can use the great majority of built-in ES5/6 functions without having to be afraid
that your application will break on a user's browser. The Object parameter is optional.
The example given adds a couple of non-standard methods to the String class for padding output
which I find useful in pretty much every project I write. There is no downside to calling
`fix` because it won't do anything if nothing needs to be done.

UsefulJS does a whole lot more besides. Check out the docs. 
