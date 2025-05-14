import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';

const AddressAutocomplete = ({ onSelectAddress, placeholder }) => {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [showPredictions, setShowPredictions] = useState(false);

  useEffect(() => {
    if (query.length > 2) {
      fetchPredictions();
    } else {
      setPredictions([]);
    }
  }, [query]);

  const fetchPredictions = async () => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          query
        )}&key=AIzaSyDbv7vak9FAXNNZTPyqfIaxY9R2TGvy99o&components=country:il`
      );

      if (response.data.predictions) {
        setPredictions(response.data.predictions);
        setShowPredictions(true);
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  const handleSelectAddress = async (placeId) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address&key=AIzaSyDbv7vak9FAXNNZTPyqfIaxY9R2TGvy99o`
      );

      if (response.data.result) {
        const { formatted_address, geometry } = response.data.result;
        onSelectAddress({
          address: formatted_address,
          location: {
            latitude: geometry.location.lat,
            longitude: geometry.location.lng,
          },
        });
        setQuery(formatted_address);
        setShowPredictions(false);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder={placeholder || 'הזן כתובת...'}
        placeholderTextColor="#666"
      />
      {showPredictions && predictions.length > 0 && (
        <FlatList
          style={styles.predictionsList}
          data={predictions}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.predictionItem}
              onPress={() => handleSelectAddress(item.place_id)}
            >
              <Text style={styles.predictionText}>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 1000,
    elevation: 1000,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: 'white',
    textAlign: 'right',
    elevation: 1,
  },
  predictionsList: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxHeight: 200,
    zIndex: 1000,
  },
  predictionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  predictionText: {
    fontSize: 14,
    textAlign: 'right',
  },
});

export default AddressAutocomplete; 