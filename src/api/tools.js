import axios from "axios";

const BASE_URL = `${process.env.REACT_APP_API_URL}/tools`;

export const getTools = async () => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: "684d43c3234f6819aae4d80e",
  };
  const response = await axios.get(BASE_URL, { headers });
  return response.data;
};

export const createTool = async (tool) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: "684d43c3234f6819aae4d80e",
  };
  const response = await axios.post(BASE_URL, { tool }, { headers });
  return response.data;
};

export const updateTool = async (tool) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: "684d43c3234f6819aae4d80e",
  };
  const response = await axios.put(
    `${BASE_URL}`,
    {
      updatedTool: tool,
      name: tool.name,
    },
    { headers }
  );
  return response.data;
};

export const deleteTool = async (name) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: "684d43c3234f6819aae4d80e",
  };
  const response = await axios.delete(`${BASE_URL}/${name}`, { headers });
  return response.data;
};
