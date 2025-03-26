import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const useCheckExists = (type, id) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      navigate("/not-found");
      return;
    }

    const checkExists = async () => {
      try {
        if (type === "board") {
          await axios.get(`http://localhost:8000/api/boards/${id}/exists`);
        } else if (type === "card") {
          await axios.get(`http://localhost:8000/api/cards/${id}/exists`);
        }
      } catch (error) {
        navigate("/not-found");
      }
    };

    checkExists();
  }, [type, id, navigate]);
};

export default useCheckExists;
