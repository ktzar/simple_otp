let totp = null;
const authLabel = "Some auth";
const getId = (id ) => document.getElementById(id);

function copyToClipboard() {
    const token = totp.generate();
    navigator.clipboard.writeText(token);
    showToast("Token copied to the clipboard");
}

function showToast(text) {
    getId("toast").style.display = "block";
    getId("toast").innerText = text;
    setTimeout(() => {
        getId("toast").style.display = "none";
    }, 2500);
}

function localStorageItemName() {
    if (document.location.hash.length > 1) {
        return '2fa_secret_' + document.location.hash;
    }
    return '2fa_secret';
}

function initApp() {
    const savedSecret = localStorage.getItem(localStorageItemName());
    if (savedSecret) {
        getId('secret').value = savedSecret;
        initTOTP(savedSecret, authLabel);
    }
}

// Load from localStorage on startup
window.onload = () => {
    window.addEventListener("hashchange", () => {
        document.location.reload();
    });
    initApp();
};

function saveSecret() {
    const secret = getId('secret').value.replace(/\s+/g, '').toUpperCase();
    localStorage.setItem(localStorageItemName(), secret);
    initTOTP(secret, authLabel);
}

function initTOTP(secret, label) {
    console.log("Initialising TOTP");
    try {
        totp = new OTPAuth.TOTP({
            issuer: 'Some org',
            label: label,
            algorithm: 'SHA1',
            digits: 6,
            period: 30,
            secret: secret
        });
        getId('display-area').style.display = 'block';
        updateToken();
    } catch (e) {
        alert("Invalid Secret Key format (Base32 required)");
    }
}

function updateToken() {
    if (!totp) return;
    const token = totp.generate();
    getId('token').innerText = token.slice(0,3) + ' ' + token.slice(3);

    const seconds = Date.now() / 1000 % 30;
    getId('progress').value = 30-seconds;
    if (seconds > 25) {
        getId('progress').classList.add('expiring');
    } else {
        getId('progress').classList.remove('expiring');
    }

    if (document.location.hash.length > 1) {
        getId("account-label").innerText = "Your code for " + document.location.hash;
    }
}

// Refresh every 100ms
setInterval(updateToken, 100);
