"use client";
import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
} from "@nextui-org/navbar";
import { ThemeSwitch } from "@/components/theme-switch";
import { Logo } from "@/components/icons";
import { IconBrandFacebook } from "@tabler/icons-react";
import Link from "next/link";
import { DropdownPage } from "./dropdownPage";
import { DropdownPage1 } from "./navmanu/Dropdown";
import React from "react";

import {
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
} from "@nextui-org/react";

export const NavbarPage = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  return (
    <>
      <NextUINavbar
        maxWidth={"full"}
        className="py-2"
        onMenuOpenChange={setIsMenuOpen}
      >
        <NavbarContent>
          <NavbarBrand>
            <Link className="flex justify-start items-center gap-2" href="/">
              <Logo />
              <div className=" ">
                <div className="hidden sm:flex text-xs ">
                  วิทยาลัยเทคนิคกันทรลักษ์
                </div>
                <div className="font-bold text-inherit">KTLTC</div>
              </div>
            </Link>

            <ul className="hidden lg:flex gap-6 justify-start">
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
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden"
          />
          {/* *************************************************** */}
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="secondary"
                name="Jason Hughes"
                size="sm"
                src="/images/logo.webp"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem href="/" key="home">
                Home
              </DropdownItem>
              <DropdownItem href="/about" key="about">
                About
              </DropdownItem>
              <DropdownItem href="/contact" key="contact">
                Contact
              </DropdownItem>

              <DropdownItem key="/logout" color="danger">
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
          {/* *************************************************** */}
        </NavbarContent>

        <NavbarMenu className="pt-5">
          <div className="pt-[30px] text-center text-red-600 text-xl">
            กด X เพื่อออก
          </div>
          {/* {searchInput} */}
          <div>
            <DropdownPage1 />
          </div>
        </NavbarMenu>
      </NextUINavbar>
    </>
  );
};
