import axios from "axios";

const BASE_URL = `${process.env.REACT_APP_API_URL}/intents`;

export const getIntents = async () => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("userId"),
  };
  const response = await axios.get(BASE_URL, { headers });
  return response.data;
};

export const createIntent = async (intent) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("userId"),
  };
  const response = await axios.post(BASE_URL, intent, { headers });
  return response.data;
};

export const updateIntent = async (intent) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("userId"),
  };
  const response = await axios.put(`${BASE_URL}/${intent.intentid}`, intent, {
    headers,
  });
  return response.data;
};

export const deleteIntent = async (id) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("userId"),
  };
  const response = await axios.delete(`${BASE_URL}/${id}`, { headers });
  return response.data;
};
