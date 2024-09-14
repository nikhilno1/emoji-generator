import { supabase } from './supabase'

export async function createOrGetUserProfile(userId: string) {
  // Check if the user profile already exists
  const { data: existingProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching user profile:', fetchError)
    throw fetchError
  }

  if (existingProfile) {
    return existingProfile
  }

  // If the profile doesn't exist, create a new one
  const { data: newProfile, error: insertError } = await supabase
    .from('profiles')
    .insert([
      {
        user_id: userId,
        credits: 3,
        tier: 'free'
      }
    ])
    .single()

  if (insertError) {
    console.error('Error creating user profile:', insertError)
    throw insertError
  }

  return newProfile
}