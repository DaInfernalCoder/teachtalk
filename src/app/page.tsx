import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { LogIn } from "lucide-react";
import FileUpload from "@/components/FileUpload";

export default async function Home() {
  const { userId } = auth();
  const isAuth = !!userId;

  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-gray-700 to-black">
      <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-yellow-300">
        <div className="flex flex-col items-center text-center">
          <h1 className="mr-3 text-5xl font-semibold">Talk With Any PDF</h1>
          <UserButton afterSignOutUrl="/"></UserButton>

          <div className="flex mt-2">
            {isAuth && (
              <Link href="/chat/1/">
                <Button>Go to Chats</Button>
              </Link>
            )}
          </div>

          <p className="max-w-xl mt-1 text-lg text-yellow-300">
            Unlock deeper understanding and retention with AI-powered
            interactive conversations.
          </p>

          <div className="w-full mt-4">
            {isAuth ? (
              <h1>
                <FileUpload />
              </h1>
            ) : (
              <Link href="/sign-in">
                <Button>
                  {" "}
                  Login to Get Started
                  <LogIn className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
