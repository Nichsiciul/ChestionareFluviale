const csv = require("fast-csv");
const fs = require('fs');

const sms = [];
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

    sms.push({
      question,
      answers,
      correct,
      image
    });


  })
  .on("end", function () {
    var final = {
      questions: sms,
      questionsPerPage: 30
    }
    var json = JSON.stringify(final);
    var script = `const database = ${json};`
    fs.writeFile(`generated/${fileName}.js`, script, (error) => {
      console.log(error);
    });
  });
