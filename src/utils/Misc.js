export function checkPasswordStrength(password, i18n) {
    let strength = 0;
    let text = "";
    let textClass = "";

    if (password) {
        // Length check
        if (password.length >= 8) strength += 20;
        if (password.length >= 12) strength += 10;
        if (password.length >= 16) strength += 10;

        // Character variety
        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSymbols = /[^a-zA-Z0-9]/.test(password);

        if (hasLowercase) strength += 5;
        if (hasUppercase) strength += 5;
        if (hasNumbers) strength += 5;
        if (hasSymbols) strength += 5;

        const varietyCount = [hasLowercase, hasUppercase, hasNumbers, hasSymbols].filter(Boolean).length;
        if (varietyCount >= 3) strength += 10;
        if (varietyCount >= 4) strength += 10;
    }

    // Determine strength text and class
    if (strength < 40) {
        text = i18n.global.t("info.password_weak");
        textClass = "text-red-500";
    } else if (strength < 75) {
        text = i18n.global.t("info.password_fair");
        textClass = "text-yellow-500";
    } else if (strength < 90) {
        text = i18n.global.t("info.password_good");
        textClass = "text-blue-500";
    } else {
        text = i18n.global.t("info.password_strong");
        textClass = "text-green-500";
    }

    return {
        strength: strength,
        text: text,
        class: strength < 40 ? "bg-red-500" : strength < 75 ? "bg-yellow-500" : strength < 90 ? "bg-blue-500" : "bg-green-500",
        textClass: textClass,
    };
}

export function parseTimeParam(time) {
    var a = time.split(":");
    if (a.length == 1) return parseInt(a[0]);
    else if (a.length == 2) return parseInt(a[0]) * 60 + parseInt(a[1]);
    else if (a.length == 3) return parseInt(a[0]) * 3600 + parseInt(a[1]) * 60 + parseInt(a[2]);
}

export function truncateStringByWidth(str, width) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = "14px Vazirmatn";
    let truncated = str;
    if (context.measureText(truncated).width > width) {
        while (context.measureText(truncated + "...").width > width) {
            truncated = truncated.slice(0, -1);
        }
        truncated += "...";
    }
    return truncated;
}

export function toPersianDigits(n) {
    const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return n.toString().replace(/\d/g, x => persianDigits[x]);
}
