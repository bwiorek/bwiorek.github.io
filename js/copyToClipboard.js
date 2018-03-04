"use strict";

function copyToClipboard(event) {
    var copiedTextElem = event.getElementsByClassName("postUrl")[0];
    var icon = event.getElementsByTagName("i")[0];
    var confirmMessage = event.getElementsByTagName("em")[0];
    var tempInput = document.createElement('input');
    var timeout = 2000;

    icon.classList.remove("fa-link");
    icon.classList.add("fa-check");
    icon.classList.add("color--success");
    confirmMessage.classList.remove("hide");

    document.body.appendChild(tempInput);
    tempInput.value = copiedTextElem.innerHTML;

    tempInput.select();
    document.execCommand("copy", false);
    tempInput.remove();

    var timeoutId = window.setTimeout(function() {
        icon.classList.add("fa-link");
        icon.classList.remove("fa-check");
        icon.classList.remove("color--success");
        confirmMessage.classList.add("hide");
    }, timeout);
  }