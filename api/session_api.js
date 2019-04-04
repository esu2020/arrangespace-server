let db = require('../db/database_mongo');

/**
 * @api {post} /login LogIn User
 * @apiName SessionLogin
 * @apiGroup Session
 *
 * @apiParam {String} access_token User access_token.
 * @apiParam {Object} user_data User Object.
 *
 * @apiExample Example User Object:
 *     {
 *       "access_token": "ya29.GlzcBkNmWxyefozXxA6gWeCoLfuNmp_U0_9dC7aRK7mRu2m0k7GV59Eo4yK4vWH-tn9QQ77AOmy62wdl5OxIWOsGcB7uZ8pdluO44VPdEqVkV5MGKpxV4oWrHd6wkw",
 *       "user_data": {
 *         "familyName": "Chia",
 *         "imageUrl": "https://lh3.googleusercontent.com/-CIJl6ntqVg4/AAAAAAAAAAI/AAAAAAAAABY/Jfd1E76bbhA/s96-c/photo.jpg",
 *         "name": "Gideon Chia",
 *         "googleId": "116550101409368732312",
 *         "email": "gideon.chia@gmail.com",
 *         "givenName": "Gideon"
 *       }
 *     }
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *  {
 *    {user-object}
 *  }
 */
exports.logIn = function (payload, request, response) {
  return new Promise(resolve => {
    db.createUser(payload, request, response).then(results => {
      if (!results.error) {
        resolve(results.user_data);
      } else {
        resolve(results);
      }
    });
  });
};

/**
 * @api {post} /logout LogOut User
 * @apiName SessionLogout
 * @apiGroup Session
 * @apiDescription Not Yet Implemented.
 *
 * @apiSuccess {String} message You are logged in.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *  {
 *    "message": "You are logged out."
 *  }
 */
exports.logOut = function (request) {
  // TODO: Make DB call
  let response = {
    message: 'You are logged out.'
  };

  return new Promise(resolve => {
    resolve(response);
  });
};
