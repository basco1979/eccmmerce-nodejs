const   expressjwt = require('express-jwt');

function authJwt(){
    const secret = process.env.SECRET
    const api = process.env.API_URL
    return expressjwt({
        secret,
        algorithms : ['HS256'],
        isRevoked : isRevoked
    }).unless({
        path : [
            {url : /\/public\/uploads(.*)/, method : ['GET', 'OPTIONS']},
            {url : /\/api\/v1\/products(.*)/, method : ['GET', 'OPTIONS']},
            {url : /\/api\/v1\/categories(.*)/, method : ['GET', 'OPTIONS']},
            `${api}/users/login`,
            `${api}/users/register`,
        ]
    })
}

    async function isRevoked(req, payload, done){
        if(!payload.isAdmin){
            done(null, true)
        }
        done();
    }

module.exports = authJwt;
