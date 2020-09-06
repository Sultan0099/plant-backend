const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {

    try {

        //Extract Authorization Token
        const bearerToken = req.headers["authorization"];
        const token = bearerToken.split(" ")[1];
        const decoded = jwt.verify(token, 'mysecretkey');
        req.user = decoded;
        next();

    } catch (error) {
        res.status(401).json({
            error: "JWT error"
        });
    }


}

module.exports = authenticate;