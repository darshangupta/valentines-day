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
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [easterEggFading, setEasterEggFading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const yesButtonRef = useRef<HTMLButtonElement>(null);
  const noButtonRef = useRef<HTMLButtonElement>(null);
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
    if (!isMounted) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const container = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - container.left;
      const mouseY = e.clientY - container.top;

      let buttonCenterX: number;
      let buttonCenterY: number;

      if (noButtonPos === null) {
        // Button is still inline - get its position from the ref
        const noButton = noButtonRef.current?.getBoundingClientRect();
        if (!noButton) return;
        buttonCenterX = noButton.left - container.left + noButton.width / 2;
        buttonCenterY = noButton.top - container.top + noButton.height / 2;
      } else {
        // Button is absolute positioned
        buttonCenterX = noButtonPos.x + BUTTON_WIDTH / 2;
        buttonCenterY = noButtonPos.y + BUTTON_HEIGHT / 2;
      }

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

  const handleYesClick = () => {
    setShowEasterEgg(true);
    setEasterEggFading(false);
    // Start shatter after 1.5 seconds
    setTimeout(() => {
      setEasterEggFading(true);
    }, 1500);
    // Hide completely and show modal after shatter completes
    setTimeout(() => {
      setShowEasterEgg(false);
      setEasterEggFading(false);
      setIsModalOpen(true);
    }, 3000);
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
            onClick={handleYesClick}
            className="bg-primary hover:bg-primary/90 text-white text-xl px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Yes
          </Button>

          {noButtonPos === null ? (
            <Button
              ref={noButtonRef}
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

      {showEasterEgg && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-1000 ${
            easterEggFading ? "bg-black/0" : "bg-black/80"
          }`}
        >
          {!easterEggFading ? (
            <img
              src="/easter-egg.JPG"
              alt="Easter egg"
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in fade-in zoom-in duration-300"
            />
          ) : (
            <div className="relative" style={{ width: "min(90vw, 500px)", height: "min(90vh, 667px)" }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div
                  key={i}
                  className={`shatter-piece shatter-${i} rounded-lg`}
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundImage: "url(/easter-egg.JPG)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ))}
            </div>
          )}
        </div>
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
                href="https://dirtyhabitdc.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold hover:underline"
              >
                Dirty Habit
              </a>
            </DialogDescription>
            <p className="text-lg text-foreground">
              Then chocolate covered strawberries (and strawberry palomas)
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
