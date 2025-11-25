"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Image } from "@heroui/image";

const transition = {};

export const MenuItem1 = ({
  setActive,
  active,
  item,
  children,
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
}) => {
  return (
    <div onMouseEnter={() => setActive(item)} className=" ">
      <motion.div>{item}</motion.div>
      {active !== null && (
        <motion.div>
          {active === item && (
            <div>
              <motion.div
                transition={transition}
                layoutId=" " // layoutId ensures smooth animation
                className=" "
              >
                <motion.div
                  layout // layout ensures smooth animation
                  className="p-2"
                >
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const Menu1 = ({
  setActive,
  children,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
}) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)} // resets the state
      className="px-8"
    >
      {children}
    </nav>
  );
};

export const ProductItem = ({
  title,
  description,
  href,
  src,
}: {
  title: string;
  description: string;
  href: string;
  src: string;
}) => {
  return (
    <Link href={href} className=" ">
      <Image src={src} className=" " />
      <div>
        <h4 className=" ">{title}</h4>
        <p className=" ">{description}</p>
      </div>
    </Link>
  );
};

export const HoveredLink1 = ({ children, ...rest }: any) => {
  return (
    <Link
      {...rest}
      className="text-neutral-700 hover:text-sky-600 dark:text-neutral-200 dark:hover:text-sky-700"
    >
      <div className="px-2 py-2">{children}</div>
    </Link>
  );
};
