function saveUserData() {
  var asdf = document.getElementById("username_field").value;
  var fdsa = document.getElementById("password_field").value;
  if (asdf === "" || fdsa === "") {
    document.getElementById("status_msg").innerHTML =
      "<font color='red'>Die Felder d&uuml;rfen nicht leer sein!</font>";
    return false;
  } else {
    chrome.storage.local.set({ isEnabled: true }, function () {}); //need to activate auto login feature
    chrome.runtime.sendMessage({ cmd: "clear_badge" });
    chrome.runtime.sendMessage({
      cmd: "set_user_data",
      userData: { asdf: asdf, fdsa: fdsa },
    });
    document.getElementById("status_msg").innerHTML = "";
    document.getElementById("save_data").innerHTML =
      "<font>Gespeichert!</font>";
    document.getElementById("save_data").disabled = true;
    document.getElementById("save_data").style.backgroundColor =
      "rgb(47, 143, 18)";
    document.getElementById("username_field").value = "";
    document.getElementById("password_field").value = "";
    document.getElementById("status_msg").innerHTML =
      "<font color='green'>Du bist angemeldet und wirst automatisch in Opal & Co. eingeloggt.</font>";
    setTimeout(() => {
      document.getElementById("save_data").style.backgroundColor = "grey";
      document.getElementById("save_data").innerHTML = "Speichern";
      document.getElementById("save_data").disabled = false;
    }, 2000);
  }
}

function deleteUserData() {
  chrome.runtime.sendMessage({ cmd: "clear_badge" });
  chrome.storage.local.set({ Data: "undefined" }, function () {}); //this is how to delete user data!
  chrome.storage.local.set({ isEnabled: false }, function () {}); //need to deactivate auto login feature
  // -- also delete courses in dashboard
  chrome.storage.local.set({ meine_kurse: false }, function () {});
  chrome.storage.local.set({ favoriten: false }, function () {});
  // --
  document.getElementById("status_msg").innerHTML = "";
  document.getElementById("delete_data").innerHTML =
    "<font>Gel&ouml;scht!</font>";
  document.getElementById("delete_data").style.backgroundColor =
    "rgb(47, 143, 18)";
  document.getElementById("delete_data").disabled = true;
  document.getElementById("username_field").value = "";
  document.getElementById("password_field").value = "";
  document.getElementById("status_msg").innerHTML =
    "<font color='grey'>Du bist nicht angemeldet.</font>";
  setTimeout(() => {
    document.getElementById("delete_data").innerHTML =
      "Alle Daten l&ouml;schen";
    document.getElementById("delete_data").style.backgroundColor = "grey";
    document.getElementById("delete_data").disabled = false;
    chrome.storage.local.get(["Data"], function (result) {});
  }, 2000);
}
function fwdGoogleSearch() {
  chrome.storage.local.get(["fwdEnabled"], function (result) {
    chrome.storage.local.set(
      { fwdEnabled: !result.fwdEnabled },
      function () {}
    );
  });
}

//set switches and other elements
function displayEnabled() {
  chrome.storage.local.get(["fwdEnabled"], function (result) {
    this.document.getElementById("switch_fwd").checked = result.fwdEnabled;
  });
  /*chrome.storage.local.get(['dashboardDisplay'], function(result) {
    if(result.dashboardDisplay === "favoriten") {document.getElementById('fav').checked = true}
    if(result.dashboardDisplay === "meine_kurse") {document.getElementById('crs').checked = true}
  })*/
}

//handle dashboard course select customization
/*function dashboardCourseSelect () {
  if(document.getElementById('fav').checked) {
    chrome.storage.local.set({dashboardDisplay: "favoriten"}, function() {})
  }else if(document.getElementById('crs').checked) {
    chrome.storage.local.set({dashboardDisplay: "meine_kurse"}, function() {})
  }
}*/

function clicksToTime(clicks) {
  let clicks_calc = clicks * 3;
  let secs = clicks_calc % 60;
  let mins = Math.floor(clicks_calc / 60);
  return (
    "<strong>" +
    clicks +
    " Klicks &#x1F5B1</strong> und <strong>" +
    mins +
    "min " +
    secs +
    "s</strong> &#9202; gespart!"
  );
}

function clicksToTimeNoIcon(clicks) {
  let clicks_calc = clicks * 3;
  let secs = clicks_calc % 60;
  let mins = Math.floor(clicks_calc / 60);
  return (
    "<strong>" +
    clicks +
    " Klicks </strong> und <strong>" +
    mins +
    "min " +
    secs +
    "s</strong> gespart!"
  );
}

function openKeyboardSettings() {
  chrome.runtime.sendMessage(
    { cmd: "open_shortcut_settings" },
    function (result) {}
  );
}

function denyHostPermissionS() {
  chrome.storage.local.set(
    { gotInteractionOnHostPermissionExtension1: true },
    function () {}
  );
  alert(
    "Okay, das ist schade. Trotzdem wird TUfast bei dir auf den wichtigsten Seiten Funktionieren. Entdecke auf dieser Seite jetzt alle Funktionen von TUfast!"
  );
  document.getElementById("addition_host_permissions").remove();
}

