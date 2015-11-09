#!/usr/bin/perl

use strict;
use warnings qw/all/;
use JSON;

# Tune $pLen for maximum compression against $maxLen

my @words = ();
my ($pLen, $pfx) = (4, "");

# Replacements for common letter combinations
my @rep = qw/ing er es ti at te on re is ed/;
my $maxLen = 9;

while (<>) {
	chomp;
	chop if (/\r$/);
	my $word = $_;
	next if ($word =~ /[^a-z]/);
	my $wLen = length($word);
	next unless ($wLen && $wLen <= $maxLen);
	if (substr($word, 0, $pLen) eq $pfx) {
	    substr($word, 0, $pLen) = "*";
	}
	else {
	    $pfx = substr($word, 0, $pLen);
	}
	for (0..$#rep) {
	    $word =~ s/$rep[$_]/$_/g;
	}
	
	push(@words, $word);
}

my $wl = join(" ", @words);
my $plt = JSON->new()->encode(\@rep);

print <<HERE;
/**
 * Word functions for word games; recognizes words between 2 and $maxLen characters
 * Author: Christopher Williams
 * This code is in the public domain
 */
(function() {
    var wl = "$wl".split(" "), _longest = 0,
        wByLength = [[], []], sigs = {}, pfx = "";

    // Lookup table for restoring common patterns
    var plt = $plt;    

    var _toSig = function(w) {
        var a = w.split("");
        a.sort();
        return a.join("");
    };
    
    var _add = function(w) {
        var s = _toSig(w), len = w.length;
        if (len > _longest) {
            _longest = len;
        }
        if (!wByLength[len]) {
            wByLength[len] = [w];
        }
        else {
            wByLength[len].push(w);
        }
        if (!sigs[s]) {
            sigs[s] = [w];
        }
        else {
            sigs[s].push(w);
        }
    };
    
    wl.forEach(function(w) {
        // Restore missing sequences
        w = w.replace(/([0-9])/g, function(m, p) { return plt[p]; });
        if ('*' === w.charAt(0)) {
            // Replace the '*' with the prefix
            w = pfx + w.substring(1);
        }
        else {
            pfx = w.substring(0, $pLen);
        }
        
        _add(w);
    });

    // Gets valid keys from an ordered collection of letters
    var _perms = function(soFar, w, len, r, m) {
        if (!m[soFar]) {
            if (sigs[soFar]) {
                r.push(soFar);
            }
            m[soFar] = 1;
        }
        var i, _s, _ss, _k;
        for (i = 0; i < len; ++i) {
            _s = soFar + w.charAt(i);
            _ss = w.substring(i + 1);
            _k = _s + _ss;
            if (!m[_k]) {
                _perms(_s, _ss, len - 1, r, m);
                m[_k] = 1;
            }
        }
    };

    this.WORDS = {
        // Gets a random word of a given length
        random : function(len) {
            if (len >= wByLength.length) {
                return "";
            }
            var a = wByLength[len], idx = Math.floor(Math.random() * a.length);
            return a[idx];
        },
        // Returns true if a word is in the dictionary
        exists : function(w) {
            var k = _toSig(w);
            if (sigs[k]) {
                return sigs[k].some(function(_w) {
                    if (_w === w) {
                        return true;
                    }
                    return false;
                });
            }
            return false;
        },
        // Extracts the longest word or words from a jumble of letters
        longest : function(nw, n) {
            n = (n >>> 0) || 1;
            nw = _toSig(nw);
            var ret = [], len = nw.length, keys = [];
            // Get all the valid keys
            _perms("", nw, len, keys, {});
            // Sort them longest first
            keys.sort(function(a, b) {
                return b.length - a.length;
            });
            keys.every(function(k) {
                sigs[k].forEach(function(w) {
                    ret.push(w);
                });
                return (ret.length < n);
            });
            if (!ret.length) {
                return null;
            }
            if (1 === ret.length) {
                return ret[0];
            }
            if (ret.length > n) {
                ret.length = n;
            }
            return ret;
        },
        // Solves an anagram
        solve : function(nw) {
            nw = _toSig(nw);
            if (sigs[nw]) {
                return sigs[nw][0];
            }
            return null;
        },
        // Jumbles up the letters of a word
        scramble : function(w) {
            var scrambled, clear, i, idx, len = w.length;
            do {
                scrambled = "";
                clear = w.split("");
                for (i = 0; i < len; ++i) {
                    idx = Math.floor(Math.random() * clear.length);
                    scrambled += clear[idx];
                    clear.splice(idx, 1);
                }
            }
            while (scrambled === w);
            return scrambled;
        },
        // Solves a crossword clue
        solveCrossword : function(n, re) {
            var ret = [], l = wByLength[n] || [], i, wc = l.length;
            for (i = 0; i < wc; ++i) {
                if (re.test(l[i])) {
                    ret.push(l[i]);
                }
            }
            if (!ret.length) {
                return null;
            }
            if (1 === ret.length) {
                return ret[0];
            }
            return ret;
        },
        // Adds a new word to the dictionary
        add : _add
    };
})(this);

HERE

