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
import { HeartFilledIcon, SearchIcon } from "@/components/icons";
import { Logo } from "@/components/icons";
import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/link";
import NextLink from "next/link";
import DropdownPage from "./dropdownPage";

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
      <NextUINavbar>
        <NavbarContent>
          <NavbarBrand>
            <NextLink
              className="flex justify-start items-center gap-2"
              href="/"
            >
              <Logo />
              <div className="font-bold text-inherit pt-2">KTLTC</div>
            </NextLink>

            <ul className="hidden md:flex gap-6 justify-start ml-6">
              <DropdownPage />
            </ul>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent justify="end">
          <ThemeSwitch />
          <Button
            isExternal
            as={Link}
            className="text-sm font-normal text-default-600 bg-default-100"
            // href={siteConfig.links.sponsor}
            href="/Sponsor"
            startContent={<HeartFilledIcon className="text-danger" />}
            variant="flat"
          >
            Sponsor
          </Button>
          <NavbarMenuToggle />
        </NavbarContent>

        <NavbarMenu className=" ">
          {searchInput}
          <div className="max-25 mt-2 flex flex-col gap-2 ">
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
          </div>
        </NavbarMenu>
      </NextUINavbar>
    </>
  );
};
