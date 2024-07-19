/* eslint-disable camelcase */
const axios = require('axios');

exports.facebook = async (access_token) => {
  const fields = 'id, name, email, picture';
  const url = 'https://graph.facebook.com/me';
  const params = { access_token, fields };
  const response = await axios.get(url, { params });
  const {
    id, name, email, picture,
  } = response.data;
  return {
    service: 'facebook',
    picture: picture.data.url,
    id,
    name,
    email,
  };
};

exports.google = async (access_token) => {
  const url = 'https://www.googleapis.com/oauth2/v3/userinfo';
  const params = { access_token };
  const response = await axios.get(url, { params });
  const {
    sub, name, email, picture,
  } = response.data;
  return {
    service: 'google',
    picture,
    id: sub,
    name,
    email,
  };
};

exports.googleAccessToken = async (auth_code) => {

  try{
      const url = 'https://oauth2.googleapis.com/token';
      const params = {
        client_id: google.client_id,
        client_secret: google.client_secret,
        code: auth_code,
        grant_type: "authorization_code",
        redirect_uri: "",
      };
      
      const response = await axios.post(url, params );
      
      return {status: 0, data: response.data};
  } catch(error){
    return {status: 1, message: error.message};
  }
 
};