import axios from "axios";
const BASE_URL = "http://192.168.0.21:8000";

export const sendMessage = async (messages) => {
  const res = await axios.post(`${BASE_URL}/chat`, { messages });
  return res.data.response;
};

export const sendPairwiseCheck = async (queryText) => {
  const res = await axios.post(`${BASE_URL}/pairwise-check`, {
    query_text: queryText,
  });
  return res.data;
};
