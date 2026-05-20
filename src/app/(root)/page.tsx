import Image from "next/image";
import UserButton from "../../../modules/authentication/components/user-button";
import { currentUser } from "../../../modules/authentication/actions";

export default async function Home() {
  const user = await currentUser()

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      Under Construction
    </div>
  );
}