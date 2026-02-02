"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const THRESHOLD = 100;
const BUTTON_WIDTH = 100;
const BUTTON_HEIGHT = 44;
const PADDING = 20;

export function ValentineCard() {
  const [noButtonPos, setNoButtonPos] = useState<{ x: number; y: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const yesButtonRef = useRef<HTMLButtonElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getNewSafePosition = useCallback(() => {
    if (!containerRef.current) return { x: 0, y: 0 };

    const container = containerRef.current.getBoundingClientRect();
    const yesButton = yesButtonRef.current?.getBoundingClientRect();
    const title = titleRef.current?.getBoundingClientRect();

    const maxX = container.width - BUTTON_WIDTH - PADDING;
    const maxY = container.height - BUTTON_HEIGHT - PADDING;

    let attempts = 0;
    let newX: number, newY: number;

    do {
      newX = PADDING + Math.random() * (maxX - PADDING);
      newY = PADDING + Math.random() * (maxY - PADDING);
      attempts++;

      const noButtonRect = {
        left: newX,
        right: newX + BUTTON_WIDTH,
        top: newY,
        bottom: newY + BUTTON_HEIGHT,
      };

      const overlapsYes = yesButton && !(
        noButtonRect.right < yesButton.left - container.left - 20 ||
        noButtonRect.left > yesButton.right - container.left + 20 ||
        noButtonRect.bottom < yesButton.top - container.top - 20 ||
        noButtonRect.top > yesButton.bottom - container.top + 20
      );

      const overlapsTitle = title && !(
        noButtonRect.right < title.left - container.left - 20 ||
        noButtonRect.left > title.right - container.left + 20 ||
        noButtonRect.bottom < title.top - container.top - 20 ||
        noButtonRect.top > title.bottom - container.top + 20
      );

      if (!overlapsYes && !overlapsTitle) {
        break;
      }
    } while (attempts < 50);

    return { x: newX, y: newY };
  }, []);

  useEffect(() => {
    if (isMounted && noButtonPos === null) {
      setNoButtonPos(getNewSafePosition());
    }
  }, [isMounted, noButtonPos, getNewSafePosition]);

  useEffect(() => {
    if (!isMounted) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || noButtonPos === null) return;

      const container = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - container.left;
      const mouseY = e.clientY - container.top;

      const buttonCenterX = noButtonPos.x + BUTTON_WIDTH / 2;
      const buttonCenterY = noButtonPos.y + BUTTON_HEIGHT / 2;

      const distance = Math.sqrt(
        Math.pow(mouseX - buttonCenterX, 2) + Math.pow(mouseY - buttonCenterY, 2)
      );

      if (distance < THRESHOLD) {
        setNoButtonPos(getNewSafePosition());
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [noButtonPos, isMounted, getNewSafePosition]);

  const handleNoClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setNoButtonPos(getNewSafePosition());
  };

  if (!isMounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-2xl text-primary animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden"
    >
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
        <h1
          ref={titleRef}
          className="text-4xl md:text-6xl font-bold text-center text-primary drop-shadow-lg"
        >
          Will you be my Valentine?
        </h1>

        <div className="flex gap-4 items-center">
          <Button
            ref={yesButtonRef}
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white text-xl px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Yes
          </Button>

          {noButtonPos === null ? (
            <Button
              onClick={handleNoClick}
              onTouchStart={handleNoClick}
              variant="outline"
              className="text-xl px-8 py-6 rounded-full border-2 border-primary text-primary hover:bg-primary/10 transition-all duration-300"
            >
              No
            </Button>
          ) : null}
        </div>
      </div>

      {noButtonPos !== null && (
        <Button
          onClick={handleNoClick}
          onTouchStart={handleNoClick}
          variant="outline"
          className="absolute text-xl px-8 py-6 rounded-full border-2 border-primary text-primary hover:bg-primary/10 transition-all duration-300"
          style={{
            left: noButtonPos.x,
            top: noButtonPos.y,
            transition: "left 0.2s ease-out, top 0.2s ease-out",
          }}
        >
          No
        </Button>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white border-2 border-primary">
          <DialogHeader>
            <DialogTitle className="text-2xl md:text-3xl text-primary text-center">
              You are cordially invited
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-center py-4">
            <DialogDescription className="text-lg text-foreground">
              to dinner at{" "}
              <a
                href="LINK_PLACEHOLDER"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold hover:underline"
              >
                Dirty Habit
              </a>
            </DialogDescription>
            <p className="text-lg text-foreground">
              Then chocolate covered strawberries and espresso martinis
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
