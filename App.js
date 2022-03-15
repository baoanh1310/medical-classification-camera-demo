import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Button, Image, StyleSheet, Text, View } from 'react-native';
import axios from 'axios';
const API_URL = 'http://bk-ocr.ai/medical_classifier/predict/';

import { constants } from './constants.js';

async function callOCRAsync(cameraResult) {

  let localUri = cameraResult.uri;
  let filename = localUri.split('/').pop();
  let match = /\.(\w+)$/.exec(filename);
  let type = match ? `image/${match[1]}` : `image`;
  let formData = new FormData();
  formData.append('file', { uri: localUri, name: filename, type });

  const response = await fetch(API_URL, {
    method: 'POST',
    body: formData,
    headers: {
      'content-type': 'multipart/form-data'
    }
  });
  
  const result = await response.json();
  console.log('callOCRAsync -> result', result);

  return result;
}

export default function App() {
  const [image, setImage] = React.useState(null);
  const [status, setStatus] = React.useState(null);
  const [detail, setDetail] = React.useState(null);
  const [permissions, setPermissions] = React.useState(false);

  const askPermissionsAsync = async () => {
    let permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    } else {
      setPermissions(true);
    }
  };

  const takePictureAsync = async () => {
    const cameraResult = await ImagePicker.launchCameraAsync({
      base64: true,
    });

    if (!cameraResult.cancelled) {
      setImage(cameraResult.uri);
      setStatus('Loading...');
      try {
        const result = await callOCRAsync(cameraResult);
        const classifier_number = result["classifier_number"];
        const deviceName = constants[classifier_number];
        setStatus(deviceName);
        if (result["ocr_result"] !== null) {
          switch (classifier_number) {
            case 0:
              break;
            case 1:
              break;
            case 2:
              break;
            case 3:
              break;
            case 4:
              let degree = result["ocr_result"].toString().concat(" °C");
              setDetail(degree);
              break;
          }
        }
      } catch (error) {
        setStatus(`Error: ${error.message}`);
      }
    } else {
      setImage(null);
      setStatus(null);
      setDetail(null);
    }
  };

  return (
    <View style={styles.container}>
      {permissions === false ? (
        <Button onPress={askPermissionsAsync} title="Ask permissions" />
      ) : (
        <>
          {image && <Image style={styles.image} source={{ uri: image }} />}
          {status && <Text style={styles.text}>{status}</Text>}
          {detail && <Text style={styles.text}>{detail}</Text>}
          <Button onPress={takePictureAsync} title="Take a Picture" />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 300,
    height: 300,
  },
  text: {
    margin: 5,
  },
});