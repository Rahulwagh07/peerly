'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@peerly/ui-components';
import { FaGithub } from 'react-icons/fa';
import { GoArrowUpRight } from 'react-icons/go';
import { useTheme } from 'next-themes';

export function GithubBorder() {
  const { theme } = useTheme();
  return (
    <a href="https://github.com/rahulwagh07/peerly" target="_blank">
      <HoverBorderGradient
        containerClassName="rounded-full"
        theme={theme ?? 'dark'}
        className="z-20 pl-10 flex items-center justify-center gap-4 rounded-full bg-white/5 dark:text-white/80 py-2.5 text-sm"
      >
        <FaGithub className="h-4 w-4" />
        <div className="flex items-center justify-center">
          {' '}
          Star us on Github{' '}
          <GoArrowUpRight
            className="group-hover/anchor:opacity-90 items-center mt-1 w-[18px] h-[18px] opacity-0 transition"
            stroke="#ffffff"
          />
        </div>
      </HoverBorderGradient>
    </a>
  );
}

type Direction = 'TOP' | 'LEFT' | 'BOTTOM' | 'RIGHT';

export function HoverBorderGradient({
  children,
  theme,
  containerClassName,
  className,
  as: Tag = 'button',
  duration = 1,
  clockwise = true,
  ...props
}: React.PropsWithChildren<
  {
    as?: React.ElementType;
    theme: string;
    containerClassName?: string;
    className?: string;
    duration?: number;
    clockwise?: boolean;
  } & React.HTMLAttributes<HTMLElement>
>) {
  const [hovered, setHovered] = useState<boolean>(false);
  const [direction, setDirection] = useState<Direction>('TOP');

  const rotateDirection = (currentDirection: Direction): Direction => {
    const directions: Direction[] = ['TOP', 'LEFT', 'BOTTOM', 'RIGHT'];
    const currentIndex = directions.indexOf(currentDirection);
    const nextIndex = clockwise
      ? (currentIndex - 1 + directions.length) % directions.length
      : (currentIndex + 1) % directions.length;
    if (!directions[nextIndex]) {
      return directions[0]!;
    }
    return directions[nextIndex]!;
  };

  const movingMap: Record<Direction, string> = {
    TOP: 'radial-gradient(20.7% 50% at 50% 0%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)',
    LEFT: 'radial-gradient(16.6% 43.1% at 0% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)',
    BOTTOM:
      'radial-gradient(20.7% 50% at 50% 100%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)',
    RIGHT:
      'radial-gradient(16.2% 41.199999999999996% at 100% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)',
  };
  const highlightDark =
    'radial-gradient(75% 181.15942028985506% at 50% 50%, #3275F8 0%, rgba(255, 255, 255, 0) 100%)';

  const movingMapLight: Record<Direction, string> = {
    TOP: 'radial-gradient(20.7% 50% at 50% 0%, hsl(0, 0%, 100%) 0%, rgba(0,212,255,1) 100%)',
    LEFT: 'radial-gradient(16.6% 43.1% at 0% 50%, hsl(0, 0%, 100%) 0%, rgba(0,212,255,1) 100%)',
    BOTTOM:
      'radial-gradient(20.7% 50% at 50% 100%, hsl(0, 0%, 100%) 0%, rgba(0,212,255,1) 100%)',
    RIGHT:
      'radial-gradient(16.2% 41.199999999999996% at 100% 50%, hsl(0, 0%, 100%) 0%,rgba(0,212,255,1) 100%)',
  };

  const highlight =
    'radial-gradient(75% 181.15942028985506% at 50% 50%, #1e40af 0%, rgba(0,212,255,1)  100%)';
  useEffect(() => {
    if (!hovered) {
      const interval = setInterval(() => {
        setDirection((prevState) => rotateDirection(prevState));
      }, duration * 1000);
      return () => clearInterval(interval);
    }
  }, [hovered]);
  return (
    <Tag
      onMouseEnter={(event: React.MouseEvent<HTMLDivElement>) => {
        setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'relative h-min w-fit mt-10 transition duration-500 group/anchor flex items-center justify-center gap-4 rounded-full text-white/80 bg-white/5 text-sm',
        containerClassName,
      )}
      {...props}
    >
      <div
        className={cn(
          'z-10 w-auto rounded-[inherit] bg-white/5 px-4 py-2 text-white',
          className,
        )}
      >
        {children}
      </div>
      <motion.div
        className={cn(
          'absolute inset-0 z-0 flex-none overflow-hidden rounded-[inherit]',
        )}
        style={{
          filter: 'blur(2px)',
          position: 'absolute',
          width: '100%',
          height: '100%',
        }}
        initial={{
          background:
            theme === 'dark' ? movingMap[direction] : movingMapLight[direction],
        }}
        animate={{
          background: (() => {
            if (hovered) {
              return theme === 'dark'
                ? [movingMap[direction], highlightDark]
                : [movingMapLight[direction], highlight];
            } else {
              return theme === 'dark'
                ? movingMap[direction]
                : movingMapLight[direction];
            }
          })(),
        }}
        transition={{ ease: 'linear', duration: duration ?? 1 }}
      />
      <div className="z-1 absolute inset-[2px] flex-none rounded-[100px] bg-[#020617]" />
    </Tag>
  );
}
