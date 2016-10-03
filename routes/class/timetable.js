var utils = require('../utils');
// 개인 시간표 조회
var run = function(req, res, next){
  console.log("POST /timetable");
  console.log("REMOTE IP : " + req.ip);
  console.log("REMOTE IPS : " + req.ips);

  // 개인 시간표 데이터를 파싱할 페이지 URL
  var url = utils.baseurl+"/GATE/SAM/LESSON/A/SSEA34S.ASPX?&maincd=O&systemcd=S&seq=100";

  utils.get(req, res, next, url, true)
  .then(function(window, rawData){
    // 파싱한 데이터를 보관할 배열
    var data = [[],[],[],[],[],[]];

    // id 가 tblTimeSheet 인 테이블의 데이터 긁어오기
    window.$("#tblTimeSheet > tbody > tr")
      .each(function(index, element){
        if(index>0){
          console.log("========================================");
          for(var i=0; i<6; i++){
            console.log(window.$( element ).children("td.TT_ItemCell:eq("+i+")").text());
            var item = window.$( element ).children("td.TT_ItemCell:eq("+i+")").text();
            if(item.length>0){
              var code_tutor = item.split("(")[1].split(")")[0]; // 강사 또는 교수
              var codeval = code_tutor.split("-")[0] + "-" + code_tutor.split("-")[1]; // 과목코드
              // 과목코드로 배열에서 중복되는 요소인지 여부 검사
              if(utils.isDuplicated(data[i], "code", codeval)==false){
                var time = item.split("(")[1].split(")")[1].substring(0,13);
                data[i].push({
                  "subject" : item.split("(")[0],
                  "code" : codeval,
                  "tutor" : code_tutor.split("-")[2],
                  "time" : time,
                  "start" : [parseInt(time.split("~")[0].split(":")[0]),
                    parseInt(time.split("~")[0].split(":")[1])],
                  "end" : [parseInt(time.split("~")[1].split(":")[0]),
                    parseInt(time.split("~")[1].split(":")[1])],
                  "location" : item.split("(")[1].split(")")[1].substring(13,17)
                });
              }
            }
          }
        }
      });

    // JSON 으로 처리하여 클라이언트에 응답
    res.send(JSON.stringify({
        "monday" : data[0],
        "tuesday" : data[1],
        "wednsday" : data[2],
        "thursday" : data[3],
        "friday" : data[4],
        "saturday" : data[5]
    }));
  });

}

module.exports = run;
