class AppError extends Error {
  constructor(config = { code: '01', name: 'AppError' }, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }

    this.name = config.name || 'CustomError';
    // Custom debugging information
    this.code = config.code || '01'; //Decide on custom error later
    this.error_ts = Date.now();
  }
}


const ErrorUtils = {};
ErrorUtils.throwError = function (_message, _config) {
  let em = _message || 'Some error occured';
  throw new AppError(_config, em);
}

ErrorUtils.isAppError = function (error_object) {
  return error_object instanceof AppError;
}

ErrorUtils.handleError = function (optional_deferred_object, error_object) {
  //Do some logging and all here on the error object
  let em = error_object.message;
  if(!ErrorUtils.isAppError(error_object)) {
    em = "Service error."; //This is so we don't inadvertently return params.x is undefined like errors to the user
    error_object.message = em;
    error_object.code = '01';
  }
  if(optional_deferred_object && optional_deferred_object.reject) {
    optional_deferred_object.reject(error_object);
  }
}

module.exports = ErrorUtils;

// const q = require('q');
// function a(n) {
//   const d = q.defer();
//   const b = {};
//   q.fcall( () => {
//     if(n % 2 !== 0) {
//       ErrorUtils.throwError("N should be divisible by 2", {});
//     } else {
//       b.m.j = 2;
//       d.resolve(1)
//     }
//   })
//   .catch(e => {
//     ErrorUtils.handleError(d, e);
//   })

//   return d.promise;
// }
// a(2).then(x=>{
//   //console.log(x)
// }).catch(e => { 
//   console.dir(e); 
//   //console.log(e.code, e.message);
// })