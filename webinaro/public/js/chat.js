/* global io, jQuery, moment, Mustache */

var socket = io();

function scrollToBottom() {
  // selectors
  var messages = jQuery("#messages");
  var newMessage = messages.children("li:last-child");
  // heights
  var clientHeight = messages.prop("clientHeight");
  var scrollTop = messages.prop("scrollTop");
  var scrollHeight = messages.prop("scrollHeight");
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight();

  if (
    clientHeight + scrollTop + newMessageHeight + lastMessageHeight >=
    scrollHeight
  ) {
    messages.scrollTop(scrollHeight);
  }
}

socket.on("connect", function () {
  var params = jQuery.deparam(window.location.search);

  socket.emit("join", params, function (err) {
    if (err) {
      console.log(err);
      //alert(err);
      //window.location.href = "/"; // redirect user back to root page
      window.location.href = "https://pwrigniter.com/?ref=webinarPage#register";
      //window.open("https://pwrigniter.com/#register?ref=webinarPage",'_blank');
    } else {
      console.log("No error!");
    }
  });
});

socket.on("disconnect", function () {
  console.log("Disconnected from the server.");
});

// event listener: updateUserList
socket.on("updateUserList", function (users) {
  var ol = jQuery("<ol></ol>");

  users.forEach(function (user) {
    ol.append(jQuery("<li></li>").text(user));
  });

  jQuery("#users").html(ol);
});

// event listener: newMessage
socket.on("newMessage", appendMessage);

function appendMessage(message) {
  if (!chatBoxStatus) {
    messageCount++;
    $("#message-count").text(messageCount);
  }
  var formattedTime = moment(message.createAt).format("h:mm:ss a");
  var template = jQuery("#message-template").html();
  var html = Mustache.render(template, {
    text: message.text,
    from: message.from,
    createAt: formattedTime,
  });

  jQuery("#messages").append(html);
  scrollToBottom();
}

jQuery("#chat-box").hide();
var chatBoxStatus = false;
var messageCount = 0;

function hideChatBox() {
  jQuery("#action-box").show();

  chatBoxStatus = false;
  jQuery("#chat-box").hide();
}
function showChatBox() {
  jQuery("#action-box").hide();
  messageCount = 0;
  chatBoxStatus = true;
  jQuery("#chat-box").show();
}

socket.on("webinarInfo", setupWebinar);
jQuery("#webinar-over").hide();
function setupWebinar(message) {
  console.log("webinfo", message);
  webInfo = message;

  document.getElementById("webinar").style.display = "none";
  let webinarTime = new Date(webInfo.webinarObj.startTime);
  let timeRemaining = webinarTime - new Date();

  console.log(timeRemaining,"100 timeRemaining");
  var endTime = new Date(webinarTime.getTime() + webInfo.webinarObj.duration*60000);

  if(endTime < new Date() ){
    console.log("webinar is over");
    jQuery("#timer").hide();
    jQuery("#webinar-over").show();
    renderUpcomingWebinars(webInfo.upcomingWebinars);
  }
  else{
    
    if (timeRemaining > 0) {
      console.log(timeRemaining,"112 timeRemaining");
      startTimer(webinarTime.getTime(), "time");
    } else {
      startWebinar();
    }
  }

 
}

function renderUpcomingWebinars(upcomingWebinars){
  jQuery("#upcoming-webinars").innerHTML = "";
  //const seoul = new Date();

  var template = jQuery("#upcoming-webinar-template").html();
  for(let i=0;i<upcomingWebinars.length;i++){
    
    var now = new Date(upcomingWebinars[i].startTime);

    // now = now.getTime() - seoul.getTimezoneOffset() * 60000;
    // now = new Date(now);
    
    var html = Mustache.render(template, {
      wId: upcomingWebinars[i]._id,
      startTime: now.toLocaleTimeString()+ " , "+ now.toDateString()
    });
    jQuery("#upcoming-webinars").append(html);
  }
 
}

function renderAboutWebinar() {
  var template = jQuery("#about-webinar-template").html();
  var html = Mustache.render(template, {
    title: webInfo.webinarObj.title,
    des: webInfo.webinarObj.des,
    speaker: webInfo.webinarObj.speaker,
  });
  jQuery("#about_webinar").append(html);
}

// event listener: newLocationMessage
socket.on("newLocationMessage", function (message) {
  var formattedTime = moment(message.createAt).format("h:mm a");
  var template = jQuery("#location-message-template").html();
  var html = Mustache.render(template, {
    url: message.url,
    from: message.from,
    createAt: formattedTime,
  });

  jQuery("#messages").append(html);
  scrollToBottom();
});

