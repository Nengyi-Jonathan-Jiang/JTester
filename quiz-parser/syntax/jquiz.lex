string := "([^"\n\\]|\\[^\n])*"?
type := question|block|(inline-)?frq|m[cs]q|(correct-)?choice|explanation|section|title|heading
(
)
=
name := [abcdefghijklmnopqrstuvwxyz]+(-[abcdefghijklmnopqrstuvwxyz]+)*

whitespace := \s+
comment := // [^\n]*