# Make function for minifying JavaScript files; replace with whatever tool you
# prefer or, if you use Closure Compiler, set the correct path

PATH_TO_CLOSURE:=../closure-compiler

define minjs
	java -jar ${PATH_TO_CLOSURE}/compiler.jar --charset UTF-8 --js $1 --js_output_file $2
endef

