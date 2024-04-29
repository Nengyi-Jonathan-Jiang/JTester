### How to run
Chrome doesn't let you fetch from local, usually. To get around this, I 
wrote Server.jar to set up a small static file server. Hopefully it works?
Once it's running, go to `localhost:3000/#java-test` to see the page. 

Quizzes are found in the `/quizzes` directory. See `java-test.jquiz` to 
get a sample of what the file looks like. Weirdly, strings without a `"` that
are at the end of a line are interpreted as having an extra newline at the end.
This is also how you make newlines -- escape characters like `\n` and `\t` don't 
work. There should be no other surprises, other than the fact that commas are not 
used. Y'all are smart. Y'all can figure it out.

If you make more tests, put them in the `/quizzes` directory. They should
be named something like `the-file-name.jquiz`. To access them, go to 
`localhost:3000/#the-file-name`.

The file format should be pretty self-explanatory, I hope. The only
entity type not used in `java-test.jquiz` is `mcq`, which works just
like `msq` but it's multiple choice, not multiple select.

Um, if you wanna edit the css, good luck?