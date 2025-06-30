import axios from "axios";

const BASE_URL = `${process.env.REACT_APP_API_URL}/chat`;

export const getChat = async (sessionId, message) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: "684d43c3234f6819aae4d80e",
  };
  const response = await axios.post(
    BASE_URL,
    { sessionId, text: message },
    { headers }
  );
  return response.data;
};
