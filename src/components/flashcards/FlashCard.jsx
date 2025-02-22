import React from 'react';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from "axios";
import { useAuthContext } from '../../contexts/AuthContext';

const CardComponent = ({id, name, imageUrl}) => {
  const { user } = useAuthContext();

  const deleteCard = async () => {
    try {
      if(user) {
        const config = {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        };
        const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/card/delete/${id}`, config);
        if(response?.status === 200) {
          toast.success("Card deleted successfully!");
        }
      }
    } catch(error) {
      console.error(error);
      toast.error(error?.message || "Failed to delete card");
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
      <h2 className="text-xl font-bold mb-3">{name.toUpperCase()}</h2>
      <img 
        src={imageUrl} 
        alt={name}
        className="w-48 h-48 object-cover rounded-md mb-3" 
      />
      <button
        onClick={deleteCard}
        className="text-red-500 hover:text-red-700 transition-colors"
        aria-label="Delete card"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
};

export default CardComponent;