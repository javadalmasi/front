export const isEmail = input => {
    // Taken from https://emailregex.com
    const result = input.match(
        //eslint-disable-next-line
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
    return result;
};

export const checkPasswordStrength = password => {
    let strength = 0;
    let text = "";
    let textClass = "";

    // Length check (0-40 points)
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (password.length >= 16) strength += 10;

    // Character variety checks (0-40 points)
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[^a-zA-Z0-9]/.test(password);

    if (hasLowercase) strength += 5;
    if (hasUppercase) strength += 5;
    if (hasNumbers) strength += 5;
    if (hasSymbols) strength += 5;

    // Variety bonus (0-20 points)
    const varietyCount = [hasLowercase, hasUppercase, hasNumbers, hasSymbols].filter(Boolean).length;
    if (varietyCount >= 3) strength += 10;
    if (varietyCount >= 4) strength += 10;

    // Update UI based on strength
    if (strength < 40) {
        text = "رمز عبور ضعیف است";
        textClass = "text-red-500";
    } else if (strength < 75) {
        text = "رمز عبور متوسط است";
        textClass = "text-yellow-500";
    } else if (strength < 90) {
        text = "رمز عبور خوب است";
        textClass = "text-blue-500";
    } else {
        text = "رمز عبور قوی است";
        textClass = "text-green-500";
    }

    return {
        strength,
        text,
        textClass,
        barClass:
            strength < 40
                ? "bg-red-500"
                : strength < 75
                  ? "bg-yellow-500"
                  : strength < 90
                    ? "bg-blue-500"
                    : "bg-green-500",
    };
};

export const parseTimeParam = time => {
    let start = 0;
    if (/^[\d]*$/g.test(time)) {
        start = time;
    } else {
        const hours = /([\d]*)h/gi.exec(time)?.[1];
        const minutes = /([\d]*)m/gi.exec(time)?.[1];
        const seconds = /([\d]*)s/gi.exec(time)?.[1];
        if (hours) {
            start += parseInt(hours) * 60 * 60;
        }
        if (minutes) {
            start += parseInt(minutes) * 60;
        }
        if (seconds) {
            start += parseInt(seconds);
        }
    }
    return start;
};

export const truncateString = (str, maxLength) => {
    if (!str) return str;
    return str.length > maxLength ? str.substring(0, maxLength) + "..." : str;
};

// Function to measure text width in pixels
export const measureTextWidth = (text, font = "14px system-ui") => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.font = font;
    return ctx.measureText(text).width;
};

// Function to truncate text based on available width in pixels
export const truncateStringByWidth = (str, maxWidth, font = "14px system-ui") => {
    if (!str) return str;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.font = font;

    const ellipsis = "...";
    const ellipsisWidth = ctx.measureText(ellipsis).width;

    if (ellipsisWidth > maxWidth) {
        // If even the ellipsis is too wide, return empty string or single character
        return maxWidth > ctx.measureText("W").width ? ellipsis : "";
    }

    const fullWidth = ctx.measureText(str).width;
    if (fullWidth <= maxWidth) {
        return str;
    }

    // Binary search for the optimal length
    let low = 0;
    let high = str.length;
    let result = str;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const testStr = str.substring(0, mid) + ellipsis;
        const testWidth = ctx.measureText(testStr).width;

        if (testWidth <= maxWidth) {
            result = str.substring(0, mid) + (mid < str.length ? ellipsis : "");
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }

    return result;
};
