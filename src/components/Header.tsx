import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="flex justify-between items-center w-full mt-5 border-b-2 pb-7 sm:px-4 px-2">
      <Link href="/" className="flex space-x-2">
        <Image
          alt="header text"
          src="/window.svg"
          className="sm:w-12 sm:h-12 w-7 h-7"
          width={24}
          height={24}
        />
        <h1 className="sm:text-4xl text-2xl font-bold ml-2 tracking-tight">
          Astra
        </h1>
      </Link>
    </header>
  );
}
