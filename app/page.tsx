import { auth } from "@clerk/nextjs/server";
import { createOrGetUserProfile } from "../lib/user-profile";
import EmojiMaker from "../components/EmojiMaker";

export default async function Home() {
  const { userId } = auth();

  let userProfile = null;
  if (userId) {
    try {
      userProfile = await createOrGetUserProfile(userId);
    } catch (error) {
      console.error("Error creating/getting user profile:", error);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center p-4">
      <main className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Emoji Maker</h1>
        {userId ? (
          <>
            <p className="mb-4">Welcome, user! You have {userProfile?.credits} credits.</p>
            <EmojiMaker userId={userId} />
          </>
        ) : (
          <div className="text-center">
            <p className="mb-4">Please sign in to use the Emoji Maker</p>
            {/* Your existing sign-in button */}
          </div>
        )}
      </main>
    </div>
  );
}
