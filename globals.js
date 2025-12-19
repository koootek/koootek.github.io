const DEV_MODE = false;

if (DEV_MODE) {
    document.querySelectorAll("*").forEach(element => {
        element.style.animation = "none";
    });
}

// Export readCookie
var readCookie = function(name) {
    name = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(name))
            return cookie.substring(name.length);
    }
    return null;
};

