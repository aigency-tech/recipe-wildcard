import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';

export async function pickImage(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== 'granted') {
    throw new Error('Permission to access photos was denied');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return result.assets[0].uri;
}

export async function takePhoto(): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();

  if (status !== 'granted') {
    throw new Error('Permission to access camera was denied');
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return result.assets[0].uri;
}

export async function uploadImage(uri: string, recipeId: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  const fileExt = uri.split('.').pop() || 'jpg';
  const fileName = `${recipeId}.${fileExt}`;
  const filePath = `recipe-images/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('recipe-images')
    .upload(filePath, blob, {
      contentType: `image/${fileExt}`,
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('recipe-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function deleteImage(imageUrl: string): Promise<void> {
  const path = imageUrl.split('/recipe-images/')[1];
  if (!path) return;

  const { error } = await supabase.storage
    .from('recipe-images')
    .remove([`recipe-images/${path}`]);

  if (error) throw error;
}
