import { createContext, useContext } from "react";

interface SlideContextValue {
  slideNum: number;
  goTo: (index: number) => void;
  stepOverride?: number;
}

export const SlideContext = createContext<SlideContextValue>({
  slideNum: 0,
  goTo: () => {},
});

export function useSlideNum(): number {
  return useContext(SlideContext).slideNum;
}

export function useGoTo(): (index: number) => void {
  return useContext(SlideContext).goTo;
}
