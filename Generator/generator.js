const csv = require("fast-csv");
const fs = require('fs');
const sms = [];
const questionsPerPage = 30;

let failedQuestionsCount = 0;
let fileName = "CAPITAN A TCN.VITALITATE";

fileName = process.argv[2] || fileName;

csv
  .fromPath(`CSVs/${fileName}.csv`, {
    delimiter: ","
  })
  .on("data", function (data) {
    const question = data[0];
    const image = data[1];
    const answers = data.map((ans, i) => {
      if (i < 2 || i % 2 == 1) return null;
      return ans
    }).filter(ans => !!ans);

    const answerKeys = data.map((key, i) => {
      if (i < 2 || i % 2 == 0) return null;
      return key
    }).filter(key => !!key);

    const correct = answerKeys.indexOf("1");

    if(question) {
      sms.push({
        question,
        answers,
        correct,
        image
      });
    } else {
      failedQuestionsCount++;
    }
  })
  .on("end", function () {
    var final = {
      questions: sms,
      questionsPerPage: sms.length < questionsPerPage ? sms.length : questionsPerPage
    }
    var json = JSON.stringify(final);
    var script = `const database = ${json};`

    if(failedQuestionsCount) {
      console.log("Failed question conversion: ", failedQuestionsCount);
      console.log("Something wrong with CSV");
    }

    fs.writeFile(`generated/${fileName}.js`, script, (error) => {
      if(error == null) {
        console.log("File created!");
      } else{
        console.log(error);
      }
    });
  });