jQuery("#message-form").on("submit", function (e) {
  var messageTextbox = jQuery("[name=message]");

  // prevent the default behavior: not refresh the page
  e.preventDefault();

  socket.emit(
    "createMessage",
    {
      text: messageTextbox.val(),
    },
    function () {
      messageTextbox.val("");
    }
  );
});

function sendPool(ops) {
  console.log(ops);
  jQuery("#pool").empty();
  socket.emit(
    "createMessage",
    {
      pool: true,
      question: poolG.question,
      response: ops,
    },
    function () {
      //on success
      // messageTextbox.val("");
    }
  );
}

function regForNextWebinar(wId){
  console.log(wId);
  jQuery("#pool").empty();
  socket.emit(
    "createMessage",
    {
      reg: true,
      webinarId: wId
    },
    function () {
      //on success
      // messageTextbox.val("");
    }
  );
}
var locationButton = jQuery("#send-location");
locationButton.on("click", function () {
  // check user is able to access geolocation api
  if (!navigator.geolocation) {
    return alert("Geolocation not supported by your browser.");
  }

  locationButton.attr("disabled", "disabled").text("Sending location..."); // disable the button while fetching geodata

  navigator.geolocation.getCurrentPosition(
    function (position) {
      locationButton.removeAttr("disabled").text("Send location"); // re-enabling the button
      socket.emit("createLocationMessage", {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    },
    function () {
      locationButton.removeAttr("disabled").text("Send location");
      alert("Unable to fetch location"); // error handler
    }
  );
});

function startTimer(countDownDate, timerId) {
  console.log("duration, timerId", countDownDate, timerId);
  var x = setInterval(function () {
    // Get today's date and time
    //const seoul = new Date();
    var now = new Date().getTime();

    //now = now - seoul.getTimezoneOffset() * 60000;

    // Find the distance between now and the count down date
    var distance = countDownDate - now;

    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    var timerStr = "";
    if (days > 0) {
      timerStr = days + "d ";
    }
    if (hours > 0) {
      timerStr += hours + "h ";
    }
    if (minutes > 0) {
      timerStr += minutes + "m ";
    }
    if (seconds > 0) {
      timerStr += seconds + "s ";
    }

    // Display the result in the element with id="demo"
    document.getElementById(timerId).innerHTML = timerStr;

    // If the count down is finished, write some text
    if (distance < 0) {
      clearInterval(x);
      document.getElementById(timerId).innerHTML = "EXPIRED";
      startWebinar();
    }
  }, 1000);
}

window.onload = function () {};

function startWebinar() {
  showChatBox();
  setTimeout(() => {
    hideChatBox();
  }, 10000);

  document.getElementById("timer").style.display = "none";
  document.getElementById("webinar").style.display = "";
  processWebinar();
}

var video = document.getElementById("video");

function toggleControls() {
  if (video.hasAttribute("controls")) {
    video.removeAttribute("controls");
  } else {
    video.setAttribute("controls", "controls");
  }
}

function playVideo(videoUrl) {
  toggleControls();

  if (Hls.isSupported()) {
    var hls = new Hls({
      debug: false,
    });
    hls.loadSource(videoUrl);
    hls.attachMedia(video);
    hls.on(Hls.Events.MEDIA_ATTACHED, function () {
      video.muted = true;
      
      video.play();
     // video.muted = false;

      let webinarTime = new Date(webInfo.webinarObj.startTime);
      let timeRemaining = webinarTime - new Date();

      if(timeRemaining < 0){
        console.log("seeking to", (timeRemaining*-1)/1000);
        video.currentTime = (timeRemaining*-1)/1000;
      }
      
    });
  }
  // hls.js is not supported on platforms that do not have Media Source Extensions (MSE) enabled.
  // When the browser has built-in HLS support (check using `canPlayType`), we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video element throught the `src` property.
  // This is using the built-in support of the plain video element, without using hls.js.
  else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = videoUrl;
    video.addEventListener("canplay", function () {
      video.play();
    });
  }

  if (video.readyState < 1) {
    // wait for loadedmetdata event
    video.addEventListener("loadedmetadata", onLoadedMetadata);
  } else {
    // metadata already loaded
    onLoadedMetadata();
  }
}

var seedMes = null;
var webInfo = null;

function processWebinar() {
  playVideo(webInfo.flowObj.videoUrl);

  seedMes = [...webInfo.flowObj.seedMes];

  //webInfo = resp;
  renderAboutWebinar();
}

function onLoadedMetadata() {
  //alert(video.duration);
  // $('#duration').html("Duration: " + video.duration());
  messageLoop();
}
var poolG = null;

jQuery("#pool-box-center").hide();

function loadPool(poolObj) {
  setupCenterBox();

  var template = jQuery("#pool-template").html();
  var html = Mustache.render(template, {
    question: poolObj.question,
    op1: poolObj.options[0],
    op2: poolObj.options[1],
    op3: poolObj.options[2],
  });
  jQuery("#pool").append(html);
  poolG = poolObj;
  poolSetTimeout = setTimeout(() => {
    jQuery("#pool-box-center").hide();
  }, 10000);
}

function setupCenterBox() {
  if (poolSetTimeout) clearTimeout(poolSetTimeout);

  jQuery("#pool-box-center").show();

  jQuery("#pool").empty();
  jQuery("#pool-results").empty();
}

var poolSetTimeout = null;
function loadResult(resultObj) {
  setupCenterBox();

  var template = jQuery("#pool-results-template").html();
  var html = Mustache.render(template, {});
  jQuery("#pool-results").append(html);

  new Chart(document.getElementById("bar-chart"), {
    type: "bar",
    data: {
      labels: resultObj.labels,
      datasets: [
        {
          label: resultObj.dataLabel,
          backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f"],
          data: resultObj.data,
        },
      ],
    },
    options: {
      legend: { display: false, labels: {
        fontColor: 'orange'
       } },
      title: {
        display: true,
        fontColor: 'white',
        text: resultObj.title,
      },
      
      scales: {
          yAxes: [{
              ticks: {
                  beginAtZero:true,
                  fontColor: 'white'
              },
          }],
        xAxes: [{
              ticks: {
                  fontColor: 'white'
              },
          }]
      } 
    },
  });
  poolSetTimeout = setTimeout(() => {
    jQuery("#pool-box-center").hide();
  }, 10000);
}

function messageLoop() {
  if (seedMes.length <= 0) return;

  //console.log("video duration", video.duration,video.currentTime);
  let dif = video.currentTime * 1000 - seedMes[0].at;
  //console.log("dif",dif);
  if (dif >= 0 && dif < 5000) {
    //console.log("dif  showing",dif);
    if (seedMes[0].type == "pool") {
      loadPool(seedMes[0]);
    } else if (seedMes[0].type == "result") {
      loadResult(seedMes[0]);
    } else {
      let messageTime = new Date(webInfo.startAt);
      //console.log("messageTime",messageTime, messageTime.toDateString());
      messageTime = new Date(messageTime.getTime() + seedMes[0].at);
      //console.log("messageTime",messageTime);

      appendMessage({
        createAt: messageTime.toString(),
        text: seedMes[0].text,
        from: seedMes[0].from,
      });
    }
    seedMes.shift();
  } else if (dif > 0) {
    //console.log("dif not showing",dif);

    seedMes.shift();
  }

  setTimeout(() => {
    messageLoop();
  }, 100);
}

$("#about_webinar_container").click(function () {
  $header = $(this);
  //getting the next element
  $content = $header.next();
  //open up the content needed - toggle the slide- if visible, slide up, if not slidedown.
  $content.slideToggle(500, function () {
    //execute this after slideToggle is done
    //change text of header based on visibility of content div
    $header.text(function () {
      //change text based on condition
      return $content.is(":visible") ? "Collapse" : "About Webinar";
    });
  });
});

// Make the DIV element draggable:
// dragElement(document.getElementById("mydiv"));

// function dragElement(elmnt) {
//   var pos1 = 0,
//     pos2 = 0,
//     pos3 = 0,
//     pos4 = 0;
//   if (document.getElementById(elmnt.id + "header")) {
//     // if present, the header is where you move the DIV from:
//     document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
//   } else {
//     // otherwise, move the DIV from anywhere inside the DIV:
//     elmnt.onmousedown = dragMouseDown;
//   }

//   function dragMouseDown(e) {
//     e = e || window.event;
//     e.preventDefault();
//     // get the mouse cursor position at startup:
//     pos3 = e.clientX;
//     pos4 = e.clientY;
//     document.onmouseup = closeDragElement;
//     // call a function whenever the cursor moves:
//     document.onmousemove = elementDrag;
//   }

//   function elementDrag(e) {
//     e = e || window.event;
//     e.preventDefault();
//     // calculate the new cursor position:
//     pos1 = pos3 - e.clientX;
//     pos2 = pos4 - e.clientY;
//     pos3 = e.clientX;
//     pos4 = e.clientY;
//     // set the element's new position:
//     elmnt.style.top = elmnt.offsetTop - pos2 + "px";
//     elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
//   }

//   function closeDragElement() {
//     // stop moving when mouse button is released:
//     document.onmouseup = null;
//     document.onmousemove = null;
//   }
// }

//screen.orientation.lock("landscape");
