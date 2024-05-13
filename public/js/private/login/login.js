const loginElement = document.getElementById("login-element");

const usernameInput = document.getElementById("username-input");

const passwordInput = document.getElementById("password-input");

const loginError = document.getElementById("log-error-popup");

const sendButton = document.getElementById("try-login");

let loginErrDisplayed = false;

async function sendJSONToNode(data, url, callback = () => {}) {
    console.log("Intento de login!");
    let xhr = new XMLHttpRequest();

    xhr.open("POST", url, true);

    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function () {
        callback(xhr);
    };

    xhr.onerror = function () {
        callback(xhr);
    };

    xhr.send(JSON.stringify(data));
}

sendButton.addEventListener("click", () => {
    let data = {
        username: usernameInput.value,
        password: passwordInput.value,
    };

    sendJSONToNode(data, "http://localhost:3500/try-login", (xhr) => {
        if (xhr.status >= 200 && xhr.status < 300) {
            let incorrectLoginData = xhr.responseText === "true";

            if (incorrectLoginData) {
                showLoginError();
            } else {
                window.location.href = "./index.html";
            }
        } else {
            showLoginError();
            console.error("Error al enviar los datos");
        }
    });
});

function showLoginError() {
    loginElement.classList.add("animate__headShake");

    if (!loginErrDisplayed) {
        loginError.style.display = "flex";
        loginError.classList.add("animate__bounceInDown");

        loginElement.style.display = "flex";
        loginElement.classList.add("animate__headShake");
    } else {
        loginElement.classList.add("animate__headShake");
        loginError.classList.add("animate__heartBeat");
    }
}

loginElement.addEventListener("animationend", (event) => {
    event.target.classList.remove("animate__headShake");
});

loginError.addEventListener("animationend", (event) => {
    if (!loginErrDisplayed) {
        loginErrDisplayed = true;
        loginError.classList.remove("animate__bounceInDown");
    } else {
        loginError.classList.remove("animate__heartBeat");
    }
});
