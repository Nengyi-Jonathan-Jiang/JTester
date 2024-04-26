import {generateQuiz} from "./jquiz.js";

await generateQuiz(
    document.getElementById('questions'),
    './quizzes/java-test.jquiz'
);