import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import EmojiMaker from "../components/EmojiMaker";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center p-4">
      <main className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Emoji Maker</h1>
        <SignedIn>
          <EmojiMaker />
        </SignedIn>
        <SignedOut>
          <div className="text-center">
            <p className="mb-4">Please sign in to use the Emoji Maker</p>
            <SignInButton mode="modal">
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                Sign In
              </button>
            </SignInButton>
          </div>
        </SignedOut>
      </main>
    </div>
  );
}
