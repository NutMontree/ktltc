import Link from "next/link";
import DarkModeSwitcher from "./DarkModeSwitcher";
// import DropdownMessage from "./DropdownMessage";
// import DropdownNotification from "./DropdownNotification";
// import DropdownUser from "./DropdownUser";
import Image from "next/image";

const Header = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}) => {
  return (
    <header className="sticky top-0 z-999 flex w-full border-b border-stroke bg-white/80 backdrop-blur-md dark:border-strokedark dark:bg-boxdark/80">

    </header>
  );
};

export default Header;
