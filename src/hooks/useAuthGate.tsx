import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { useAuth } from "./useAuth";
import { AuthGateModal } from "@/components/AuthGateModal";

type GateContext = {
  /** If user logged in: runs cb. Otherwise opens auth modal. */
  requireAuth: (cb: () => void, intent?: string) => void;
  open: (intent?: string) => void;
};

const Ctx = createContext<GateContext | null>(null);

export const AuthGateProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [openState, setOpenState] = useState(false);
  const [intent, setIntent] = useState<string | undefined>(undefined);

  const open = useCallback((i?: string) => {
    setIntent(i);
    setOpenState(true);
  }, []);

  const requireAuth = useCallback(
    (cb: () => void, i?: string) => {
      if (user) {
        cb();
        return;
      }
      setIntent(i);
      setOpenState(true);
    },
    [user]
  );

  return (
    <Ctx.Provider value={{ requireAuth, open }}>
      {children}
      <AuthGateModal open={openState} onClose={() => setOpenState(false)} intent={intent} />
    </Ctx.Provider>
  );
};

export const useAuthGate = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuthGate must be used inside AuthGateProvider");
  return ctx;
};
