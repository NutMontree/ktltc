import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarMenuItem,
} from "@nextui-org/navbar";
import { Kbd } from "@nextui-org/kbd";
import { Input } from "@nextui-org/input";
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { SearchIcon } from "@/components/icons";
import { Logo } from "@/components/icons";
import { Link } from "@nextui-org/link";
import NextLink from "next/link";
import DropdownPage from "./dropdownPage";
import DropdownPage2 from "./navmanu/Dropdown";
import DropdownPage1 from "./navmanu/Dropdown";

export const Navbar = () => {
  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={<Kbd keys={["option", "command"]}>K</Kbd>}
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  return (
    <>
      <NextUINavbar maxWidth={"full"} className="py-2">
        <NavbarContent>
          <NavbarBrand>
            <NextLink
              className="flex justify-start items-center gap-2"
              href="/"
            >
              <Logo />
              <div className=" ">
                <div className="hidden sm:flex text-xs ">
                  วิทยาลัยเทคนิคกันทรลักษ์
                </div>
                <div className="font-bold text-inherit">KTLTC</div>
              </div>
            </NextLink>

            <ul className="hidden lg:flex gap-6 justify-start ml-6">
              <DropdownPage />
            </ul>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent justify="end">
          <ThemeSwitch />
          <NavbarMenuToggle />
        </NavbarContent>

        <NavbarMenu className="pt-5">
          {searchInput}
          {/* <div className="max-25 mt-2 flex flex-col gap-2 ">
            {siteConfig.navMenuItems.map((item, index) => (
              <NavbarMenuItem key={`${item}-${index}`}>
                <Link
                  color={
                    index === 0
                      ? "primary"
                      : index === siteConfig.navMenuItems.length - 5
                      ? "danger"
                      : "foreground"
                  }
                  href={item.href}
                >
                  {item.label}
                </Link>
              </NavbarMenuItem>
            ))}
          </div> */}

          <div>
            <DropdownPage1 />
          </div>
        </NavbarMenu>
      </NextUINavbar>
    </>
  );
};
