var module = (function ($, db) {
  var currentQuestions = [];
  var correctAnswers = 0;
  var toPass = 25;
  var numbersGenerated = [];

  function generateNumber() {
    return Math.floor(Math.random() * db.questions.length);
  }

  function generateUniqueNumber() {
    var number = generateNumber();
    if (numbersGenerated.includes(number)) {
      number = generateUniqueNumber();
    }
    numbersGenerated.push(number);
    return number;
  }

  function createQuestionsArray() {
    for (var i = 0; i < db.questionsPerPage; i++) {
      var questionNumber = generateUniqueNumber();
      var questionObject = {
        number: questionNumber,
        question: db.questions[questionNumber].question,
        answers: db.questions[questionNumber].answers,
        correct: db.questions[questionNumber].correct,
        image: db.questions[questionNumber].image
      }
      currentQuestions.push(questionObject);
    }
  }

  function createQuestion(questionObject) {
    var htmlString = `
      <div class="panel panel-primary question">
        <div class="panel-heading capmain">
        <h3 class="panel-title">${questionObject.question}</h3>
        </div>
        <div class="panel-body">
    `
    if (questionObject.image) {
      htmlString += `
        <img class="image-question" src="./${questionObject.image}" />
      `
    }
    for (var i = 0; i < questionObject.answers.length; i++) {
      htmlString += `
      <div class="radio panel-body">
        <label for="${questionObject.number}-${i}">
          <input type="radio" name="${questionObject.number}" id="${questionObject.number}-${i}" value="${i}">
          <span>${questionObject.answers[i]}</span>
        </label>
      </div>
      `
    }
    htmlString += "</div></div>";

    return htmlString;
  }

  function createAllQuestions() {
    var finalHtml = ""
    for (var i = 0; i < currentQuestions.length; i++) {
      finalHtml += createQuestion(currentQuestions[i]);
    }
    $("#questions").append(finalHtml);
  };

  function verifyQuestions() {
    var questions = $(".question");
    for (var i = 0; i < questions.length; i++) {
      var answers = $(questions[i]).find(".radio input");
      for (var j = 0; j < answers.length; j++) {
        if (currentQuestions[i].correct == j) {
          $("#questions .capmain").removeClass("capmain");
          var panel = $(answers[j]).closest(".panel");
          $(answers[j]).parent().parent().addClass("correct").siblings().addClass("incorrect");
          panel.removeClass("panel-primary").removeClass("panel-danger").removeClass("panel-success");
          panel.addClass("panel-danger");
          $('#questions input').attr('disabled', 'disabled');
          //check if correct
          if ($(answers[j]).is(":checked")) {
            panel.removeClass("panel-danger").addClass("panel-success");
            correctAnswers++;
          }
        }
      }
    }

    $("#total").html(currentQuestions.length);
    $("#right").html(correctAnswers);
    $("#wrong").html(currentQuestions.length - correctAnswers);
    $("#answers").show();

    if (correctAnswers < toPass) {
      //you failed
      $("#answers").removeClass("panel-success").addClass("panel-danger");
      alert("Din pacate ai picat testul. Mai incearca !");
    }
    else {
      $("#answers").removeClass("panel-danger").addClass("panel-success");
      alert("Felicitari ! Ai fost admis !");
    }

    correctAnswers = 0;

  }


  function initModule() {
    createQuestionsArray();
    createAllQuestions();
    $("#verify").on("click", verifyQuestions);
  };
  return {
    init: initModule,
    verify: verifyQuestions
  }

}(jQuery, database));

var timerModule = (function ($, main) {
  function initTimer() {
    var now = new Date();
    now.setMinutes(now.getMinutes() + 59);
    now.setSeconds(now.getSeconds() + 59);
    $("#timer")
      .countdown(now, function (event) {
        $(this).text(
          event.strftime('%M:%S')
        );

        if (event.type == "finish") {
          main.verify();
          $("html, body").animate({ scrollTop: $(document).height() }, 1000);
        }
      });
  }

  return {
    init: initTimer
  }
}(jQuery, module));

$(document).ready(function () {
  module.init();
  timerModule.init();

  //Click event to scroll to bottom
  $('.scrollToBot').click(function () {
    $("html, body").animate({ scrollTop: $(document).height() }, 1000);
    return false;
  });

  //Click event to scroll to top
  $('.scrollToTop').click(function () {
    $('html, body').animate({ scrollTop: 0 }, 800);
    return false;
  });

});

$(window).scroll(function () {
  if ($(window).scrollTop() > 150) {
    $("#timer").addClass("fixing");
  }
  else {
    $("#timer").removeClass("fixing");

  }
});