import axios from "axios";

const BASE_URL = `${process.env.REACT_APP_API_URL}/chat`;

export const getChat = async (sessionId, message) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("userId"),
  };
  const response = await axios.post(
    BASE_URL,
    { sessionId, text: message },
    { headers }
  );
  return response.data;
};
