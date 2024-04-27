string := "([^"\n\\]|\\[^\n])*"?
type := quiz|questions?|code|block|(inline-)?frq|m[cs]q|(correct-)?choice|explanation|section|title|heading
(
)
=
name := [abcdefghijklmnopqrstuvwxyz]+(-[abcdefghijklmnopqrstuvwxyz]+)*

whitespace := \s+
comment := // [^\n]*