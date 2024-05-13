logoutButton.addEventListener("click", () => {
    sendJSONToNode({}, "http://localhost:3500/logout", (xhr) => {
        if (xhr.status >= 200 && xhr.status < 300) {
            console.log('pastel')
            window.location.href = '/login.html';
        } else {
            console.log("Error on logout!");
        }
    });
});