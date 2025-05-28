import axios from "axios";
const BASE_URL = "http://127.0.0.1:5000/user";

export const sendMessage = async (messages) => {
  const res = await axios.post(`${BASE_URL}/chat`, { messages });
  return res.data.response;
};

export const sendVectorDB = async (queryText) => {
  const res = await axios.post(`${BASE_URL}/check`, {
    query_text: queryText,
  });
  return res.data;
};
