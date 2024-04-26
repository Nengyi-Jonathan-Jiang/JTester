string := "([^"\n\\]|\\[^\n])*"?
type := quiz|questions|question|code|block|inline-frq|frq|msq|mcq|choice|correct-choice|explanation
(
)
=
name := [abcdefghijklmnopqrstuvwxyz]+(-[abcdefghijklmnopqrstuvwxyz]+)*

whitespace := \s+