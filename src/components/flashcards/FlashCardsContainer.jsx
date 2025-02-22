import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from "axios";
import { useAuthContext } from '../../contexts/AuthContext';
import CardComponent from './FlashCard';

const FlashCardsContainer = () => {
  const [cards, setCards] = useState([]);
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchAllCards = async () => {
      try {
        if(user) {
          const config = {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          };
          const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/card/`, config);
          if(response?.status === 200 && response.data) {
            setCards(response.data.cards);
          }
        }
      } catch(error) {
        console.error(error);
        toast.error(error?.message || "Failed to fetch cards");
      }
    };

    fetchAllCards();
  }, [user, cards]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {cards?.length > 0 ? (
        cards.map((card) => (
          <CardComponent 
            key={card._id} 
            id={card._id} 
            name={card.name} 
            imageUrl={card.imageUrl} 
          />
        ))
      ) : (
        <div className="col-span-full text-center">
          <h1 className="text-2xl font-bold text-gray-600">No cards present</h1>
        </div>
      )}
    </div>
  );
};

export default FlashCardsContainer;