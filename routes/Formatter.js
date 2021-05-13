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
        }
    }
}

module.exports = Formatter
