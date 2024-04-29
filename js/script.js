import {generateQuiz} from "./jquiz.js";

let quiz = window.location.hash.replaceAll(/^#/g, '');
try {
    await generateQuiz(
        document.getElementById('questions'),
        `./quizzes/${quiz}.jquiz`
    );
}
catch (e) {
    alert(`Invalid quiz: "${quiz}" not found or broken.`)
}