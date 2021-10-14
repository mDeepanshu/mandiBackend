class Formatter {
    static format(body, statusCode) {
        switch (statusCode) {
            case 400:
                return {
                    status: 400,
                    title: "Bad Request",
                    message: body
                }
            case 200:
                return {
                    status: 200,
                    title: "Successful",
                    message: body
                }
            case 500:
                return {
                    statusCode: 500,
                    title: "Internal Server Error",
                    message: body
                }
            default:
                return {
                    status: statusCode,
                    title: `status - ${statusCode}`,
                    message: body
                }

        }
    }

    static nextDate(yyyy, mm, dd) {
        console.log(yyyy)
        if (yyyy == null) return "year is wrong"
        if (mm == null) return "month is wrong"
        if (dd == null) return "date is wrong"
        if (yyyy < 2000 || 4000 < yyyy) return "year is wrong";
        if (mm < 1 || 12 < mm) return "month is wrong";
        let days;
        switch (mm) {
            case 4:
            case 6:
            case 9:
            case 11:
                days = 31;
                break;
            case 2:
                if (yyyy % 4 === 0)
                    days = 29;
                else days = 28;
                break;
            default:
                days = 31;
                break;
        }
        if (dd < 1 || days < dd) return "date is wrong";

        dd = dd < days ? parseInt(dd) + 1 : 1;
        mm = dd === 1 ? parseInt(mm) + 1 : mm;
        mm = mm <= 12 ? mm : 1;
        yyyy = mm === 1 ? parseInt(yyyy) + 1 : yyyy;

        return {
            dd: dd,
            mm: mm,
            yyyy: yyyy
        }

    }

}


module.exports = Formatter
