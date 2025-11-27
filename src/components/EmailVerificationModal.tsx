"use client";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export interface EmailVerificationModalProps {
  open: boolean;
  onClose: (open: boolean) => void;
  email?: string;
  onVerify?: (code: string) => void;
  onResend?: () => void;
}

export function EmailVerificationModal({ open, onClose, email, onVerify, onResend }: EmailVerificationModalProps) {
  const [code, setCode] = React.useState<string[]>(["", "", "", "", "", ""]);
  const inputs = React.useRef<Array<HTMLInputElement | null>>([]);
  const [isSmUp, setIsSmUp] = React.useState<boolean>(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => setIsSmUp(e.matches);
    // set initial
    setIsSmUp(mq.matches);
    // add listener
    if (mq.addEventListener) mq.addEventListener("change", onChange as any);
    else mq.addListener(onChange as any);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange as any);
      else mq.removeListener(onChange as any);
    };
  }, []);

  const handleChange = (i: number, val: string) => {
    if (/^[0-9]?$/.test(val)) {
      const newCode = [...code];
      newCode[i] = val;
      setCode(newCode);
      if (val && i < 5) inputs.current[i + 1]?.focus();
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handleVerify = () => {
    onVerify && onVerify(code.join(""));
  };

  // Render a sheet on small screens and a centered dialog on larger screens.
  return (
    <>
      {!isSmUp && (
        <Sheet open={open} onOpenChange={onClose}>
          <SheetContent side="bottom" className="block sm:hidden bg-[#19191d] border-0 p-0 rounded-t-2xl shadow-2xl">
          <Card className="bg-[#19191d] border-none shadow-none p-0">
            <div className="flex flex-col items-center gap-2 pt-4 pb-2 px-4">
              <div className="w-16 h-10 bg-[#e5e5e5] rounded-md mb-2" />
              <CardTitle className="text-center text-lg font-semibold text-white">Check your email</CardTitle>
              <div className="text-center text-muted-foreground text-sm font-normal mt-2">
                Enter the 6 digit verification code sent to
                <br />
                <span className="font-medium"> {email}</span>
              </div>
            </div>
            <CardContent className="flex flex-col items-center gap-6 pt-2 pb-6 px-4">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleVerify();
                }}
                className="w-full flex flex-col items-center gap-6"
              >
                <div className="flex gap-3 justify-center w-full">
                  {code.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { inputs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="w-12 h-12 text-xl text-center rounded-md bg-[#23243a] border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      value={digit}
                      onChange={e => handleChange(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                    />
                  ))}
                </div>
                <div className="text-center text-muted-foreground text-sm">
                  Didn't get your code?{' '}
                  <button type="button" className="text-primary underline" onClick={onResend}>
                    Resend code
                  </button>
                </div>
                <Button type="submit" className="w-full bg-[#6c5dd3] text-white text-base font-semibold py-3 rounded-md mt-2">
                  Verify
                </Button>
              </form>
            </CardContent>
          </Card>
          <SheetClose asChild>
            <button className="sr-only">Close</button>
          </SheetClose>
        </SheetContent>
        </Sheet>
      )}

      {isSmUp && (
        <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="hidden sm:block w-full max-w-md sm:w-[480px] sm:max-w-xl bg-[#19191d] border-0 p-0 rounded-2xl shadow-2xl mx-4 sm:mx-0">
          <Card className="bg-[#19191d] border-none shadow-none p-0">
            <CardHeader className="flex flex-col items-center gap-2 pt-6 pb-2 px-4 sm:px-0">
              <div className="w-16 h-10 bg-[#e5e5e5] rounded-md mb-2" />
              <CardTitle className="text-center text-lg sm:text-2xl font-semibold text-white">Check your email</CardTitle>
              <div className="text-center text-muted-foreground text-sm sm:text-base font-normal mt-2">
                Enter the 6 digit verification code sent to
                <br className="block sm:hidden" />
                <span className="font-medium"> {email}</span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6 pt-2 pb-8 px-4 sm:px-0">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleVerify();
                }}
                className="w-full flex flex-col items-center gap-6"
              >
                <div className="flex gap-3 justify-center w-full">
                  {code.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { inputs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="w-12 h-12 sm:w-14 sm:h-14 text-xl sm:text-2xl text-center rounded-md bg-[#23243a] border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      value={digit}
                      onChange={e => handleChange(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                    />
                  ))}
                </div>
                <div className="text-center text-muted-foreground text-sm">
                  Didn't get your code?{' '}
                  <button type="button" className="text-primary underline" onClick={onResend}>
                    Resend code
                  </button>
                </div>
                <Button type="submit" className="w-full bg-[#6c5dd3] text-white text-base font-semibold py-3 rounded-md mt-2">
                  Verify
                </Button>
              </form>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
      )}
    </>
  );
}
