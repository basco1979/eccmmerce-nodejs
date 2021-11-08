function errorHandler(error, req, res, next){

    //jwt authentication error 
    if(error.name === 'UnauthorizerError'){
        res.status(401).json({message : 'The user is not authorized'})
      }

      //validation error
      if(error.name === 'ValidationError'){
        res.status(401).json({message : error})
      }

      //default to 500 server error
     return res.status(500).json(error)
}

module.exports = errorHandler;