function requestHostPermissionS() {
  chrome.storage.local.set(
    { gotInteractionOnHostPermissionExtension1: true },
    function () {}
  );
  chrome.permissions.request(
    {
      origins: ["*://*.tu-dresden.de/*", "*://*.slub-dresden.de/*"],
    },
    function (granted) {
      if (granted) {
        alert(
          "Perfekt! TUfast funktioniert jetzt auf allen Seiten! Entdecke auf jetzt alle Funktionen von TUfast!"
        );
        chrome.runtime.sendMessage(
          { cmd: "register_addition_content_scripts" },
          function (result) {}
        );
        document.getElementById("addition_host_permissions").remove();
      } else {
        alert(
          "Okay, das ist schade. Trotzdem wird TUfast bei dir weiterhin Funktionieren. Entdecke auf dieser Seite jetzt alle Funktionen von TUfast!"
        );
        document.getElementById("addition_host_permissions").remove();
      }
    }
  );
}

//this need to be done here since manifest v2
window.onload = async function () {
  //assign functions
  document.getElementById("save_data").onclick = saveUserData;
  document.getElementById("delete_data").onclick = deleteUserData;
  document.getElementById("switch_fwd").onclick = fwdGoogleSearch;
  document.getElementById(
    "open_shortcut_settings"
  ).onclick = openKeyboardSettings;
  document.getElementById(
    "open_shortcut_settings1"
  ).onclick = openKeyboardSettings;
  //document.getElementById('fav').onclick = dashboardCourseSelect
  //document.getElementById('crs').onclick = dashboardCourseSelect

  //add storage listener for autologin
  chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (var key in changes) {
      if (
        key === "openSettingsPageParam" &&
        changes[key].newValue === "auto_login_settings"
      ) {
        if (
          !this.document
            .getElementById("auto_login_settings")
            .classList.contains("active")
        ) {
          this.document.getElementById("auto_login_settings").click();
        }
        chrome.storage.local.set(
          { openSettingsPageParam: false },
          function () {}
        );
        document.getElementById("settings_comment").innerHTML =
          "<strong>F&uuml;r dieses Feature gib hier deine Zugangsdaten ein.</strong>";
      }
    }
  });

  //set all switches and elements
  displayEnabled();

  //get things from storage
  chrome.storage.local.get(
    [
      "saved_click_counter",
      "openSettingsPageParam",
      "isEnabled",
      "gotInteractionOnHostPermissionExtension1",
    ],
    (result) => {
      //set text on isEnabled
      if (result.isEnabled) {
        document.getElementById("status_msg").innerHTML =
          "<font color='green'>Du bist angemeldet und wirst automatisch in Opal & Co. eingeloggt.</font>";
      }
      //else {
      //  document.getElementById('status_msg').innerHTML = "<font color='grey'>Du bist nicht angemeldet.</font>"
      //}
      //update saved clicks
      //see if any params are available
      if (result.openSettingsPageParam === "auto_login_settings") {
        setTimeout(function () {
          this.document.getElementById("auto_login_settings").click();
        }, 200);
      } else if (result.openSettingsPageParam === "time_settings") {
        setTimeout(function () {
          this.document.getElementById("time_settings").click();
        }, 200);
      } else if (result.gotInteractionOnHostPermissionExtension1) {
        document.getElementsByTagName("button")[0].click();
      }

      if (result.saved_click_counter === undefined) {
        result.saved_click_counter = 0;
      }
      this.document.getElementById("settings_comment").innerHTML =
        "Bereits " + clicksToTimeNoIcon(result.saved_click_counter);
      this.document.getElementById("time_settings").innerHTML = clicksToTime(
        result.saved_click_counter
      );
      chrome.storage.local.set(
        { openSettingsPageParam: false },
        function () {}
      );
    }
  );

  //prep accordion
  let acc = document.getElementsByClassName("accordion");
  let i;
  for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function () {
      //--only open one accordions section at a time
      let acc = document.getElementsByClassName("accordion");
      let i;
      for (i = 0; i < acc.length; i++) {
        if (acc[i] === this) continue; //skip actual clicked element
        let pan = acc[i].nextElementSibling;
        if (pan.style.maxHeight) {
          pan.style.maxHeight = null;
          acc[i].classList.toggle("active");
        }
      }
      //--
      //open clicked accordion section and set active
      this.classList.toggle("active");
      var panel = this.nextElementSibling;
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  }

  //additional host permissions
  //check whether to ask for additional host permission
  chrome.storage.local.get(
    ["gotInteractionOnHostPermissionExtension1"],
    async function (result) {
      if (!result.gotInteractionOnHostPermissionExtension1) {
        let hpDiv = document.getElementById("addition_host_permissions");
        hpDiv.innerHTML =
          '<p>Wichtig: Damit TUfast f&uuml;r alle Online-Portale der TU Dresden funktioniert, dr&uuml;cke jetzt "Akzeptieren":</p> <button class="button-deny" id="refuseDomains">Ablehnen</button><button id="acceptDomains" style="margin-left:30px;" class="button-accept">Akzeptieren</button>';
        await new Promise((r) => setTimeout(r, 500));
        document
          .getElementById("refuseDomains")
          .addEventListener("click", denyHostPermissionS); //innerHTML is not async. However, it takes time to render, so lets wait 500ms
        document
          .getElementById("acceptDomains")
          .addEventListener("click", requestHostPermissionS);
      }
    }
  );
};
