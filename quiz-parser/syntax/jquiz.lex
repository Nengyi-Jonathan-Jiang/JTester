string := "([^"\n\\]|\\[^\n])*"?
type := quiz|questions?|block|(inline-)?frq|m[cs]q|(correct-)?choice|explanation|section|title|heading
(
)
=
name := [abcdefghijklmnopqrstuvwxyz]+(-[abcdefghijklmnopqrstuvwxyz]+)*

whitespace := \s+
comment := // [^\n]*