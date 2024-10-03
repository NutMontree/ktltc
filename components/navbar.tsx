"use client";
import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
} from "@nextui-org/navbar";
import { Kbd } from "@nextui-org/kbd";
import { Input } from "@nextui-org/input";
import { ThemeSwitch } from "@/components/theme-switch";
import { SearchIcon } from "@/components/icons";
import { Logo } from "@/components/icons";
import NextLink from "next/link";
import DropdownPage from "./dropdownPage";
import DropdownPage1 from "./navmanu/Dropdown";
import { IconBrandFacebook } from "@tabler/icons-react";
import Link from "next/link";

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

  const links = [
    {
      title: "Facebook",
      icon: (
        <IconBrandFacebook className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://www.facebook.com/profile.php?id=100004276455648",
    },
  ];

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
          <div className=" ">
            <Link
              title="Facebook"
              href="https://www.facebook.com/profile.php?id=100004276455648"
            >
              <IconBrandFacebook className="h-full w-full text-neutral-500 dark:text-neutral-300" />
            </Link>
          </div>
          <ThemeSwitch />
          <NavbarMenuToggle />
        </NavbarContent>

        <NavbarMenu className="pt-5">
          {searchInput}
          <div>
            <DropdownPage1 />
          </div>
        </NavbarMenu>
      </NextUINavbar>
    </>
  );
};
