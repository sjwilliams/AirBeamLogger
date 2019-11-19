const $console = $('#console');
const $ul = $console.find('ul');

function scrollLog(){
  $ul.animate({ scrollTop: $ul.prop("scrollHeight")}, 1000);
}

function log(msg, time){
  time = time || 10000;
  const $msg = $(`<li>$ ${msg}</li>`);
  $ul.append($msg);

  setTimeout(function(){
    $msg.remove();
    scrollLog();
  }, time);

  scrollLog();
}

function isLogging(){
  let logging = false;

  if(window.AIRBEAM_STATUS){
    logging = window.AIRBEAM_STATUS.logging;
  }

  return logging;
}

export{
  log,
  isLogging
};