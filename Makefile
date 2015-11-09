# Makefile for the UsefulJS project
# Author: Christopher Williams

PROJECT=UsefulJS
MAJOR=0
MINOR=9
BUILDNO=1
BETA=rc
VERSION=${MAJOR}.${MINOR}.${BUILDNO}${BETA}

$(shell mkdir -p inter built)

include minjs.mk

SRC_FILES=$(wildcard src/*.js)
EXT_FILES=$(wildcard extensions/*.js)
CORE_MINIFIED:=inter/core.js
LOCALE_MINIFIED:=$(patsubst src/%.js,inter/%.js,$(wildcard src/locale*.js))
EXT_MINIFIED:=$(patsubst extensions/%.js,inter/%.js,$(EXT_FILES))
LIBS_MINIFIED:=$(filter-out $(CORE_MINIFIED) $(LOCALE_MINIFIED), $(patsubst src/%.js,inter/%.js,${SRC_FILES}))
FILES_MINIFIED:=$(CORE_MINIFIED) $(LIBS_MINIFIED) $(LOCALE_MINIFIED)
RELEASE_LIB:=built/UsefulJS-min-$(VERSION).js
LATEST:=built/UsefulJS-min-latest.js
FULL:=built/UsefulJS-min-full-latest.js
DEV_PACKAGE:=built/UsefulJS-$(VERSION).zip

inter/%.js : src/%.js
	$(call minjs,$<,$@)
	
inter/%.js : extensions/%.js
	$(call minjs,$<,$@)

minified : ${FILES_MINIFIED} ${EXT_MINIFIED}

$(RELEASE_LIB) : minified
	@rm -f $@;\
		cat LICENSE >$@;\
		echo "// V${VERSION}" >>$@;\
		echo '"use strict";' >>$@;\
		cat ${FILES_MINIFIED} >>$@

$(LATEST) : $(RELEASE_LIB)
	@cp $< $@
	
$(FULL) : $(LATEST)
	@cp $< $@;\
		cat $(EXT_MINIFIED) >>$@

$(DEV_PACKAGE) : LICENSE ${SRC_FILES} ${EXT_FILES} $(wildcard templates/*) Test.html
	@zip $(DEV_PACKAGE) $^

latest : $(LATEST)

all : latest $(FULL) $(DEV_PACKAGE)

clean:
	@rm -rf inter/* built/*

